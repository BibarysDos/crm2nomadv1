import { getAccessToken } from '../../services/storageService';
import { updateContragent, getProcessInstanceDetails, getContragent } from '../../services/processService';
import { mapInsuredToContragent, mapLegalRepToContragent } from './contragentService';

/**
 * Сохранение застрахованного "Свой ребенок" в API.
 * Родитель (страхователь) сохраняется/обновляется в роли legalrep,
 * затем ребенок (insured, own-child) ссылается на этого legalrep через legalRepresentative.
 */
export const saveOwnChildToApi = async ({ applicationId, taskId, childData, parentData }) => {
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
  let accessIdForAPI = applicationId?.trim();
  if (!accessIdForAPI) {
    throw new Error('Не удалось определить accessId для вызова Contragent API (applicationId пуст)');
  }

  try {
    // 2. Ищем в ProcessInstance страхователя (client), legalrep и существующего insured типа "own-child"
    let legalRepId = null;
    let existingInsuredId = null;

    try {
      const processDetails = await getProcessInstanceDetails(applicationId, token);
      if (processDetails?.contragents && Array.isArray(processDetails.contragents)) {

        const existingLegalRep = processDetails.contragents.find(
          (c) => c.contragentRoleCode === 'legalrep'
        );
        if (existingLegalRep) {
          legalRepId = existingLegalRep.id;
        }

        // Ищем любого insured в заявке (без фильтра по InsuredTypeCode),
        // как ты просил сделать и для "Иного ребенка"
        const existingInsured = processDetails.contragents.find(
          (c) => c.contragentRoleCode === 'insured'
        );
        if (existingInsured) {
          existingInsuredId = existingInsured.id;
        }
      }
    } catch (err) {
      // если не удалось получить ProcessInstance — продолжаем с пустыми id
    }

    // 3. Сохраняем / определяем legalrep на основе данных родителя (parentData)

    let effectiveLegalRepId = legalRepId || null;

    // Если legalrep уже есть в заявке — просто используем его, как у "Иного ребенка"
    if (effectiveLegalRepId) {
      // используем существующего legalrep
    } else if (parentData) {
      // Если legalrep ещё нет, но есть данные родителя — создаём legalrep из parentData
      try {
        const legalRepPayload = mapLegalRepToContragent(parentData, parentData.iin || null);
        const createdLegalRep = await updateContragent(legalRepPayload, accessIdForAPI, token);
        effectiveLegalRepId = createdLegalRep?.id || null;
      } catch (e) {
        // ошибка создания legalrep пробрасывается выше при сохранении insured
      }
    }

    // 4. Формируем данные ребенка (insured) с ссылкой на legalrep (если есть)
    // По умолчанию для своего ребенка сектор экономики всегда "9 - Домашние хозяйства/физическое лицо"
    const childDataWithSector = {
      ...childData,
      economSecId:
        childData.economSecId && childData.economSecId !== ''
          ? childData.economSecId
          : '9 - Домашние хозяйства/физическое лицо'
    };

    // Если insured уже существует, обновляем его через GET+merge+PUT
    if (existingInsuredId) {
      const existingContragent = await getContragent(existingInsuredId, accessIdForAPI, token);
      
      // Передаем existingId в mapInsuredToContragent, чтобы использовать существующий id
      const baseChildContragentData = mapInsuredToContragent(childDataWithSector, 'own-child', null, effectiveLegalRepId || null, existingInsuredId);

      const mergedContragentData = {
        ...existingContragent,
        ...baseChildContragentData,
        id: existingInsuredId,
        identifier: baseChildContragentData.identifier || existingContragent.identifier,
        contragentRoleCode: baseChildContragentData.contragentRoleCode || existingContragent.contragentRoleCode,
        address: {
          ...existingContragent.address,
          ...baseChildContragentData.address
        },
        identityDoc: {
          ...existingContragent.identityDoc,
          ...baseChildContragentData.identityDoc
        },
        detail: {
          ...existingContragent.detail,
          ...baseChildContragentData.detail
        },
        insuredDetails: {
          ...existingContragent.insuredDetails,
          ...baseChildContragentData.insuredDetails
        },
        legalRepresentative: baseChildContragentData.legalRepresentative || existingContragent.legalRepresentative
      };

      await updateContragent(mergedContragentData, accessIdForAPI, token);
      return;
    }

    // 5. Пытаемся создать нового insured (own-child)
    // Создаем данные для нового контрагента (без existingId)
    const baseChildContragentData = mapInsuredToContragent(childDataWithSector, 'own-child', null, effectiveLegalRepId || null);
    
    try {
      await updateContragent(baseChildContragentData, accessIdForAPI, token);
    } catch (saveError) {
      if (saveError.message && saveError.message.includes('уже существует контрагент с ролью insured')) {
        try {
          const processDetails = await getProcessInstanceDetails(applicationId, token);
          if (processDetails?.contragents && Array.isArray(processDetails.contragents)) {
            // При повторной попытке тоже ищем просто первого insured без фильтра по InsuredTypeCode
            const existingInsured = processDetails.contragents.find(
              (c) => c.contragentRoleCode === 'insured'
            );
            if (existingInsured) {
              existingInsuredId = existingInsured.id;

              const existingContragent = await getContragent(existingInsuredId, accessIdForAPI, token);
              
              // Передаем existingId в mapInsuredToContragent, чтобы использовать существующий id
              const baseChildContragentDataWithId = mapInsuredToContragent(childDataWithSector, 'own-child', null, effectiveLegalRepId || null, existingInsuredId);

              const mergedContragentData = {
                ...existingContragent,
                ...baseChildContragentDataWithId,
                id: existingInsuredId,
                identifier: baseChildContragentDataWithId.identifier || existingContragent.identifier,
                contragentRoleCode: baseChildContragentDataWithId.contragentRoleCode || existingContragent.contragentRoleCode,
                address: {
                  ...existingContragent.address,
                  ...baseChildContragentDataWithId.address
                },
                identityDoc: {
                  ...existingContragent.identityDoc,
                  ...baseChildContragentDataWithId.identityDoc
                },
                detail: {
                  ...existingContragent.detail,
                  ...baseChildContragentDataWithId.detail
                },
                insuredDetails: {
                  ...existingContragent.insuredDetails,
                  ...baseChildContragentDataWithId.insuredDetails
                },
                legalRepresentative: baseChildContragentDataWithId.legalRepresentative || existingContragent.legalRepresentative
              };

              await updateContragent(mergedContragentData, accessIdForAPI, token);
            } else {
              throw new Error('Не удалось найти существующий insured (own-child) в списке контрагентов');
            }
          } else {
            throw new Error('Не удалось получить список контрагентов из ProcessInstance');
          }
        } catch (retryError) {
          throw new Error(
            `Контрагент с ролью insured (own-child) уже существует, но не удалось получить его ID: ${retryError.message}`
          );
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


