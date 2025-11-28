import { useState, useEffect } from 'react';
import { getPerson, mapApiDataToForm } from '../../services/personService';
import { saveOtherPersonToApi } from '../services/otherPersonApiService';
import { mapContragentToInsuredForApplication } from '../services/processFacade';

export const useOtherPerson = ({ applicationId, taskId, savedData, onSave, onBack, policyholderData }) => {
  // Основной currentView (пока один экран, но сохраняем для совместимости)
  const [currentView, setCurrentView] = useState('main');

  // Для справочников
  const [dictionaryView, setDictionaryView] = useState('main');
  const [previousDictionaryView, setPreviousDictionaryView] = useState('main');

  // Состояния для автоматического режима
  const [manualInput, setManualInput] = useState(false);
  const [autoModeState, setAutoModeState] = useState('initial'); // 'initial', 'request_sent', 'response_received', 'data_loaded'
  const [apiResponseData, setApiResponseData] = useState(null);

  // Состояние загрузки при запросе данных
  const [isLoading, setIsLoading] = useState(false);

  // Состояние ошибки
  const [errorMessage, setErrorMessage] = useState(null);

  // Данные застрахованного
  const [insuredData, setInsuredData] = useState({
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
    expiryDate: '',
    gender: '',
    economSecId: '',
    countryId: '',
    district_nameru: '',
    settlementName: '',
    vidDocId: '',
    issuedBy: '',
    residency: 'Резидент'
  });

  // Toggle состояния
  const [toggleStates, setToggleStates] = useState({
    pdl: false
  });

  // Активное поле
  const [activeField, setActiveField] = useState(null);

  // Восстановление сохраненных данных при монтировании
  useEffect(() => {
    if (savedData) {
      // Приоритет: данные из getContragent (fullInsured) - самые полные
      // Данные застрахованного могут быть в разных местах:
      // 1. В savedData.fullData.fullInsured (данные из getContragent - ПРИОРИТЕТ)
      // 2. В savedData.fullData.insuredData (когда сохраняются из формы)
      // 3. В savedData напрямую (когда приходят из ProcessInstance через spread ...mappedInsuredData)
      let insuredDataFromSaved = null;

      // ПРИОРИТЕТ 1: Если есть данные из getContragent (fullInsured), используем их
      if (savedData.fullData?.fullInsured) {
        const mappedInsuredData = mapContragentToInsuredForApplication(savedData.fullData.fullInsured);
        if (mappedInsuredData && (mappedInsuredData.iin || mappedInsuredData.name || mappedInsuredData.surname)) {
          insuredDataFromSaved = mappedInsuredData;
        }
      }

      // ПРИОРИТЕТ 2: Если нет данных из getContragent, используем сохраненные данные из формы
      if (!insuredDataFromSaved && savedData.fullData?.insuredData) {
        const savedInsuredData = savedData.fullData.insuredData;
        if (savedInsuredData && (savedInsuredData.iin || savedInsuredData.name || savedInsuredData.surname)) {
          insuredDataFromSaved = savedInsuredData;
        }
      }

      // ПРИОРИТЕТ 3: Если нет в fullData, берем из savedData напрямую
      if (!insuredDataFromSaved) {
        const { fullData, ...dataWithoutFullData } = savedData;
        if (dataWithoutFullData && (dataWithoutFullData.iin || dataWithoutFullData.name || dataWithoutFullData.surname)) {
          insuredDataFromSaved = dataWithoutFullData;
        }
      }
      
      // Отладочное логирование
      console.log('[OTHER_PERSON] Восстановление данных:', {
        hasSavedData: !!savedData,
        hasFullData: !!savedData.fullData,
        hasInsuredData: !!insuredDataFromSaved,
        savedDataKeys: savedData ? Object.keys(savedData) : [],
        insuredDataKeys: insuredDataFromSaved ? Object.keys(insuredDataFromSaved) : [],
        gender: insuredDataFromSaved?.gender,
        genderType: typeof insuredDataFromSaved?.gender,
        economSecId: insuredDataFromSaved?.economSecId,
        economSecIdType: typeof insuredDataFromSaved?.economSecId,
        countryId: insuredDataFromSaved?.countryId,
        countryIdType: typeof insuredDataFromSaved?.countryId,
        vidDocId: insuredDataFromSaved?.vidDocId,
        vidDocIdType: typeof insuredDataFromSaved?.vidDocId,
        issuedBy: insuredDataFromSaved?.issuedBy,
        issuedByType: typeof insuredDataFromSaved?.issuedBy
      });
      
      // Проверяем, есть ли данные застрахованного
      if (insuredDataFromSaved && (insuredDataFromSaved.iin || insuredDataFromSaved.name || insuredDataFromSaved.surname)) {
        // Восстанавливаем данные застрахованного
        // Используем проверку на undefined/null, чтобы не терять пустые строки и 0
        const getValue = (value, defaultValue = '') => {
          return value !== undefined && value !== null ? value : defaultValue;
        };

        // Функция для правильной обработки объектов справочников
        // Важно: если значение есть в savedData, мы должны его использовать
        const getDictionaryValue = (value) => {
          // Если значение undefined или null, возвращаем undefined (чтобы использовать предыдущее)
          if (value === undefined || value === null) {
            return undefined;
          }
          // Если это объект (даже пустой), возвращаем его - он может содержать справочные данные
          if (typeof value === 'object' && value !== null) {
            // Проверяем, что это не массив
            if (!Array.isArray(value)) {
              return value;
            }
          }
          // Если это пустая строка, возвращаем её (это валидное значение)
          if (value === '') {
            return '';
          }
          // Для других случаев возвращаем значение как есть
          return value;
        };

        // Извлекаем значения справочников из сохраненных данных
        const restoredGender = getDictionaryValue(insuredDataFromSaved.gender);
        const restoredEconomSecId = getDictionaryValue(insuredDataFromSaved.economSecId);
        const restoredCountryId = getDictionaryValue(insuredDataFromSaved.countryId);
        const restoredVidDocId = getDictionaryValue(insuredDataFromSaved.vidDocId);
        const restoredIssuedBy = getDictionaryValue(insuredDataFromSaved.issuedBy);

        // Детальное логирование каждого справочника
        console.log('[OTHER_PERSON] Извлеченные справочники:', {
          gender: {
            raw: insuredDataFromSaved.gender,
            restored: restoredGender,
            type: typeof restoredGender
          },
          economSecId: {
            raw: insuredDataFromSaved.economSecId,
            restored: restoredEconomSecId,
            type: typeof restoredEconomSecId
          },
          countryId: {
            raw: insuredDataFromSaved.countryId,
            restored: restoredCountryId,
            type: typeof restoredCountryId
          },
          vidDocId: {
            raw: insuredDataFromSaved.vidDocId,
            restored: restoredVidDocId,
            type: typeof restoredVidDocId
          },
          issuedBy: {
            raw: insuredDataFromSaved.issuedBy,
            restored: restoredIssuedBy,
            type: typeof restoredIssuedBy
          }
        });

        // Функция для выбора значения справочника (приоритет восстановленному значению)
        const getDictionaryOrPrev = (restored, prevValue) => {
          // Если восстановленное значение определено (даже если это пустая строка или объект), используем его
          if (restored !== undefined) {
            return restored;
          }
          // Иначе используем предыдущее значение или пустую строку
          return prevValue !== undefined ? prevValue : '';
        };

        // Вычисляем финальные значения справочников перед установкой
        // Используем пустую строку как fallback, чтобы не перезаписывать существующие данные
        const finalGender = getDictionaryOrPrev(restoredGender, undefined);
        const finalEconomSecId = getDictionaryOrPrev(restoredEconomSecId, undefined);
        const finalCountryId = getDictionaryOrPrev(restoredCountryId, undefined);
        const finalVidDocId = getDictionaryOrPrev(restoredVidDocId, undefined);
        const finalIssuedBy = getDictionaryOrPrev(restoredIssuedBy, undefined);

        console.log('[OTHER_PERSON] Финальные значения справочников перед установкой:', {
          gender: finalGender,
          economSecId: finalEconomSecId,
          countryId: finalCountryId,
          vidDocId: finalVidDocId,
          issuedBy: finalIssuedBy
        });

        setInsuredData(prev => ({
          iin: getValue(insuredDataFromSaved.iin, prev.iin || ''),
          telephone: getValue(insuredDataFromSaved.telephone, prev.telephone || ''),
          name: getValue(insuredDataFromSaved.name, prev.name || ''),
          surname: getValue(insuredDataFromSaved.surname, prev.surname || ''),
          patronymic: getValue(insuredDataFromSaved.patronymic, prev.patronymic || ''),
          street: getValue(insuredDataFromSaved.street, prev.street || ''),
          houseNumber: getValue(insuredDataFromSaved.houseNumber, prev.houseNumber || ''),
          apartmentNumber: getValue(insuredDataFromSaved.apartmentNumber, prev.apartmentNumber || ''),
          docNumber: getValue(insuredDataFromSaved.docNumber, prev.docNumber || ''),
          documentFile: getValue(insuredDataFromSaved.documentFile, prev.documentFile || ''),
          birthDate: getValue(insuredDataFromSaved.birthDate, prev.birthDate || ''),
          issueDate: getValue(insuredDataFromSaved.issueDate, prev.issueDate || ''),
          expiryDate: getValue(insuredDataFromSaved.expiryDate, prev.expiryDate || ''),
          // Справочники - используем предварительно вычисленные значения (или предыдущие, если не определены)
          gender: finalGender !== undefined ? finalGender : prev.gender || '',
          economSecId: finalEconomSecId !== undefined ? finalEconomSecId : prev.economSecId || '',
          countryId: finalCountryId !== undefined ? finalCountryId : prev.countryId || '',
          vidDocId: finalVidDocId !== undefined ? finalVidDocId : prev.vidDocId || '',
          issuedBy: finalIssuedBy !== undefined ? finalIssuedBy : prev.issuedBy || '',
          // Обычные строковые поля
          district_nameru: getValue(insuredDataFromSaved.district_nameru, prev.district_nameru || ''),
          settlementName: getValue(insuredDataFromSaved.settlementName, prev.settlementName || ''),
          residency: getValue(insuredDataFromSaved.residency, prev.residency || 'Резидент')
        }));

        // Отладочное логирование после установки данных
        console.log('[OTHER_PERSON] Данные будут установлены:', {
          gender: restoredGender,
          economSecId: restoredEconomSecId,
          countryId: restoredCountryId,
          vidDocId: restoredVidDocId,
          issuedBy: restoredIssuedBy
        });
      }

      // Восстанавливаем состояние формы
      if (savedData.fullData) {
        const restored = savedData.fullData;

        if (restored.manualInput !== undefined) {
          setManualInput(restored.manualInput);
        }
        if (restored.toggleStates) {
          setToggleStates(restored.toggleStates);
        }

        if (restored.autoModeState) {
          setAutoModeState(restored.autoModeState);
        } else if (insuredDataFromSaved && insuredDataFromSaved.iin && insuredDataFromSaved.telephone) {
          // Если есть данные, но нет состояния, значит данные уже загружены
          setAutoModeState('data_loaded');
        }

        if (restored.currentView) {
          setCurrentView(restored.currentView);
        }
      } else if (insuredDataFromSaved && insuredDataFromSaved.iin && insuredDataFromSaved.telephone) {
        // Если нет fullData, но есть данные застрахованного, значит данные уже загружены
        setAutoModeState('data_loaded');
      }
    }
  }, [savedData]);

  // Логирование установленных данных для отладки
  useEffect(() => {
    console.log('[OTHER_PERSON] Текущее состояние insuredData:', {
      gender: insuredData.gender,
      economSecId: insuredData.economSecId,
      countryId: insuredData.countryId,
      vidDocId: insuredData.vidDocId,
      issuedBy: insuredData.issuedBy,
      iin: insuredData.iin,
      name: insuredData.name,
      surname: insuredData.surname
    });
  }, [insuredData]);

  // Обработчики для формы
  const handleFieldClick = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleFieldChange = (fieldName, value) => {
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

    setInsuredData(prev => ({
      ...prev,
      [fieldName]: processedValue
    }));
  };

  const handleFieldBlur = (fieldName) => {
    if (activeField === fieldName) {
      setActiveField(null);
    }
  };

  // Функция для получения текстового представления справочника
  const getDictionaryDisplayValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      // Проверяем все возможные варианты названий полей (nameRu используется в mapContragentToInsuredForApplication)
      return value.nameRu || value.name_ru || value.name || value.title || '';
    }
    return value;
  };

  // Обработчики справочников
  const handleDictionaryValueSelect = (fieldName, value) => {
    setInsuredData(prev => ({
      ...prev,
      [fieldName]: value
    }));
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

  const handleTogglePDL = () => {
    setToggleStates(prev => ({
      ...prev,
      pdl: !prev.pdl
    }));
  };

  // Обработчики для автоматического режима
  const handleToggleManualInput = () => {
    const newValue = !manualInput;
    setManualInput(newValue);
    if (newValue) {
      setInsuredData({
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
        expiryDate: '',
        gender: '',
        economSecId: '',
        countryId: '',
        district_nameru: '',
        settlementName: '',
        vidDocId: '',
        issuedBy: '',
        residency: 'Резидент'
      });
      setAutoModeState('initial');
    }
  };

  const handleSendRequest = async () => {
    if (!insuredData.iin || !insuredData.telephone) {
      setErrorMessage('Пожалуйста, заполните ИИН и номер телефона');
      return;
    }

    setErrorMessage(null);
    setAutoModeState('request_sent');
    setIsLoading(true);

    try {
      const phone = insuredData.telephone.replace(/\D/g, '');
      const iin = insuredData.iin.replace(/\D/g, '');

      const apiData = await getPerson(phone, iin);
      setApiResponseData(apiData);
      setAutoModeState('response_received');
    } catch (error) {
      setErrorMessage('Ошибка при получении данных. Попробуйте еще раз.');
      setAutoModeState('initial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    if (!apiResponseData) {
      setErrorMessage('Нет данных для обновления');
      return;
    }

    setErrorMessage(null);

    const mappedData = mapApiDataToForm(apiResponseData);
    const currentIin = insuredData.iin;
    const currentTelephone = insuredData.telephone;

    setInsuredData(prev => ({
      ...prev,
      iin: currentIin || mappedData.iin || prev.iin || '',
      telephone: currentTelephone || mappedData.telephone || prev.telephone || '',
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
  };

  const getHeaderButtonText = () => {
    if (manualInput) {
      return 'Сохранить';
    }
    if (isLoading) {
      return 'Загрузка...';
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
    try {
      await saveOtherPersonToApi({
        applicationId,
        taskId,
        insuredData,
        policyholderData
      });
    } catch (error) {
      setErrorMessage(`Ошибка сохранения: ${error.message}`);
      return;
    }

    if (onSave) {
      const dataToSave = {
        insuredType: 'other-person',
        insuredData,
        toggleStates,
        manualInput,
        autoModeState,
        currentView: 'main'
      };

      const displayData = {
        lastName: insuredData.surname || '',
        firstName: insuredData.name || '',
        middleName: insuredData.patronymic || '',
        iin: insuredData.iin || '',
        fullData: dataToSave
      };

      onSave(displayData);
    }

    if (onBack) {
      onBack();
    }
  };

  const handleHeaderButtonClick = () => {
    if (manualInput) {
      handleFinalSave();
      return;
    }
    if (autoModeState === 'initial' || autoModeState === 'request_sent') {
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

  return {
    // state
    currentView,
    dictionaryView,
    previousDictionaryView,
    manualInput,
    autoModeState,
    apiResponseData,
    isLoading,
    errorMessage,
    insuredData,
    toggleStates,
    activeField,
    // setters needed в UI
    setDictionaryView,
    setPreviousDictionaryView,
    // handlers
    handleFieldClick,
    handleFieldChange,
    handleFieldBlur,
    getDictionaryDisplayValue,
    handleDictionaryValueSelect,
    handleOpenGender,
    handleOpenSectorCode,
    handleOpenCountry,
    handleOpenRegion,
    handleOpenDocType,
    handleOpenIssuedBy,
    handleTogglePDL,
    handleToggleManualInput,
    handleSendRequest,
    handleUpdate,
    getHeaderButtonText,
    handleHeaderButtonClick
  };
};

export default useOtherPerson;


