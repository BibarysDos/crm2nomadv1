/**
 * Сервис для получения данных о детях через API
 */

import { handleUnauthorized } from './storageService';

const API_URL = 'https://person-child-dates.onrender.com/api/get-child';

/**
 * Получить список детей по ИИН и телефону
 * @param {string} iin - ИИН
 * @param {string} phone - Номер телефона
 * @returns {Promise<Array>} Массив детей или пустой массив
 */
export const getChildren = async (iin, phone) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        iin: iin,
        phone: phone
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
    
    // Если успешно и есть данные
    if (data.success && data.data) {
      // result: 1 - детей нет
      if (data.data.result === 1) {
        return [];
      }
      // result: 2 - есть дети
      if (data.data.result === 2 && data.data.childs && Array.isArray(data.data.childs)) {
        return data.data.childs;
      }
    }
    
    return [];
  } catch (error) {
    throw error;
  }
};

/**
 * Преобразовать дату из ISO формата в DD.MM.YYYY
 * @param {string} isoDate - Дата в формате ISO (например, "2014-08-13T01:00:00")
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
 * Получить полное ФИО ребенка
 * @param {Object} child - Объект ребенка из API
 * @returns {string} ФИО в формате "Фамилия Имя Отчество"
 */
export const getChildFullName = (child) => {
  if (!child) return '';
  const parts = [
    child.child_surname,
    child.child_name,
    child.child_patronymic
  ].filter(Boolean);
  return parts.join(' ');
};

