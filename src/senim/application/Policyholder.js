import React, { useState } from 'react';
import { usePolicyholderForm } from '../hooks/usePolicyholderForm';
import { InputField } from '../components/ui/InputField';
import { DictionarySelect } from '../components/ui/DictionarySelect';
import { CalendarField } from '../components/ui/CalendarField';
import { ToggleButton } from '../components/ui/ToggleButton';

// Импорт компонентов словарей (предполагается, что они существуют)
import Gender from '../dictionary/Gender';
import SectorCode from '../dictionary/SectorCode';
import Country from '../dictionary/Country';
import Region from '../dictionary/Region';
import DocType from '../dictionary/DocType';
import IssuedBy from '../dictionary/IssuedBy';

const Policyholder = ({ onBack, onSave, applicationId, taskId, processDetails }) => {
  const [currentView, setCurrentView] = useState('main');

  const {
    policyholderData,
    activeField,
    toggleStates,
    autoModeState,
    waitingSmsResponse,
    errorMessage,
    isLoading,
    isLoadingContragent,
    handleFieldChange,
    handleFieldBlur,
    handleFieldActivate,
    handleDictionarySelect,
    handleToggle,
    handleSendRequest,
    handleUpdate,
    handleSave
  } = usePolicyholderForm(applicationId, taskId, onSave, processDetails);

  const handleBackToMain = () => setCurrentView('main');

  // Рендеринг словарей
  if (currentView === 'gender') {
    return <Gender onBack={handleBackToMain} onSelect={(value) => { handleDictionarySelect('gender', value); handleBackToMain(); }} />;
  }
  if (currentView === 'sectorCode') {
    return <SectorCode onBack={handleBackToMain} onSelect={(value) => { handleDictionarySelect('sectorCode', value); handleBackToMain(); }} initialValue={policyholderData.economSecId} />;
  }
  if (currentView === 'country') {
    return <Country onBack={handleBackToMain} onSave={(value) => { handleDictionarySelect('country', value); handleBackToMain(); }} initialValue={policyholderData.countryId} />;
  }
  if (currentView === 'region') {
    return <Region onBack={handleBackToMain} onSave={(value) => { handleDictionarySelect('region', value); handleBackToMain(); }} />;
  }
  if (currentView === 'docType') {
    return <DocType onBack={handleBackToMain} onSave={(value) => { handleDictionarySelect('docType', value); handleBackToMain(); }} />;
  }
  if (currentView === 'issuedBy') {
    return <IssuedBy onBack={handleBackToMain} onSelect={(value) => { handleDictionarySelect('issuedBy', value); handleBackToMain(); }} />;
  }

  // Индикатор загрузки
  if (isLoadingContragent) {
    return (
      <div data-layer="Policyholder data page" className="PolicyholderDataPage" style={{ width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>
          Загрузка данных страхователя...
        </div>
      </div>
    );
  }

  const getHeaderButtonText = () => {
    if (toggleStates.manualInput) return 'Сохранить';
    if (autoModeState === 'initial') return 'Получить данные';
    if (autoModeState === 'request_sent' || autoModeState === 'response_received') return 'Обновить';
    if (autoModeState === 'data_loaded') return 'Сохранить';
    return 'Сохранить';
  };

  const handleHeaderButtonClick = async () => {
    if (toggleStates.manualInput) {
      await handleSave();
      // После сохранения возвращаемся на экран заявки
      if (onBack) onBack();
    } else {
      if (autoModeState === 'initial' || autoModeState === 'request_sent') {
        // При initial или request_sent (result === 1) снова вызываем запрос
        await handleSendRequest();
      } else if (autoModeState === 'response_received') {
        await handleUpdate();
      } else if (autoModeState === 'data_loaded') {
        await handleSave();
        if (onBack) onBack();
      }
    }
  };

  const getDictionaryValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') return value.nameRu || value.nameKz || value.code || '';
    return value;
  };

  return (
    <div data-layer="Policyholder data page" className="PolicyholderDataPage" style={{ width: 1512, minHeight: '100vh', background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex' }}>
      <div data-layer="Menu" className="Menu" style={{ width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div data-layer="Back button" className="BackButton" onClick={onBack} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer' }}>
          <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{ left: 32, top: 32, position: 'absolute' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
      <div data-layer="Policyholder data" className="PolicyholderData" style={{ width: 1427, alignSelf: 'stretch', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div data-layer="SubHeader" className="Subheader" style={{ alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
          <div data-layer="Title" className="Title" style={{ flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>Страхователь</div>
            <div data-layer="Button container" className="ButtonContainer" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
              <div data-layer="Save button" className="SaveButton" onClick={isLoading ? undefined : handleHeaderButtonClick} style={{ width: 390, height: 85, background: isLoading ? '#666' : 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                <div data-layer="Button Text" className="ButtonText" style={{ flex: '1 1 0', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>{getHeaderButtonText()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert */}
        {(!toggleStates.manualInput && (autoModeState === 'request_sent' || autoModeState === 'response_received' || waitingSmsResponse)) || errorMessage ? (
          <div data-layer="Alert" className="Alert" style={{ alignSelf: 'stretch', height: 85, paddingRight: 20, background: errorMessage ? '#fff5f5' : 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
            <div data-layer="Info container" className="InfoContainer" style={{ width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden' }}>
              {errorMessage ? (
                <div data-svg-wrapper data-layer="Error" className="Error" style={{ left: 31, top: 32, position: 'absolute' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="10" stroke="#d32f2f" strokeWidth="2" />
                    <path d="M11 7V11M11 15H11.01" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              ) : (
                <div data-svg-wrapper data-layer="Info" className="Info" style={{ left: 31, top: 32, position: 'absolute' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_491_9703)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0.916748 10.9998C0.916748 5.43083 5.43107 0.916504 11.0001 0.916504C16.5691 0.916504 21.0834 5.43083 21.0834 10.9998C21.0834 16.5688 16.5691 21.0832 11.0001 21.0832C5.43107 21.0832 0.916748 16.5688 0.916748 10.9998ZM11.0001 2.74984C6.44359 2.74984 2.75008 6.44335 2.75008 10.9998C2.75008 15.5563 6.44359 19.2498 11.0001 19.2498C15.5566 19.2498 19.2501 15.5563 19.2501 10.9998C19.2501 6.44335 15.5566 2.74984 11.0001 2.74984ZM10.0742 7.33317C10.0742 6.82691 10.4847 6.4165 10.9909 6.4165H11.0001C11.5063 6.4165 11.9167 6.82691 11.9167 7.33317C11.9167 7.83943 11.5063 8.24984 11.0001 8.24984H10.9909C10.4847 8.24984 10.0742 7.83943 10.0742 7.33317ZM11.0001 10.0832C11.5063 10.0832 11.9167 10.4936 11.9167 10.9998V14.6665C11.9167 15.1728 11.5063 15.5832 11.0001 15.5832C10.4938 15.5832 10.0834 15.1728 10.0834 14.6665V10.9998C10.0834 10.4936 10.4938 10.0832 11.0001 10.0832Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_491_9703">
                        <rect width="22" height="22" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
                    <div className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: errorMessage ? '#d32f2f' : 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>
                      {errorMessage || (waitingSmsResponse || autoModeState === 'request_sent' ? 'На номер телефона будет отправлено СМС для получения согласия, клиенту необходимо ответить 511' : 'Нажмите на обновить, чтобы получить данные клиента')}
                    </div>
          </div>
        ) : null}

        <div data-layer="Filds list" className="FildsList" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
          <ToggleButton
            label="Ручной ввод данных"
            isPressed={toggleStates.manualInput}
            onClick={() => handleToggle('manualInput')}
          />

          {toggleStates.manualInput ? (
            <>
              <InputField label="ИИН" value={policyholderData.iin} onChange={(e) => handleFieldChange('iin', e.target.value)} onBlur={() => handleFieldBlur('iin')} isActive={activeField === 'iin'} onActivate={() => handleFieldActivate('iin')} />
              <InputField label="Номер телефона" value={policyholderData.telephone} onChange={(e) => handleFieldChange('phone', e.target.value)} onBlur={() => handleFieldBlur('phone')} isActive={activeField === 'phone'} onActivate={() => handleFieldActivate('phone')} />
              <InputField label="Фамилия" value={policyholderData.surname} onChange={(e) => handleFieldChange('lastName', e.target.value)} onBlur={() => handleFieldBlur('lastName')} isActive={activeField === 'lastName'} onActivate={() => handleFieldActivate('lastName')} />
              <InputField label="Имя" value={policyholderData.name} onChange={(e) => handleFieldChange('firstName', e.target.value)} onBlur={() => handleFieldBlur('firstName')} isActive={activeField === 'firstName'} onActivate={() => handleFieldActivate('firstName')} />
              <InputField label="Отчество" value={policyholderData.patronymic} onChange={(e) => handleFieldChange('middleName', e.target.value)} onBlur={() => handleFieldBlur('middleName')} isActive={activeField === 'middleName'} onActivate={() => handleFieldActivate('middleName')} />
              <CalendarField label="Дата рождения" value={policyholderData.birthDate} onChange={(e) => handleFieldChange('birthDate', e.target.value)} onBlur={() => handleFieldBlur('birthDate')} isActive={activeField === 'birthDate'} onActivate={() => handleFieldActivate('birthDate')} />

              <DictionarySelect label="Пол" value={getDictionaryValue(policyholderData.gender)} onClick={() => setCurrentView('gender')} />
              <DictionarySelect label="Код сектора экономики" value={getDictionaryValue(policyholderData.economSecId)} onClick={() => setCurrentView('sectorCode')} />
              <DictionarySelect label="Страна" value={getDictionaryValue(policyholderData.countryId)} onClick={() => setCurrentView('country')} />
              <DictionarySelect label="Область" value={policyholderData.district_nameru} onClick={() => setCurrentView('region')} />

              <InputField label="Название населенного пункта" value={policyholderData.settlementName} onChange={(e) => handleFieldChange('settlementName', e.target.value)} onBlur={() => handleFieldBlur('settlementName')} isActive={activeField === 'settlementName'} onActivate={() => handleFieldActivate('settlementName')} />
              <InputField label="Улица" value={policyholderData.street} onChange={(e) => handleFieldChange('street', e.target.value)} onBlur={() => handleFieldBlur('street')} isActive={activeField === 'street'} onActivate={() => handleFieldActivate('street')} />
              <InputField label="№ дома" value={policyholderData.houseNumber} onChange={(e) => handleFieldChange('houseNumber', e.target.value)} onBlur={() => handleFieldBlur('houseNumber')} isActive={activeField === 'houseNumber'} onActivate={() => handleFieldActivate('houseNumber')} />
              <InputField label="№ квартиры" value={policyholderData.apartmentNumber} onChange={(e) => handleFieldChange('apartmentNumber', e.target.value)} onBlur={() => handleFieldBlur('apartmentNumber')} isActive={activeField === 'apartmentNumber'} onActivate={() => handleFieldActivate('apartmentNumber')} />

              <DictionarySelect label="Тип документа" value={getDictionaryValue(policyholderData.vidDocId)} onClick={() => setCurrentView('docType')} />
              <InputField label="Номер документа" value={policyholderData.docNumber} onChange={(e) => handleFieldChange('documentNumber', e.target.value)} onBlur={() => handleFieldBlur('documentNumber')} isActive={activeField === 'documentNumber'} onActivate={() => handleFieldActivate('documentNumber')} />
              <DictionarySelect label="Кем выдано" value={getDictionaryValue(policyholderData.issuedBy)} onClick={() => setCurrentView('issuedBy')} />

              <CalendarField label="Выдан от" value={policyholderData.issueDate} onChange={(e) => handleFieldChange('issueDate', e.target.value)} onBlur={() => handleFieldBlur('issueDate')} isActive={activeField === 'issueDate'} onActivate={() => handleFieldActivate('issueDate')} />
              <CalendarField label="Действует до" value={policyholderData.expiryDate} onChange={(e) => handleFieldChange('expiryDate', e.target.value)} onBlur={() => handleFieldBlur('expiryDate')} isActive={activeField === 'expiryDate'} onActivate={() => handleFieldActivate('expiryDate')} />

              <ToggleButton label="Признак ПДЛ" isPressed={toggleStates.pdl} onClick={() => handleToggle('pdl')} />
            </>
          ) : (
            <>
              <InputField label="ИИН" value={policyholderData.iin} onChange={(e) => handleFieldChange('iin', e.target.value)} onBlur={() => handleFieldBlur('iin')} isActive={activeField === 'iin'} onActivate={() => handleFieldActivate('iin')} />
              <InputField label="Номер телефона" value={policyholderData.telephone} onChange={(e) => handleFieldChange('phone', e.target.value)} onBlur={() => handleFieldBlur('phone')} isActive={activeField === 'phone'} onActivate={() => handleFieldActivate('phone')} />

              {autoModeState === 'data_loaded' && (
                <>
                  <InputField label="Фамилия" value={policyholderData.surname} onChange={(e) => handleFieldChange('lastName', e.target.value)} onBlur={() => handleFieldBlur('lastName')} isActive={activeField === 'lastName'} onActivate={() => handleFieldActivate('lastName')} />
                  <InputField label="Имя" value={policyholderData.name} onChange={(e) => handleFieldChange('firstName', e.target.value)} onBlur={() => handleFieldBlur('firstName')} isActive={activeField === 'firstName'} onActivate={() => handleFieldActivate('firstName')} />
                  <InputField label="Отчество" value={policyholderData.patronymic} onChange={(e) => handleFieldChange('middleName', e.target.value)} onBlur={() => handleFieldBlur('middleName')} isActive={activeField === 'middleName'} onActivate={() => handleFieldActivate('middleName')} />
                  <CalendarField label="Дата рождения" value={policyholderData.birthDate} onChange={(e) => handleFieldChange('birthDate', e.target.value)} onBlur={() => handleFieldBlur('birthDate')} isActive={activeField === 'birthDate'} onActivate={() => handleFieldActivate('birthDate')} />

                  <DictionarySelect label="Пол" value={getDictionaryValue(policyholderData.gender)} onClick={() => setCurrentView('gender')} />
                  <DictionarySelect label="Код сектора экономики" value={getDictionaryValue(policyholderData.economSecId)} onClick={() => setCurrentView('sectorCode')} />
                  <DictionarySelect label="Страна" value={getDictionaryValue(policyholderData.countryId)} onClick={() => setCurrentView('country')} />
                  <DictionarySelect label="Область" value={policyholderData.district_nameru} onClick={() => setCurrentView('region')} />

                  <InputField label="Название населенного пункта" value={policyholderData.settlementName} onChange={(e) => handleFieldChange('settlementName', e.target.value)} onBlur={() => handleFieldBlur('settlementName')} isActive={activeField === 'settlementName'} onActivate={() => handleFieldActivate('settlementName')} />
                  <InputField label="Улица" value={policyholderData.street} onChange={(e) => handleFieldChange('street', e.target.value)} onBlur={() => handleFieldBlur('street')} isActive={activeField === 'street'} onActivate={() => handleFieldActivate('street')} />
                  <InputField label="№ дома" value={policyholderData.houseNumber} onChange={(e) => handleFieldChange('houseNumber', e.target.value)} onBlur={() => handleFieldBlur('houseNumber')} isActive={activeField === 'houseNumber'} onActivate={() => handleFieldActivate('houseNumber')} />
                  <InputField label="№ квартиры" value={policyholderData.apartmentNumber} onChange={(e) => handleFieldChange('apartmentNumber', e.target.value)} onBlur={() => handleFieldBlur('apartmentNumber')} isActive={activeField === 'apartmentNumber'} onActivate={() => handleFieldActivate('apartmentNumber')} />

                  <DictionarySelect label="Тип документа" value={getDictionaryValue(policyholderData.vidDocId)} onClick={() => setCurrentView('docType')} />
                  <InputField label="Номер документа" value={policyholderData.docNumber} onChange={(e) => handleFieldChange('documentNumber', e.target.value)} onBlur={() => handleFieldBlur('documentNumber')} isActive={activeField === 'documentNumber'} onActivate={() => handleFieldActivate('documentNumber')} />
                  <DictionarySelect label="Кем выдано" value={getDictionaryValue(policyholderData.issuedBy)} onClick={() => setCurrentView('issuedBy')} />

                  <CalendarField label="Выдан от" value={policyholderData.issueDate} onChange={(e) => handleFieldChange('issueDate', e.target.value)} onBlur={() => handleFieldBlur('issueDate')} isActive={activeField === 'issueDate'} onActivate={() => handleFieldActivate('issueDate')} />
                  <CalendarField label="Действует до" value={policyholderData.expiryDate} onChange={(e) => handleFieldChange('expiryDate', e.target.value)} onBlur={() => handleFieldBlur('expiryDate')} isActive={activeField === 'expiryDate'} onActivate={() => handleFieldActivate('expiryDate')} />

                  <ToggleButton label="Признак ПДЛ" isPressed={toggleStates.pdl} onClick={() => handleToggle('pdl')} />
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