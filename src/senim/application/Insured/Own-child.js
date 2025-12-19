import React, { useState, useEffect } from 'react';
import Gender from '../../dictionary/Gender';
import SectorCode from '../../dictionary/SectorCode';
import Country from '../../dictionary/Country';
import Region from '../../dictionary/Region';
import DocType from '../../dictionary/DocType';
import IssuedBy from '../../dictionary/IssuedBy';
import ClientType from '../../dictionary/ClientType';
import { getChildren, getChildFullName, formatDate as formatChildDate } from '../../../services/childService';
import { renderInputField, renderDictionaryButton, renderCalendarField, renderAttachField, renderToggleButton } from './InsuredFormFields';
import { saveOwnChildToApi } from '../../services/ownChildApiService';
import { mapContragentToInsuredForApplication } from '../../services/processFacade';

const OwnChild = ({ onBack, onSave, applicationId, taskId, onOpenTypes, policyholderData, savedData }) => {
  // Основной currentView для переключения между этапами: 'main', 'choose-child', 'filled'
  const [currentView, setCurrentView] = useState('main');
  // Для справочников внутри 'filled' view
  const [dictionaryView, setDictionaryView] = useState('main');
  const [previousDictionaryView, setPreviousDictionaryView] = useState('main');

  // Состояние для ручного ввода данных ребенка
  const [manualChildInput, setManualChildInput] = useState(false);

  // Состояние для тоггла "Адрес проживания совпадает с адресом родителя"
  const [addressMatchesParent, setAddressMatchesParent] = useState(true);

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

  // Состояния для выбора ребенка
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [toggleStates, setToggleStates] = useState({
    pdl: false
  });

  const [activeChildField, setActiveChildField] = useState(null);
  const [activeParentField, setActiveParentField] = useState(null);
  const [childSectionCollapsed, setChildSectionCollapsed] = useState(false);
  const [parentSectionCollapsed, setParentSectionCollapsed] = useState(true);


  // Восстановление сохраненных данных при монтировании
  useEffect(() => {
    if (savedData) {
      // Приоритет: данные из getContragent (fullInsured) - самые полные
      // Данные ребенка могут быть в разных местах:
      // 1. В savedData.fullData.fullInsured (данные из getContragent - ПРИОРИТЕТ)
      // 2. В savedData.fullData.childData (когда сохраняются из формы)
      // 3. В savedData напрямую (когда приходят из ProcessInstance через spread ...mappedInsuredData)
      let childDataFromSaved = null;

      // ПРИОРИТЕТ 1: Если есть данные из getContragent (fullInsured), используем их
      if (savedData.fullData?.fullInsured) {
        const mappedChildData = mapContragentToInsuredForApplication(savedData.fullData.fullInsured);
        if (mappedChildData && (mappedChildData.iin || mappedChildData.name || mappedChildData.surname)) {
          childDataFromSaved = mappedChildData;
        }
      }

      // ПРИОРИТЕТ 2: Если нет данных из getContragent, используем сохраненные данные из формы
      if (!childDataFromSaved && savedData.fullData?.childData) {
        const savedChildData = savedData.fullData.childData;
        if (savedChildData && (savedChildData.iin || savedChildData.name || savedChildData.surname)) {
          childDataFromSaved = savedChildData;
        }
      }

      // ПРИОРИТЕТ 3: Если нет в fullData, берем из savedData напрямую
      if (!childDataFromSaved) {
        const { fullData, ...dataWithoutFullData } = savedData;
        if (dataWithoutFullData && (dataWithoutFullData.iin || dataWithoutFullData.name || dataWithoutFullData.surname)) {
          childDataFromSaved = dataWithoutFullData;
        }
      }

      // Восстанавливаем данные ребенка
      if (childDataFromSaved && (childDataFromSaved.iin || childDataFromSaved.name || childDataFromSaved.surname)) {
        // Функция для правильной обработки значений
        const getValue = (value, defaultValue = '') => {
          return value !== undefined && value !== null ? value : defaultValue;
        };

        // Функция для правильной обработки объектов справочников
        const getDictionaryValue = (value) => {
          if (value === undefined || value === null) {
            return undefined;
          }
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return value;
          }
          if (value === '') {
            return '';
          }
          return value;
        };

        const getDictionaryOrPrev = (restored, prevValue) => {
          if (restored !== undefined) {
            return restored;
          }
          return prevValue !== undefined ? prevValue : '';
        };

        // Извлекаем значения справочников
        const restoredGender = getDictionaryValue(childDataFromSaved.gender);
        const restoredEconomSecId = getDictionaryValue(childDataFromSaved.economSecId);
        const restoredCountryId = getDictionaryValue(childDataFromSaved.countryId);
        const restoredVidDocId = getDictionaryValue(childDataFromSaved.vidDocId);
        const restoredIssuedBy = getDictionaryValue(childDataFromSaved.issuedBy);
        const restoredClientType = getDictionaryValue(childDataFromSaved.clientType);

        // Вычисляем финальные значения справочников
        const finalGender = getDictionaryOrPrev(restoredGender, undefined);
        const finalEconomSecId = getDictionaryOrPrev(restoredEconomSecId, undefined);
        const finalCountryId = getDictionaryOrPrev(restoredCountryId, undefined);
        const finalVidDocId = getDictionaryOrPrev(restoredVidDocId, undefined);
        const finalIssuedBy = getDictionaryOrPrev(restoredIssuedBy, undefined);
        const finalClientType = getDictionaryOrPrev(restoredClientType, undefined);

        setChildData(prev => ({
          iin: getValue(childDataFromSaved.iin, prev.iin || ''),
          telephone: getValue(childDataFromSaved.telephone, prev.telephone || ''),
          name: getValue(childDataFromSaved.name, prev.name || ''),
          surname: getValue(childDataFromSaved.surname, prev.surname || ''),
          patronymic: getValue(childDataFromSaved.patronymic, prev.patronymic || ''),
          street: getValue(childDataFromSaved.street, prev.street || ''),
          houseNumber: getValue(childDataFromSaved.houseNumber, prev.houseNumber || ''),
          apartmentNumber: getValue(childDataFromSaved.apartmentNumber, prev.apartmentNumber || ''),
          docNumber: getValue(childDataFromSaved.docNumber, prev.docNumber || ''),
          birthDate: getValue(childDataFromSaved.birthDate, prev.birthDate || ''),
          issueDate: getValue(childDataFromSaved.issueDate, prev.issueDate || ''),
          expiryDate: getValue(childDataFromSaved.expiryDate, prev.expiryDate || ''),
          // Справочники - используем предварительно вычисленные значения
          gender: finalGender !== undefined ? finalGender : prev.gender || '',
          economSecId: finalEconomSecId !== undefined ? finalEconomSecId : prev.economSecId || '',
          countryId: finalCountryId !== undefined ? finalCountryId : prev.countryId || '',
          vidDocId: finalVidDocId !== undefined ? finalVidDocId : prev.vidDocId || '',
          issuedBy: finalIssuedBy !== undefined ? finalIssuedBy : prev.issuedBy || '',
          clientType: finalClientType !== undefined ? finalClientType : prev.clientType || '',
          // Обычные строковые поля
          district_nameru: getValue(childDataFromSaved.district_nameru, prev.district_nameru || ''),
          settlementName: getValue(childDataFromSaved.settlementName, prev.settlementName || ''),
          residency: getValue(childDataFromSaved.residency, prev.residency || 'Резидент')
        }));

        // Автоматически открываем форму с заполненными данными
        // Если есть данные ребенка из getContragent, всегда открываем форму 'filled'
        // Устанавливаем view и разворачиваем секцию СРАЗУ, не ждем следующего рендера
        setCurrentView('filled');
        setChildSectionCollapsed(false);
      }

      // Восстанавливаем данные из fullData (если есть)
      if (savedData.fullData) {
        const restored = savedData.fullData;

        // ПРИОРИТЕТ 2: Если нет данных из getContragent, используем сохраненные данные из формы
        if (!childDataFromSaved && restored.childData) {
          setChildData(restored.childData);
          childDataFromSaved = restored.childData; // Помечаем, что данные есть
        }

        if (restored.selectedChild) {
          setSelectedChild(restored.selectedChild);
        }

        // Восстанавливаем состояния тогглов
        if (restored.manualChildInput !== undefined) {
          setManualChildInput(restored.manualChildInput);
        }
        if (restored.addressMatchesParent !== undefined) {
          setAddressMatchesParent(restored.addressMatchesParent);
        }
        if (restored.toggleStates) {
          setToggleStates(restored.toggleStates);
        }

        // Восстанавливаем view: если не задан, но есть fullInsured или childData, сразу открываем заполненную форму
        // Логика как в Other-child: если есть данные ребенка, пропускаем экран выбора
        if (restored.currentView) {
          // Если явно сохранен view, используем его только если нет данных ребенка
          if (!childDataFromSaved) {
            setCurrentView(restored.currentView);
          }
        } else if (restored.fullInsured || restored.childData || childDataFromSaved) {
          // Если есть данные ребенка (из любого источника), сразу открываем форму
          setCurrentView('filled');
          setChildSectionCollapsed(false);
        }
      }

      // ФИНАЛЬНАЯ ПРОВЕРКА: Если есть данные ребенка, гарантируем, что view установлен в 'filled'
      // Это нужно сделать в конце, чтобы перезаписать любые другие значения
      if (childDataFromSaved && (childDataFromSaved.iin || childDataFromSaved.name || childDataFromSaved.surname)) {
        setCurrentView('filled');
        setChildSectionCollapsed(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedData]);

  // Загрузка детей при переходе на экран выбора
  useEffect(() => {
    if (currentView === 'choose-child' && policyholderData && policyholderData.iin && policyholderData.telephone) {
      const loadChildren = async () => {
        try {
          setLoading(true);
          setError(null);
          const phoneClean = policyholderData.telephone.replace(/\D/g, '');
          const iinClean = policyholderData.iin.replace(/\D/g, '');
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
  }, [currentView, policyholderData]);

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
        houseNumber: '',
        apartmentNumber: '',
        docNumber: selectedChild.act_number || '',
        birthDate: formatChildDate(selectedChild.child_birth_date) || '',
        issueDate: formatChildDate(selectedChild.act_date) || '',
        gender: '',
        economSecId: '',
        countryId: '',
        district_nameru: '',
        settlementName: '',
        vidDocId: 'Свидетельство о рождении',
        issuedBy: selectedChild.zags_name_ru || '',
        residency: 'Резидент',
        clientType: ''
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
        birthDate: '',
        issueDate: '',
        gender: '',
        economSecId: '',
        countryId: '',
        district_nameru: '',
        settlementName: '',
        vidDocId: 'Свидетельство о рождении',
        issuedBy: '',
        residency: 'Резидент',
        clientType: ''
      });
    }
  }, [currentView, selectedChild, manualChildInput]);

  // Автоматическое копирование адреса родителя в адрес ребенка когда тоггл включен
  useEffect(() => {
    if (addressMatchesParent && currentView === 'filled' && policyholderData) {
      setChildData(prev => ({
        ...prev,
        countryId: policyholderData.countryId || prev.countryId,
        district_nameru: policyholderData.district_nameru || prev.district_nameru,
        settlementName: policyholderData.settlementName || prev.settlementName,
        street: policyholderData.street || prev.street,
        houseNumber: policyholderData.houseNumber || prev.houseNumber,
        apartmentNumber: policyholderData.apartmentNumber || prev.apartmentNumber
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressMatchesParent, policyholderData?.countryId, policyholderData?.district_nameru, policyholderData?.settlementName, policyholderData?.street, policyholderData?.houseNumber, policyholderData?.apartmentNumber, currentView]);

  // Обработчики для формы родителя (используем policyholderData напрямую)
  const handleParentFieldChange = (fieldName, value) => {
    // Для своего ребенка данные родителя берутся из policyholderData
    // Здесь можно добавить локальное состояние если нужно редактирование
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
    // Для своего ребенка данные родителя берутся из policyholderData
    // Здесь можно добавить локальное состояние если нужно редактирование
    setDictionaryView(previousDictionaryView);
  };

  const handleParentOpenGender = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('parent-gender');
  };
  const handleParentOpenSectorCode = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('parent-sectorCode');
  };
  const handleParentOpenCountry = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('parent-country');
  };
  const handleParentOpenRegion = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('parent-region');
  };
  const handleParentOpenDocType = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('parent-docType');
  };
  const handleParentOpenIssuedBy = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('parent-issuedBy');
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
  const handleOpenClientType = () => {
    setPreviousDictionaryView(dictionaryView);
    setDictionaryView('clientType');
  };

  const handleToggleManualChildInput = () => {
    const newValue = !manualChildInput;
    setManualChildInput(newValue);
    if (newValue) {
      // Если включаем ручной ввод, сразу переходим к заполнению формы
      setCurrentView('filled');
    }
  };

  const handleSelectChild = () => {
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

  const handleChildFieldClick = (fieldName) => {
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

  // Функция для получения текстового представления справочника
  const getDictionaryDisplayValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      // Проверяем все возможные варианты названий полей (nameRu используется в mapContragentToInsuredForApplication)
      return value.nameRu || value.name_ru || value.name || value.title || '';
    }
    return value;
  };

  const handleTogglePDL = () => {
    setToggleStates(prev => ({
      ...prev,
      pdl: !prev.pdl
    }));
  };

  const handleToggleAddressMatchesParent = () => {
    const newValue = !addressMatchesParent;
    setAddressMatchesParent(newValue);
    if (newValue && policyholderData) {
      // Копируем адрес родителя в адрес ребенка
      setChildData(prev => ({
        ...prev,
        countryId: policyholderData.countryId || prev.countryId,
        district_nameru: policyholderData.district_nameru || prev.district_nameru,
        settlementName: policyholderData.settlementName || prev.settlementName,
        street: policyholderData.street || prev.street,
        houseNumber: policyholderData.houseNumber || prev.houseNumber,
        apartmentNumber: policyholderData.apartmentNumber || prev.apartmentNumber
      }));
    }
  };

  const handleFinalSave = async () => {
    // Сохраняем в API через сервис ownChildApiService
    if (applicationId) {
      try {
        await saveOwnChildToApi({
          applicationId,
          taskId,
          childData,
          parentData: policyholderData
        });
      } catch (error) {
      }
    }

    if (onSave) {
      // Сохраняем все данные для восстановления
      const dataToSave = {
        insuredType: 'own-child', // Указываем тип застрахованного
        childData,
        selectedChild,
        toggleStates,
        manualChildInput,
        addressMatchesParent,
        currentView: currentView === 'filled' ? 'filled' : 'main'
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

  // Рендеринг справочников родителя (внутри filled view)
  if (currentView === 'filled' && dictionaryView !== 'main' && dictionaryView.startsWith('parent-')) {
    if (dictionaryView === 'parent-gender') {
      return <Gender onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleParentDictionaryValueSelect('gender', value)} />;
    }
    if (dictionaryView === 'parent-sectorCode') {
      return <SectorCode onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleParentDictionaryValueSelect('economSecId', value)} initialValue={policyholderData.economSecId} />;
    }
    if (dictionaryView === 'parent-country') {
      return <Country onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleParentDictionaryValueSelect('countryId', value)} />;
    }
    if (dictionaryView === 'parent-region') {
      return <Region onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleParentDictionaryValueSelect('district_nameru', value)} />;
    }
    if (dictionaryView === 'parent-docType') {
      return <DocType onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleParentDictionaryValueSelect('vidDocId', value)} />;
    }
    if (dictionaryView === 'parent-issuedBy') {
      return <IssuedBy onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleParentDictionaryValueSelect('issuedBy', value)} />;
    }
  }

  // Рендеринг справочников ребенка (внутри filled view)
  if (currentView === 'filled' && dictionaryView !== 'main' && !dictionaryView.startsWith('parent-')) {
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
    if (dictionaryView === 'clientType') {
      return <ClientType onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleDictionaryValueSelect('clientType', value)} initialValue={childData.clientType} />;
    }
  }

  // Рендеринг экрана выбора ребенка
  if (currentView === 'choose-child') {
    return (
      <div data-layer="Selection child page" className="SelectionChildPage" style={{ width: 1512, minHeight: '100vh', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex' }}>
        <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{ width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div data-layer="Menu button" className="MenuButton" onClick={() => setCurrentView('main')} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer' }}>
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{ left: 31, top: 32, position: 'absolute' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="Selection child" className="SelectionChild" style={{ flex: '1 1 0', alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
            <div data-layer="Title" className="Title" style={{ flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Выбрать ребенка</div>
              {!error && children.length > 0 && (
                <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleChildSave} style={{ width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer' }}>
                  <div data-layer="Button Text" className="ButtonText" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Сохранить</div>
                </div>
              )}
            </div>
          </div>
          <div data-layer="Fields List" className="FieldsList" style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
            {loading && (
              <div data-layer="Loading" className="Loading" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex' }}>
                <div data-layer="Label" className="Label" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Загрузка...</div>
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
                  style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer' }}
                >
                  <div data-layer="Text container" className="TextContainer" style={{ flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div data-layer="Label" className="Label" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{fullName}</div>
                  </div>
                  <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden' }}>
                    {isSelected ? (
                      <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{ left: 35, top: 36, position: 'absolute' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="7" cy="7" r="6.5" fill="black" stroke="black" />
                        </svg>
                      </div>
                    ) : (
                      <div data-svg-wrapper data-layer="Ellipse-off" className="EllipseOff" style={{ left: 35, top: 36, position: 'absolute' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="7" cy="7" r="6.5" stroke="black" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {!loading && error && (
              <div data-layer="Alert" className="Alert" style={{ width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
                <div data-layer="Info container" className="InfoContainer" style={{ width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden' }}>
                  <div data-svg-wrapper data-layer="Info" className="Info" style={{ left: 31, top: 32, position: 'absolute' }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_785_24837)">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.916016 11.0003C0.916016 5.43131 5.43034 0.916992 10.9993 0.916992C16.5684 0.916992 21.0827 5.43131 21.0827 11.0003C21.0827 16.5693 16.5684 21.0837 10.9993 21.0837C5.43034 21.0837 0.916016 16.5693 0.916016 11.0003ZM10.9993 2.75033C6.44286 2.75033 2.74935 6.44384 2.74935 11.0003C2.74935 15.5568 6.44286 19.2503 10.9993 19.2503C15.5558 19.2503 19.2494 15.5568 19.2494 11.0003C19.2494 6.44384 15.5558 2.75033 10.9993 2.75033ZM10.0735 7.33366C10.0735 6.8274 10.4839 6.41699 10.9902 6.41699H10.9993C11.5056 6.41699 11.916 6.8274 11.916 7.33366C11.916 7.83992 11.5056 8.25033 10.9993 8.25033H10.9902C10.4839 8.25033 10.0735 7.83992 10.0735 7.33366ZM10.9993 10.0837C11.5056 10.0837 11.916 10.4941 11.916 11.0003V14.667C11.916 15.1733 11.5056 15.5837 10.9993 15.5837C10.4931 15.5837 10.0827 15.1733 10.0827 14.667V11.0003C10.0827 10.4941 10.4931 10.0837 10.9993 10.0837Z" fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_785_24837">
                          <rect width="22" height="22" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Сервис не работает. Данные детей не получены.</div>
              </div>
            )}
            {!loading && !error && children.length === 0 && (
              <div data-layer="Alert" className="Alert" style={{ width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
                <div data-layer="Info container" className="InfoContainer" style={{ width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden' }}>
                  <div data-svg-wrapper data-layer="Info" className="Info" style={{ left: 31, top: 32, position: 'absolute' }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_785_24837)">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.916016 11.0003C0.916016 5.43131 5.43034 0.916992 10.9993 0.916992C16.5684 0.916992 21.0827 5.43131 21.0827 11.0003C21.0827 16.5693 16.5684 21.0837 10.9993 21.0837C5.43034 21.0837 0.916016 16.5693 0.916016 11.0003ZM10.9993 2.75033C6.44286 2.75033 2.74935 6.44384 2.74935 11.0003C2.74935 15.5568 6.44286 19.2503 10.9993 19.2503C15.5558 19.2503 19.2494 15.5568 19.2494 11.0003C19.2494 6.44384 15.5558 2.75033 10.9993 2.75033ZM10.0735 7.33366C10.0735 6.8274 10.4839 6.41699 10.9902 6.41699H10.9993C11.5056 6.41699 11.916 6.8274 11.916 7.33366C11.916 7.83992 11.5056 8.25033 10.9993 8.25033H10.9902C10.4839 8.25033 10.0735 7.83992 10.0735 7.33366ZM10.9993 10.0837C11.5056 10.0837 11.916 10.4941 11.916 11.0003V14.667C11.916 15.1733 11.5056 15.5837 10.9993 15.5837C10.4931 15.5837 10.0827 15.1733 10.0827 14.667V11.0003C10.0827 10.4941 10.4931 10.0837 10.9993 10.0837Z" fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_785_24837">
                          <rect width="22" height="22" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Детей нет.</div>
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
      <div data-layer="Insured data page" className="InsuredDataPage" style={{ width: 1512, minHeight: '100vh', background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex' }}>
        <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{ width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div data-layer="Back button" className="BackButton" onClick={onBack} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer' }}>
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{ left: 32, top: 32, position: 'absolute' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="Insured data" className="InsuredData" style={{ width: 1427, alignSelf: 'stretch', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{ alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
            <div data-layer="Title" className="Title" style={{ flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Застрахованный - Свой ребенок</div>
              <div data-layer="Button container" className="ButtonContainer" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
                <div data-layer="Send request button" data-state="pressed" className="SendRequestButton" onClick={handleFinalSave} style={{ width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer' }}>
                  <div data-layer="Button Text" className="ButtonText" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Сохранить</div>
                </div>
              </div>
            </div>
          </div>
          <div data-layer="Filds list" className="FildsList" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
            {/* Секция данных родителя - всегда видна */}
            <div data-layer="MessageContainer" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
              <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Данные родителя или опекуна ребенка</div>
              <div data-layer="Open button" className="OpenButton" onClick={() => setParentSectionCollapsed(!parentSectionCollapsed)} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer' }}>
                <div data-svg-wrapper data-layer="Chewron up" className="ChewronUp" style={{ left: 31, top: 32, position: 'absolute', transform: parentSectionCollapsed ? 'rotate(180deg)' : 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 15.5L11 7.5L18.5 15.5" stroke="black" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
            {!parentSectionCollapsed && (
              <>
                {!policyholderData ? (
                  <div data-layer="Alert" className="Alert" style={{ width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
                    <div data-layer="Info container" className="InfoContainer" style={{ width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden' }}>
                      <div data-svg-wrapper data-layer="Info" className="Info" style={{ left: 31, top: 32, position: 'absolute' }}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_785_24837)">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0.916016 11.0003C0.916016 5.43131 5.43034 0.916992 10.9993 0.916992C16.5684 0.916992 21.0827 5.43131 21.0827 11.0003C21.0827 16.5693 16.5684 21.0837 10.9993 21.0837C5.43034 21.0837 0.916016 16.5693 0.916016 11.0003ZM10.9993 2.75033C6.44286 2.75033 2.74935 6.44384 2.74935 11.0003C2.74935 15.5568 6.44286 19.2503 10.9993 19.2503C15.5558 19.2503 19.2494 15.5568 19.2494 11.0003C19.2494 6.44384 15.5558 2.75033 10.9993 2.75033ZM10.0735 7.33366C10.0735 6.8274 10.4839 6.41699 10.9902 6.41699H10.9993C11.5056 6.41699 11.916 6.8274 11.916 7.33366C11.916 7.83992 11.5056 8.25033 10.9993 8.25033H10.9902C10.4839 8.25033 10.0735 7.83992 10.0735 7.33366ZM10.9993 10.0837C11.5056 10.0837 11.916 10.4941 11.916 11.0003V14.667C11.916 15.1733 11.5056 15.5837 10.9993 15.5837C10.4931 15.5837 10.0827 15.1733 10.0827 14.667V11.0003C10.0827 10.4941 10.4931 10.0837 10.9993 10.0837Z" fill="black" />
                          </g>
                          <defs>
                            <clipPath id="clip0_785_24837">
                              <rect width="22" height="22" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Заполните страхователя сначала</div>
                  </div>
                ) : (
                  <>
                    {renderInputField('iin', 'ИИН', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('telephone', 'Номер телефона', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('surname', 'Фамилия', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('name', 'Имя', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('patronymic', 'Отчество', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderCalendarField('birthDate', 'Дата рождения', policyholderData.birthDate)}
                    {renderDictionaryButton('gender', 'Пол', getDictionaryDisplayValue(policyholderData.gender), handleParentOpenGender, !!policyholderData.gender)}
                    {renderDictionaryButton('economSecId', 'Код сектора экономики', getDictionaryDisplayValue(policyholderData.economSecId), handleParentOpenSectorCode, !!policyholderData.economSecId)}
                    {renderDictionaryButton('countryId', 'Страна', getDictionaryDisplayValue(policyholderData.countryId), handleParentOpenCountry, !!policyholderData.countryId)}
                    {renderDictionaryButton('district_nameru', 'Область', getDictionaryDisplayValue(policyholderData.district_nameru), handleParentOpenRegion, !!policyholderData.district_nameru)}
                    {renderInputField('settlementName', 'Название населенного пункта', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('street', 'Улица', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('houseNumber', '№ дома', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderInputField('apartmentNumber', '№ квартиры', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderDictionaryButton('vidDocId', 'Тип документа', getDictionaryDisplayValue(policyholderData.vidDocId), handleParentOpenDocType, !!policyholderData.vidDocId)}
                    {renderInputField('docNumber', 'Номер документа', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                    {renderDictionaryButton('issuedBy', 'Кем выдано', getDictionaryDisplayValue(policyholderData.issuedBy), handleParentOpenIssuedBy, !!policyholderData.issuedBy)}
                    {renderCalendarField('issueDate', 'Выдан от', policyholderData.issueDate)}
                    {renderCalendarField('expiryDate', 'Действует до', policyholderData.expiryDate)}
                  </>
                )}
              </>
            )}

            {/* Секция данных ребенка */}
            <div data-layer="MessageContainer" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
              <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Данные ребенка</div>
              <div data-layer="Open button" className="OpenButton" onClick={() => setChildSectionCollapsed(!childSectionCollapsed)} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer' }}>
                <div data-svg-wrapper data-layer="Chewron up" className="ChewronUp" style={{ left: 31, top: 32, position: 'absolute', transform: childSectionCollapsed ? 'rotate(180deg)' : 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 15.5L11 7.5L18.5 15.5" stroke="black" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
            {!childSectionCollapsed && (
              <>
                {/* Показываем "Выбрать ребенка" только если данных ребенка еще нет */}
                {!(childData.iin || childData.name || childData.surname) && (
                  <>
                    {renderDictionaryButton('selectChild', 'Выбрать ребенка', getSelectedChildDisplay(), handleSelectChild, !!getSelectedChildDisplay())}
                    {renderToggleButton('Ручной ввод данных', manualChildInput, handleToggleManualChildInput)}
                  </>
                )}
                {/* Показываем поля ребенка, если есть данные ИЛИ выбран ребенок ИЛИ включен ручной ввод */}
                {(childData.iin || childData.name || childData.surname || manualChildInput || selectedChild) && (
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
                    {renderDictionaryButton('clientType', 'Тип клиента', getDictionaryDisplayValue(childData.clientType), handleOpenClientType, !!childData.clientType)}
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

  // Основной вид - выбор ребенка
  return (
    <div data-layer="Insured data page" className="InsuredDataPage" style={{ width: 1512, minHeight: '100vh', background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex' }}>
      <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{ width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div data-layer="Back button" className="BackButton" onClick={onBack} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer' }}>
          <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{ left: 32, top: 32, position: 'absolute' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
      <div data-layer="Insured data" className="InsuredData" style={{ width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{ alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
          <div data-layer="Title" className="Title" style={{ flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Застрахованный - Свой ребенок</div>
            <div data-layer="Button container" className="ButtonContainer" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
              <div data-layer="Application section transition buttons" className="ApplicationSectionTransitionButtons" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
                <div data-layer="Next Button" className="NextButton" style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderRight: '1px #F8E8E8 solid' }}>
                  <div data-svg-wrapper data-layer="Chewron down" className="ChewronDown" style={{ left: 31, top: 32, position: 'absolute' }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.5 7.5L11 15.5L3.5 7.5" stroke="black" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div data-layer="Previous Button" className="PreviousButton" style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid' }}>
                  <div data-svg-wrapper data-layer="Chewron up" className="ChewronUp" style={{ left: 31, top: 32, position: 'absolute' }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.5 15.5L11 7.5L18.5 15.5" stroke="black" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
              <div data-layer="Send request button" data-state="pressed" className="SendRequestButton" onClick={handleFinalSave} style={{ width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer' }}>
                <div data-layer="Button Text" className="ButtonText" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Сохранить</div>
              </div>
            </div>
          </div>
        </div>
        <div data-layer="Filds list" className="FildsList" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
          {/* Секция данных родителя */}
          <div data-layer="MessageContainer" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
            <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Данные родителя или опекуна ребенка</div>
            <div data-layer="Open button" className="OpenButton" onClick={() => setParentSectionCollapsed(!parentSectionCollapsed)} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer' }}>
              <div data-svg-wrapper data-layer="Chewron up" className="ChewronUp" style={{ left: 31, top: 32, position: 'absolute', transform: parentSectionCollapsed ? 'rotate(180deg)' : 'none' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.5 15.5L11 7.5L18.5 15.5" stroke="black" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
          {!parentSectionCollapsed && (
            <>
              {!policyholderData ? (
                <div data-layer="Alert" className="Alert" style={{ width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
                  <div data-layer="Info container" className="InfoContainer" style={{ width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden' }}>
                    <div data-svg-wrapper data-layer="Info" className="Info" style={{ left: 31, top: 32, position: 'absolute' }}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_785_24837)">
                          <path fillRule="evenodd" clipRule="evenodd" d="M0.916016 11.0003C0.916016 5.43131 5.43034 0.916992 10.9993 0.916992C16.5684 0.916992 21.0827 5.43131 21.0827 11.0003C21.0827 16.5693 16.5684 21.0837 10.9993 21.0837C5.43034 21.0837 0.916016 16.5693 0.916016 11.0003ZM10.9993 2.75033C6.44286 2.75033 2.74935 6.44384 2.74935 11.0003C2.74935 15.5568 6.44286 19.2503 10.9993 19.2503C15.5558 19.2503 19.2494 15.5568 19.2494 11.0003C19.2494 6.44384 15.5558 2.75033 10.9993 2.75033ZM10.0735 7.33366C10.0735 6.8274 10.4839 6.41699 10.9902 6.41699H10.9993C11.5056 6.41699 11.916 6.8274 11.916 7.33366C11.916 7.83992 11.5056 8.25033 10.9993 8.25033H10.9902C10.4839 8.25033 10.0735 7.83992 10.0735 7.33366ZM10.9993 10.0837C11.5056 10.0837 11.916 10.4941 11.916 11.0003V14.667C11.916 15.1733 11.5056 15.5837 10.9993 15.5837C10.4931 15.5837 10.0827 15.1733 10.0827 14.667V11.0003C10.0827 10.4941 10.4931 10.0837 10.9993 10.0837Z" fill="black" />
                        </g>
                        <defs>
                          <clipPath id="clip0_785_24837">
                            <rect width="22" height="22" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Заполните страхователя сначала</div>
                </div>
              ) : (
                <>
                  {renderInputField('iin', 'ИИН', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('telephone', 'Номер телефона', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('surname', 'Фамилия', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('name', 'Имя', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('patronymic', 'Отчество', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderCalendarField('birthDate', 'Дата рождения', policyholderData.birthDate)}
                  {renderDictionaryButton('gender', 'Пол', getDictionaryDisplayValue(policyholderData.gender), handleParentOpenGender, !!policyholderData.gender)}
                  {renderDictionaryButton('economSecId', 'Код сектора экономики', getDictionaryDisplayValue(policyholderData.economSecId), handleParentOpenSectorCode, !!policyholderData.economSecId)}
                  {renderDictionaryButton('countryId', 'Страна', getDictionaryDisplayValue(policyholderData.countryId), handleParentOpenCountry, !!policyholderData.countryId)}
                  {renderDictionaryButton('district_nameru', 'Область', getDictionaryDisplayValue(policyholderData.district_nameru), handleParentOpenRegion, !!policyholderData.district_nameru)}
                  {renderInputField('settlementName', 'Название населенного пункта', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('street', 'Улица', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('houseNumber', '№ дома', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderInputField('apartmentNumber', '№ квартиры', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderDictionaryButton('vidDocId', 'Тип документа', getDictionaryDisplayValue(policyholderData.vidDocId), handleParentOpenDocType, !!policyholderData.vidDocId)}
                  {renderInputField('docNumber', 'Номер документа', policyholderData, activeParentField, handleParentFieldChange, handleParentFieldClick, handleParentFieldBlur)}
                  {renderDictionaryButton('issuedBy', 'Кем выдано', getDictionaryDisplayValue(policyholderData.issuedBy), handleParentOpenIssuedBy, !!policyholderData.issuedBy)}
                  {renderCalendarField('issueDate', 'Выдан от', policyholderData.issueDate)}
                  {renderCalendarField('expiryDate', 'Действует до', policyholderData.expiryDate)}
                  {renderToggleButton('Признак ПДЛ', toggleStates.pdl, handleTogglePDL)}
                </>
              )}
            </>
          )}

          {/* Секция данных ребенка */}
          <div data-layer="MessageContainer" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
            <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Данные ребенка</div>
          </div>
          <div data-layer="InputContainerDictionaryButton" data-state="not_pressed" className="Inputcontainerdictionarybutton" onClick={handleSelectChild} style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
            <div data-layer="Text container" className="TextContainer" style={{ flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
              <div data-layer="Label" className="Label" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Выбрать ребенка</div>
            </div>
            <div data-layer="Open button" className="OpenButton" style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden' }}>
              <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{ left: 31, top: 32, position: 'absolute' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
          {renderToggleButton('Ручной ввод данных', manualChildInput, handleToggleManualChildInput)}
        </div>
      </div>
    </div>
  );
};

export default OwnChild;
