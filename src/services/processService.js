import { getAccessToken } from './storageService';

const PROCESS_BASE_URL = 'https://crm-process.onrender.com/api/Statement';
const ARM_BASE_URL = 'https://crm-arm.onrender.com/api/Statement';
const DICTIONARY_BASE_URL = 'https://crm-arm.onrender.com/api/Dictionary';
const STATEMENT_BASE_URL = 'https://crm-statement.onrender.com/api';

const getTokenOrThrow = (token) => {
  const resolved = token || getAccessToken();
  if (!resolved) {
    throw new Error('Токен авторизации не найден');
  }
  return resolved;
};

const handleResponse = async (response, defaultErrorMessage) => {
  if (response.ok) {
    if (response.status === 204) {
      return null;
    }
    return response.json();
  }

  const errorText = await response.text();
  throw new Error(`${defaultErrorMessage}: ${response.status} ${errorText}`);
};

export const startStatementProcess = async ({ productCode, operationType = 'New' }, token) => {
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${PROCESS_BASE_URL}/start`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      productCode,
      operationType,
    }),
  });

  return handleResponse(response, 'Ошибка запуска процесса заявки');
};

export const getStatementStatus = async (processInstanceId, token) => {
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${ARM_BASE_URL}/GetStatus`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      processInstanceId,
    }),
  });

  return handleResponse(response, 'Ошибка получения статуса заявки');
};

export const getTaskClaimAvailability = async (taskId, token) => {
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${PROCESS_BASE_URL}/can-claim-task`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      taskId,
    }),
  });

  return handleResponse(response, 'Ошибка проверки возможности взять задачу');
};

export const claimTask = async (taskId, token) => {
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${PROCESS_BASE_URL}/claim-task`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      taskId,
    }),
  });

  return handleResponse(response, 'Ошибка при взятии задачи');
};

export const sendTaskDecision = async ({ taskId, decision, reasonId = null }, token) => {
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${PROCESS_BASE_URL}/send-task`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      taskId,
      decision,
      reasonId,
    }),
  });

  return handleResponse(response, 'Ошибка отправки задачи');
};

export const getRejectReasons = async (taskId, token) => {
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${DICTIONARY_BASE_URL}/GetReasons`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      taskId,
    }),
  });

  return handleResponse(response, 'Ошибка загрузки причин отказа');
};

export const getProcessInstanceDetails = async (processInstanceId, token) => {
  if (!processInstanceId) {
    throw new Error('processInstanceId не указан');
  }
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${STATEMENT_BASE_URL}/ProcessInstance/${processInstanceId}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${authToken}`,
    },
  });

  return handleResponse(response, 'Ошибка получения данных процесса');
};

export const getProcessHistory = async (processInstanceId, token) => {
  if (!processInstanceId) {
    throw new Error('processInstanceId не указан');
  }
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${PROCESS_BASE_URL}/process-history/${processInstanceId}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${authToken}`,
    },
  });

  return handleResponse(response, 'Ошибка получения истории процесса');
};

/**
 * Получить список названий словарей
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Array>} Массив названий словарей
 */
export const getDictionaryNames = async (token) => {
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${DICTIONARY_BASE_URL}/GetDictionaryNames`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  return handleResponse(response, 'Ошибка получения списка словарей');
};

/**
 * Получить значения словаря по коду
 * @param {string} code - Код словаря (например, "DicContragentRole")
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Array>} Массив значений словаря
 */
export const getDictionaryValues = async (code, token) => {
  if (!code) {
    throw new Error('Код словаря не указан');
  }
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${DICTIONARY_BASE_URL}/GetDictionaryValues`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      code,
    }),
  });

  return handleResponse(response, 'Ошибка получения значений словаря');
};

/**
 * Получить данные контрагента по ID
 * @param {string} contragentId - ID контрагента
 * @param {string} accessId - ID доступа (processInstanceId)
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Object>} Данные контрагента
 */
export const getContragent = async (contragentId, accessId, token) => {
  if (!contragentId) {
    throw new Error('ID контрагента не указан');
  }
  if (!accessId) {
    throw new Error('ID доступа (accessId) не указан');
  }
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${STATEMENT_BASE_URL}/Contragent/${contragentId}?accessId=${accessId}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${authToken}`,
    },
  });

  return handleResponse(response, 'Ошибка получения данных контрагента');
};

/**
 * Обновить данные контрагента
 * @param {Object} contragentData - Данные контрагента для обновления
 * @param {string} accessId - ID доступа (processInstanceId)
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Object>} Обновленные данные контрагента
 */
export const updateContragent = async (contragentData, accessId, token) => {
  if (!contragentData) {
    throw new Error('Данные контрагента не указаны');
  }
  if (!accessId) {
    throw new Error('accessId не указан');
  }
  const authToken = getTokenOrThrow(token);

  // Формат, который реально работает на backend (как в твоём последнем примере):
  //   PUT /api/Contragent?accessId={id_последней_задачи_из_истории}
  // В теле передаём полный объект с полем id (для update) или "0000..." / без id (для create).
  const { taskId: _, ...cleanContragentData } = contragentData;
  const requestBody = cleanContragentData;

  let accessIdParam = String(accessId).trim();

  // По договорённости: accessId должен быть ID последней задачи из истории процесса.
  // Ответ history — это массив объектов с полем id (а не taskId), берём последний по массиву.
  try {
    const history = await getProcessHistory(accessIdParam, token);
    if (Array.isArray(history) && history.length > 0) {
      const last = history[history.length - 1];
      if (last?.id) {
        accessIdParam = String(last.id).trim();
      }
    }
  } catch (e) {
    // ignore history errors, fallback to исходный accessId
  }
  const url = `${STATEMENT_BASE_URL}/Contragent?accessId=${encodeURIComponent(accessIdParam)}`;

  const response = await fetch(url, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  return handleResponse(response, 'Ошибка обновления данных контрагента');
};

export const getStatementParticipants = async (accessId, token) => {
  if (!accessId) {
    throw new Error('accessId не указан');
  }
  const authToken = getTokenOrThrow(token);

  // Используем ProcessInstance для получения участников, так как он уже содержит contragents
  // Это более надежный способ, так как /Statement/participants возвращает 404
  try {
    const processDetails = await getProcessInstanceDetails(accessId, token);
    if (processDetails?.contragents && Array.isArray(processDetails.contragents)) {
      return processDetails.contragents;
    }
    return [];
  } catch (error) {
    // Альтернативный способ - через ProcessInstance напрямую
    const response = await fetch(`${STATEMENT_BASE_URL}/ProcessInstance/${accessId}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${authToken}`,
      },
    });

    const processData = await handleResponse(response, 'Ошибка получения участников заявки');
    if (processData?.contragents && Array.isArray(processData.contragents)) {
      return processData.contragents;
    }
    return [];
  }
};
