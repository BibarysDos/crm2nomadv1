import { useState, useEffect } from 'react';
import { getPerson, mapApiDataToForm } from '../../services/personService';
import { getChildren, formatDate as formatChildDate } from '../../services/childService';
import { saveOtherChildToApi } from '../services/otherChildApiService';
import {
  mapContragentToInsuredForApplication,
  mapContragentToPolicyholderForApplication
} from '../services/processFacade';

/**
 * Хук инкапсулирует всю бизнес-логику экрана "Иной ребенок":
 * - стейты родителя и ребенка
 * - загрузку/восстановление данных
 * - работу с сервисами children/person
 * - финальное сохранение через Contragent API
 */
export const useOtherChild = ({ applicationId, taskId, savedData, onSave, onBack }) => {
  // Основной currentView для переключения между этапами: 'parent', 'choose-child', 'filled'
  const [currentView, setCurrentView] = useState('parent');
  // Для справочников внутри 'filled' view (ребенок)
  const [dictionaryView, setDictionaryView] = useState('main');
  const [previousDictionaryView, setPreviousDictionaryView] = useState('main');
  // Для справочников родителя
  const [parentDictionaryView, setParentDictionaryView] = useState('main');
  const [previousParentDictionaryView, setPreviousParentDictionaryView] = useState('main');

  // Состояния для формы родителя
  const [manualInput, setManualInput] = useState(false);
  const [autoModeState, setAutoModeState] = useState('initial'); // 'initial', 'request_sent', 'response_received'
  const [waitingSmsResponse, setWaitingSmsResponse] = useState(false); // Флаг для показа алерта про СМС при initial состоянии
  const [apiResponseData, setApiResponseData] = useState(null);
  const [parentSectionCollapsed, setParentSectionCollapsed] = useState(false);

  // Состояние загрузки при запросе данных
  const [isLoading, setIsLoading] = useState(false);

  // Состояние ошибки
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Состояние для отслеживания полей с ошибками валидации
  const [fieldErrors, setFieldErrors] = useState({});

  // Состояние для ручного ввода данных ребенка
  const [manualChildInput, setManualChildInput] = useState(false);

  // Состояние для тоггла "Адрес проживания совпадает с адресом родителя"
  const [addressMatchesParent, setAddressMatchesParent] = useState(true);

  // Данные родителя
  const [parentData, setParentData] = useState({
    iin: '',
    telephone: '',
    surname: '',
    name: '',
    patronymic: '',
    birthDate: '',
    gender: '',
    economSecId: '',
    countryId: '',
    district_nameru: '',
    settlementName: '',
    street: '',
    houseNumber: '',
    apartmentNumber: '',
    vidDocId: '',
    docNumber: '',
    issuedBy: '',
    issueDate: '',
    expiryDate: '',
    pdl: false
  });

  // Состояния для выбора ребенка
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Данные ребенка
  const [childData, setChildData] = useState({
    iin: '',
    telephone: '',
    name: '',
    surname: '',
    patronymic: '',
    street: '',
    houseNumber: '',
    apartmentNumber: '',
    docNumber: '',
    documentFile: '',
    birthDate: '',
    issueDate: '',
    gender: '',
    economSecId: '',
    countryId: '',
    district_nameru: '',
    settlementName: '',
    vidDocId: '',
    issuedBy: '',
    residency: 'Резидент',
    clientType: ''
  });

  const [toggleStates, setToggleStates] = useState({
    pdl: false
  });

  // Активные поля
  // eslint-disable-next-line no-unused-vars
  const [activeField, setActiveField] = useState(null);
  const [activeParentField, setActiveParentField] = useState(null);
  const [activeChildField, setActiveChildField] = useState(null);
  const [childSectionCollapsed, setChildSectionCollapsed] = useState(false);

  // Восстановление сохраненных данных при монтировании
  useEffect(() => {
    if (savedData && savedData.fullData) {
      const restored = savedData.fullData;

      // ПРИОРИТЕТ 1: Данные из getContragent (fullInsured и legalRep) - самые полные
      // Восстанавливаем данные родителя из legalRep (если есть)
      if (restored.legalRep) {
        const mappedParent = mapContragentToPolicyholderForApplication(restored.legalRep);
        if (mappedParent && (mappedParent.iin || mappedParent.name || mappedParent.surname)) {
          setParentData((prev) => ({
            ...prev,
            ...mappedParent
          }));
          // Считаем, что данные родителя загружены из сервиса
          setAutoModeState('data_loaded');
          setParentSectionCollapsed(false);
        }
      }

      // Восстанавливаем данные ребенка из fullInsured (если есть)
      if (restored.fullInsured) {
        const mappedChild = mapContragentToInsuredForApplication(restored.fullInsured);
        if (mappedChild && (mappedChild.iin || mappedChild.name || mappedChild.surname)) {
          setChildData((prev) => ({
            ...prev,
            ...mappedChild
          }));
          // Автоматически открываем форму с заполненными данными
          if (currentView === 'parent' || !currentView) {
            setCurrentView('filled');
          }
          setChildSectionCollapsed(false);
        }
      }

      // ПРИОРИТЕТ 2: Если нет данных из getContragent, используем сохраненные данные из формы
      if (!restored.legalRep && restored.parentData) {
        setParentData(restored.parentData);
      }
      if (!restored.fullInsured && restored.childData) {
        setChildData(restored.childData);
      }

      if (restored.selectedChild) {
        setSelectedChild(restored.selectedChild);
      }

      // Восстанавливаем состояния тогглов
      if (restored.manualInput !== undefined) {
        setManualInput(restored.manualInput);
      }
      if (restored.manualChildInput !== undefined) {
        setManualChildInput(restored.manualChildInput);
      }
      if (restored.addressMatchesParent !== undefined) {
        setAddressMatchesParent(restored.addressMatchesParent);
      }
      if (restored.toggleStates) {
        setToggleStates(restored.toggleStates);
      }

      // 3. Устанавливаем autoModeState: если сохранен - используем его, иначе если есть данные - data_loaded
      if (restored.autoModeState) {
        setAutoModeState(restored.autoModeState);
      } else if (restored.legalRep || (restored.parentData && restored.parentData.iin && restored.parentData.telephone)) {
        setAutoModeState('data_loaded');
      }

      // 4. Восстанавливаем view: если не задан, но есть fullInsured или childData, сразу открываем заполненную форму
      if (restored.currentView) {
        setCurrentView(restored.currentView);
      } else if (restored.fullInsured || restored.childData) {
        setCurrentView('filled');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedData]);

  // Загрузка детей при переходе на экран выбора
  useEffect(() => {
    if (currentView === 'choose-child' && parentData.iin && parentData.telephone) {
      const loadChildren = async () => {
        try {
          setLoading(true);
          setError(null);
          const phoneClean = parentData.telephone.replace(/\D/g, '');
          const iinClean = parentData.iin.replace(/\D/g, '');
          const childrenData = await getChildren(iinClean, phoneClean);
          setChildren(childrenData);
        } catch (err) {
          setError('Ошибка при загрузке данных о детях');
        } finally {
          setLoading(false);
        }
      };
      loadChildren();
    }
  }, [currentView, parentData.iin, parentData.telephone]);

  // Заполнение данных ребенка при выборе
  useEffect(() => {
    if (currentView === 'filled' && selectedChild && typeof selectedChild === 'object' && selectedChild.child_iin) {
      setChildData({
        iin: selectedChild.child_iin || '',
        telephone: '',
        name: selectedChild.child_name || '',
        surname: selectedChild.child_surname || '',
        patronymic: selectedChild.child_patronymic || '',
        street: '',
        microdistrict: '',
        houseNumber: '',
        apartmentNumber: '',
        docNumber: selectedChild.act_number || '',
        documentFile: '',
        birthDate: formatChildDate(selectedChild.child_birth_date) || '',
        issueDate: formatChildDate(selectedChild.act_date) || '',
        gender: '',
        economSecId: '',
        countryId: '',
        district_nameru: '',
        settlementName: '',
        vidDocId: 'Свидетельство о рождении',
        issuedBy: selectedChild.zags_name_ru || '',
        residency: 'Резидент'
      });
    } else if (currentView === 'filled' && manualChildInput && !selectedChild) {
      // Очищаем данные для ручного ввода нового ребенка
      setChildData({
        iin: '',
        telephone: '',
        name: '',
        surname: '',
        patronymic: '',
        street: '',
        houseNumber: '',
        apartmentNumber: '',
        docNumber: '',
        documentFile: '',
        birthDate: '',
        issueDate: '',
        gender: '',
        economSecId: '',
        countryId: '',
        district_nameru: '',
        settlementName: '',
        vidDocId: 'Свидетельство о рождении',
        issuedBy: '',
        residency: 'Резидент'
      });
    }
  }, [currentView, selectedChild, manualChildInput]);

  // Автоматическое копирование адреса родителя в адрес ребенка когда тоггл включен
  useEffect(() => {
    if (addressMatchesParent && currentView === 'filled') {
      setChildData(prev => ({
        ...prev,
        countryId: parentData.countryId || prev.countryId,
        district_nameru: parentData.district_nameru || prev.district_nameru,
        settlementName: parentData.settlementName || prev.settlementName,
        street: parentData.street || prev.street,
        houseNumber: parentData.houseNumber || prev.houseNumber,
        apartmentNumber: parentData.apartmentNumber || prev.apartmentNumber
      }));
    }
  }, [addressMatchesParent, parentData.countryId, parentData.district_nameru, parentData.settlementName, parentData.street, parentData.houseNumber, parentData.apartmentNumber, currentView]);

  // --- Обработчики родителя ---
  const handleParentFieldChange = (fieldName, value) => {
    let processedValue = value;
    
    // Маска для телефона (+7)
    if (fieldName === 'telephone') {
      // Логика форматирования телефона
      let cleaned = value.replace(/[^\d+]/g, '');
      if (cleaned.startsWith('+7')) cleaned = cleaned.substring(2);
      else if (cleaned.startsWith('7') || cleaned.startsWith('8')) cleaned = cleaned.substring(1);
      cleaned = cleaned.substring(0, 10);

      if (cleaned.length === 0) processedValue = '+7';
      else if (cleaned.length <= 3) processedValue = `+7 (${cleaned}`;
      else if (cleaned.length <= 6) processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
      else if (cleaned.length <= 8) processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
      else processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
    }

    setParentData(prev => ({
      ...prev,
      [fieldName]: processedValue
    }));
  };

  const handleParentFieldClick = (fieldName) => {
    setActiveParentField(fieldName);
  };

  // Для совместимости с UI используем единое название "Activate"
  const handleParentFieldActivate = (fieldName) => {
    setActiveParentField(fieldName);
  };

  const handleParentFieldBlur = (fieldName) => {
    if (activeParentField === fieldName) {
      setActiveParentField(null);
    }
  };

  const handleParentDictionaryValueSelect = (fieldName, value) => {
    setParentData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setParentDictionaryView(previousParentDictionaryView);
  };

  const handleParentOpenGender = () => {
    setPreviousParentDictionaryView(parentDictionaryView);
    setParentDictionaryView('gender');
  };
  const handleParentOpenSectorCode = () => {
    setPreviousParentDictionaryView(parentDictionaryView);
    setParentDictionaryView('sectorCode');
  };
  const handleParentOpenCountry = () => {
    setPreviousParentDictionaryView(parentDictionaryView);
    setParentDictionaryView('country');
  };
  const handleParentOpenRegion = () => {
    setPreviousParentDictionaryView(parentDictionaryView);
    setParentDictionaryView('region');
  };
  const handleParentOpenDocType = () => {
    setPreviousParentDictionaryView(parentDictionaryView);
    setParentDictionaryView('docType');
  };
  const handleParentOpenIssuedBy = () => {
    setPreviousParentDictionaryView(parentDictionaryView);
    setParentDictionaryView('issuedBy');
  };

  const handleToggleManualInput = () => {
    const newValue = !manualInput;
    setManualInput(newValue);
    if (newValue) {
      setAutoModeState('initial');
      setApiResponseData(null);
    } else {
      // При отключении ручного ввода родителя сбрасываем состояние ребенка
      setManualChildInput(false);
      setSelectedChild(null);
      setCurrentView('parent');
    }
  };

  const handleToggleManualChildInput = () => {
    // Ручной ввод ребенка доступен когда включен ручной ввод родителя ИЛИ данные получены через сервис
    if (!manualInput && autoModeState !== 'data_loaded') {
      return;
    }
    const newValue = !manualChildInput;
    setManualChildInput(newValue);
    if (newValue) {
      setCurrentView('filled');
    }
  };

  const handleToggleAddressMatchesParent = () => {
    const newValue = !addressMatchesParent;
    setAddressMatchesParent(newValue);
    if (newValue) {
      setChildData(prev => ({
        ...prev,
        countryId: parentData.countryId || prev.countryId,
        district_nameru: parentData.district_nameru || prev.district_nameru,
        settlementName: parentData.settlementName || prev.settlementName,
        street: parentData.street || prev.street,
        houseNumber: parentData.houseNumber || prev.houseNumber,
        apartmentNumber: parentData.apartmentNumber || prev.apartmentNumber
      }));
    }
  };

  // --- Запрос данных родителя ---
  const handleSendRequest = async () => {
    if (!parentData.iin || !parentData.telephone) {
      setErrorMessage('Пожалуйста, заполните ИИН и номер телефона');
      return;
    }

    setErrorMessage(null);
    // НЕ сбрасываем waitingSmsResponse здесь - он должен оставаться до получения результата
    setIsLoading(true);

    try {
      const phone = parentData.telephone.replace(/\D/g, '');
      const iin = parentData.iin.replace(/\D/g, '');

      const apiData = await getPerson(phone, iin);
      
      // Обработка ответа в зависимости от result
      if (apiData && typeof apiData === 'object') {
        // Проверяем наличие error (таймаут)
        if (apiData.error && !apiData.success) {
          // Таймаут - запрос успешный, но надо повторно запросить
          setErrorMessage('Таймаут при обращении к внешнему сервису. Пожалуйста, нажмите "Запросить данные" еще раз.');
          setWaitingSmsResponse(false); // Сбрасываем флаг при таймауте
          setAutoModeState('initial');
          setIsLoading(false);
          return;
        }
        
        // Проверяем result
        if (apiData.result === 0) {
          // ИИН или номер телефона неверный
          setErrorMessage('ИИН или номер телефона неверный');
          setWaitingSmsResponse(false); // Сбрасываем флаг при ошибке
          setAutoModeState('initial');
          setIsLoading(false);
          return;
        } else if (apiData.result === 1) {
          // Ждем ответ 511 - показываем алерт про СМС, но оставляем состояние initial
          setErrorMessage(null); // Очищаем ошибку, чтобы показать алерт про СМС
          setWaitingSmsResponse(true); // Устанавливаем флаг для показа алерта
          setAutoModeState('initial'); // Оставляем initial, чтобы кнопка была "Получить данные"
          setIsLoading(false);
          return;
        } else if (apiData.result === 2) {
          // Успешно, данные есть - сразу показываем все поля
          setWaitingSmsResponse(false); // Сбрасываем флаг при успехе
          setApiResponseData(apiData);
          
          // Сразу применяем данные к форме
          const mappedData = mapApiDataToForm(apiData);
          setParentData(prev => ({
            ...prev,
            iin: prev.iin || mappedData.iin || '',
            telephone: prev.telephone || mappedData.telephone || '',
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
          }));
          
          // Сразу устанавливаем data_loaded, чтобы показать все поля без кнопки "Обновить"
          setAutoModeState('data_loaded');
          setIsLoading(false);
          return;
        }
      }
      
      // Если формат ответа неожиданный
      setErrorMessage('Неожиданный формат ответа. Попробуйте еще раз.');
      setWaitingSmsResponse(false); // Сбрасываем флаг при ошибке
      setAutoModeState('initial');
    } catch (error) {
      // Ошибка сети или другая ошибка
      setErrorMessage('Ошибка при получении данных. Попробуйте еще раз.');
      setWaitingSmsResponse(false); // Сбрасываем флаг при ошибке
      setAutoModeState('initial');
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление родителя по уже полученному ответу
  const handleUpdate = () => {
    if (!apiResponseData) {
      setErrorMessage('Нет данных для обновления');
      return;
    }

    setErrorMessage(null);

    const mappedData = mapApiDataToForm(apiResponseData);

    setParentData(prev => ({
      ...prev,
      iin: prev.iin || mappedData.iin || '',
      telephone: prev.telephone || mappedData.telephone || '',
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
    }));

    setAutoModeState('data_loaded');
    // Убрали вызов getChildren - он должен вызываться только при нажатии на "Выбрать ребенка"
  };

  // --- Выбор ребенка ---
  const handleSelectChild = () => {
    if (!manualInput && autoModeState !== 'data_loaded') {
      return;
    }
    if (manualChildInput) {
      return;
    }
    setCurrentView('choose-child');
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };

  const handleChildSave = () => {
    if (selectedChild && typeof selectedChild === 'object') {
      setCurrentView('filled');
    } else if (manualChildInput) {
      setCurrentView('filled');
    }
  };

  // --- Форма ребенка ---
  const handleDictionaryValueSelect = (fieldName, value) => {
    setChildData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Очищаем ошибку поля при выборе значения
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      // Если больше нет ошибок, очищаем сообщение об ошибке
      if (Object.keys(fieldErrors).length === 1) {
        setErrorMessage(null);
      }
    }
    
    setDictionaryView(previousDictionaryView);
  };

  const handleOpenGender = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('gender');
  };
  const handleOpenSectorCode = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('sectorCode');
  };
  const handleOpenCountry = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('country');
  };
  const handleOpenRegion = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('region');
  };
  const handleOpenDocType = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('docType');
  };
  const handleOpenIssuedBy = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('issuedBy');
  };
  const handleOpenClientType = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('clientType');
  };

  const handleChildFieldClick = (fieldName) => {
    setActiveChildField(fieldName);
  };

  const handleChildFieldActivate = (fieldName) => {
    setActiveChildField(fieldName);
  };

  const handleChildFieldChange = (fieldName, value) => {
    let processedValue = value;
    
    // Маска для телефона (+7)
    if (fieldName === 'telephone') {
      // Логика форматирования телефона
      let cleaned = value.replace(/[^\d+]/g, '');
      if (cleaned.startsWith('+7')) cleaned = cleaned.substring(2);
      else if (cleaned.startsWith('7') || cleaned.startsWith('8')) cleaned = cleaned.substring(1);
      cleaned = cleaned.substring(0, 10);

      if (cleaned.length === 0) processedValue = '+7';
      else if (cleaned.length <= 3) processedValue = `+7 (${cleaned}`;
      else if (cleaned.length <= 6) processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
      else if (cleaned.length <= 8) processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
      else processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
    }

    setChildData(prev => ({
      ...prev,
      [fieldName]: processedValue
    }));
  };

  const handleChildFieldBlur = (fieldName) => {
    if (activeChildField === fieldName) {
      setActiveChildField(null);
    }
  };

  // --- Вспомогательные функции ---
  const getDictionaryDisplayValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      // Поддерживаем и name_ru, и nameRu, и generic name/title
      return value.name_ru || value.nameRu || value.name || value.title || '';
    }
    return value;
  };

  const getDictionaryValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.name_ru || value.nameRu || value.name || value.title || '';
    }
    return value;
  };

  // Текст кнопки в шапке
  const getHeaderButtonText = () => {
    if (isLoading) {
      return 'Загрузка...';
    }

    if (manualInput) {
      return 'Сохранить';
    }

    if (autoModeState === 'initial' || autoModeState === 'request_sent') {
      return 'Запросить данные';
    }

    if (autoModeState === 'response_received') {
      return 'Обновить';
    }

    if (autoModeState === 'data_loaded') {
      return 'Сохранить';
    }

    return 'Сохранить';
  };

  const handleFinalSave = async () => {
    console.log('handleFinalSave вызван в useOtherChild');
    console.log('childData:', childData);
    console.log('applicationId:', applicationId);
    console.log('taskId:', taskId);
    
    // Очищаем предыдущие ошибки полей
    setFieldErrors({});
    
    // Валидация обязательных полей ребенка перед сохранением
    const errors = {};
    if (!childData.gender) {
      errors.gender = true;
      console.log('Ошибка валидации: Пол не выбран');
    }
    
    // Если есть ошибки, устанавливаем их и показываем сообщение
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Пол застрахованного обязателен. Пожалуйста, выберите значение в поле "Пол".');
      return;
    }
    
    // Очищаем ошибки, если валидация прошла успешно
    setFieldErrors({});
    setErrorMessage(null);

    // Экономический сектор обязателен при создании прочей детализации.
    // Если у ребенка не выбран, подставляем сектор родителя или '9' (Домашние хозяйства/физическое лицо).
    const resolvedChildData = {
      ...childData,
      economSecId:
        childData.economSecId ||
        parentData.economSecId || {
          code: '9',
          nameRu: 'Домашние хозяйства/физическое лицо'
        }
    };

    if (applicationId) {
      try {
        console.log('Вызов saveOtherChildToApi с данными:', { applicationId, taskId, parentData, childData: resolvedChildData });
        await saveOtherChildToApi({
          applicationId,
          taskId,
          parentData,
          childData: resolvedChildData
        });
        console.log('saveOtherChildToApi успешно выполнен');
      } catch (error) {
        console.error('Ошибка в saveOtherChildToApi:', error);
        setErrorMessage(`Ошибка сохранения: ${error.message}`);
        return;
      }
    } else {
      console.log('applicationId не указан, пропускаем сохранение в API');
    }

    if (onSave) {
      console.log('Вызов onSave');
      const dataToSave = {
        insuredType: 'other-child',
        parentData,
        childData,
        selectedChild,
        toggleStates,
        addressMatchesParent,
        manualInput,
        manualChildInput,
        autoModeState,
        currentView: currentView === 'filled' ? 'filled' : 'parent'
      };

      const displayData = {
        lastName: childData.surname || '',
        firstName: childData.name || '',
        middleName: childData.patronymic || '',
        iin: childData.iin || '',
        fullData: dataToSave
      };

      onSave(displayData);
    } else {
      console.log('onSave не определен');
    }

    if (onBack) {
      console.log('Вызов onBack');
      onBack();
    } else {
      console.log('onBack не определен');
    }
  };

  const handleHeaderButtonClick = () => {
    if (manualInput) {
      handleFinalSave();
      return;
    }

    if (autoModeState === 'initial' || autoModeState === 'request_sent') {
      // При initial или request_sent (result === 1) снова вызываем запрос
      handleSendRequest();
      return;
    }

    if (autoModeState === 'response_received') {
      handleUpdate();
      return;
    }

    if (autoModeState === 'data_loaded') {
      handleFinalSave();
      return;
    }
  };

  const getSelectedChildDisplay = () => {
    if (selectedChild && typeof selectedChild === 'object') {
      return `${selectedChild.child_surname || ''} ${selectedChild.child_name || ''} ${selectedChild.child_patronymic || ''}`.trim();
    }
    if (selectedChild && typeof selectedChild === 'string') {
      return selectedChild;
    }
    return '';
  };

  return {
    // стейты
    currentView,
    setCurrentView,
    dictionaryView,
    previousDictionaryView,
    setDictionaryView,
    parentDictionaryView,
    previousParentDictionaryView,
    manualInput,
    autoModeState,
    waitingSmsResponse,
    apiResponseData,
    parentSectionCollapsed,
    isLoading,
    errorMessage,
    fieldErrors,
    manualChildInput,
    addressMatchesParent,
    parentData,
    selectedChild,
    children,
    loading,
    error,
    childData,
    toggleStates,
    activeParentField,
    activeChildField,
    childSectionCollapsed,

    // обработчики родителя
    handleParentFieldChange,
    handleParentFieldClick,
    handleParentFieldActivate,
    handleParentFieldBlur,
    handleParentDictionaryValueSelect,
    handleParentOpenGender,
    handleParentOpenSectorCode,
    handleParentOpenCountry,
    handleParentOpenRegion,
    handleParentOpenDocType,
    handleParentOpenIssuedBy,
    setParentSectionCollapsed,

    // тогглы
    handleToggleManualInput,
    handleToggleManualChildInput,
    handleToggleAddressMatchesParent,

    // запросы
    handleSendRequest,
    handleUpdate,

    // дети
    handleSelectChild,
    handleChildSelect,
    handleChildSave,

    // форма ребенка
    handleDictionaryValueSelect,
    handleOpenGender,
    handleOpenSectorCode,
    handleOpenCountry,
    handleOpenRegion,
    handleOpenDocType,
    handleOpenIssuedBy,
    handleOpenClientType,
    handleChildFieldClick,
    handleChildFieldActivate,
    handleChildFieldChange,
    handleChildFieldBlur,
    setChildSectionCollapsed,

    // вспомогательные
    getDictionaryDisplayValue,
    getDictionaryValue,
    getHeaderButtonText,
    handleHeaderButtonClick,
    handleFinalSave,
    getSelectedChildDisplay
  };
};


