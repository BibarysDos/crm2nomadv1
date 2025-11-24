import React, { useState, useEffect } from 'react';
import Gender from '../../dictionary/Gender';
import SectorCode from '../../dictionary/SectorCode';
import Country from '../../dictionary/Country';
import Region from '../../dictionary/Region';
import DocType from '../../dictionary/DocType';
import IssuedBy from '../../dictionary/IssuedBy';
import { getPerson, mapApiDataToForm } from '../../../services/personService';
import { getChildren, getChildFullName, formatDate as formatChildDate } from '../../../services/childService';
import { renderInputField, renderDictionaryButton, renderCalendarField, renderAttachField, renderToggleButton } from './InsuredFormFields';
import { mapInsuredToContragent } from '../Policyholder';
import { updateContragent, getProcessInstanceDetails } from '../../../services/processService';
import { getAccessToken, loadApplicationMetadata } from '../../../services/storageService';

const OtherChild = ({ onBack, onSave, applicationId, taskId, policyholderData, savedData }) => {
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
  const [apiResponseData, setApiResponseData] = useState(null);
  const [parentSectionCollapsed, setParentSectionCollapsed] = useState(false);
  
  // Состояние загрузки при запросе данных
  const [isLoading, setIsLoading] = useState(false);
  
  // Состояние ошибки
  const [errorMessage, setErrorMessage] = useState(null);
  
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
    residency: 'Резидент'
  });

  const [toggleStates, setToggleStates] = useState({
    pdl: false
  });

  // eslint-disable-next-line no-unused-vars
  const [activeField, setActiveField] = useState(null);
  const [activeParentField, setActiveParentField] = useState(null);
  const [activeChildField, setActiveChildField] = useState(null);
  const [childSectionCollapsed, setChildSectionCollapsed] = useState(false);

  // Восстановление сохраненных данных при монтировании
  useEffect(() => {
    if (savedData && savedData.fullData) {
      const restored = savedData.fullData;
      
      // Восстанавливаем данные родителя и ребенка
      if (restored.parentData) {
        setParentData(restored.parentData);
      }
      if (restored.childData) {
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
      // Устанавливаем autoModeState: если сохранен - используем его, иначе если есть данные - data_loaded
      if (restored.autoModeState) {
        setAutoModeState(restored.autoModeState);
      } else if (restored.parentData && restored.parentData.iin && restored.parentData.telephone) {
        // Если данных нет в сохраненном autoModeState, но есть данные родителя, устанавливаем data_loaded
        setAutoModeState('data_loaded');
      }
      
      // Восстанавливаем view
      if (restored.currentView) {
        setCurrentView(restored.currentView);
      }
    }
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
          console.error('Error loading children:', err);
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


  // Обработчики для формы родителя
  const handleParentFieldChange = (fieldName, value) => {
    setParentData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleParentFieldClick = (fieldName) => {
    setActiveParentField(fieldName);
  };

  const handleParentFieldBlur = (fieldName) => {
    if (activeParentField === fieldName) {
      setActiveParentField(null);
    }
  };

  // Обработчики для справочников родителя
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
      // Если включаем ручной ввод, сразу переходим к заполнению формы
      setCurrentView('filled');
    }
  };
  
  const handleToggleAddressMatchesParent = () => {
    const newValue = !addressMatchesParent;
    setAddressMatchesParent(newValue);
    if (newValue) {
      // Копируем адрес родителя в адрес ребенка
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

  const handleSendRequest = async () => {
    if (!parentData.iin || !parentData.telephone) {
      setErrorMessage('Пожалуйста, заполните ИИН и номер телефона');
      return;
    }

    // Очищаем предыдущую ошибку
    setErrorMessage(null);
    
    // Переход в состояние request_sent и загрузки
    setAutoModeState('request_sent');
    setIsLoading(true);
    
    try {
      const phone = parentData.telephone.replace(/\D/g, '');
      const iin = parentData.iin.replace(/\D/g, '');
      
      const apiData = await getPerson(phone, iin);
      
      setApiResponseData(apiData);
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

    // Сохраняем исходные значения ИИН и телефона для вызова getChildren
    const currentIin = parentData.iin;
    const currentTelephone = parentData.telephone;

    // Маппинг данных из API ответа в формат формы
    const mappedData = mapApiDataToForm(apiResponseData);
    
    // Обновляем поля формы, сохраняя уже введенные ИИН и телефон
    // Для остальных полей используем значения из API (даже если они пустые), чтобы перезаписать старые данные
    setParentData(prev => ({
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
    }));
    
    // Переход в состояние data_loaded
    setAutoModeState('data_loaded');
    
    // Вызов getChildren в фоне
    const phoneClean = currentTelephone.replace(/\D/g, '');
    const iinClean = currentIin.replace(/\D/g, '');
    getChildren(iinClean, phoneClean).then(childrenData => {
      setChildren(childrenData);
    }).catch(err => {
      console.error('Error loading children in background:', err);
    });
  };

  const handleSelectChild = () => {
    // Если ручной ввод родителя не включен И данные не получены через сервис, ничего не делаем
    if (!manualInput && autoModeState !== 'data_loaded') {
      return;
    }
    // Если включен ручной ввод ребенка, ничего не делаем
    if (manualChildInput) {
      return;
    }
    // Переходим на экран выбора
    setCurrentView('choose-child');
  };

  // Обработчики для выбора ребенка
  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };

  const handleChildSave = () => {
    if (selectedChild && typeof selectedChild === 'object') {
      setCurrentView('filled');
    } else if (manualChildInput) {
      // Если включен ручной ввод, переходим к заполнению формы
      setCurrentView('filled');
    }
  };

  // Обработчики для формы ребенка
  const handleDictionaryValueSelect = (fieldName, value) => {
    setChildData(prev => ({
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

  const handleChildFieldClick = (fieldName) => {
    setActiveChildField(fieldName);
  };

  const handleChildFieldChange = (fieldName, value) => {
    setChildData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleChildFieldBlur = (fieldName) => {
    if (activeChildField === fieldName) {
      setActiveChildField(null);
    }
  };

  // Функция для получения текстового представления справочника
  const getDictionaryDisplayValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.name_ru || value.name || value.title || '';
    }
    return value;
  };


  const handleTogglePDL = () => {
    setToggleStates(prev => ({
      ...prev,
      pdl: !prev.pdl
    }));
  };

  // Определение текста кнопки в заголовке
  const getHeaderButtonText = () => {
    // Если идет загрузка, показываем "Загрузка..."
    if (isLoading) {
      return 'Загрузка...';
    }
    
    // Если ручной ввод включен - кнопка всегда "Сохранить"
    if (manualInput) {
      return 'Сохранить';
    }
    
    // Если ручной ввод выключен - кнопка зависит от состояния автоматического режима
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

  // Определение действия кнопки в заголовке
  const handleHeaderButtonClick = () => {
    // Если ручной ввод включен - сохраняем данные
    if (manualInput) {
      handleFinalSave();
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
      handleFinalSave();
      return;
    }
  };

  const handleFinalSave = async () => {
    // Сохраняем в API через Contragent PUT
    if (applicationId) {
      try {
        const token = getAccessToken();
        if (token) {
          // Получаем taskId
          let actualTaskId = taskId;
          if (!actualTaskId || actualTaskId.trim() === '' || actualTaskId === applicationId) {
            const metadata = loadApplicationMetadata(applicationId);
            if (metadata?.taskId && metadata.taskId !== applicationId) {
              actualTaskId = metadata.taskId;
            } else {
              try {
                const processInstance = await getProcessInstanceDetails(applicationId, token);
                if (processInstance?.taskId && processInstance.taskId !== applicationId) {
                  actualTaskId = processInstance.taskId;
                } else if (processInstance?.tasks && Array.isArray(processInstance.tasks) && processInstance.tasks.length > 0) {
                  const firstTask = processInstance.tasks[0];
                  if (firstTask?.id && firstTask.id !== applicationId) {
                    actualTaskId = firstTask.id;
                  }
                }
              } catch (error) {
                console.warn('⚠️ [INSURED] Не удалось получить processInstance:', error.message);
              }
            }
          }
          
          let accessIdForAPI = actualTaskId && actualTaskId !== applicationId ? actualTaskId : applicationId;
          
          if (accessIdForAPI && accessIdForAPI.trim() !== '') {
            try {
              // Преобразуем данные ребенка в формат API
              const contragentData = mapInsuredToContragent(childData, 'other-child');
              
              console.log('📤 [INSURED] Отправка данных застрахованного (другой ребенок) в API с accessId:', accessIdForAPI);
              console.log('📤 [INSURED] Данные застрахованного:', JSON.stringify(contragentData, null, 2));
              
              // Вызываем PUT для сохранения/обновления контрагента
              await updateContragent(contragentData, accessIdForAPI.trim(), token);
              
              console.log('✅ [INSURED] Данные застрахованного сохранены в API');
            } catch (error) {
              console.error('Ошибка сохранения застрахованного в API:', error);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка сохранения застрахованного в API:', error);
      }
    }

    if (onSave) {
      // Сохраняем все данные для восстановления
      const dataToSave = {
        insuredType: 'other-child', // Указываем тип застрахованного
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
      
      // Преобразуем childData для отображения в Application.js
      const displayData = {
        lastName: childData.surname || '',
        firstName: childData.name || '',
        middleName: childData.patronymic || '',
        iin: childData.iin || '',
        // Сохраняем полные данные для восстановления
        fullData: dataToSave
      };
      
      onSave(displayData);
    }
    // Возвращаемся в Application.js
    if (onBack) {
      onBack();
    }
  };

  const getSelectedChildDisplay = () => {
    if (selectedChild && typeof selectedChild === 'object') {
      return getChildFullName(selectedChild);
    }
    if (selectedChild && typeof selectedChild === 'string') {
      return selectedChild;
    }
    return '';
  };

  // Рендеринг справочников родителя (в view 'parent' и 'filled')
  if ((currentView === 'parent' || currentView === 'filled') && parentDictionaryView !== 'main') {
    if (parentDictionaryView === 'gender') {
      return <Gender onBack={() => setParentDictionaryView(previousParentDictionaryView)} onSelect={(value) => handleParentDictionaryValueSelect('gender', value)} />;
    }
    if (parentDictionaryView === 'sectorCode') {
      return <SectorCode onBack={() => setParentDictionaryView(previousParentDictionaryView)} onSelect={(value) => handleParentDictionaryValueSelect('economSecId', value)} initialValue={parentData.economSecId} />;
    }
    if (parentDictionaryView === 'country') {
      return <Country onBack={() => setParentDictionaryView(previousParentDictionaryView)} onSave={(value) => handleParentDictionaryValueSelect('countryId', value)} />;
    }
    if (parentDictionaryView === 'region') {
      return <Region onBack={() => setParentDictionaryView(previousParentDictionaryView)} onSave={(value) => handleParentDictionaryValueSelect('district_nameru', value)} />;
    }
    if (parentDictionaryView === 'docType') {
      return <DocType onBack={() => setParentDictionaryView(previousParentDictionaryView)} onSave={(value) => handleParentDictionaryValueSelect('vidDocId', value)} />;
    }
    if (parentDictionaryView === 'issuedBy') {
      return <IssuedBy onBack={() => setParentDictionaryView(previousParentDictionaryView)} onSelect={(value) => handleParentDictionaryValueSelect('issuedBy', value)} />;
    }
  }

  // Рендеринг справочников ребенка (внутри filled view)
  if (currentView === 'filled' && dictionaryView !== 'main') {
    if (dictionaryView === 'gender') {
      return <Gender onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleDictionaryValueSelect('gender', value)} />;
    }
    if (dictionaryView === 'sectorCode') {
      return <SectorCode onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleDictionaryValueSelect('economSecId', value)} initialValue={childData.economSecId} />;
    }
    if (dictionaryView === 'country') {
      return <Country onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleDictionaryValueSelect('countryId', value)} />;
    }
    if (dictionaryView === 'region') {
      return <Region onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleDictionaryValueSelect('district_nameru', value)} />;
    }
    if (dictionaryView === 'docType') {
      return <DocType onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleDictionaryValueSelect('vidDocId', value)} />;
    }
    if (dictionaryView === 'issuedBy') {
      return <IssuedBy onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleDictionaryValueSelect('issuedBy', value)} />;
    }
  }

  // Рендеринг экрана выбора ребенка
  if (currentView === 'choose-child') {
    return (
      <div data-layer="Selection child page" className="SelectionChildPage" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="Menu button" className="MenuButton" onClick={() => setCurrentView('parent')} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="Selection child" className="SelectionChild" style={{flex: '1 1 0', height: 982, background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Выбрать ребенка</div>
              {!error && children.length > 0 && (
                <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleChildSave} style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
                  <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
                </div>
              )}
            </div>
          </div>
          <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            {loading && (
              <div data-layer="Loading" className="Loading" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Загрузка...</div>
              </div>
            )}
            {!loading && children.length > 0 && children.map((child, index) => {
              const fullName = getChildFullName(child);
              const isSelected = selectedChild && typeof selectedChild === 'object' && selectedChild.child_iin === child.child_iin;
              return (
                <div 
                  key={child.child_iin || index} 
                  data-layer="InputContainerRadioButton" 
                  data-state={isSelected ? 'pressed' : 'not_pressed'} 
                  className="Inputcontainerradiobutton" 
                  onClick={() => handleChildSelect(child)} 
                  style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}
                >
                  <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{fullName}</div>
                  </div>
                  <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                    {isSelected ? (
                      <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{left: 35, top: 36, position: 'absolute'}}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6.5" fill="black" stroke="black"/>
                        </svg>
                      </div>
                    ) : (
                      <div data-svg-wrapper data-layer="Ellipse-off" className="EllipseOff" style={{left: 35, top: 36, position: 'absolute'}}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6.5" stroke="black"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {!loading && error && (
              <div data-layer="Alert" className="Alert" style={{width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                <div data-layer="Info container" className="InfoContainer" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
                  <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_785_24837)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.916016 11.0003C0.916016 5.43131 5.43034 0.916992 10.9993 0.916992C16.5684 0.916992 21.0827 5.43131 21.0827 11.0003C21.0827 16.5693 16.5684 21.0837 10.9993 21.0837C5.43034 21.0837 0.916016 16.5693 0.916016 11.0003ZM10.9993 2.75033C6.44286 2.75033 2.74935 6.44384 2.74935 11.0003C2.74935 15.5568 6.44286 19.2503 10.9993 19.2503C15.5558 19.2503 19.2494 15.5568 19.2494 11.0003C19.2494 6.44384 15.5558 2.75033 10.9993 2.75033ZM10.0735 7.33366C10.0735 6.8274 10.4839 6.41699 10.9902 6.41699H10.9993C11.5056 6.41699 11.916 6.8274 11.916 7.33366C11.916 7.83992 11.5056 8.25033 10.9993 8.25033H10.9902C10.4839 8.25033 10.0735 7.83992 10.0735 7.33366ZM10.9993 10.0837C11.5056 10.0837 11.916 10.4941 11.916 11.0003V14.667C11.916 15.1733 11.5056 15.5837 10.9993 15.5837C10.4931 15.5837 10.0827 15.1733 10.0827 14.667V11.0003C10.0827 10.4941 10.4931 10.0837 10.9993 10.0837Z" fill="black"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_785_24837">
                    <rect width="22" height="22" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>
                  </div>
                </div>
                <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сервис не работает. Данные детей не получены.</div>
              </div>
            )}
            {!loading && !error && children.length === 0 && (
              <div data-layer="Alert" className="Alert" style={{width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                <div data-layer="Info container" className="InfoContainer" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
                  <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_785_24837)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.916016 11.0003C0.916016 5.43131 5.43034 0.916992 10.9993 0.916992C16.5684 0.916992 21.0827 5.43131 21.0827 11.0003C21.0827 16.5693 16.5684 21.0837 10.9993 21.0837C5.43034 21.0837 0.916016 16.5693 0.916016 11.0003ZM10.9993 2.75033C6.44286 2.75033 2.74935 6.44384 2.74935 11.0003C2.74935 15.5568 6.44286 19.2503 10.9993 19.2503C15.5558 19.2503 19.2494 15.5568 19.2494 11.0003C19.2494 6.44384 15.5558 2.75033 10.9993 2.75033ZM10.0735 7.33366C10.0735 6.8274 10.4839 6.41699 10.9902 6.41699H10.9993C11.5056 6.41699 11.916 6.8274 11.916 7.33366C11.916 7.83992 11.5056 8.25033 10.9993 8.25033H10.9902C10.4839 8.25033 10.0735 7.83992 10.0735 7.33366ZM10.9993 10.0837C11.5056 10.0837 11.916 10.4941 11.916 11.0003V14.667C11.916 15.1733 11.5056 15.5837 10.9993 15.5837C10.4931 15.5837 10.0827 15.1733 10.0827 14.667V11.0003C10.0827 10.4941 10.4931 10.0837 10.9993 10.0837Z" fill="black"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_785_24837">
                    <rect width="22" height="22" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>
                  </div>
                </div>
                <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Детей нет.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Рендеринг финальной формы с данными
  if (currentView === 'filled') {
    return (
      <div data-layer="Insured data page" className="InsuredDataPage" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="Back button" className="BackButton" onClick={() => setCurrentView('parent')} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="Insured data" className="InsuredData" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Застрахованный иной ребенок</div>
              <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
                <div data-layer="Send request button" data-state="pressed" className="SendRequestButton" onClick={handleFinalSave} style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
                  <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
                </div>
              </div>
            </div>
          </div>
          <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            {/* Секция данных родителя */}
            <div data-layer="MessageContainer" className="Messagecontainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
              <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Данные родителя или опекуна ребенка</div>
              <div data-layer="Open button" className="OpenButton" onClick={() => setParentSectionCollapsed(!parentSectionCollapsed)} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
                <div data-svg-wrapper data-layer="Chewron up" className="ChewronUp" style={{left: 31, top: 32, position: 'absolute', transform: parentSectionCollapsed ? 'rotate(180deg)' : 'none'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.5 15.5L11 7.5L18.5 15.5" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            {!parentSectionCollapsed && parentData && (
              <>
                {renderToggleButton('Ручной ввод данных', manualInput, handleToggleManualInput)}
                {renderInputField('iin', 'ИИН', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                {renderInputField('telephone', 'Номер телефона', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                {(manualInput || autoModeState === 'data_loaded') && (
                  <>
                    {renderInputField('surname', 'Фамилия', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('name', 'Имя', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('patronymic', 'Отчество', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderCalendarField('birthDate', 'Дата рождения', parentData.birthDate)}
                    {renderDictionaryButton('gender', 'Пол', getDictionaryDisplayValue(parentData.gender), handleParentOpenGender, !!parentData.gender)}
                    {renderDictionaryButton('economSecId', 'Код сектора экономики', getDictionaryDisplayValue(parentData.economSecId), handleParentOpenSectorCode, !!parentData.economSecId)}
                    {renderDictionaryButton('countryId', 'Страна', getDictionaryDisplayValue(parentData.countryId), handleParentOpenCountry, !!parentData.countryId)}
                    {renderDictionaryButton('district_nameru', 'Область', getDictionaryDisplayValue(parentData.district_nameru), handleParentOpenRegion, !!parentData.district_nameru)}
                    {renderInputField('settlementName', 'Название населенного пункта', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('street', 'Улица', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('houseNumber', '№ дома', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('apartmentNumber', '№ квартиры', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderDictionaryButton('vidDocId', 'Тип документа', getDictionaryDisplayValue(parentData.vidDocId), handleParentOpenDocType, !!parentData.vidDocId)}
                    {renderInputField('docNumber', 'Номер документа', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderDictionaryButton('issuedBy', 'Кем выдано', getDictionaryDisplayValue(parentData.issuedBy), handleParentOpenIssuedBy, !!parentData.issuedBy)}
                    {renderCalendarField('issueDate', 'Выдан от', parentData.issueDate)}
                    {renderCalendarField('expiryDate', 'Действует до', parentData.expiryDate)}
                  </>
                )}
              </>
            )}

            {/* Секция данных ребенка */}
            <div data-layer="MessageContainer" className="Messagecontainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
              <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Данные ребенка</div>
              <div data-layer="Open button" className="OpenButton" onClick={() => setChildSectionCollapsed(!childSectionCollapsed)} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
                <div data-svg-wrapper data-layer="Chewron up" className="ChewronUp" style={{left: 31, top: 32, position: 'absolute', transform: childSectionCollapsed ? 'rotate(180deg)' : 'none'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.5 15.5L11 7.5L18.5 15.5" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            {!childSectionCollapsed && (
              <>
                {renderDictionaryButton('selectChild', 'Выбрать ребенка', getSelectedChildDisplay(), handleSelectChild, !!getSelectedChildDisplay())}
                {renderToggleButton('Ручной ввод данных', manualChildInput, handleToggleManualChildInput)}
                {(manualInput || autoModeState === 'data_loaded') && (manualChildInput || selectedChild) && (
                  <>
                    {renderInputField('iin', 'ИИН', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderInputField('surname', 'Фамилия', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderInputField('name', 'Имя', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderInputField('patronymic', 'Отчество', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderCalendarField('birthDate', 'Дата рождения', childData.birthDate)}
                    {renderDictionaryButton('gender', 'Пол', getDictionaryDisplayValue(childData.gender), handleOpenGender, !!childData.gender)}
                    {renderDictionaryButton('economSecId', 'Код сектора экономики', getDictionaryDisplayValue(childData.economSecId), handleOpenSectorCode, !!childData.economSecId)}
                    {renderToggleButton('Адрес проживания совпадает с адресом родителя', addressMatchesParent, handleToggleAddressMatchesParent)}
                    {renderDictionaryButton('countryId', 'Страна', getDictionaryDisplayValue(childData.countryId), handleOpenCountry, !!childData.countryId)}
                    {renderDictionaryButton('district_nameru', 'Область', getDictionaryDisplayValue(childData.district_nameru), handleOpenRegion, !!childData.district_nameru)}
                    {renderInputField('settlementName', 'Название населенного пункта', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderInputField('street', 'Улица', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderInputField('houseNumber', '№ дома', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderInputField('apartmentNumber', '№ квартиры', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderDictionaryButton('vidDocId', 'Тип документа', getDictionaryDisplayValue(childData.vidDocId), handleOpenDocType, !!childData.vidDocId)}
                    {renderInputField('docNumber', 'Номер документа', childData, activeChildField, handleChildFieldChange, handleChildFieldClick, handleChildFieldBlur)}
                    {renderDictionaryButton('issuedBy', 'Кем выдано', getDictionaryDisplayValue(childData.issuedBy), handleOpenIssuedBy, !!childData.issuedBy)}
                    {renderCalendarField('issueDate', 'Выдан от', childData.issueDate)}
                    {renderToggleButton('Признак ПДЛ', toggleStates.pdl, handleTogglePDL)}
                    {manualChildInput && (
                      <>
                        {renderAttachField('documentFile', 'Документ подтверждающий личность', childData.documentFile)}
                        {renderAttachField('guardianshipDocument', 'Документ подтверждающий опекунство', '')}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Основной вид - форма родителя
  const showAllParentFields = manualInput || autoModeState === 'data_loaded';
  // Ребенок доступен когда включен ручной ввод родителя ИЛИ данные получены через сервис
  const canSelectChild = manualInput || autoModeState === 'data_loaded';

  return (
    <div data-layer="Insured data page" className="InsuredDataPage" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Back button" className="BackButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
          <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
      <div data-layer="Insured data" className="InsuredData" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Застрахованный иной ребенок</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Application section transition buttons" className="ApplicationSectionTransitionButtons" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
                <div data-layer="Next Button" className="NextButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderRight: '1px #F8E8E8 solid'}}>
                  <div data-svg-wrapper data-layer="Chewron down" className="ChewronDown" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5 7.5L11 15.5L3.5 7.5" stroke="black" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div data-layer="Previous Button" className="PreviousButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}}>
                  <div data-svg-wrapper data-layer="Chewron up" className="ChewronUp" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 15.5L11 7.5L18.5 15.5" stroke="black" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div data-layer="Send request button" data-state="pressed" className="SendRequestButton" onClick={isLoading ? undefined : handleHeaderButtonClick} style={{width: 390, height: 85, background: isLoading ? '#666' : 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1}}>
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{getHeaderButtonText()}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Alert для уведомлений */}
        {(!manualInput && (autoModeState === 'request_sent' || autoModeState === 'response_received')) || errorMessage ? (
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
          <div data-layer="MessageContainer" className="Messagecontainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Данные родителя или опекуна ребенка</div>
            <div data-layer="Open button" className="OpenButton" onClick={() => setParentSectionCollapsed(!parentSectionCollapsed)} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
              <div data-svg-wrapper data-layer="Chewron up" className="ChewronUp" style={{left: 31, top: 32, position: 'absolute', transform: parentSectionCollapsed ? 'rotate(180deg)' : 'none'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 15.5L11 7.5L18.5 15.5" stroke="black" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
          {!parentSectionCollapsed && (
            <>
              {renderToggleButton('Ручной ввод данных', manualInput, handleToggleManualInput)}
              {renderInputField('iin', 'ИИН', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
              {renderInputField('telephone', 'Номер телефона', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
              {showAllParentFields && (
                <>
                  {renderInputField('surname', 'Фамилия', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('name', 'Имя', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('patronymic', 'Отчество', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderCalendarField('birthDate', 'Дата рождения', parentData.birthDate)}
                  {renderDictionaryButton('gender', 'Пол', getDictionaryDisplayValue(parentData.gender), handleParentOpenGender, !!parentData.gender)}
                  {renderDictionaryButton('economSecId', 'Код сектора экономики', getDictionaryDisplayValue(parentData.economSecId), handleParentOpenSectorCode, !!parentData.economSecId)}
                  {renderDictionaryButton('countryId', 'Страна', getDictionaryDisplayValue(parentData.countryId), handleParentOpenCountry, !!parentData.countryId)}
                  {renderDictionaryButton('district_nameru', 'Область', getDictionaryDisplayValue(parentData.district_nameru), handleParentOpenRegion, !!parentData.district_nameru)}
                  {renderInputField('settlementName', 'Название населенного пункта', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('street', 'Улица', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('houseNumber', '№ дома', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('apartmentNumber', '№ квартиры', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderDictionaryButton('vidDocId', 'Тип документа', getDictionaryDisplayValue(parentData.vidDocId), handleParentOpenDocType, !!parentData.vidDocId)}
                  {renderInputField('docNumber', 'Номер документа', parentData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderDictionaryButton('issuedBy', 'Кем выдано', getDictionaryDisplayValue(parentData.issuedBy), handleParentOpenIssuedBy, !!parentData.issuedBy)}
                  {renderCalendarField('issueDate', 'Выдан от', parentData.issueDate)}
                  {renderCalendarField('expiryDate', 'Действует до', parentData.expiryDate)}
                </>
              )}
            </>
          )}
          <div data-layer="MessageContainer" className="Messagecontainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Данные ребенка</div>
          </div>
          {canSelectChild && (
            <>
              <div data-layer="InputContainerDictionaryButton" data-state="not_pressed" className="Inputcontainerdictionarybutton" onClick={handleSelectChild} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex', cursor: 'pointer'}}>
                <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Выбрать ребенка</div>
                </div>
                <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                  <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
              </div>
              {renderToggleButton('Ручной ввод данных', manualChildInput, handleToggleManualChildInput)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherChild;

