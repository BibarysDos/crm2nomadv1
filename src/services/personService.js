/**
 * Сервис для получения данных о человеке через API
 */

import { handleUnauthorized } from './storageService';

const API_URL = 'https://person-child-dates.onrender.com/api/get-person';

/**
 * Получить данные о человеке по телефону и ИИН
 * @param {string} phone - Номер телефона
 * @param {string} iin - ИИН
 * @returns {Promise<Object>} Данные о человеке
 */
export const getPerson = async (phone, iin) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        iin: iin
      })
    });

    // Обработка 401 - выход из системы
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Сессия устарела. Необходимо войти в систему заново.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Преобразовать дату из ISO формата в DD.MM.YYYY
 * @param {string} isoDate - Дата в формате ISO (например, "1997-12-02T00:00:00")
 * @returns {string} Дата в формате DD.MM.YYYY
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (error) {
    return '';
  }
};

/**
 * Преобразовать пол из числового формата в текстовый
 * @param {string} genderCode - Код пола ("1" для мужского, "2" для женского)
 * @returns {string} Текст пола ("Мужской" или "Женский")
 */
export const formatGender = (genderCode) => {
  if (!genderCode) return '';
  return genderCode === '1' ? 'Мужской' : genderCode === '2' ? 'Женский' : '';
};

/**
 * Удалить слово "Улица" из начала строки улицы
 * @param {string} street - Название улицы
 * @returns {string} Название улицы без слова "Улица"
 */
const removeStreetPrefix = (street) => {
  if (!street) return '';
  // Убираем "Улица" и "УЛИЦА" из начала строки, с учетом пробелов
  return street.replace(/^УЛИЦА\s+/i, '').trim();
};

/**
 * Проверить, начинается ли номер документа с цифры
 * @param {string} documentNumber - Номер документа
 * @returns {boolean} true, если номер начинается с цифры
 */
const isDocumentNumberStartingWithDigit = (documentNumber) => {
  if (!documentNumber) return false;
  return /^\d/.test(documentNumber.trim());
};

/**
 * Маппинг данных из API ответа в формат формы с правильными названиями полей
 * @param {Object} apiData - Данные из API
 * @returns {Object} Данные в формате формы с правильными названиями полей
 */
export const mapApiDataToForm = (apiData) => {
  if (!apiData) return {};

  // Определяем тип документа: если номер начинается с цифры, то это удостоверение личности
  const vidDocId = isDocumentNumberStartingWithDigit(apiData.document_number) 
    ? 'Удостоверение личности' 
    : '';

  return {
    iin: apiData.iin || '',
    telephone: apiData.phone || '',
    surname: apiData.surname || '',
    name: apiData.name || '',
    patronymic: apiData.patronymic || '',
    birthDate: formatDate(apiData.birthdate),
    gender: formatGender(apiData.gender), // Строка (название), не ID
    countryId: apiData.country_nameru || '', // Строка (название), не ID
    district_nameru: apiData.district_nameru || '', // Область
    settlementName: apiData.region_nameru || '', // Название населенного пункта (район и город)
    street: removeStreetPrefix(apiData.street || ''), // Убираем "Улица" из начала
    houseNumber: apiData.building || '',
    apartmentNumber: apiData.flat !== null && apiData.flat !== undefined ? apiData.flat : '', // Обрабатываем null как пустую строку
    docNumber: apiData.document_number || '',
    issueDate: formatDate(apiData.begin_date),
    expiryDate: formatDate(apiData.enddate),
    issuedBy: apiData.issueorganization_nameru || '',
    economSecId: '9 - Домашние хозяйства/физическое лицо', // Код сектора по умолчанию
    vidDocId: vidDocId // Тип документа
  };
};

