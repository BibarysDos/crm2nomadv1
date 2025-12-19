/**
 * Сервис для работы с localStorage
 */

const STORAGE_KEYS = {
  POLICYHOLDER: 'policyholderData',
  INSURED: 'insuredData',
  CURRENT_APPLICATION_ID: 'currentApplicationId',
  APPLICATION_HISTORY: 'applicationHistory',
  APPLICATION_BENEFICIARY: 'applicationBeneficiary',
  INSURED_CURRENT_VIEW_HISTORY: 'insuredCurrentViewHistory',
  GLOBAL_APPLICATION_DATA: 'globalApplicationData',
  APPLICATION_METADATA: 'applicationMetadata',
  APPLICATION_DATA_BY_NUMBER: 'applicationDataByNumber', // Данные заявки по номеру
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_LOGIN: 'userLogin'
};

/**
 * Генерировать UUID для заявки
 * @returns {string} UUID заявки
 */
export const generateApplicationId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

/**
 * Получить ключ localStorage с префиксом applicationId
 * @param {string} applicationId - ID заявки
 * @param {string} key - Базовый ключ
 * @returns {string} Ключ с префиксом
 */
export const getApplicationKey = (applicationId, key) => {
  if (!applicationId) {
    return key;
  }
  return `application_${applicationId}_${key}`;
};

/**
 * Установить текущий ID заявки
 * @param {string} id - ID заявки
 */
export const setCurrentApplicationId = (id) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_APPLICATION_ID, id);
  } catch (error) {
  }
};

/**
 * Получить текущий ID заявки
 * @returns {string|null} ID заявки или null
 */
export const getCurrentApplicationId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_APPLICATION_ID);
  } catch (error) {
    return null;
  }
};

/**
 * Очистить данные конкретной заявки
 * @param {string} applicationId - ID заявки
 */
export const clearApplicationData = (applicationId) => {
  if (!applicationId) return;
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.CURRENT_APPLICATION_ID) {
        const prefixedKey = getApplicationKey(applicationId, key);
        localStorage.removeItem(prefixedKey);
      }
    });
  } catch (error) {
  }
};

/**
 * Сохранить данные страхователя в localStorage
 * @param {Object} data - Данные страхователя
 * @param {string} applicationId - ID заявки (опционально)
 */
export const savePolicyholderData = (data, applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.POLICYHOLDER);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
  }
};

/**
 * Загрузить данные страхователя из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 * @returns {Object|null} Данные страхователя или null
 */
export const loadPolicyholderData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.POLICYHOLDER);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Сохранить данные застрахованного в localStorage
 * @param {Object} data - Данные застрахованного
 * @param {string} applicationId - ID заявки (опционально)
 */
export const saveInsuredData = (data, applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
  }
};

/**
 * Загрузить данные застрахованного из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 * @returns {Object|null} Данные застрахованного или null
 */
export const loadInsuredData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Очистить данные страхователя из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 */
export const clearPolicyholderData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.POLICYHOLDER);
    localStorage.removeItem(key);
  } catch (error) {
  }
};

/**
 * Очистить данные застрахованного из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 */
export const clearInsuredData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED);
    localStorage.removeItem(key);
  } catch (error) {
  }
};

// Все специализированные Insured-* сохранения (other-person, own-child и т.п.)
// убраны — используем единый saveInsuredData/loadInsuredData для застрахованного.

/**
 * Очистить данные "страхователь является застрахованным" из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 */
export const clearInsuredPolicyholderData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED_POLICYHOLDER);
    localStorage.removeItem(key);
  } catch (error) {
  }
};

/**
 * Очистить данные "свой ребенок" из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 */
export const clearInsuredOwnChildData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED_OWN_CHILD);
    localStorage.removeItem(key);
  } catch (error) {
  }
};

/**
 * Очистить данные родителя для "иной ребенок" из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 */
export const clearInsuredOtherChildParentData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED_OTHER_CHILD_PARENT);
    localStorage.removeItem(key);
  } catch (error) {
  }
};

/**
 * Очистить данные ребенка для "иной ребенок" из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 */
export const clearInsuredOtherChildChildData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED_OTHER_CHILD_CHILD);
    localStorage.removeItem(key);
  } catch (error) {
  }
};

/**
 * Очистить все данные из localStorage (хард ресет)
 * Удаляет все ключи, связанные с приложением
 */
export const clearAllData = () => {
  try {
    // Удаляем все ключи из STORAGE_KEYS (включая токены)
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    // Также удаляем все ключи с префиксом application_
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('application_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
  }
};

/**
 * Сохранить данные истории заявки
 * @param {Object} data - Данные истории (дата/время, статус)
 * @param {string} applicationId - ID заявки (опционально)
 */
export const saveApplicationHistory = (data, applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.APPLICATION_HISTORY);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
  }
};

/**
 * Загрузить данные истории заявки
 * @param {string} applicationId - ID заявки (опционально)
 * @returns {Object|null} Данные истории или null
 */
export const loadApplicationHistory = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.APPLICATION_HISTORY);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Сохранить данные выгодоприобретателя
 * @param {Object} data - Данные выгодоприобретателя
 * @param {string} applicationId - ID заявки (опционально)
 */
export const saveApplicationBeneficiary = (data, applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.APPLICATION_BENEFICIARY);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
  }
};

/**
 * Загрузить данные выгодоприобретателя
 * @param {string} applicationId - ID заявки (опционально)
 * @returns {Object|null} Данные выгодоприобретателя или null
 */
export const loadApplicationBeneficiary = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.APPLICATION_BENEFICIARY);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Сохранить историю currentView застрахованного в localStorage (массив JSON)
 * @param {string} currentView - Текущий view для сохранения
 * @param {string} applicationId - ID заявки (опционально)
 */
export const saveInsuredCurrentViewHistory = (currentView, applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED_CURRENT_VIEW_HISTORY);
    // Загружаем существующий массив или создаем новый
    const existingData = localStorage.getItem(key);
    let viewHistory = existingData ? JSON.parse(existingData) : [];
    
    // Проверяем, что это массив
    if (!Array.isArray(viewHistory)) {
      viewHistory = [];
    }
    
    // Добавляем новый currentView в массив (с timestamp для отслеживания)
    const viewEntry = {
      view: currentView,
      timestamp: new Date().toISOString()
    };
    
    viewHistory.push(viewEntry);
    
    // Сохраняем обновленный массив
    localStorage.setItem(key, JSON.stringify(viewHistory));
  } catch (error) {
  }
};

/**
 * Загрузить историю currentView застрахованного из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 * @returns {Array} Массив истории currentView или пустой массив
 */
export const loadInsuredCurrentViewHistory = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.INSURED_CURRENT_VIEW_HISTORY);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      // Проверяем, что это массив
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (error) {
    return [];
  }
};

/**
 * Загрузить глобальные данные заявки из localStorage
 * @param {string} applicationId - ID заявки (опционально)
 * @returns {Object|null} Глобальные данные заявки или null
 */
export const loadGlobalApplicationData = (applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.GLOBAL_APPLICATION_DATA);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed;
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Сохранить глобальные данные заявки в localStorage
 * @param {Object} globalData - Глобальные данные заявки
 * @param {string} applicationId - ID заявки (опционально)
 */
export const saveGlobalApplicationData = (globalData, applicationId = null) => {
  try {
    const key = getApplicationKey(applicationId || getCurrentApplicationId(), STORAGE_KEYS.GLOBAL_APPLICATION_DATA);
    // Загружаем существующие данные или создаем новую структуру
    const existingData = loadGlobalApplicationData(applicationId || getCurrentApplicationId()) || {};
    
    // Объединяем существующие данные с новыми
    const updatedData = {
      ...existingData,
      ...globalData
    };
    
    // НЕ удаляем Policyholder здесь - это делается только в updateGlobalApplicationSection
    // чтобы не влиять на другие данные при сохранении
    
    localStorage.setItem(key, JSON.stringify(updatedData));
  } catch (error) {
  }
};

/**
 * Обновить секцию в глобальных данных заявки
 * @param {string} section - Название секции (Policyholder, Insured, Terms, Questionary)
 * @param {Object} sectionData - Данные секции
 * @param {string} applicationId - ID заявки (опционально)
 */
export const updateGlobalApplicationSection = (section, sectionData, applicationId = null) => {
  try {
    // НЕ сохраняем Policyholder в global storage - полностью отказываемся от него
    if (section === 'Policyholder') {
      return;
    }

    // НЕ сохраняем Insured в global storage — для застрахованного используем только локальное хранилище
    if (section === 'Insured') {
      return;
    }
    
    const globalData = loadGlobalApplicationData(applicationId || getCurrentApplicationId()) || {};
    globalData[section] = sectionData;
    saveGlobalApplicationData(globalData, applicationId || getCurrentApplicationId());
  } catch (error) {
  }
};

/**
 * Сохранить метаданные заявки
 * @param {string} applicationId - ID заявки
 * @param {Object} metadata - Метаданные заявки (product, createdAt, policyholderIin, status)
 */
export const saveApplicationMetadata = (applicationId, metadata) => {
  if (!applicationId) return;
  
  try {
    const key = getApplicationKey(applicationId, STORAGE_KEYS.APPLICATION_METADATA);
    const metadataToSave = {
      applicationId,
      product: metadata.product || null,
      createdAt: metadata.createdAt || new Date().toISOString(),
      policyholderIin: metadata.policyholderIin || '',
      status: metadata.status || 'Черновик',
      ...metadata
    };
    localStorage.setItem(key, JSON.stringify(metadataToSave));
  } catch (error) {
  }
};

/**
 * Загрузить метаданные заявки
 * @param {string} applicationId - ID заявки
 * @returns {Object|null} Метаданные заявки или null
 */
export const loadApplicationMetadata = (applicationId) => {
  if (!applicationId) return null;
  
  try {
    const key = getApplicationKey(applicationId, STORAGE_KEYS.APPLICATION_METADATA);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Получить список всех заявок
 * @returns {Array} Массив объектов с метаданными заявок
 */
export const getAllApplications = () => {
  try {
    const applications = [];
    const applicationIds = new Set();
    
    // Проходим по всем ключам localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('application_')) {
        // Извлекаем applicationId из ключа
        // Формат: application_{applicationId}_{storageKey}
        // Находим последнее подчеркивание, которое отделяет applicationId от storageKey
        const lastUnderscoreIndex = key.lastIndexOf('_');
        if (lastUnderscoreIndex > 12) { // 'application_'.length = 12
          const applicationId = key.substring(12, lastUnderscoreIndex);
          if (applicationId) {
            applicationIds.add(applicationId);
          }
        }
      }
    }
    
    // Загружаем метаданные для каждой заявки
    applicationIds.forEach(applicationId => {
      const metadata = loadApplicationMetadata(applicationId);
      if (metadata) {
        applications.push(metadata);
      } else {
        // Если метаданных нет, создаем базовые
        applications.push({
          applicationId,
          product: null,
          createdAt: new Date().toISOString(),
          policyholderIin: '',
          status: 'Черновик'
        });
      }
    });
    
    // Сортируем по дате создания (новые сверху)
    applications.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return applications;
  } catch (error) {
    return [];
  }
};

/**
 * Удалить заявку и все её данные
 * @param {string} applicationId - ID заявки
 */
export const deleteApplication = (applicationId) => {
  if (!applicationId) return;
  
  try {
    const keysToRemove = [];
    
    // Находим все ключи, связанные с этой заявкой
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`application_${applicationId}_`)) {
        keysToRemove.push(key);
      }
    }
    
    // Удаляем все найденные ключи
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
  } catch (error) {
  }
};

/**
 * Сохранить access token в localStorage
 * @param {string} token - Access token
 */
export const saveAccessToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
  }
};

/**
 * Получить access token из localStorage
 * @returns {string|null} Access token или null
 */
export const getAccessToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    return null;
  }
};

/**
 * Сохранить refresh token в localStorage
 * @param {string} token - Refresh token
 */
export const saveRefreshToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
  }
};

/**
 * Получить refresh token из localStorage
 * @returns {string|null} Refresh token или null
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    return null;
  }
};

/**
 * Сохранить логин пользователя в localStorage
 * @param {string} login - Логин пользователя
 */
export const saveUserLogin = (login) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_LOGIN, login);
  } catch (error) {
  }
};

/**
 * Получить логин пользователя из localStorage
 * @returns {string|null} Логин пользователя или null
 */
export const getUserLogin = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.USER_LOGIN);
  } catch (error) {
    return null;
  }
};

/**
 * Очистить токены из localStorage
 */
/**
 * Обновить access token используя refresh token
 * @returns {Promise<string>} Новый access token
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Refresh token не найден');
  }

  try {
    const response = await fetch('https://crm-identity.onrender.com/api/auth/refresh', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        RefreshToken: refreshToken
      }),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = { raw: responseText };
    }

    if (!response.ok || !responseData.accessToken) {
      throw new Error(responseData.message || responseData.error || 'Ошибка обновления токена');
    }

    // Сохраняем новый токен
    saveAccessToken(responseData.accessToken);
    if (responseData.refreshToken) {
      saveRefreshToken(responseData.refreshToken);
    }

    return responseData.accessToken;
  } catch (error) {
    // Если не удалось обновить токен, очищаем все и перенаправляем на авторизацию
    handleUnauthorized();
    throw error;
  }
};

/**
 * Обработка ошибки 401 (Unauthorized) - выход из системы и перенаправление на страницу авторизации
 */
export const handleUnauthorized = () => {
  // Очищаем все данные
  clearAllData();
  
  // Очищаем sessionStorage
  sessionStorage.removeItem('currentView');
  sessionStorage.removeItem('selectedProduct');
  sessionStorage.removeItem('currentApplicationId');
  
  // Устанавливаем флаг для показа сообщения об устаревшей сессии
  sessionStorage.setItem('sessionExpired', 'true');
  
  // Перенаправляем на страницу авторизации через перезагрузку страницы
  // Это гарантирует, что App.js пересоздастся и проверит токен
  window.location.reload();
};

export const clearTokens = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_LOGIN);
    // Также очищаем кэшированную роль и хэш токена
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoleTokenHash');
  } catch (error) {
  }
};

/**
 * Декодировать JWT токен и извлечь payload
 * @param {string} token - JWT токен
 * @returns {Object|null} Payload токена или null
 */
export const decodeJWT = (token) => {
  if (!token) return null;
  
  try {
    // JWT формат: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Декодируем payload (вторая часть)
    const payload = parts[1];
    
    // Base64 декодирование (JWT использует base64url, но стандартный base64 тоже работает)
    // Добавляем padding если нужно
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

/**
 * Получить роль пользователя по логину
 * @returns {string|null} Роль пользователя или null
 */
export const getUserRole = () => {
  try {
    // Получаем логин пользователя
    const login = getUserLogin();
    if (!login) {
      return null;
    }
    
    // Определяем роль по логину (регистронезависимо)
    const loginLower = login.toLowerCase().trim();
    
    if (loginLower === 'manager') {
      return 'manager';
    } else if (loginLower === 'underwriter') {
      return 'underwriter';
    } else if (loginLower === 'compliance') {
      return 'compliance';
    }
    
    // Если логин не соответствует известным ролям, возвращаем null
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Сохранить все данные заявки по номеру заявки
 * @param {string} applicationNumber - Номер заявки
 * @param {string} applicationId - ID заявки (processId)
 * @param {Object} allData - Все данные заявки
 */
export const saveApplicationDataByNumber = (applicationNumber, applicationId, allData) => {
  if (!applicationNumber || !applicationId) return;
  
  try {
    const key = `${STORAGE_KEYS.APPLICATION_DATA_BY_NUMBER}_${applicationNumber}`;
    const dataToSave = {
      applicationNumber,
      applicationId,
      savedAt: new Date().toISOString(),
      ...allData
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
  }
};

/**
 * Загрузить все данные заявки по номеру заявки
 * @param {string} applicationNumber - Номер заявки
 * @returns {Object|null} Все данные заявки или null
 */
export const loadApplicationDataByNumber = (applicationNumber) => {
  if (!applicationNumber) return null;
  
  try {
    const key = `${STORAGE_KEYS.APPLICATION_DATA_BY_NUMBER}_${applicationNumber}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Получить applicationId по номеру заявки
 * @param {string} applicationNumber - Номер заявки
 * @returns {string|null} ID заявки или null
 */
export const getApplicationIdByNumber = (applicationNumber) => {
  const data = loadApplicationDataByNumber(applicationNumber);
  return data?.applicationId || null;
};

