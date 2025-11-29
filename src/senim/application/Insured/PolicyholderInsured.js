import React, { useState, useEffect } from 'react';
import Gender from '../../dictionary/Gender';
import SectorCode from '../../dictionary/SectorCode';
import Country from '../../dictionary/Country';
import Region from '../../dictionary/Region';
import DocType from '../../dictionary/DocType';
import IssuedBy from '../../dictionary/IssuedBy';
import { renderInputField, renderDictionaryButton, renderCalendarField, renderToggleButton } from './InsuredFormFields';
import { mapInsuredToContragent } from '../../services/contragentService';
import { updateContragent } from '../../../services/processService';
import { getAccessToken } from '../../../services/storageService';

const PolicyholderInsured = ({ onBack, policyholderData, onSave, applicationId, taskId, savedData, onOpenTypes }) => {
  // Основной currentView для переключения между этапами
  // eslint-disable-next-line no-unused-vars
  const [currentView, setCurrentView] = useState('main');
  // Для справочников внутри 'main' view
  const [dictionaryView, setDictionaryView] = useState('main');
  const [previousDictionaryView, setPreviousDictionaryView] = useState('main');

  // Toggle состояния
  const [toggleStates, setToggleStates] = useState({
    pdl: false
  });

  // Активное поле
  const [activeField, setActiveField] = useState(null);

  // Логирование policyholderData для отладки убрано по требованию

  // Восстановление сохраненных данных при монтировании
  useEffect(() => {
    if (savedData && savedData.fullData) {
      const restored = savedData.fullData;

      // Восстанавливаем состояния тогглов
      if (restored.toggleStates) {
        setToggleStates(restored.toggleStates);
      }

      // Восстанавливаем view
      if (restored.currentView) {
        setCurrentView(restored.currentView);
      }
    }
  }, [savedData]);

  // Отслеживаем изменения policyholderData и обновляем поля при необходимости
  useEffect(() => {
    // Когда policyholderData загружается или обновляется, 
    // поля автоматически отображают его значения через renderInputField
    // Этот эффект нужен для логирования или дополнительной обработки
    if (policyholderData) {
      // Данные автоматически подтягиваются через props в renderInputField
    }
  }, [policyholderData]);

  // Обработчики для формы
  const handleFieldChange = (fieldName, value) => {
    // Для "Страхователь является застрахованным" данные берутся из policyholderData
    // Здесь можно добавить локальное состояние если нужно редактирование
  };

  const handleFieldClick = (fieldName) => {
    setActiveField(fieldName);
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
      // Проверяем различные варианты названий полей (nameRu - camelCase, name_ru - snake_case)
      const displayValue = value.nameRu || value.name_ru || value.name || value.title || value.label || '';
      return displayValue;
    }
    // Если это строка, возвращаем как есть
    return String(value);
  };

  // Обработчики справочников
  const handleDictionaryValueSelect = (fieldName, value) => {
    // Для "Страхователь является застрахованным" данные берутся из policyholderData
    // Здесь можно добавить локальное состояние если нужно редактирование
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

  const handleFinalSave = async () => {
    // Сохраняем в API через Contragent PUT
    if (applicationId) {
      try {
        const token = getAccessToken();
        if (token) {
          const accessIdForAPI = applicationId;

          try {
            // Преобразуем данные страхователя в формат застрахованного с типом "страхователь является застрахованным"
            const contragentData = mapInsuredToContragent(policyholderData, 'policyholder');
            await updateContragent(contragentData, String(accessIdForAPI).trim(), token);
          } catch (error) {
          }
        }
      } catch (error) {
      }
    }

    if (onSave) {
      // Сохраняем все данные для восстановления
      const dataToSave = {
        insuredType: 'policyholder', // Указываем тип застрахованного
        toggleStates,
        currentView: 'main'
      };

      // Преобразуем policyholderData для отображения в Application.js
      const displayData = {
        lastName: policyholderData?.surname || '',
        firstName: policyholderData?.name || '',
        middleName: policyholderData?.patronymic || '',
        iin: policyholderData?.iin || '',
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
    return <SectorCode onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleDictionaryValueSelect('sectorCode', value)} initialValue={policyholderData.economSecId} />;
  }
  if (dictionaryView === 'country') {
    return <Country onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleDictionaryValueSelect('country', value)} />;
  }
  if (dictionaryView === 'region') {
    return <Region onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleDictionaryValueSelect('district_nameru', value)} />;
  }
  if (dictionaryView === 'docType') {
    return <DocType onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleDictionaryValueSelect('docType', value)} />;
  }
  if (dictionaryView === 'issuedBy') {
    return <IssuedBy onBack={() => setDictionaryView(previousDictionaryView)} onSelect={(value) => handleDictionaryValueSelect('issuedBy', value)} />;
  }

  // Рендеринг меню
  const renderMenu = () => (
    <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{ width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
      <div data-layer="Back button" className="BackButton" onClick={onBack} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer' }}>
        <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{ left: 32, top: 32, position: 'absolute' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );

  const renderSubHeader = (title) => (
    <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{ alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
      <div data-layer="Title" className="Title" style={{ flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{title}</div>
        <div data-layer="Button container" className="ButtonContainer" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
          <div data-layer="Send request button" data-state="pressed" className="SendRequestButton" onClick={handleFinalSave} style={{ width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer' }}>
            <div data-layer="Button Text" className="ButtonText" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Сохранить</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Основной вид
  return (
    <div data-layer="Insured data page" className="InsuredDataPage" style={{ width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
      {renderMenu()}
      <div data-layer="Insured data" className="InsuredData" style={{ width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        {renderSubHeader('Застрахованный - Страхователь')}
        <div data-layer="Filds list" className="FildsList" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
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
              {renderInputField('iin', 'ИИН', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.iin)}
              {renderInputField('telephone', 'Номер телефона', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.telephone)}
              {renderInputField('surname', 'Фамилия', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.surname)}
              {renderInputField('name', 'Имя', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.name)}
              {renderInputField('patronymic', 'Отчество', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.patronymic)}
              {renderCalendarField('birthDate', 'Дата рождения', policyholderData.birthDate)}
              {renderDictionaryButton('gender', 'Пол', getDictionaryDisplayValue(policyholderData.gender), handleOpenGender, !!policyholderData.gender)}
              {renderDictionaryButton('economSecId', 'Код сектора экономики', getDictionaryDisplayValue(policyholderData.economSecId), handleOpenSectorCode, !!policyholderData.economSecId)}
              {renderDictionaryButton('countryId', 'Страна', getDictionaryDisplayValue(policyholderData.countryId), handleOpenCountry, !!policyholderData.countryId)}
              {renderDictionaryButton('district_nameru', 'Область', policyholderData.district_nameru || '', handleOpenRegion, !!policyholderData.district_nameru)}
              {renderInputField('settlementName', 'Название населенного пункта', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.settlementName)}
              {renderInputField('street', 'Улица', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.street)}
              {renderInputField('houseNumber', '№ дома', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.houseNumber)}
              {renderInputField('apartmentNumber', '№ квартиры', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.apartmentNumber)}
              {renderDictionaryButton('vidDocId', 'Тип документа', getDictionaryDisplayValue(policyholderData.vidDocId), handleOpenDocType, !!policyholderData.vidDocId)}
              {renderInputField('docNumber', 'Номер документа', policyholderData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur, false, !!policyholderData.docNumber)}
              {renderDictionaryButton('issuedBy', 'Кем выдано', getDictionaryDisplayValue(policyholderData.issuedBy), handleOpenIssuedBy, !!policyholderData.issuedBy)}
              {renderCalendarField('issueDate', 'Выдан от', policyholderData.issueDate)}
              {renderCalendarField('expiryDate', 'Действует до', policyholderData.expiryDate)}
              {renderToggleButton('Признак ПДЛ', toggleStates.pdl, handleTogglePDL)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyholderInsured;
