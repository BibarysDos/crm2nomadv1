import { getAccessToken, loadApplicationMetadata } from '../../services/storageService';
import { updateContragent, getProcessInstanceDetails, getContragent } from '../../services/processService';
import { mapInsuredToContragent, mapLegalRepToContragent } from './contragentService';

/**
 * Сохранение застрахованного "Иной ребенок" и его законного представителя в API.
 * Вся бизнес-логика работы с Contragent вынесена сюда, чтобы компонент был проще.
 */
export const saveOtherChildToApi = async ({ applicationId, taskId, parentData, childData }) => {
  if (!applicationId) {
    throw new Error('applicationId не указан');
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error('Токен доступа не найден');
  }

  // 1. Определяем accessIdForAPI
  // По договорённости с backend в качестве accessId всегда используем внешний идентификатор заявки,
  // с которым мы открывали ProcessInstance (applicationId из App), а не внутреннее processInstance.id.
  const accessIdForAPI = applicationId?.trim();
  if (!accessIdForAPI) {
    throw new Error('Не удалось определить accessId для вызова Contragent API (applicationId пуст)');
  }

  try {
    // 2. Проверяем, существуют ли уже legalrep и insured через ProcessInstance
    let existingLegalRepId = null;
    let existingInsuredId = null;

    try {
      const processDetails = await getProcessInstanceDetails(applicationId, token);
      if (processDetails?.contragents && Array.isArray(processDetails.contragents)) {
        const existingLegalRep = processDetails.contragents.find(p => p.contragentRoleCode === 'legalrep');
        if (existingLegalRep) {
          existingLegalRepId = existingLegalRep.id;
        }

        const existingInsured = processDetails.contragents.find(p => p.contragentRoleCode === 'insured');
        if (existingInsured) {
          existingInsuredId = existingInsured.id;
        }
      }
    } catch (err) {
      // Если не удалось получить ProcessInstance при первоначальной проверке — продолжаем без него
    }

    // 3. Сохраняем / определяем родителя (legalrep)
    const parentContragentData = mapLegalRepToContragent(parentData, parentData.iin);

    let parentId = null;
    if (existingLegalRepId) {
      parentId = existingLegalRepId;
    } else {
      try {
        const savedParent = await updateContragent(parentContragentData, accessIdForAPI, token);
        parentId = savedParent?.id || parentContragentData.id;
      } catch (saveError) {
        if (saveError.message && saveError.message.includes('уже существует контрагент с ролью legalrep')) {
          try {
            const processDetails = await getProcessInstanceDetails(applicationId, token);
            if (processDetails?.contragents && Array.isArray(processDetails.contragents)) {
              const existingLegalRep = processDetails.contragents.find(p => p.contragentRoleCode === 'legalrep');
              if (existingLegalRep) {
                existingLegalRepId = existingLegalRep.id;
                parentId = existingLegalRepId;
              } else {
                throw new Error('Не удалось найти существующий legalrep в списке контрагентов');
              }
            } else {
              throw new Error('Не удалось получить список контрагентов из ProcessInstance');
            }
          } catch (retryError) {
            throw new Error(`Контрагент с ролью legalrep уже существует, но не удалось получить его ID: ${retryError.message}`);
          }
        } else {
          throw saveError;
        }
      }
    }

    if (!parentId || parentId === '00000000-0000-0000-0000-000000000000') {
      throw new Error('Не удалось получить ID родителя (legalrep). Ребенок не будет сохранен.');
    }

    // 4. Сохраняем / обновляем ребенка (insured) с ссылкой на родителя
    const childContragentData = mapInsuredToContragent(childData, 'other-child', null, parentId);

    if (existingInsuredId) {
      // Обновляем существующего insured
      const existingContragent = await getContragent(existingInsuredId, accessIdForAPI, token);

      const mergedContragentData = {
        ...existingContragent,
        ...childContragentData,
        id: existingInsuredId,
        identifier: childContragentData.identifier || existingContragent.identifier,
        contragentRoleCode: childContragentData.contragentRoleCode || existingContragent.contragentRoleCode,
        address: {
          ...existingContragent.address,
          ...childContragentData.address
        },
        identityDoc: {
          ...existingContragent.identityDoc,
          ...childContragentData.identityDoc
        },
        detail: {
          ...existingContragent.detail,
          ...childContragentData.detail
        },
        insuredDetails: {
          ...existingContragent.insuredDetails,
          ...childContragentData.insuredDetails
        },
        legalRepresentative: childContragentData.legalRepresentative || existingContragent.legalRepresentative
      };

      await updateContragent(mergedContragentData, accessIdForAPI, token);
      return;
    }

    // Пытаемся создать нового insured
    try {
      await updateContragent(childContragentData, accessIdForAPI, token);
    } catch (saveError) {
      if (saveError.message && saveError.message.includes('уже существует контрагент с ролью insured')) {
        try {
          const processDetails = await getProcessInstanceDetails(applicationId, token);
          if (processDetails?.contragents && Array.isArray(processDetails.contragents)) {
            const existingInsured = processDetails.contragents.find(p => p.contragentRoleCode === 'insured');
            if (existingInsured) {
              existingInsuredId = existingInsured.id;

              const existingContragent = await getContragent(existingInsuredId, accessIdForAPI, token);

              const mergedContragentData = {
                ...existingContragent,
                ...childContragentData,
                id: existingInsuredId,
                identifier: childContragentData.identifier || existingContragent.identifier,
                contragentRoleCode: childContragentData.contragentRoleCode || existingContragent.contragentRoleCode,
                address: {
                  ...existingContragent.address,
                  ...childContragentData.address
                },
                identityDoc: {
                  ...existingContragent.identityDoc,
                  ...childContragentData.identityDoc
                },
                detail: {
                  ...existingContragent.detail,
                  ...childContragentData.detail
                },
                insuredDetails: {
                  ...existingContragent.insuredDetails,
                  ...childContragentData.insuredDetails
                },
                legalRepresentative: childContragentData.legalRepresentative || existingContragent.legalRepresentative
              };

              await updateContragent(mergedContragentData, accessIdForAPI, token);
            } else {
              throw new Error('Не удалось найти существующий insured в списке контрагентов');
            }
          } else {
            throw new Error('Не удалось получить список контрагентов из ProcessInstance');
          }
        } catch (retryError) {
          throw new Error(`Контрагент с ролью insured уже существует, но не удалось получить его ID: ${retryError.message}`);
        }
      } else {
        throw saveError;
      }
    }
  } catch (error) {
    // Пробрасываем ошибку наверх, чтобы компонент решил, как её показать
    throw error;
  }
};


