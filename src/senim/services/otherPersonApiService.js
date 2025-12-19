import { getAccessToken } from '../../services/storageService';
import { updateContragent, getProcessInstanceDetails, getContragent, getStatementParticipants } from '../../services/processService';
import { mapInsuredToContragent, mapLegalRepToContragent } from './contragentService';

/**
 * Сохранение застрахованного \"Иное лицо\" и его законного представителя.
 * Вынесено из компонента в сервис, чтобы упростить UI.
 */
export const saveOtherPersonToApi = async ({ applicationId, taskId, insuredData, policyholderData }) => {
  if (!applicationId) {
    throw new Error('applicationId не указан');
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error('Токен доступа не найден');
  }

  // Определяем accessIdForAPI.
  // По договорённости с backend в качестве accessId всегда используем внешний идентификатор заявки (applicationId из App),
  // а не внутреннее processInstance.id.
  const accessIdForAPI = applicationId?.trim();
  if (!accessIdForAPI) {
    throw new Error('Не удалось определить accessId для вызова Contragent API (applicationId пуст)');
  }

  try {
    // 1. Проверяем существующие контрагенты через getProcessInstanceDetails
    let existingLegalRepId = null;
    let existingInsuredId = null;

    try {
      const processDetails = await getProcessInstanceDetails(applicationId, token);
      if (processDetails?.contragents && Array.isArray(processDetails.contragents)) {
        const existingLegalRep = processDetails.contragents.find(c => c.contragentRoleCode === 'legalrep');
        if (existingLegalRep) {
          existingLegalRepId = existingLegalRep.id;
        }

        const existingInsured = processDetails.contragents.find(
          c => c.contragentRoleCode === 'insured' && c.identifier === insuredData.iin
        );
        if (existingInsured) {
          existingInsuredId = existingInsured.id;
        }
      }
    } catch (err) {
      // Не удалось получить данные процесса — продолжаем без них
    }

    // 2. Сохраняем родителя (Legal Representative), если есть policyholderData
    let parentId = null;
    if (policyholderData && policyholderData.iin) {
      const parentContragentData = mapLegalRepToContragent(policyholderData, policyholderData.iin);

      if (existingLegalRepId) {
        parentId = existingLegalRepId;
      } else {
        try {
          const savedParent = await updateContragent(parentContragentData, accessIdForAPI, token);
          parentId = savedParent?.id || parentContragentData.id;
        } catch (saveError) {
          if (saveError.message && saveError.message.includes('уже существует контрагент с ролью legalrep')) {
            try {
              const participants = await getStatementParticipants(accessIdForAPI, token);
              if (participants && Array.isArray(participants)) {
                const existingLegalRep = participants.find(p => p.contragentRoleCode === 'legalrep');
                if (existingLegalRep) {
                  parentId = existingLegalRep.id || existingLegalRep.contragentId;
                }
              }
            } catch (retryError) {
              // ignore retry error, пробросим основную ошибку выше
            }
          } else {
            throw saveError;
          }
        }
      }
    }

    // 3. Сохраняем застрахованного (Insured)

    if (existingInsuredId) {
      // Обновляем существующего insured
      try {
        await getContragent(existingInsuredId, accessIdForAPI, token);

        // Передаем existingId в mapInsuredToContragent, чтобы использовать существующий id
        const contragentData = mapInsuredToContragent(insuredData, 'other-person', null, parentId, existingInsuredId);

        await updateContragent(contragentData, accessIdForAPI, token);
      } catch (error) {
        throw error;
      }
    } else {
      const contragentData = mapInsuredToContragent(insuredData, 'other-person', null, parentId);
      await updateContragent(contragentData, accessIdForAPI, token);
    }
  } catch (error) {
    throw error;
  }
};


