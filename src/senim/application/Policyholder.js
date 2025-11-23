import React, { useState, useEffect } from 'react';
import Gender from '../dictionary/Gender';
import SectorCode from '../dictionary/SectorCode';
import Country from '../dictionary/Country';
import Region from '../dictionary/Region';
import DocType from '../dictionary/DocType';
import IssuedBy from '../dictionary/IssuedBy';
import ClientType from '../dictionary/ClientType';
import { getPerson, mapApiDataToForm } from '../../services/personService';
import { saveApplicationMetadata, loadApplicationMetadata, getAccessToken } from '../../services/storageService';
import { getContragent, updateContragent, getProcessInstanceDetails } from '../../services/processService';

const Policyholder = ({ onBack, onSave, applicationId, taskId }) => {
  const [currentView, setCurrentView] = useState('main');

  // Единый объект состояния с правильными названиями полей
  const [policyholderData, setPolicyholderData] = useState({
    // Основные поля
    iin: '',
    telephone: '',
    name: '',
    surname: '',
    patronymic: '',
    // Адрес (отдельные поля)
    street: '',
    houseNumber: '',
    apartmentNumber: '',
    // Документ
    docNumber: '',
    // Даты
    birthDate: '',
    issueDate: '',
    expiryDate: '',
    // Справочники (как строки)
    gender: '',
    economSecId: '',
    countryId: '',
    district_nameru: '',
    settlementName: '',
    vidDocId: '',
    issuedBy: '',
    clientType: ''
  });

  // Состояние для отслеживания активного поля
  const [activeField, setActiveField] = useState(null);

  // Состояние для toggle кнопок
  const [toggleStates, setToggleStates] = useState({
    manualInput: false,
    pdl: false
  });

  // Состояние для автоматического режима
  const [autoModeState, setAutoModeState] = useState('initial'); // 'initial' | 'request_sent' | 'response_received' | 'data_loaded'
  
  // Состояние для хранения данных из API
  const [apiResponseData, setApiResponseData] = useState(null);
  
  // Флаг для предотвращения сохранения при начальной загрузке
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Состояние загрузки при запросе данных
  const [isLoading, setIsLoading] = useState(false);
  
  // Состояние ошибки
  const [errorMessage, setErrorMessage] = useState(null);

  // Состояние для хранения ID контрагента
  const [contragentId, setContragentId] = useState(null);
  
  // Состояние для хранения ID связи контрагента из ProcessInstance (id из массива contragents)
  const [contragentRelationId, setContragentRelationId] = useState(null);
  
  // Состояние для хранения identifier (ИИН) из загруженного контрагента
  const [loadedContragentIdentifier, setLoadedContragentIdentifier] = useState(null);
  
  // Состояние загрузки контрагента из API
  const [isLoadingContragent, setIsLoadingContragent] = useState(false);

  // НЕ загружаем данные из global storage - используем только локальное состояние
  // Данные загружаются только из API при монтировании компонента (через useEffect для loadContragent)
  useEffect(() => {
    setIsInitialLoad(false);
  }, [applicationId]);

  // Автоматическое обновление метаданных при изменении ИИН
  useEffect(() => {
    if (applicationId && policyholderData.iin && !isInitialLoad) {
      const existingMetadata = loadApplicationMetadata(applicationId) || {};
      if (existingMetadata.policyholderIin !== policyholderData.iin) {
        saveApplicationMetadata(applicationId, {
          ...existingMetadata,
          policyholderIin: policyholderData.iin
        });
      }
    }
  }, [policyholderData.iin, applicationId, isInitialLoad]);

  // Загрузка контрагента из API при монтировании или изменении applicationId
  // Загружаем данные сразу при открытии заявки, если есть контрагент в ProcessInstance
  useEffect(() => {
    console.log('🔄 [POLICYHOLDER] useEffect сработал, applicationId:', applicationId);
    const loadContragent = async () => {
      if (!applicationId) {
        console.log('⚠️ [POLICYHOLDER] applicationId отсутствует, пропускаем загрузку');
        return;
      }

      try {
        console.log('🔄 [POLICYHOLDER] Начинаем загрузку контрагента для applicationId:', applicationId);
        setIsLoadingContragent(true);
        const token = getAccessToken();
        if (!token) {
          console.log('⚠️ [POLICYHOLDER] Токен не найден, пропускаем загрузку контрагента');
          setIsLoadingContragent(false);
          return;
        }
        console.log('✅ [POLICYHOLDER] Токен найден, продолжаем загрузку');

        // ВАЖНО: Сначала получаем ProcessInstance, чтобы проверить contragents
        let contragentIdToLoad = null;
        
        try {
          const processInstance = await getProcessInstanceDetails(applicationId, token);
          console.log('📋 [PROCESS INSTANCE] Получены данные процесса:', processInstance);
          
          // Проверяем массив contragents на наличие контрагента с ролью client
          if (processInstance?.contragents && Array.isArray(processInstance.contragents)) {
            const clientContragent = processInstance.contragents.find(
              c => c.contragentRoleCode === 'client'
            );
            
            if (clientContragent) {
              // Используем id контрагента из ProcessInstance (это id связи контрагента с заявкой)
              contragentIdToLoad = clientContragent.id;
              console.log('✅ [CONTRAGENT] Найден контрагент с ролью client в ProcessInstance:', clientContragent);
              console.log('🔍 [CONTRAGENT] contragentIdToLoad:', contragentIdToLoad, 'applicationId:', applicationId);
              
              // Сохраняем id связи контрагента с заявкой (нужен для обновления)
              setContragentRelationId(clientContragent.id);
              // Сохраняем identifier из контрагента (нужен для обновления)
              if (clientContragent.identifier) {
                setLoadedContragentIdentifier(clientContragent.identifier);
              }
              
              // Если в ProcessInstance есть контрагент, но его детали (address, detail, etc.) равны null,
              // нужно загрузить полные данные через getContragent
              const needsFullData = !clientContragent.address && !clientContragent.detail && !clientContragent.identityDoc;
              console.log('🔍 [CONTRAGENT] needsFullData:', needsFullData, 'address:', clientContragent.address, 'detail:', clientContragent.detail, 'identityDoc:', clientContragent.identityDoc);
              
              if (needsFullData && contragentIdToLoad && applicationId) {
                // Загружаем полные данные контрагента через Contragent_GET
                console.log('📥 [CONTRAGENT] Загружаем полные данные контрагента через getContragent...');
                try {
                  const contragentData = await getContragent(contragentIdToLoad, applicationId, token);
                  console.log('📥 [CONTRAGENT] Получены данные контрагента из getContragent:', contragentData);
                  if (contragentData) {
                    // Преобразуем данные контрагента в формат формы
                    const mappedData = mapContragentToPolicyholder(contragentData);
                    console.log('📥 [CONTRAGENT] Преобразованные данные для формы:', mappedData);
                    // Сразу показываем данные в полях (не мержим с предыдущими)
                    setPolicyholderData(mappedData);
                    // Сохраняем id контрагента (из ответа API)
                    setContragentId(contragentData.id || contragentIdToLoad);
                    // Сохраняем identifier из загруженного контрагента (нужен для обновления)
                    if (contragentData.identifier) {
                      setLoadedContragentIdentifier(contragentData.identifier);
                    }
                    // Устанавливаем состояние "данные загружены"
                    setAutoModeState('data_loaded');
                    // Уведомляем родительский компонент о загруженных данных
                    if (onSave) {
                      onSave(mappedData);
                    }
                    console.log('✅ [CONTRAGENT] Данные контрагента загружены из API через Contragent_GET и отображены в полях');
                  }
                } catch (error) {
                  console.error('❌ [CONTRAGENT] Ошибка загрузки полных данных контрагента:', error);
                  console.error('❌ [CONTRAGENT] Детали ошибки:', error.message, error.stack);
                  // Если контрагент не найден, но есть базовые данные в ProcessInstance, используем их
                  if (clientContragent.identifier || clientContragent.longName) {
                    console.log('⚠️ [CONTRAGENT] Используем базовые данные из ProcessInstance');
                    const basicData = {
                      iin: clientContragent.identifier || '',
                      name: '',
                      surname: '',
                      patronymic: '',
                      telephone: '',
                      street: '',
                      houseNumber: '',
                      apartmentNumber: '',
                      docNumber: '',
                      birthDate: '',
                      issueDate: '',
                      expiryDate: '',
                      gender: '',
                      economSecId: '',
                      countryId: '',
                      district_nameru: '',
                      settlementName: '',
                      vidDocId: '',
                      issuedBy: '',
                      clientType: ''
                    };
                    // Пытаемся извлечь имя из longName
                    if (clientContragent.longName) {
                      const nameParts = clientContragent.longName.trim().split(/\s+/);
                      if (nameParts.length >= 1) basicData.surname = nameParts[0] || '';
                      if (nameParts.length >= 2) basicData.name = nameParts[1] || '';
                      if (nameParts.length >= 3) basicData.patronymic = nameParts.slice(2).join(' ') || '';
                    }
                    setPolicyholderData(basicData);
                    setContragentId(clientContragent.id);
                    if (clientContragent.identifier) {
                      setLoadedContragentIdentifier(clientContragent.identifier);
                    }
                    setAutoModeState('data_loaded');
                    // Уведомляем родительский компонент о загруженных данных
                    if (onSave) {
                      onSave(basicData);
                    }
                    console.log('✅ [CONTRAGENT] Базовые данные контрагента загружены из ProcessInstance');
                  }
                }
              } else if (!needsFullData && clientContragent) {
                // Если в ProcessInstance есть полные данные контрагента, используем их напрямую
                console.log('📥 [CONTRAGENT] Используем полные данные из ProcessInstance');
                const mappedData = mapContragentToPolicyholder(clientContragent);
                console.log('📥 [CONTRAGENT] Преобразованные данные для формы:', mappedData);
                setPolicyholderData(mappedData);
                setContragentId(clientContragent.id);
                if (clientContragent.identifier) {
                  setLoadedContragentIdentifier(clientContragent.identifier);
                }
                setAutoModeState('data_loaded');
                // Уведомляем родительский компонент о загруженных данных
                if (onSave) {
                  onSave(mappedData);
                }
                console.log('✅ [CONTRAGENT] Данные контрагента загружены из ProcessInstance и отображены в полях');
              }
            }
          }
        } catch (error) {
          console.warn('⚠️ [PROCESS INSTANCE] Не удалось получить ProcessInstance:', error.message);
          // Продолжаем без загрузки контрагента
        }
      } catch (error) {
        console.error('Ошибка загрузки контрагента:', error);
      } finally {
        setIsLoadingContragent(false);
      }
    };

    // Загружаем данные сразу при открытии заявки (не ждем isInitialLoad)
    if (applicationId) {
      loadContragent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  // Маппинг старых названий полей справочников на новые
  const getDictionaryFieldName = (oldName) => {
    const mapping = {
      'sectorCode': 'economSecId',
      'country': 'countryId',
      'region': 'district_nameru',
      'docType': 'vidDocId'
    };
    return mapping[oldName] || oldName;
  };

  // Преобразование кодов типа клиента в названия (для обратной совместимости)
  const getClientTypeDisplayValue = (value) => {
    if (!value) return '';
    const mapping = {
      'other': 'Иные лица',
      'worker': 'Работник',
      'family': 'Член семьи'
    };
    return mapping[value] || value;
  };

  // Функция для получения кода из объекта справочника (поддержка старого формата)
  const getCodeFromDictionaryValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.code || value.id || '';
    }
    return value;
  };

  // Функция для получения названия из объекта справочника
  const getNameFromDictionaryValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.nameRu || value.nameKz || value.code || '';
    }
    return value;
  };

  // Функция для нормализации даты в формат YYYY-MM-DD (System.DateOnly)
  const normalizeDate = (dateValue) => {
    // Обрабатываем пустые значения
    if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {
      return null;
    }
    
    // Если уже в формате YYYY-MM-DD, возвращаем как есть
    const trimmed = String(dateValue).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    
    // Если дата в формате YYYY-MM-DD с временем (например, "2010-01-15T00:00:00"), берем только дату
    const dateOnlyMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateOnlyMatch) {
      return dateOnlyMatch[1];
    }
    
    // Пытаемся распарсить дату
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return null;
      }
      // Форматируем в YYYY-MM-DD (System.DateOnly формат)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.warn('Ошибка парсинга даты:', dateValue, e);
      return null;
    }
  };

  // Функция для преобразования даты из YYYY-MM-DD в DD.MM.YYYY (для отображения в форме)
  const formatDateForDisplay = (dateValue) => {
    if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {
      return '';
    }
    
    const trimmed = String(dateValue).trim();
    
    // Если дата в формате YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const [, year, month, day] = ymdMatch;
      return `${day}.${month}.${year}`;
    }
    
    // Если дата уже в формате DD.MM.YYYY, возвращаем как есть
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    
    // Пытаемся распарсить дату
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return '';
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (e) {
      console.warn('Ошибка форматирования даты для отображения:', dateValue, e);
      return '';
    }
  };

  // Маппинг данных Policyholder в формат Contragent API
  const mapPolicyholderToContragent = (data, contragentId = null, contragentRelationId = null, loadedIdentifier = null) => {
    // Получаем код страны из объекта или строки
    let countryCode = getCodeFromDictionaryValue(data.countryId);
    const countryName = getNameFromDictionaryValue(data.countryId);
    
    // Проверяем, что countryCode - это действительно код (2-3 символа), а не название
    // Если это название (длинная строка), то не используем его как код
    if (countryCode && countryCode.length > 3) {
      // Это название, а не код - очищаем
      countryCode = '';
    }
    
    // Если страна выбрана из справочника (есть countryId), но код не найден,
    // используем значение по умолчанию 'KZ' (Казахстан) и считаем резидентом
    const hasCountrySelected = data.countryId && (typeof data.countryId === 'object' || data.countryId);
    if (hasCountrySelected && !countryCode) {
      countryCode = 'KZ'; // По умолчанию Казахстан, если страна выбрана, но код не найден
    }
    
    // Получаем коды других справочников
    // Получаем код пола - проверяем, что это код, а не название
    let genderCode = getCodeFromDictionaryValue(data.gender);
    const genderName = getNameFromDictionaryValue(data.gender);
    
    // Маппинг названий полов на коды (API требует коды "male"/"female", а не названия)
    const genderMapping = {
      'Мужской': 'male',
      'Женский': 'female',
      'male': 'male',
      'female': 'female'
    };
    
    // Если genderCode - это название (не "male" или "female"), пытаемся найти код в маппинге
    if (genderCode && genderCode !== 'male' && genderCode !== 'female') {
      genderCode = genderMapping[genderCode] || '';
    }
    
    // Если кода все еще нет, но есть название, пытаемся найти код по названию
    if (!genderCode && genderName) {
      genderCode = genderMapping[genderName] || '';
    }
    
    // Получаем код сектора экономики - извлекаем только код (например, "9" из "9 - Домашние хозяйства/физическое лицо")
    let economicSectorCode = getCodeFromDictionaryValue(data.economSecId);
    let economicSectorName = getNameFromDictionaryValue(data.economSecId);
    
    // Если economicSectorCode содержит " - ", извлекаем только код до дефиса
    if (economicSectorCode && typeof economicSectorCode === 'string' && economicSectorCode.includes(' - ')) {
      const codePart = economicSectorCode.split(' - ')[0].trim();
      // Проверяем, что это действительно код (число)
      if (/^\d+$/.test(codePart)) {
        economicSectorCode = codePart;
      }
    }
    
    // Убираем код из названия сектора экономики (если название содержит "9 - ", убираем эту часть)
    if (economicSectorName && typeof economicSectorName === 'string' && economicSectorName.includes(' - ')) {
      economicSectorName = economicSectorName.split(' - ').slice(1).join(' - ').trim();
    }
    
    // Если economicSectorCode - это длинная строка без дефиса, возможно это название, пытаемся найти код
    if (economicSectorCode && typeof economicSectorCode === 'string' && economicSectorCode.length > 10 && !economicSectorCode.includes(' - ')) {
      // Маппинг названий секторов на коды
      const sectorMapping = {
        'Правительство Республики Казахстан или Правительство иностранного государства': '1',
        'Региональные и местные органы управления': '2',
        'Центральный (национальный) банк': '3',
        'Другие депозитные организации': '4',
        'Другие финансовые организации': '5',
        'Государственные нефинансовые организации': '6',
        'Негосударственные нефинансовые организации': '7',
        'Некоммерческие организации, обслуживающие домашние хозяйства': '8',
        'Домашние хозяйства/физическое лицо': '9'
      };
      economicSectorCode = sectorMapping[economicSectorCode] || '';
    }
    // Получаем код типа документа - проверяем, что это код, а не название
    let docTypeCode = getCodeFromDictionaryValue(data.vidDocId);
    const docTypeName = getNameFromDictionaryValue(data.vidDocId);
    
    // Маппинг названий типов документов на коды (API требует коды, а не названия)
    const docTypeMapping = {
      'Удостоверение личности': '1',
      'Паспорт': '2',
      'Свидетельство о рождении': '3',
      'Вид на жительство иностранца': '4'
    };
    
    // Если docTypeCode - это название (длинная строка или не является числом), пытаемся найти код в маппинге
    if (docTypeCode) {
      // Проверяем, является ли это кодом (короткая строка, обычно 1-2 символа) или названием
      if (docTypeCode.length > 10 || isNaN(docTypeCode)) {
        // Это название, пытаемся найти код
        docTypeCode = docTypeMapping[docTypeCode] || '';
      }
    }
    
    // Если кода все еще нет, но есть название, пытаемся найти код по названию
    if (!docTypeCode && docTypeName) {
      docTypeCode = docTypeMapping[docTypeName] || '';
    }
    // Получаем код органа выдачи - проверяем, что это код, а не название
    let issuerCode = getCodeFromDictionaryValue(data.issuedBy);
    const issuerName = getNameFromDictionaryValue(data.issuedBy);
    
    // Маппинг названий органов выдачи на коды (API требует коды, а не названия)
    const issuerMapping = {
      'Министерство внутренних дел Республики Казахстан': '1',
      'МИНИСТЕРСТВО ВНУТРЕННИХ ДЕЛ РК': '1',
      'МВД РК': '1',
      'Министерство юстиции Республики Казахстан': '2',
      'Запись актов гражданского состояния': '3',
      'ЗАГС': '3'
    };
    
    // Функция для поиска кода по названию (с учетом регистра)
    const findIssuerCode = (name) => {
      if (!name) return '';
      // Прямое совпадение
      if (issuerMapping[name]) {
        return issuerMapping[name];
      }
      // Поиск без учета регистра
      const nameLower = name.toLowerCase();
      for (const [key, value] of Object.entries(issuerMapping)) {
        if (key.toLowerCase() === nameLower) {
          return value;
        }
      }
      // Поиск по частичному совпадению (для "МИНИСТЕРСТВО ВНУТРЕННИХ ДЕЛ РК")
      if (nameLower.includes('внутренних дел') || nameLower.includes('мвд')) {
        return '1';
      }
      if (nameLower.includes('юстиции')) {
        return '2';
      }
      if (nameLower.includes('загс') || nameLower.includes('актов гражданского')) {
        return '3';
      }
      return '';
    };
    
    // Если issuerCode - это название (длинная строка), пытаемся найти код в маппинге
    if (issuerCode) {
      // Проверяем, является ли это кодом (короткая строка) или названием
      if (issuerCode.length > 10 || isNaN(issuerCode)) {
        // Это название, пытаемся найти код
        issuerCode = findIssuerCode(issuerCode);
      }
    }
    
    // Если кода все еще нет, но есть название, пытаемся найти код по названию
    if (!issuerCode && issuerName) {
      issuerCode = findIssuerCode(issuerName);
    }

    // API требует identifier для поиска или создания контрагента
    // Используем ИИН из данных, или identifier из загруженного контрагента, если ИИН пустой
    const contragentIdentifier = (data.iin || loadedIdentifier || '').trim();
    
    // Если нет contragentId и нет identifier - это ошибка
    if (!contragentId && !contragentIdentifier) {
      throw new Error('Необходимо указать либо contragentId контрагента, либо ИИН (identifier)');
    }

    // Определяем резидентность: если страна выбрана из справочника - всегда резидент
    // API требует residentTypeCode в нижнем регистре: "resident" или "nonResident" (как в Postman примере)
    // ВАЖНО: все из справочников берем как резидента
    const residentTypeCode = hasCountrySelected ? 'resident' : 'nonResident';
    
    // Формируем полное имя (LongName обязателен для создания нового контрагента)
    const longName = `${data.surname || ''} ${data.name || ''} ${data.patronymic || ''}`.trim();
    
    // Формируем объекты только если есть данные
    const addressData = {
      countryCode: countryCode || 'KZ', // Обязательное поле, по умолчанию KZ если не указано
      ...(countryName ? { countryName: countryName } : {}),
      ...(data.district_nameru ? { region: data.district_nameru } : {}),
      ...(data.settlementName ? { city: data.settlementName } : {}),
      ...(data.street ? { street: data.street } : {}),
      ...(data.houseNumber ? { building: data.houseNumber } : {}),
      ...(data.apartmentNumber ? { flat: data.apartmentNumber } : {}),
    };

    const identityDocData = {
      ...(docTypeCode ? { identityDocTypeCode: docTypeCode } : {}),
      ...(docTypeName ? { identityDocTypeName: docTypeName } : {}),
      ...(data.docNumber ? { number: data.docNumber } : {}),
      ...(issuerCode ? { identityDocIssuerCode: issuerCode } : {}),
      ...(issuerName ? { identityDocIssuerName: issuerName } : {}),
      // API требует формат DateOnly (YYYY-MM-DD), не принимает null - отправляем только если дата есть
      ...(normalizeDate(data.issueDate) ? { issuedDate: normalizeDate(data.issueDate) } : {}),
      ...(normalizeDate(data.expiryDate) ? { expireDate: normalizeDate(data.expiryDate) } : {}),
    };

    const detailData = {
      ...(data.surname ? { lastName: data.surname } : {}),
      ...(data.name ? { firstName: data.name } : {}),
      ...(data.patronymic ? { middleName: data.patronymic } : {}),
      // API требует формат DateOnly (YYYY-MM-DD), не принимает null - отправляем только если дата есть
      ...(normalizeDate(data.birthDate) ? { birthDate: normalizeDate(data.birthDate) } : {}),
        ...(genderCode ? { genderCode: genderCode } : {}),
        ...(genderName ? { genderName: genderName } : {}),
        ...(economicSectorCode ? { economicSectorCode: economicSectorCode } : {}),
        // economicSectorName уже очищен от кода выше
        ...(economicSectorName ? { economicSectorName: economicSectorName } : {}),
    };

    const contragentData = {
      // Если есть id связи контрагента с заявкой (из ProcessInstance), добавляем его для обновления
      ...(contragentRelationId ? { id: contragentRelationId } : {}),
      contragentTypeCode: 'individual', // Тип контрагента: individual (физическое лицо) или legal (юридическое лицо)
      residentTypeCode: residentTypeCode, // Тип резидентства: resident (резидент) или nonResident (нерезидент) - в нижнем регистре
      contragentRoleCode: 'client',
      contragentRoleName: 'Клиент',
      longName: longName || '', // Обязательное поле для создания нового контрагента (в нижнем регистре, как в Postman)
      ...(Object.keys(addressData).length > 1 ? { address: addressData } : {}), // Отправляем address только если есть данные (кроме countryCode)
      ...(data.telephone ? {
        contacts: [{
          contactTypeCode: 'mobile',
          contactTypeName: 'Мобильный телефон',
          value: data.telephone
        }]
      } : {}),
      // Отправляем identityDoc только если есть хотя бы одно поле
      ...(Object.keys(identityDocData).length > 0 ? { identityDoc: identityDocData } : {}),
      // Отправляем detail только если есть хотя бы одно поле
      ...(Object.keys(detailData).length > 0 ? { detail: detailData } : {}),
    };

    // API требует identifier для поиска или создания контрагента (в нижнем регистре, как в Postman)
    if (contragentIdentifier) {
      contragentData.identifier = contragentIdentifier;
    }

    return contragentData;
  };

  // Маппинг данных Contragent API в формат Policyholder
  const mapContragentToPolicyholder = (contragentData) => {
    if (!contragentData) return {};

    const address = contragentData.address || {};
    const detail = contragentData.detail || {};
    const identityDoc = contragentData.identityDoc || {};
    
    // Находим мобильный телефон в контактах
    const mobileContact = contragentData.contacts?.find(c => c.contactTypeCode === 'mobile');
    
    // Формируем объект страны из API
    const countryValue = address.countryCode ? {
      code: address.countryCode,
      nameRu: address.countryName || address.countryCode
    } : null;

    // Формируем название сектора экономики с кодом: "9 - Домашние хозяйства/физическое лицо"
    const economicSectorName = detail.economicSectorName || '';
    const economicSectorCode = detail.economicSectorCode || '';
    const economicSectorDisplayName = economicSectorCode && economicSectorName 
      ? `${economicSectorCode} - ${economicSectorName}`
      : economicSectorName || economicSectorCode || '';

    return {
      iin: contragentData.identifier || contragentData.contragentIdentifier || '',
      telephone: mobileContact?.value || '',
      name: detail.firstName || '',
      surname: detail.lastName || '',
      patronymic: detail.middleName || '',
      street: address.street || '',
      houseNumber: address.building || '',
      apartmentNumber: address.flat || '',
      docNumber: identityDoc.number || '',
      // Преобразуем даты из YYYY-MM-DD в DD.MM.YYYY для отображения в форме
      birthDate: formatDateForDisplay(detail.birthDate || ''),
      issueDate: formatDateForDisplay(identityDoc.issuedDate || ''),
      expiryDate: formatDateForDisplay(identityDoc.expireDate || ''),
      // Справочники - сохраняем как объекты если есть код и название
      gender: detail.genderCode ? {
        code: detail.genderCode,
        nameRu: detail.genderName || detail.genderCode
      } : '',
      economSecId: detail.economicSectorCode ? {
        code: detail.economicSectorCode,
        nameRu: economicSectorDisplayName
      } : '',
      countryId: countryValue,
      // Используем region вместо district для области
      district_nameru: address.region || address.district || '',
      settlementName: address.city || '',
      vidDocId: identityDoc.identityDocTypeCode ? {
        code: identityDoc.identityDocTypeCode,
        nameRu: identityDoc.identityDocTypeName || identityDoc.identityDocTypeCode
      } : '',
      issuedBy: identityDoc.identityDocIssuerCode ? {
        code: identityDoc.identityDocIssuerCode,
        nameRu: identityDoc.identityDocIssuerName || identityDoc.identityDocIssuerCode
      } : '',
      // Тип клиента - это отдельное поле, не contragentRoleCode (который всегда "client" для страхователя)
      // Если в API есть отдельное поле для типа клиента, используем его, иначе оставляем пустым
      // Пользователь должен выбрать тип клиента вручную: "Иные лица", "Работник" или "Член семьи"
      clientType: contragentData.clientType || contragentData.insuredType || ''
    };
  };

  // Обработчик для сохранения выбранных значений из справочников
  const handleDictionaryValueSelect = (fieldName, value) => {
    const newFieldName = getDictionaryFieldName(fieldName);
    console.log('🔵 [DICTIONARY SELECT] Поле:', fieldName, '→', newFieldName, 'Значение:', value);
    setPolicyholderData(prev => {
      const updated = {
        ...prev,
        [newFieldName]: value
      };
      console.log('🔵 [DICTIONARY SELECT] Обновленные данные:', updated);
      return updated;
    });
    setCurrentView('main');
  };

  const handleBackToMain = () => setCurrentView('main');
  const handleOpenGender = () => setCurrentView('gender');
  const handleOpenSectorCode = () => setCurrentView('sectorCode');
  const handleOpenCountry = () => setCurrentView('country');
  const handleOpenRegion = () => setCurrentView('region');
  const handleOpenDocType = () => setCurrentView('docType');
  const handleOpenIssuedBy = () => setCurrentView('issuedBy');
  const handleOpenClientType = () => setCurrentView('clientType');

  // Активация поля при клике
  const handleFieldClick = (fieldName) => {
    setActiveField(fieldName);
    
    // Для поля телефона, если оно пустое, устанавливаем +7
    if (fieldName === 'phone') {
      const newFieldName = getFieldName(fieldName);
      if (!policyholderData[newFieldName] || policyholderData[newFieldName].trim() === '') {
        setPolicyholderData(prev => ({
          ...prev,
          [newFieldName]: '+7'
        }));
      }
    }
  };

  // Маппинг старых названий полей на новые
  const getFieldName = (oldName) => {
    const mapping = {
      'phone': 'telephone',
      'firstName': 'name',
      'lastName': 'surname',
      'middleName': 'patronymic',
      'documentNumber': 'docNumber'
    };
    return mapping[oldName] || oldName;
  };

  // Функция форматирования телефона с +7
  const formatPhoneNumber = (value) => {
    // Убираем все нецифровые символы, кроме +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Если начинается с +7, оставляем как есть, иначе добавляем +7
    if (cleaned.startsWith('+7')) {
      cleaned = cleaned.substring(2); // Убираем +7
    } else if (cleaned.startsWith('7')) {
      cleaned = cleaned.substring(1); // Убираем 7
    } else if (cleaned.startsWith('8')) {
      cleaned = cleaned.substring(1); // Убираем 8
    }
    
    // Ограничиваем до 10 цифр (без +7)
    cleaned = cleaned.substring(0, 10);
    
    // Форматируем: +7 (XXX) XXX-XX-XX
    if (cleaned.length === 0) {
      return '+7';
    } else if (cleaned.length <= 3) {
      return `+7 (${cleaned}`;
    } else if (cleaned.length <= 6) {
      return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    } else if (cleaned.length <= 8) {
      return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else {
      return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
    }
  };

  // Обновление значения поля
  const handleFieldChange = (fieldName, value) => {
    const newFieldName = getFieldName(fieldName);
    let processedValue = value;
    
    // Для поля телефона применяем форматирование
    if (fieldName === 'phone' || newFieldName === 'telephone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setPolicyholderData(prev => ({
      ...prev,
      [newFieldName]: processedValue
    }));
  };

  // Возврат к обычному состоянию при потере фокуса
  const handleFieldBlur = (fieldName) => {
    const newFieldName = getFieldName(fieldName);
    const value = policyholderData[newFieldName];
    
    // Для поля телефона, если оно пустое или содержит только +7, оставляем +7
    if (fieldName === 'phone' || newFieldName === 'telephone') {
      if (!value || value.trim() === '' || value === '+7') {
        setPolicyholderData(prev => ({
          ...prev,
          [newFieldName]: '+7'
        }));
        // Не убираем активное состояние для телефона, чтобы пользователь мог продолжить ввод
        return;
      }
    }
    
    if (!value) {
      setActiveField(null);
    }
  };

  // Обработчик для переключения состояния toggle кнопок
  const handleToggleClick = (toggleName) => {
    setToggleStates(prev => ({
      ...prev,
      [toggleName]: !prev[toggleName]
    }));
    // При включении ручного ввода сбрасываем состояние автоматического режима
    if (toggleName === 'manualInput' && !toggleStates.manualInput) {
      setAutoModeState('initial');
    }
  };

  // Обработчик для отправки запроса
  const handleSendRequest = async () => {
    // Проверяем наличие ИИН и телефона
    if (!policyholderData.iin || !policyholderData.telephone) {
      setErrorMessage('Пожалуйста, заполните ИИН и номер телефона');
      return;
    }

    // Очищаем предыдущую ошибку
    setErrorMessage(null);
    
    // Переход в состояние request_sent и загрузки
    setAutoModeState('request_sent');
    setIsLoading(true);
    
    try {
      // Отправляем запрос на сервер
      const phone = policyholderData.telephone.replace(/\D/g, ''); // Убираем все нецифровые символы
      const iin = policyholderData.iin.replace(/\D/g, ''); // Убираем все нецифровые символы
      
      const apiData = await getPerson(phone, iin);
      
      // Сохраняем данные из API
      setApiResponseData(apiData);
      
      // Переход в состояние response_received
      setAutoModeState('response_received');
    } catch (error) {
      console.error('Error fetching person data:', error);
      setErrorMessage('Ошибка при получении данных. Попробуйте еще раз.');
      setAutoModeState('initial');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик для обновления данных
  const handleUpdate = () => {
    if (!apiResponseData) {
      setErrorMessage('Нет данных для обновления');
      return;
    }
    
    // Очищаем предыдущую ошибку
    setErrorMessage(null);

    // Маппинг данных из API ответа в формат формы
    const mappedData = mapApiDataToForm(apiResponseData);
    
    console.log('🔵 [HANDLE UPDATE] API Response:', apiResponseData);
    console.log('🔵 [HANDLE UPDATE] Mapped Data:', mappedData);
    console.log('🔵 [HANDLE UPDATE] district_nameru from API:', apiResponseData.district_nameru);
    console.log('🔵 [HANDLE UPDATE] region_nameru from API:', apiResponseData.region_nameru);
    console.log('🔵 [HANDLE UPDATE] mapped district_nameru:', mappedData.district_nameru);
    console.log('🔵 [HANDLE UPDATE] mapped settlementName:', mappedData.settlementName);
    
    // Обновляем поля формы, сохраняя уже введенные ИИН и телефон
    // Для остальных полей используем значения из API (даже если они пустые), чтобы перезаписать старые данные
    setPolicyholderData(prev => {
      const updated = {
        ...prev,
        // ИИН и телефон сохраняем, если они уже были введены
        iin: prev.iin || mappedData.iin || '',
        telephone: prev.telephone || mappedData.telephone || '',
        // Остальные поля перезаписываем значениями из API (включая пустые строки)
        name: mappedData.name !== undefined ? mappedData.name : prev.name,
        surname: mappedData.surname !== undefined ? mappedData.surname : prev.surname,
        patronymic: mappedData.patronymic !== undefined ? mappedData.patronymic : prev.patronymic,
        street: mappedData.street !== undefined ? mappedData.street : prev.street,
        houseNumber: mappedData.houseNumber !== undefined ? mappedData.houseNumber : prev.houseNumber,
        apartmentNumber: mappedData.apartmentNumber !== undefined ? mappedData.apartmentNumber : prev.apartmentNumber,
        docNumber: mappedData.docNumber !== undefined ? mappedData.docNumber : prev.docNumber,
        birthDate: mappedData.birthDate !== undefined ? mappedData.birthDate : prev.birthDate,
        issueDate: mappedData.issueDate !== undefined ? mappedData.issueDate : prev.issueDate,
        expiryDate: mappedData.expiryDate !== undefined ? mappedData.expiryDate : prev.expiryDate,
        gender: mappedData.gender !== undefined ? mappedData.gender : prev.gender,
        countryId: mappedData.countryId !== undefined ? mappedData.countryId : prev.countryId,
        district_nameru: mappedData.district_nameru !== undefined ? mappedData.district_nameru : prev.district_nameru,
        settlementName: mappedData.settlementName !== undefined ? mappedData.settlementName : prev.settlementName,
        economSecId: mappedData.economSecId !== undefined ? mappedData.economSecId : prev.economSecId,
        vidDocId: mappedData.vidDocId !== undefined ? mappedData.vidDocId : prev.vidDocId,
        issuedBy: mappedData.issuedBy !== undefined ? mappedData.issuedBy : prev.issuedBy
      };
      console.log('🔵 [HANDLE UPDATE] Updated policyholderData:', updated);
      // Обновляем метаданные заявки с ИИН страхователя
      if (applicationId && updated.iin) {
        const existingMetadata = loadApplicationMetadata(applicationId) || {};
        saveApplicationMetadata(applicationId, {
          ...existingMetadata,
          policyholderIin: updated.iin
        });
      }
      return updated;
    });
    
    // Переход в состояние data_loaded
    setAutoModeState('data_loaded');
  };

  // Определение текста кнопки в заголовке
  const getHeaderButtonText = () => {
    // Если идет загрузка, показываем "Загрузка..."
    if (isLoading) {
      return 'Загрузка...';
    }
    
    // Если ручной ввод включен - кнопка всегда "Сохранить"
    if (toggleStates.manualInput) {
      return 'Сохранить';
    }
    
    // Если ручной ввод выключен - кнопка зависит от состояния автоматического режима
    if (autoModeState === 'initial' || autoModeState === 'request_sent') {
      return 'Отправить запрос';
    }
    
    if (autoModeState === 'response_received') {
      return 'Обновить';
    }
    
    if (autoModeState === 'data_loaded') {
      return 'Сохранить';
    }
    
    return 'Сохранить';
  };

  // Определение действия кнопки в заголовке
  const handleHeaderButtonClick = async () => {
    // Если ручной ввод включен - сохраняем данные
    if (toggleStates.manualInput) {
      const dataToSave = {
        ...policyholderData,
        ...toggleStates
      };
      
      // Сохраняем в localStorage
      const saveData = {
        ...policyholderData,
        toggleStates,
        autoModeState,
        contragentId, // Сохраняем ID контрагента
        contragentRelationId // Сохраняем ID связи контрагента с заявкой
      };
      console.log('💾 [СТРАХОВАТЕЛЬ] Сохранение по кнопке (ручной ввод):', saveData);
      
      // Сохраняем в API через Contragent PUT
      if (applicationId) {
        try {
          const token = getAccessToken();
          if (token) {
            // API требует именно taskId, а не applicationId (processInstanceId)
            // Если taskId отсутствует или равен applicationId, пытаемся получить его из метаданных или processInstance
            let actualTaskId = taskId;
            if (!actualTaskId || actualTaskId.trim() === '' || actualTaskId === applicationId) {
              // Пытаемся получить taskId из метаданных
              const metadata = loadApplicationMetadata(applicationId);
              if (metadata?.taskId && metadata.taskId !== applicationId) {
                actualTaskId = metadata.taskId;
                console.log('🔍 [CONTRAGENT] taskId получен из метаданных:', actualTaskId);
              } else {
                // Пытаемся получить taskId из processInstance (если он уже загружен)
                try {
                  const processInstance = await getProcessInstanceDetails(applicationId, token);
                  // Проверяем, есть ли в processInstance поле taskId или tasks массив
                  if (processInstance?.taskId && processInstance.taskId !== applicationId) {
                    actualTaskId = processInstance.taskId;
                    console.log('🔍 [CONTRAGENT] taskId получен из processInstance:', actualTaskId);
                  } else if (processInstance?.tasks && Array.isArray(processInstance.tasks) && processInstance.tasks.length > 0) {
                    // Берем первый taskId из массива tasks
                    const firstTask = processInstance.tasks[0];
                    if (firstTask?.id && firstTask.id !== applicationId) {
                      actualTaskId = firstTask.id;
                      console.log('🔍 [CONTRAGENT] taskId получен из processInstance.tasks:', actualTaskId);
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ [CONTRAGENT] Не удалось получить processInstance для поиска taskId:', error.message);
                }
              }
            }
            
            console.log('🔍 [CONTRAGENT] taskId:', actualTaskId, 'applicationId:', applicationId, 'taskId из props:', taskId);
            
            // Определяем accessId для API: если taskId найден и не равен applicationId, используем его, иначе используем applicationId
            // Согласно Postman примеру, accessId может быть как taskId, так и applicationId (processInstanceId)
            let accessIdForAPI = actualTaskId && actualTaskId !== applicationId ? actualTaskId : applicationId;
            
            if (!accessIdForAPI || accessIdForAPI.trim() === '') {
              console.warn('⚠️ [CONTRAGENT] accessId не найден, пропускаем сохранение контрагента в API. Данные сохранены локально.');
            } else {
              try {
                // Преобразуем данные в формат API
                const contragentData = mapPolicyholderToContragent(policyholderData, contragentId, contragentRelationId, loadedContragentIdentifier);
                
                // Логируем данные перед отправкой для диагностики
                console.log('📤 [CONTRAGENT] Отправка данных контрагента в API с accessId:', accessIdForAPI);
                console.log('📤 [CONTRAGENT] Данные контрагента:', JSON.stringify(contragentData, null, 2));
                
                // Вызываем PUT для сохранения/обновления контрагента (используем accessIdForAPI как accessId в URL)
                const savedContragent = await updateContragent(contragentData, accessIdForAPI.trim(), token);
                
                // Сохраняем ID контрагента из ответа
                if (savedContragent?.id) {
                  setContragentId(savedContragent.id);
                  saveData.contragentId = savedContragent.id;
                } else if (contragentId) {
                  saveData.contragentId = contragentId;
                }
                
                console.log('✅ [CONTRAGENT] Данные контрагента сохранены в API');
              } catch (error) {
                // Если ошибка связана с отсутствием ИИН - это не критично, продолжаем работу
                if (error.message && error.message.includes('contragentIdentifier')) {
                  console.warn('⚠️ [CONTRAGENT] Не удалось сохранить в API (отсутствует ИИН):', error.message);
                } else if (error.message && error.message.includes('уже существует контрагент с ролью')) {
                  // Контрагент уже существует - это нормально, данные сохранены локально
                  console.warn('⚠️ [CONTRAGENT] Контрагент с ролью client уже существует в заявке. Данные сохранены локально.');
                } else {
                  console.error('Ошибка сохранения контрагента в API:', error);
                  // Продолжаем работу, данные сохранены локально
                }
              }
            }
          }
        } catch (error) {
          console.error('Ошибка сохранения контрагента в API:', error);
          // Продолжаем работу, данные сохранены локально
        }
      }
      
      // НЕ сохраняем в global storage - используем только локальное состояние
      // Обновляем метаданные заявки с ИИН страхователя
      if (applicationId && policyholderData.iin) {
        const existingMetadata = loadApplicationMetadata(applicationId) || {};
        saveApplicationMetadata(applicationId, {
          ...existingMetadata,
          policyholderIin: policyholderData.iin
        });
      }
      
      if (onSave) {
        // Преобразуем данные для отображения в Application.js
        const displayData = {
          firstName: policyholderData.name || '',
          lastName: policyholderData.surname || '',
          middleName: policyholderData.patronymic || '',
          iin: policyholderData.iin || '',
          ...dataToSave
        };
        onSave(displayData);
      }
      if (onBack) {
        onBack();
      }
      return;
    }
    
    // Если ручной ввод выключен - действия зависят от состояния автоматического режима
    if (autoModeState === 'initial' || autoModeState === 'request_sent') {
      handleSendRequest();
      return;
    }
    
    if (autoModeState === 'response_received') {
      handleUpdate();
      return;
    }
    
    if (autoModeState === 'data_loaded') {
      // Сохранение данных
      const dataToSave = {
        ...policyholderData,
        ...toggleStates
      };
      
      // Сохраняем в localStorage
      const saveData = {
        ...policyholderData,
        toggleStates,
        autoModeState,
        contragentId, // Сохраняем ID контрагента
        contragentRelationId // Сохраняем ID связи контрагента с заявкой
      };
      console.log('💾 [СТРАХОВАТЕЛЬ] Сохранение по кнопке (авторежим):', saveData);
      
      // Сохраняем в API через Contragent PUT
      if (applicationId) {
        try {
          const token = getAccessToken();
          if (token) {
            // API требует именно taskId, а не applicationId (processInstanceId)
            // Если taskId отсутствует или равен applicationId, пытаемся получить его из метаданных или processInstance
            let actualTaskId = taskId;
            if (!actualTaskId || actualTaskId.trim() === '' || actualTaskId === applicationId) {
              // Пытаемся получить taskId из метаданных
              const metadata = loadApplicationMetadata(applicationId);
              if (metadata?.taskId && metadata.taskId !== applicationId) {
                actualTaskId = metadata.taskId;
                console.log('🔍 [CONTRAGENT] taskId получен из метаданных:', actualTaskId);
              } else {
                // Пытаемся получить taskId из processInstance (если он уже загружен)
                try {
                  const processInstance = await getProcessInstanceDetails(applicationId, token);
                  // Проверяем, есть ли в processInstance поле taskId или tasks массив
                  if (processInstance?.taskId && processInstance.taskId !== applicationId) {
                    actualTaskId = processInstance.taskId;
                    console.log('🔍 [CONTRAGENT] taskId получен из processInstance:', actualTaskId);
                  } else if (processInstance?.tasks && Array.isArray(processInstance.tasks) && processInstance.tasks.length > 0) {
                    // Берем первый taskId из массива tasks
                    const firstTask = processInstance.tasks[0];
                    if (firstTask?.id && firstTask.id !== applicationId) {
                      actualTaskId = firstTask.id;
                      console.log('🔍 [CONTRAGENT] taskId получен из processInstance.tasks:', actualTaskId);
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ [CONTRAGENT] Не удалось получить processInstance для поиска taskId:', error.message);
                }
              }
            }
            
            console.log('🔍 [CONTRAGENT] taskId:', actualTaskId, 'applicationId:', applicationId, 'taskId из props:', taskId);
            
            // Определяем accessId для API: если taskId найден и не равен applicationId, используем его, иначе используем applicationId
            // Согласно Postman примеру, accessId может быть как taskId, так и applicationId (processInstanceId)
            let accessIdForAPI = actualTaskId && actualTaskId !== applicationId ? actualTaskId : applicationId;
            
            if (!accessIdForAPI || accessIdForAPI.trim() === '') {
              console.warn('⚠️ [CONTRAGENT] accessId не найден, пропускаем сохранение контрагента в API. Данные сохранены локально.');
            } else {
              try {
                // Преобразуем данные в формат API
                const contragentData = mapPolicyholderToContragent(policyholderData, contragentId, contragentRelationId, loadedContragentIdentifier);
                
                // Логируем данные перед отправкой для диагностики
                console.log('📤 [CONTRAGENT] Отправка данных контрагента в API с accessId:', accessIdForAPI);
                console.log('📤 [CONTRAGENT] Данные контрагента:', JSON.stringify(contragentData, null, 2));
                
                // Вызываем PUT для сохранения/обновления контрагента (используем accessIdForAPI как accessId в URL)
                const savedContragent = await updateContragent(contragentData, accessIdForAPI.trim(), token);
                
                // Сохраняем ID контрагента из ответа
                if (savedContragent?.id) {
                  setContragentId(savedContragent.id);
                  saveData.contragentId = savedContragent.id;
                } else if (contragentId) {
                  saveData.contragentId = contragentId;
                }
                
                console.log('✅ [CONTRAGENT] Данные контрагента сохранены в API');
              } catch (error) {
                // Если ошибка связана с отсутствием ИИН - это не критично, продолжаем работу
                if (error.message && error.message.includes('contragentIdentifier')) {
                  console.warn('⚠️ [CONTRAGENT] Не удалось сохранить в API (отсутствует ИИН):', error.message);
                } else if (error.message && error.message.includes('уже существует контрагент с ролью')) {
                  // Контрагент уже существует - это нормально, данные сохранены локально
                  console.warn('⚠️ [CONTRAGENT] Контрагент с ролью client уже существует в заявке. Данные сохранены локально.');
                } else {
                  console.error('Ошибка сохранения контрагента в API:', error);
                  // Продолжаем работу, данные сохранены локально
                }
              }
            }
          }
        } catch (error) {
          console.error('Ошибка сохранения контрагента в API:', error);
          // Продолжаем работу, данные сохранены локально
        }
      }
      
      // НЕ сохраняем в global storage - используем только локальное состояние
      // Обновляем метаданные заявки с ИИН страхователя
      if (applicationId && policyholderData.iin) {
        const existingMetadata = loadApplicationMetadata(applicationId) || {};
        saveApplicationMetadata(applicationId, {
          ...existingMetadata,
          policyholderIin: policyholderData.iin
        });
      }
      
      if (onSave) {
        // Преобразуем данные для отображения в Application.js
        const displayData = {
          firstName: policyholderData.name || '',
          lastName: policyholderData.surname || '',
          middleName: policyholderData.patronymic || '',
          iin: policyholderData.iin || '',
          ...dataToSave
        };
        onSave(displayData);
      }
      if (onBack) {
        onBack();
      }
      return;
    }
  };

  // Функция для рендеринга кнопок справочника
  const renderDictionaryButton = (fieldName, label, onClickHandler, hasValue) => {
    const newFieldName = getDictionaryFieldName(fieldName);
    const fieldValue = policyholderData[newFieldName];
    // Для типа клиента используем специальную функцию для отображения
    // Для countryId и других справочников получаем название из объекта
    const displayValue = fieldName === 'clientType' 
      ? getClientTypeDisplayValue(fieldValue)
      : (fieldName === 'country' || newFieldName === 'countryId')
        ? getNameFromDictionaryValue(fieldValue)
        : (typeof fieldValue === 'object' && fieldValue !== null)
          ? getNameFromDictionaryValue(fieldValue)
          : fieldValue;
    if (hasValue) {
      return (
        <div data-layer={`Input '${label}'`} data-state="pressed" className="Input" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Label" className="Label" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{label}</div>
            <div data-layer="Input text" className="InputText" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{displayValue}</div>
          </div>
          <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}} onClick={onClickHandler}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div data-layer={`Input '${label}'`} data-state="not_pressed" className="Input" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{label}</div>
          </div>
          <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}} onClick={onClickHandler}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      );
    }
  };

  // Функция рендеринга поля с календарем
  const renderCalendarField = (fieldName, label) => {
    const isActive = activeField === fieldName;
    const hasValue = !!policyholderData[fieldName];

    if (isActive || hasValue) {
      // Активное состояние - с полем ввода
      return (
        <div data-layer={`Input '${label}'`} data-state="pressed" className="Input" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{label}</div>
            <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
              <input
                type="text"
                value={policyholderData[fieldName] || ''}
                onChange={(e) => {
                  setPolicyholderData(prev => ({
                    ...prev,
                    [fieldName]: e.target.value
                  }));
                }}
                onBlur={() => {
                  if (!policyholderData[fieldName]) {
                    setActiveField(null);
                  }
                }}
                autoFocus={isActive}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  color: '#071222',
                  paddingLeft: 0,
                  marginLeft: 0
                }}
              />
            </div>
          </div>
          <div data-layer="Calendar button" className="CalendarButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}} onClick={() => handleFieldClick(fieldName)}>
            <div data-svg-wrapper data-layer="Calendar" className="Calendar" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.3335 0.916626C7.83976 0.916626 8.25016 1.32703 8.25016 1.83329V2.74996H13.7502V1.83329C13.7502 1.32703 14.1606 0.916626 14.6668 0.916626C15.1731 0.916626 15.5835 1.32703 15.5835 1.83329V2.74996H17.4168C18.1462 2.74996 18.8456 3.03969 19.3614 3.55542C19.8771 4.07114 20.1668 4.77061 20.1668 5.49996V18.3333C20.1668 19.0626 19.8771 19.7621 19.3614 20.2778C18.8456 20.7936 18.1462 21.0833 17.4168 21.0833H4.5835C3.85415 21.0833 3.15468 20.7936 2.63895 20.2778C2.12323 19.7621 1.8335 19.0626 1.8335 18.3333V5.49996C1.8335 4.77061 2.12323 4.07114 2.63895 3.55542C3.15468 3.03969 3.85415 2.74996 4.5835 2.74996H6.41683V1.83329C6.41683 1.32703 6.82724 0.916626 7.3335 0.916626ZM6.41683 4.58329H4.5835C4.34038 4.58329 4.10722 4.67987 3.93531 4.85178C3.76341 5.02369 3.66683 5.25684 3.66683 5.49996V8.24996H18.3335V5.49996C18.3335 5.25684 18.2369 5.02369 18.065 4.85178C17.8931 4.67987 17.6599 4.58329 17.4168 4.58329H15.5835V5.49996C15.5835 6.00622 15.1731 6.41663 14.6668 6.41663C14.1606 6.41663 13.7502 6.00622 13.7502 5.49996V4.58329H8.25016V5.49996C8.25016 6.00622 7.83976 6.41663 7.3335 6.41663C6.82724 6.41663 6.41683 6.00622 6.41683 5.49996V4.58329ZM18.3335 10.0833H3.66683V18.3333C3.66683 18.5764 3.76341 18.8096 3.93531 18.9815C4.10722 19.1534 4.34038 19.25 4.5835 19.25H17.4168C17.6599 19.25 17.8931 19.1534 18.065 18.9815C18.2369 18.8096 18.3335 18.5764 18.3335 18.3333V10.0833Z" fill="black"/>
              </svg>
            </div>
          </div>
        </div>
      );
    } else {
      // Обычное состояние - только название
      return (
        <div data-layer={`Input '${label}'`} data-state="not_pressed" className="Input" onClick={() => handleFieldClick(fieldName)} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex', cursor: 'pointer'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{label}</div>
          </div>
          <div data-layer="Calendar button" className="CalendarButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); handleFieldClick(fieldName); }}>
            <div data-svg-wrapper data-layer="Calendar" className="Calendar" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.3335 0.916626C7.83976 0.916626 8.25016 1.32703 8.25016 1.83329V2.74996H13.7502V1.83329C13.7502 1.32703 14.1606 0.916626 14.6668 0.916626C15.1731 0.916626 15.5835 1.32703 15.5835 1.83329V2.74996H17.4168C18.1462 2.74996 18.8456 3.03969 19.3614 3.55542C19.8771 4.07114 20.1668 4.77061 20.1668 5.49996V18.3333C20.1668 19.0626 19.8771 19.7621 19.3614 20.2778C18.8456 20.7936 18.1462 21.0833 17.4168 21.0833H4.5835C3.85415 21.0833 3.15468 20.7936 2.63895 20.2778C2.12323 19.7621 1.8335 19.0626 1.8335 18.3333V5.49996C1.8335 4.77061 2.12323 4.07114 2.63895 3.55542C3.15468 3.03969 3.85415 2.74996 4.5835 2.74996H6.41683V1.83329C6.41683 1.32703 6.82724 0.916626 7.3335 0.916626ZM6.41683 4.58329H4.5835C4.34038 4.58329 4.10722 4.67987 3.93531 4.85178C3.76341 5.02369 3.66683 5.25684 3.66683 5.49996V8.24996H18.3335V5.49996C18.3335 5.25684 18.2369 5.02369 18.065 4.85178C17.8931 4.67987 17.6599 4.58329 17.4168 4.58329H15.5835V5.49996C15.5835 6.00622 15.1731 6.41663 14.6668 6.41663C14.1606 6.41663 13.7502 6.00622 13.7502 5.49996V4.58329H8.25016V5.49996C8.25016 6.00622 7.83976 6.41663 7.3335 6.41663C6.82724 6.41663 6.41683 6.00622 6.41683 5.49996V4.58329ZM18.3335 10.0833H3.66683V18.3333C3.66683 18.5764 3.76341 18.8096 3.93531 18.9815C4.10722 19.1534 4.34038 19.25 4.5835 19.25H17.4168C17.6599 19.25 17.8931 19.1534 18.065 18.9815C18.2369 18.8096 18.3335 18.5764 18.3335 18.3333V10.0833Z" fill="black"/>
              </svg>
            </div>
          </div>
        </div>
      );
    }
  };

  // Функция рендеринга поля без кнопки
  const renderInputField = (fieldName, label, defaultValue = '') => {
    const newFieldName = getFieldName(fieldName);
    const isActive = activeField === fieldName;
    const hasValue = !!policyholderData[newFieldName];

    if (isActive || hasValue) {
      // Активное состояние - с полем ввода
      return (
        <div data-layer="InputContainerWithoutButton" data-state="pressed" className="Inputcontainerwithoutbutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
            <div data-layer="LabelDefault" className="Labeldefault" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{label}</div>
            <div data-layer="%Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
              <input
                type="text"
                value={policyholderData[newFieldName] || ''}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                onBlur={() => handleFieldBlur(fieldName)}
                autoFocus={isActive}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  color: '#071222',
                  paddingLeft: 0,
                  marginLeft: 0
                }}
              />
            </div>
          </div>
        </div>
      );
    } else {
      // Обычное состояние - только название
      return (
        <div data-layer="InputContainerWithoutButton" data-state="not_pressed" className="Inputcontainerwithoutbutton" onClick={() => handleFieldClick(fieldName)} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{label}</div>
          </div>
        </div>
      );
    }
  };

  if (currentView === 'gender') {
    return <Gender onBack={handleBackToMain} onSelect={(value) => handleDictionaryValueSelect('gender', value)} />;
  }

  if (currentView === 'sectorCode') {
    return <SectorCode onBack={handleBackToMain} onSelect={(value) => handleDictionaryValueSelect('sectorCode', value)} initialValue={policyholderData.economSecId} />;
  }

  if (currentView === 'country') {
    return <Country 
      onBack={handleBackToMain} 
      onSave={(value) => handleDictionaryValueSelect('country', value)}
      initialValue={policyholderData.countryId}
    />;
  }

  if (currentView === 'region') {
    return <Region onBack={handleBackToMain} onSave={(value) => handleDictionaryValueSelect('region', value)} />;
  }


  if (currentView === 'docType') {
    return <DocType onBack={handleBackToMain} onSave={(value) => handleDictionaryValueSelect('docType', value)} />;
  }

  if (currentView === 'issuedBy') {
    return <IssuedBy onBack={handleBackToMain} onSelect={(value) => handleDictionaryValueSelect('issuedBy', value)} />;
  }

  if (currentView === 'clientType') {
    return <ClientType onBack={handleBackToMain} onSave={(value) => handleDictionaryValueSelect('clientType', value)} />;
  }

  // Показываем индикатор загрузки, если данные загружаются
  if (isLoadingContragent) {
    return (
      <div data-layer="Policyholder data page" className="PolicyholderDataPage" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '100vh'}}>
        <div style={{textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500'}}>
          Загрузка данных страхователя...
        </div>
      </div>
    );
  }

  return (
    <div data-layer="Policyholder data page" className="PolicyholderDataPage" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
  <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Back button" className="BackButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
      <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  </div>
  <div data-layer="Policyholder data" className="PolicyholderData" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Страхователь</div>
        <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
          <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={isLoading ? undefined : handleHeaderButtonClick} style={{width: 390, height: 85, background: isLoading ? '#666' : 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1}}>
            <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{getHeaderButtonText()}</div>
          </div>
        </div>
      </div>
    </div>
        {/* Alert для уведомлений */}
        {(!toggleStates.manualInput && (autoModeState === 'request_sent' || autoModeState === 'response_received')) || errorMessage ? (
          <div data-layer="Alert" className="Alert" style={{alignSelf: 'stretch', height: 85, paddingRight: 20, background: errorMessage ? '#fff5f5' : 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div data-layer="Info container" className="InfoContainer" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
              {errorMessage ? (
                <div data-svg-wrapper data-layer="Error" className="Error" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="10" stroke="#d32f2f" strokeWidth="2"/>
                    <path d="M11 7V11M11 15H11.01" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              ) : (
                <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_491_9703)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.916748 10.9998C0.916748 5.43083 5.43107 0.916504 11.0001 0.916504C16.5691 0.916504 21.0834 5.43083 21.0834 10.9998C21.0834 16.5688 16.5691 21.0832 11.0001 21.0832C5.43107 21.0832 0.916748 16.5688 0.916748 10.9998ZM11.0001 2.74984C6.44359 2.74984 2.75008 6.44335 2.75008 10.9998C2.75008 15.5563 6.44359 19.2498 11.0001 19.2498C15.5566 19.2498 19.2501 15.5563 19.2501 10.9998C19.2501 6.44335 15.5566 2.74984 11.0001 2.74984ZM10.0742 7.33317C10.0742 6.82691 10.4847 6.4165 10.9909 6.4165H11.0001C11.5063 6.4165 11.9167 6.82691 11.9167 7.33317C11.9167 7.83943 11.5063 8.24984 11.0001 8.24984H10.9909C10.4847 8.24984 10.0742 7.83943 10.0742 7.33317ZM11.0001 10.0832C11.5063 10.0832 11.9167 10.4936 11.9167 10.9998V14.6665C11.9167 15.1728 11.5063 15.5832 11.0001 15.5832C10.4938 15.5832 10.0834 15.1728 10.0834 14.6665V10.9998C10.0834 10.4936 10.4938 10.0832 11.0001 10.0832Z" fill="black"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_491_9703">
                    <rect width="22" height="22" fill="white"/>
                    </clipPath>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: errorMessage ? '#d32f2f' : 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
              {errorMessage 
                ? errorMessage
                : autoModeState === 'request_sent' 
                  ? 'На номер будет отправлено СМС для получения согласия, клиенту необходимо ответить 511'
                  : 'Нажмите на обновить, чтобы получить данные детей клиента'}
            </div>
          </div>
        ) : null}
    <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
      <div data-layer="ManualToggleButton" data-state={toggleStates.manualInput ? "pressed" : "not_pressed"} className="Manualtogglebutton" onClick={() => handleToggleClick('manualInput')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
        <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
          <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ручной ввод данных</div>
        </div>
        <div data-layer="Switch container" className="SwitchContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
          <div data-svg-wrapper data-layer="tui-switches" className="TuiSwitches" style={{left: 26, top: 35, position: 'absolute'}}>
            <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="16" rx="8" fill={toggleStates.manualInput ? "black" : "#E0E0E0"}/>
            <circle cx={toggleStates.manualInput ? "24" : "8"} cy="8" r="6" fill="white"/>
            </svg>
          </div>
        </div>
      </div>
      {/* Условный рендеринг полей в зависимости от режима */}
      {toggleStates.manualInput ? (
        // Ручной ввод включен - показываем все поля
        <>
          {renderInputField('iin', 'ИИН')}
          {renderInputField('phone', 'Номер телефона')}
          {renderInputField('lastName', 'Фамилия')}
          {renderInputField('firstName', 'Имя')}
          {renderInputField('middleName', 'Отчество')}
          {renderCalendarField('birthDate', 'Дата рождения')}
          {renderDictionaryButton('gender', 'Пол', handleOpenGender, !!policyholderData.gender)}
          {renderDictionaryButton('sectorCode', 'Код сектора экономики', handleOpenSectorCode, !!policyholderData.economSecId)}
          {renderDictionaryButton('country', 'Страна', handleOpenCountry, !!(policyholderData.countryId && (typeof policyholderData.countryId === 'object' ? policyholderData.countryId.code || policyholderData.countryId.nameRu : policyholderData.countryId)))}
          {renderDictionaryButton('region', 'Область', handleOpenRegion, !!policyholderData.district_nameru)}
          {renderInputField('settlementName', 'Название населенного пункта')}
          {renderInputField('street', 'Улица')}
          {renderInputField('houseNumber', '№ дома')}
          {renderInputField('apartmentNumber', '№ квартиры')}
          {renderDictionaryButton('docType', 'Тип документа', handleOpenDocType, !!policyholderData.vidDocId)}
          {renderInputField('documentNumber', 'Номер документа')}
          {renderDictionaryButton('issuedBy', 'Кем выдано', handleOpenIssuedBy, !!policyholderData.issuedBy)}
          {renderCalendarField('issueDate', 'Выдан от')}
          {renderCalendarField('expiryDate', 'Действует до')}
          <div data-layer="ПризнакПДЛ ToggleButton" data-state={toggleStates.pdl ? "pressed" : "not_pressed"} className="Togglebutton" onClick={() => handleToggleClick('pdl')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Признак ПДЛ</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="tui-switches" className="TuiSwitches" style={{left: 26, top: 35, position: 'absolute'}}>
                <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="16" rx="8" fill={toggleStates.pdl ? "black" : "#E0E0E0"}/>
                <circle cx={toggleStates.pdl ? "24" : "8"} cy="8" r="6" fill="white"/>
                </svg>
              </div>
            </div>
          </div>
          {renderDictionaryButton('clientType', 'Тип клиента', handleOpenClientType, !!policyholderData.clientType)}
        </>
      ) : (
        // Ручной ввод выключен - показываем поля в зависимости от состояния
        <>
          {renderInputField('iin', 'ИИН')}
          {renderInputField('phone', 'Номер телефона')}
          {/* В состоянии data_loaded показываем все остальные поля */}
          {autoModeState === 'data_loaded' && (
            <>
              {renderInputField('lastName', 'Фамилия')}
              {renderInputField('firstName', 'Имя')}
              {renderInputField('middleName', 'Отчество')}
              {renderCalendarField('birthDate', 'Дата рождения')}
              {renderDictionaryButton('gender', 'Пол', handleOpenGender, !!policyholderData.gender)}
              {renderDictionaryButton('sectorCode', 'Код сектора экономики', handleOpenSectorCode, !!policyholderData.economSecId)}
              {renderDictionaryButton('country', 'Страна', handleOpenCountry, !!(policyholderData.countryId && (typeof policyholderData.countryId === 'object' ? policyholderData.countryId.code || policyholderData.countryId.nameRu : policyholderData.countryId)))}
              {renderDictionaryButton('region', 'Область', handleOpenRegion, !!policyholderData.district_nameru)}
              {renderInputField('settlementName', 'Название населенного пункта')}
              {renderInputField('street', 'Улица')}
              {renderInputField('houseNumber', '№ дома')}
              {renderInputField('apartmentNumber', '№ квартиры')}
              {renderDictionaryButton('docType', 'Тип документа', handleOpenDocType, !!policyholderData.vidDocId)}
              {renderInputField('documentNumber', 'Номер документа')}
              {renderDictionaryButton('issuedBy', 'Кем выдано', handleOpenIssuedBy, !!policyholderData.issuedBy)}
              {renderCalendarField('issueDate', 'Выдан от')}
              {renderCalendarField('expiryDate', 'Действует до')}
              <div data-layer="ПризнакПДЛ ToggleButton" data-state={toggleStates.pdl ? "pressed" : "not_pressed"} className="Togglebutton" onClick={() => handleToggleClick('pdl')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
                <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Признак ПДЛ</div>
                </div>
                <div data-layer="Switch container" className="SwitchContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                  <div data-svg-wrapper data-layer="tui-switches" className="TuiSwitches" style={{left: 26, top: 35, position: 'absolute'}}>
                    <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="16" rx="8" fill={toggleStates.pdl ? "black" : "#E0E0E0"}/>
                    <circle cx={toggleStates.pdl ? "24" : "8"} cy="8" r="6" fill="white"/>
                    </svg>
                  </div>
                </div>
              </div>
              {renderDictionaryButton('clientType', 'Тип клиента', handleOpenClientType, !!policyholderData.clientType)}
            </>
          )}
        </>
      )}
    </div>
  </div>
</div>
  );
};

export default Policyholder;