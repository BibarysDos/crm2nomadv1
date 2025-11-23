import React, { useState, useEffect } from 'react';
import Gender from '../../dictionary/Gender';
import SectorCode from '../../dictionary/SectorCode';
import Country from '../../dictionary/Country';
import Region from '../../dictionary/Region';
import DocType from '../../dictionary/DocType';
import IssuedBy from '../../dictionary/IssuedBy';
import { getPerson, mapApiDataToForm } from '../../../services/personService';
import { renderInputField, renderDictionaryButton, renderCalendarField, renderAttachField, renderToggleButton } from './InsuredFormFields';

const OtherPerson = ({ onBack, onSave, applicationId, savedData, onOpenTypes }) => {
  // Основной currentView
  // eslint-disable-next-line no-unused-vars
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
    if (savedData && savedData.fullData) {
      const restored = savedData.fullData;
      
      // Восстанавливаем данные
      if (restored.insuredData) {
        setInsuredData(restored.insuredData);
      }
      
      // Восстанавливаем состояния тогглов
      if (restored.manualInput !== undefined) {
        setManualInput(restored.manualInput);
      }
      if (restored.toggleStates) {
        setToggleStates(restored.toggleStates);
      }
      // Устанавливаем autoModeState: если сохранен - используем его, иначе если есть данные - data_loaded
      if (restored.autoModeState) {
        setAutoModeState(restored.autoModeState);
      } else if (restored.insuredData && restored.insuredData.iin && restored.insuredData.telephone) {
        // Если данных нет в сохраненном autoModeState, но есть данные, устанавливаем data_loaded
        setAutoModeState('data_loaded');
      }
      
      // Восстанавливаем view
      if (restored.currentView) {
        setCurrentView(restored.currentView);
      }
    }
  }, [savedData]);

  // Обработчики для формы
  const handleFieldClick = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleFieldChange = (fieldName, value) => {
    setInsuredData(prev => ({
      ...prev,
      [fieldName]: value
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
      return value.name_ru || value.name || value.title || '';
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
      // Очищаем данные при включении ручного ввода
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
    // Проверяем наличие ИИН и телефона
    if (!insuredData.iin || !insuredData.telephone) {
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
      const phone = insuredData.telephone.replace(/\D/g, '');
      const iin = insuredData.iin.replace(/\D/g, '');
      
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

  const handleUpdate = () => {
    if (!apiResponseData) {
      setErrorMessage('Нет данных для обновления');
      return;
    }
    
    // Очищаем предыдущую ошибку
    setErrorMessage(null);

    // Маппинг данных из API ответа в формат формы
    const mappedData = mapApiDataToForm(apiResponseData);
    
    // Сохраняем ИИН и телефон, которые были введены пользователем
    const currentIin = insuredData.iin;
    const currentTelephone = insuredData.telephone;
    
    // Обновляем поля формы, используя данные из API
    // Для остальных полей используем значения из API (даже если они пустые), чтобы перезаписать старые данные
    setInsuredData(prev => ({
      ...prev,
      // ИИН и телефон сохраняем, если они уже были введены
      iin: currentIin || mappedData.iin || prev.iin || '',
      telephone: currentTelephone || mappedData.telephone || prev.telephone || '',
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
  };

  // Определение текста кнопки в заголовке
  const getHeaderButtonText = () => {
    // Если ручной ввод включен - кнопка всегда "Сохранить"
    if (manualInput) {
      return 'Сохранить';
    }
    
    // Если идет загрузка, показываем "Загрузка..."
    if (isLoading) {
      return 'Загрузка...';
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

  const handleFinalSave = () => {
    if (onSave) {
      // Сохраняем все данные для восстановления
      const dataToSave = {
        insuredType: 'other-person', // Указываем тип застрахованного
        insuredData,
        toggleStates,
        manualInput,
        autoModeState,
        currentView: 'main'
      };
      
      // Преобразуем insuredData для отображения в Application.js
      const displayData = {
        lastName: insuredData.surname || '',
        firstName: insuredData.name || '',
        middleName: insuredData.patronymic || '',
        iin: insuredData.iin || '',
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

  // Рендеринг справочников
  if (dictionaryView === 'gender') {
    return <Gender onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleDictionaryValueSelect('gender', value)} />;
  }
  if (dictionaryView === 'sectorCode') {
    return <SectorCode onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleDictionaryValueSelect('economSecId', value)} initialValue={insuredData.economSecId} />;
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

  // Рендеринг меню
  const renderMenu = () => (
    <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div data-layer="Back button" className="BackButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
        <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  );

  const renderSubHeader = (title) => (
    <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{title}</div>
        <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
          <div data-layer="Send request button" data-state="pressed" className="SendRequestButton" onClick={isLoading ? undefined : handleHeaderButtonClick} style={{width: 390, height: 85, background: isLoading ? '#666' : 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1}}>
            <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{getHeaderButtonText()}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Основной вид
  return (
    <div data-layer="Insured data page" className="InsuredDataPage" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="Insured data" className="InsuredData" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        {renderSubHeader('Застрахованный')}
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
                  : 'Нажмите на обновить, чтобы получить данные'}
            </div>
          </div>
        ) : null}
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          {renderToggleButton('Ручной ввод данных', manualInput, handleToggleManualInput)}
          {!manualInput && (autoModeState === 'initial' || autoModeState === 'request_sent') && (
            <>
              {renderInputField('iin', 'ИИН', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderInputField('telephone', 'Номер телефона', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
            </>
          )}
          {(manualInput || autoModeState === 'data_loaded' || autoModeState === 'response_received') && (
            <>
              {renderDictionaryButton('residency', 'Признак резидентства', getDictionaryDisplayValue(insuredData.residency), () => {}, !!insuredData.residency)}
              {renderInputField('iin', 'ИИН', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderInputField('telephone', 'Номер телефона', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderInputField('surname', 'Фамилия', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderInputField('name', 'Имя', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderInputField('patronymic', 'Отчество', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderCalendarField('birthDate', 'Дата рождения', insuredData.birthDate)}
              {renderDictionaryButton('gender', 'Пол', getDictionaryDisplayValue(insuredData.gender), handleOpenGender, !!insuredData.gender)}
              {renderDictionaryButton('economSecId', 'Код сектора экономики', getDictionaryDisplayValue(insuredData.economSecId), handleOpenSectorCode, !!insuredData.economSecId)}
              {renderDictionaryButton('countryId', 'Страна', getDictionaryDisplayValue(insuredData.countryId), handleOpenCountry, !!insuredData.countryId)}
              {renderDictionaryButton('district_nameru', 'Область', getDictionaryDisplayValue(insuredData.district_nameru), handleOpenRegion, !!insuredData.district_nameru)}
              {renderInputField('settlementName', 'Название населенного пункта', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderInputField('street', 'Улица', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderInputField('houseNumber', '№ дома', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderInputField('apartmentNumber', '№ квартиры', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderAttachField('documentFile', 'Документ подтверждающий личность', insuredData.documentFile)}
              {renderDictionaryButton('vidDocId', 'Тип документа', getDictionaryDisplayValue(insuredData.vidDocId), handleOpenDocType, !!insuredData.vidDocId)}
              {renderInputField('docNumber', 'Номер документа', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
              {renderDictionaryButton('issuedBy', 'Кем выдано', getDictionaryDisplayValue(insuredData.issuedBy), handleOpenIssuedBy, !!insuredData.issuedBy)}
              {renderCalendarField('issueDate', 'Выдан от', insuredData.issueDate)}
              {renderCalendarField('expiryDate', 'Действует до', insuredData.expiryDate)}
              {renderToggleButton('Признак ПДЛ', toggleStates.pdl, handleTogglePDL)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherPerson;
