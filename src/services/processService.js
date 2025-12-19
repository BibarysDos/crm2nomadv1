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
  // Убираем возможные пробелы и переносы строк
  return resolved.trim();
};

const handleResponse = async (response, defaultErrorMessage) => {
  if (response.ok) {
    if (response.status === 204) {
      return null;
    }
    return response.json();
  }

  const errorText = await response.text();
  // Логируем детали ошибки для отладки
  if (process.env.NODE_ENV === 'development') {
    console.error(`Ошибка ${response.status} ${defaultErrorMessage}:`, errorText);
  }
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

/**
 * Отправить задачу на подписание
 * @param {string} taskId - ID задачи
 * @param {string} token - Токен авторизации (опционально)
 * @returns {Promise<Object>} Результат отправки на подписание
 */
export const sendTaskForSigning = async (taskId, token) => {
  const authToken = getTokenOrThrow(token);

  // Используем тот же endpoint, но с decision: true для подписания
  // В будущем может быть отдельный endpoint для подписания
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
      decision: true,
      reasonId: null,
    }),
  });

  return handleResponse(response, 'Ошибка отправки задачи на подписание');
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
 * Получить программы страхования
 * @param {string} processDefinitionCode - Код определения процесса (например, "SenimNew")
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Array>} Массив программ страхования
 */
export const getPrograms = async (processDefinitionCode = 'SenimNew', token) => {
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${DICTIONARY_BASE_URL}/GetPrograms`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      processDefinitionCode,
    }),
  });

  return handleResponse(response, 'Ошибка получения программ страхования');
};

/**
 * Получить частоты оплаты для программы страхования
 * @param {string} programId - ID программы страхования
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Array>} Массив частот оплаты
 */
export const getProgramPaymentFrequencies = async (programId, token) => {
  if (!programId) {
    throw new Error('ID программы не указан');
  }
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${DICTIONARY_BASE_URL}/GetProgramPaymentFrequencies`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      programId,
    }),
  });

  return handleResponse(response, 'Ошибка получения частот оплаты');
};

/**
 * Получить контракт по ID задачи
 * @param {string} taskId - ID задачи (taskId из истории)
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Object>} Данные контракта или null если 404
 */
export const getContract = async (taskId, token) => {
  if (!taskId) {
    throw new Error('ID задачи (taskId) не указан');
  }
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${STATEMENT_BASE_URL}/Contract/${taskId}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${authToken}`,
    },
  });

  // Если 404 - контракт не существует, это нормально
  if (response.status === 404) {
    return null;
  }

  return handleResponse(response, 'Ошибка получения контракта');
};

/**
 * Обновить контракт
 * @param {Object} contractData - Данные контракта (id должен быть null для нового контракта)
 * @param {string} taskId - ID задачи (taskId из истории, используется как accessId в query)
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Object>} Обновленные данные контракта
 */
export const updateContract = async (contractData, taskId, token) => {
  if (!contractData) {
    throw new Error('Данные контракта не указаны');
  }
  if (!taskId) {
    throw new Error('ID задачи (taskId) не указан');
  }
  const authToken = getTokenOrThrow(token);

  // Используем формат с accessId в query параметре, как в Postman
  const url = `${STATEMENT_BASE_URL}/Contract?accessId=${encodeURIComponent(taskId)}`;

  const response = await fetch(url, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(contractData),
  });

  return handleResponse(response, 'Ошибка обновления контракта');
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

/**
 * Обновить данные выгодоприобретателя
 * @param {Object} beneficiaryData - Данные выгодоприобретателя
 * @param {string} accessId - ID доступа (processInstanceId или taskId)
 * @param {string} token - Токен авторизации (опционально, будет получен автоматически)
 * @returns {Promise<Object>} Обновленные данные выгодоприобретателя
 */
export const updateBeneficiary = async (beneficiaryData, accessId, token) => {
  if (!beneficiaryData) {
    throw new Error('Данные выгодоприобретателя не указаны');
  }
  if (!accessId) {
    throw new Error('accessId не указан');
  }
  const authToken = getTokenOrThrow(token);

  // Beneficiary также является контрагентом с ролью 'beneficiary'
  // Используем тот же endpoint, что и для других контрагентов
  let accessIdParam = String(accessId).trim();

  // Получаем последнюю задачу из истории для использования в качестве accessId
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

  // Преобразуем данные beneficiary в формат контрагента
  // Для создания нового контрагента используем пустой GUID, для обновления - существующий id
  const contragentId = beneficiaryData.id || '00000000-0000-0000-0000-000000000000';
  
  // Определяем резидентность
  const isResident = beneficiaryData.residencyType !== 'Нерезидент' && 
                     beneficiaryData.residencyType !== 'не резидент' && 
                     beneficiaryData.residencyType !== 'Не резидент';
  const residentTypeCode = isResident ? 'resident' : 'nonResident';
  
  // Формируем адрес в правильном формате
  const addressData = {};
  if (beneficiaryData.country) {
    addressData.countryCode = beneficiaryData.country;
  } else {
    addressData.countryCode = 'KZ'; // По умолчанию Казахстан
  }
  if (beneficiaryData.region) {
    addressData.region = beneficiaryData.region;
  }
  if (beneficiaryData.street) {
    addressData.street = beneficiaryData.street;
  }
  if (beneficiaryData.houseNumber) {
    addressData.building = beneficiaryData.houseNumber;
  }
  if (beneficiaryData.apartmentNumber) {
    addressData.flat = beneficiaryData.apartmentNumber;
  }
  
  // Для нерезидентов БИН/ИИН не используется, используем название компании как identifier
  // Для резидентов используем БИН если есть
  const beneficiaryName = beneficiaryData.name || 'Madanes Advanced Healthcare Services Ltd.';
  let identifier;
  if (residentTypeCode === 'nonResident') {
    // Для нерезидентов используем название компании как identifier (ограничиваем длину до 50 символов)
    const nameIdentifier = beneficiaryData.identifier || beneficiaryName;
    identifier = nameIdentifier.length > 50 ? nameIdentifier.substring(0, 50) : nameIdentifier;
  } else {
    // Для резидентов используем БИН
    identifier = beneficiaryData.bin || beneficiaryData.identifier || beneficiaryName;
  }
  
  const contragentData = {
    id: contragentId,
    identifier: identifier,
    contragentTypeCode: 'legalentity', // Beneficiary обычно юридическое лицо
    contragentRoleCode: 'beneficiary',
    contragentRoleName: 'Бенефициар',
    residentTypeCode: residentTypeCode,
    longName: beneficiaryName
  };
  
  // Добавляем адрес только если есть хотя бы одно поле кроме countryCode
  const hasAddressFields = beneficiaryData.region || beneficiaryData.street || beneficiaryData.houseNumber || beneficiaryData.apartmentNumber;
  if (hasAddressFields || addressData.countryCode) {
    contragentData.address = addressData;
  }
  
  // Добавляем detail с обязательными полями для юридических лиц
  // Для нерезидентов-бенефициаров используем код '7' (Негосударственные нефинансовые организации)
  const economicSectorCode = beneficiaryData.economicSectorCode || '7';
  const economicSectorName = beneficiaryData.economicSectorName || 'Негосударственные нефинансовые организации';
  // Для юридических лиц genderCode обязателен, используем значение по умолчанию
  const genderCode = beneficiaryData.genderCode || 'male';
  const genderName = beneficiaryData.genderName || 'Мужской';
  contragentData.detail = {
    economicSectorCode: economicSectorCode,
    economicSectorName: economicSectorName,
    genderCode: genderCode,
    genderName: genderName
  };
  
  console.log('Отправка beneficiary:', JSON.stringify(contragentData, null, 2));
  console.log('URL:', `${STATEMENT_BASE_URL}/Contragent?accessId=${encodeURIComponent(accessIdParam)}`);

  const url = `${STATEMENT_BASE_URL}/Contragent?accessId=${encodeURIComponent(accessIdParam)}`;

  const response = await fetch(url, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(contragentData),
  });

  return handleResponse(response, 'Ошибка обновления данных выгодоприобретателя');
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

/**
 * Получить анкету для контрагента
 * @param {string} contragentId - ID контрагента (застрахованного)
 * @param {string} accessId - ID доступа (taskId)
 * @param {string} token - Токен авторизации (опционально)
 * @param {string} questionnaireTypeCode - Тип анкеты: 'healthdeclaration' или 'questionnaire' (опционально, по умолчанию 'healthdeclaration')
 * @returns {Promise<Object>} Данные анкеты
 */
export const getQuestionnaire = async (contragentId, accessId, token, questionnaireTypeCode = 'healthdeclaration') => {
  if (!contragentId) {
    throw new Error('ID контрагента не указан');
  }
  if (!accessId) {
    throw new Error('accessId не указан');
  }
  const authToken = getTokenOrThrow(token);

  const url = `${STATEMENT_BASE_URL}/Questionnaire/${contragentId}/${questionnaireTypeCode}?accessId=${encodeURIComponent(accessId)}`;
  
  // Логирование для отладки (только в development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Запрос анкеты:', {
      url,
      contragentId,
      accessId,
      questionnaireTypeCode,
      hasToken: !!authToken,
      tokenLength: authToken ? authToken.length : 0
    });
  }
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${authToken}`,
    },
  });

  // Если 404, возвращаем null вместо ошибки
  if (response.status === 404) {
    return null;
  }

  // Дополнительное логирование для 401
  if (response.status === 401) {
    if (process.env.NODE_ENV === 'development') {
      console.error('401 Unauthorized при запросе анкеты:', {
        url,
        contragentId,
        accessId,
        questionnaireTypeCode,
        hasToken: !!authToken
      });
    }
  }

  return handleResponse(response, 'Ошибка получения анкеты');
};

/**
 * Получить варианты ответов для вопроса
 * @param {string} questionCode - Код вопроса
 * @param {string} token - Токен авторизации (опционально)
 * @returns {Promise<Array>} Массив вариантов ответов
 */
export const getQuestionAnswers = async (questionCode, token) => {
  if (!questionCode) {
    throw new Error('Код вопроса не указан');
  }
  const authToken = getTokenOrThrow(token);

  const response = await fetch(`${DICTIONARY_BASE_URL}/GetQuestionAnswers`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      questionCode,
    }),
  });

  return handleResponse(response, 'Ошибка получения вариантов ответов');
};

/**
 * Обновить анкету
 * @param {Object} questionnaireData - Данные анкеты для обновления
 * @param {string} accessId - ID доступа (taskId)
 * @param {string} token - Токен авторизации (опционально)
 * @returns {Promise<Object>} Обновленные данные анкеты
 */
export const updateQuestionnaire = async (questionnaireData, accessId, token) => {
  if (!questionnaireData) {
    throw new Error('Данные анкеты не указаны');
  }
  if (!accessId) {
    throw new Error('accessId не указан');
  }
  const authToken = getTokenOrThrow(token);

  const url = `${STATEMENT_BASE_URL}/Questionnaire?accessId=${encodeURIComponent(accessId)}`;

  // Логирование для отладки
  if (process.env.NODE_ENV === 'development') {
    console.log('PUT запрос анкеты:', {
      url,
      accessId,
      questionnaireTypeCode: questionnaireData.questionnaireTypeCode,
      contragentId: questionnaireData.contragentId,
      questionsCount: questionnaireData.contragentQuestionnaires?.length || 0
    });
  }

  const response = await fetch(url, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(questionnaireData),
  });

  return handleResponse(response, 'Ошибка обновления анкеты');
};
