import React from 'react';
import { InputField } from '../../components/ui/InputField';
import { DictionarySelect } from '../../components/ui/DictionarySelect';
import { CalendarField } from '../../components/ui/CalendarField';
import { ToggleButton } from '../../components/ui/ToggleButton';
import { FileField } from '../../components/ui/FileField';
import Gender from '../../dictionary/Gender';
import SectorCode from '../../dictionary/SectorCode';
import Country from '../../dictionary/Country';
import Region from '../../dictionary/Region';
import DocType from '../../dictionary/DocType';
import IssuedBy from '../../dictionary/IssuedBy';
import ClientType from '../../dictionary/ClientType';
import { useOtherChild } from '../../hooks/useOtherChild';
import OtherChildChildrenSelect from './OtherChild/OtherChildChildrenSelect';

const OtherChild = ({ onBack, onSave, applicationId, taskId, policyholderData, savedData }) => {
  const {
    currentView,
    setCurrentView,
    dictionaryView,
    previousDictionaryView,
    setDictionaryView,
    manualInput,
    autoModeState,
    waitingSmsResponse,
    parentSectionCollapsed,
    setParentSectionCollapsed,
    isLoading,
    errorMessage,
    manualChildInput,
    addressMatchesParent,
    parentData,
    selectedChild,
    children,
    loading,
    error,
    childData,
    activeParentField,
    activeChildField,
    childSectionCollapsed,
    setChildSectionCollapsed,
    handleDictionaryValueSelect,
    handleParentFieldChange,
    handleParentFieldBlur,
    handleParentFieldActivate,
    handleParentOpenGender,
    handleParentOpenSectorCode,
    handleParentOpenCountry,
    handleParentOpenRegion,
    handleParentOpenDocType,
    handleParentOpenIssuedBy,
    handleToggleManualInput,
    handleToggleManualChildInput,
    handleSelectChild,
    handleChildSelect,
    handleChildSave,
    handleOpenGender,
    handleOpenSectorCode,
    handleOpenCountry,
    handleOpenRegion,
    handleOpenDocType,
    handleOpenIssuedBy,
    handleOpenClientType,
    handleChildFieldChange,
    handleChildFieldBlur,
    getDictionaryValue,
    getHeaderButtonText,
    handleHeaderButtonClick,
    handleChildFieldActivate,
    handleFinalSave,
    handleToggleAddressMatchesParent
  } = useOtherChild({ applicationId, taskId, savedData, onSave, onBack });

  // Рендеринг справочников ребенка (внутри filled view)
  if (currentView === 'filled' && dictionaryView !== 'main') {
    if (dictionaryView === 'gender') {
      return (
        <Gender
          onBack={() => setDictionaryView(previousDictionaryView)}
          onSelect={(value) => handleDictionaryValueSelect('gender', value)}
        />
      );
    }
    if (dictionaryView === 'sectorCode') {
      return (
        <SectorCode
          onBack={() => setDictionaryView(previousDictionaryView)}
          onSelect={(value) => handleDictionaryValueSelect('economSecId', value)}
          initialValue={childData.economSecId}
        />
      );
    }
    if (dictionaryView === 'country') {
      return (
        <Country
          onBack={() => setDictionaryView(previousDictionaryView)}
          onSave={(value) => handleDictionaryValueSelect('countryId', value)}
        />
      );
    }
    if (dictionaryView === 'region') {
      return (
        <Region
          onBack={() => setDictionaryView(previousDictionaryView)}
          onSave={(value) => handleDictionaryValueSelect('district_nameru', value)}
        />
      );
    }
    if (dictionaryView === 'docType') {
      return (
        <DocType
          onBack={() => setDictionaryView(previousDictionaryView)}
          onSave={(value) => handleDictionaryValueSelect('vidDocId', value)}
        />
      );
    }
    if (dictionaryView === 'issuedBy') {
      return (
        <IssuedBy
          onBack={() => setDictionaryView(previousDictionaryView)}
          onSelect={(value) => handleDictionaryValueSelect('issuedBy', value)}
        />
      );
    }
    if (dictionaryView === 'clientType') {
      return (
        <ClientType
          onBack={() => setDictionaryView(previousDictionaryView)}
          onSave={(value) => handleDictionaryValueSelect('clientType', value)}
          initialValue={childData.clientType}
        />
      );
    }
  }

  if (currentView === 'choose-child') {
    return (
      <OtherChildChildrenSelect
        children={children}
        selectedChild={selectedChild}
        loading={loading}
        error={error}
        onBack={() => setCurrentView('parent')}
        onSelectChild={handleChildSelect}
        onSave={handleChildSave}
      />
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
              <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Застрахованный - Иной ребенок</div>
              <div data-layer="Button container" className="ButtonContainer" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
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
            {!parentSectionCollapsed && parentData && (
              <>
                <ToggleButton label="Ручной ввод данных" isPressed={manualInput} onClick={handleToggleManualInput} />
                <InputField
                  label="ИИН"
                  value={parentData.iin}
                  onChange={(e) => handleParentFieldChange('iin', e.target.value)}
                  onBlur={() => handleParentFieldBlur('iin')}
                  isActive={activeParentField === 'iin'}
                  onActivate={() => handleParentFieldActivate('iin')}
                />
                <InputField
                  label="Номер телефона"
                  value={parentData.telephone}
                  onChange={(e) => handleParentFieldChange('telephone', e.target.value)}
                  onBlur={() => handleParentFieldBlur('telephone')}
                  isActive={activeParentField === 'telephone'}
                  onActivate={() => handleParentFieldActivate('telephone')}
                />
                {(manualInput || autoModeState === 'data_loaded') && (
                  <>
                    <InputField
                      label="Фамилия"
                      value={parentData.surname}
                      onChange={(e) => handleParentFieldChange('surname', e.target.value)}
                      onBlur={() => handleParentFieldBlur('surname')}
                      isActive={activeParentField === 'surname'}
                      onActivate={() => handleParentFieldActivate('surname')}
                    />
                    <InputField
                      label="Имя"
                      value={parentData.name}
                      onChange={(e) => handleParentFieldChange('name', e.target.value)}
                      onBlur={() => handleParentFieldBlur('name')}
                      isActive={activeParentField === 'name'}
                      onActivate={() => handleParentFieldActivate('name')}
                    />
                    <InputField
                      label="Отчество"
                      value={parentData.patronymic}
                      onChange={(e) => handleParentFieldChange('patronymic', e.target.value)}
                      onBlur={() => handleParentFieldBlur('patronymic')}
                      isActive={activeParentField === 'patronymic'}
                      onActivate={() => handleParentFieldActivate('patronymic')}
                    />
                    <CalendarField
                      label="Дата рождения"
                      value={parentData.birthDate}
                      onChange={(e) => handleParentFieldChange('birthDate', e.target.value)}
                      onBlur={() => handleParentFieldBlur('birthDate')}
                      isActive={activeParentField === 'birthDate'}
                      onActivate={() => handleParentFieldActivate('birthDate')}
                    />
                    <DictionarySelect label="Пол" value={getDictionaryValue(parentData.gender)} onClick={handleParentOpenGender} />
                    <DictionarySelect label="Код сектора экономики" value={getDictionaryValue(parentData.economSecId)} onClick={handleParentOpenSectorCode} />
                    <DictionarySelect label="Страна" value={getDictionaryValue(parentData.countryId)} onClick={handleParentOpenCountry} />
                    <DictionarySelect label="Область" value={getDictionaryValue(parentData.district_nameru)} onClick={handleParentOpenRegion} />
                    <InputField
                      label="Название населенного пункта"
                      value={parentData.settlementName}
                      onChange={(e) => handleParentFieldChange('settlementName', e.target.value)}
                      onBlur={() => handleParentFieldBlur('settlementName')}
                      isActive={activeParentField === 'settlementName'}
                      onActivate={() => handleParentFieldActivate('settlementName')}
                    />
                    <InputField
                      label="Улица"
                      value={parentData.street}
                      onChange={(e) => handleParentFieldChange('street', e.target.value)}
                      onBlur={() => handleParentFieldBlur('street')}
                      isActive={activeParentField === 'street'}
                      onActivate={() => handleParentFieldActivate('street')}
                    />
                    <InputField
                      label="№ дома"
                      value={parentData.houseNumber}
                      onChange={(e) => handleParentFieldChange('houseNumber', e.target.value)}
                      onBlur={() => handleParentFieldBlur('houseNumber')}
                      isActive={activeParentField === 'houseNumber'}
                      onActivate={() => handleParentFieldActivate('houseNumber')}
                    />
                    <InputField
                      label="№ квартиры"
                      value={parentData.apartmentNumber}
                      onChange={(e) => handleParentFieldChange('apartmentNumber', e.target.value)}
                      onBlur={() => handleParentFieldBlur('apartmentNumber')}
                      isActive={activeParentField === 'apartmentNumber'}
                      onActivate={() => handleParentFieldActivate('apartmentNumber')}
                    />
                    <DictionarySelect label="Тип документа" value={getDictionaryValue(parentData.vidDocId)} onClick={handleParentOpenDocType} />
                    <InputField
                      label="Номер документа"
                      value={parentData.docNumber}
                      onChange={(e) => handleParentFieldChange('docNumber', e.target.value)}
                      onBlur={() => handleParentFieldBlur('docNumber')}
                      isActive={activeParentField === 'docNumber'}
                      onActivate={() => handleParentFieldActivate('docNumber')}
                    />
                    <DictionarySelect label="Кем выдано" value={getDictionaryValue(parentData.issuedBy)} onClick={handleParentOpenIssuedBy} />
                    <CalendarField
                      label="Выдан от"
                      value={parentData.issueDate}
                      onChange={(e) => handleParentFieldChange('issueDate', e.target.value)}
                      onBlur={() => handleParentFieldBlur('issueDate')}
                      isActive={activeParentField === 'issueDate'}
                      onActivate={() => handleParentFieldActivate('issueDate')}
                    />
                    <CalendarField
                      label="Действует до"
                      value={parentData.expiryDate}
                      onChange={(e) => handleParentFieldChange('expiryDate', e.target.value)}
                      onBlur={() => handleParentFieldBlur('expiryDate')}
                      isActive={activeParentField === 'expiryDate'}
                      onActivate={() => handleParentFieldActivate('expiryDate')}
                    />
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
                <div data-layer="Filds list" className="FildsList" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
                  <ToggleButton label="Ручной ввод данных" isPressed={manualChildInput} onClick={handleToggleManualChildInput} />

                  {manualChildInput ? (
                    <>
                      <InputField
                        label="ИИН"
                        value={childData.iin}
                        onChange={(e) => handleChildFieldChange('iin', e.target.value)}
                        onBlur={() => handleChildFieldBlur('iin')}
                        isActive={activeChildField === 'iin'}
                        onActivate={() => handleChildFieldActivate('iin')}
                      />
                      <InputField
                        label="Фамилия"
                        value={childData.surname}
                        onChange={(e) => handleChildFieldChange('surname', e.target.value)}
                        onBlur={() => handleChildFieldBlur('surname')}
                        isActive={activeChildField === 'surname'}
                        onActivate={() => handleChildFieldActivate('surname')}
                      />
                      <InputField
                        label="Имя"
                        value={childData.name}
                        onChange={(e) => handleChildFieldChange('name', e.target.value)}
                        onBlur={() => handleChildFieldBlur('name')}
                        isActive={activeChildField === 'name'}
                        onActivate={() => handleChildFieldActivate('name')}
                      />
                      <InputField
                        label="Отчество"
                        value={childData.patronymic}
                        onChange={(e) => handleChildFieldChange('patronymic', e.target.value)}
                        onBlur={() => handleChildFieldBlur('patronymic')}
                        isActive={activeChildField === 'patronymic'}
                        onActivate={() => handleChildFieldActivate('patronymic')}
                      />
                      <CalendarField
                        label="Дата рождения"
                        value={childData.birthDate}
                        onChange={(e) => handleChildFieldChange('birthDate', e.target.value)}
                        onBlur={() => handleChildFieldBlur('birthDate')}
                        isActive={activeChildField === 'birthDate'}
                        onActivate={() => handleChildFieldActivate('birthDate')}
                      />
                      <DictionarySelect label="Пол" value={getDictionaryValue(childData.gender)} onClick={handleOpenGender} />
                      <DictionarySelect label="Код сектора экономики" value={getDictionaryValue(childData.economSecId)} onClick={handleOpenSectorCode} />
                      <ToggleButton label="Адрес проживания совпадает с адресом родителя" isPressed={addressMatchesParent} onClick={handleToggleAddressMatchesParent} />
                      <DictionarySelect label="Страна" value={getDictionaryValue(childData.countryId)} onClick={handleOpenCountry} />
                      <DictionarySelect label="Область" value={getDictionaryValue(childData.district_nameru)} onClick={handleOpenRegion} />
                      <DictionarySelect label="Тип документа" value={getDictionaryValue(childData.vidDocId)} onClick={handleOpenDocType} />
                      <InputField
                        label="Номер документа"
                        value={childData.docNumber}
                        onChange={(e) => handleChildFieldChange('docNumber', e.target.value)}
                        onBlur={() => handleChildFieldBlur('docNumber')}
                        isActive={activeChildField === 'docNumber'}
                        onActivate={() => handleChildFieldActivate('docNumber')}
                      />
                      <DictionarySelect label="Кем выдано" value={getDictionaryValue(childData.issuedBy)} onClick={handleOpenIssuedBy} />
                      <CalendarField
                        label="Выдан от"
                        value={childData.issueDate}
                        onChange={(e) => handleChildFieldChange('issueDate', e.target.value)}
                        onBlur={() => handleChildFieldBlur('issueDate')}
                        isActive={activeChildField === 'issueDate'}
                        onActivate={() => handleChildFieldActivate('issueDate')}
                      />
                      {(() => {
                        const docType = getDictionaryValue(childData.vidDocId);
                        const isBirthCertificate = docType === 'Свидетельство о рождении' || childData.vidDocId === 'Свидетельство о рождении';
                        return !isBirthCertificate && (
                          <CalendarField
                            label="Действует до"
                            value={childData.expiryDate}
                            onChange={(e) => handleChildFieldChange('expiryDate', e.target.value)}
                            onBlur={() => handleChildFieldBlur('expiryDate')}
                            isActive={activeChildField === 'expiryDate'}
                            onActivate={() => handleChildFieldActivate('expiryDate')}
                          />
                        );
                      })()}
                      <DictionarySelect label="Тип клиента" value={getDictionaryValue(childData.clientType)} onClick={handleOpenClientType} />
                      <FileField label="Документ подтверждающий личность" value={childData.documentFile} onClick={() => { }} />
                      <FileField label="Документ подтверждающий опекунство" value="" onClick={() => { }} />
                    </>
                  ) : (
                    <>
                      <InputField
                        label="ИИН"
                        value={childData.iin}
                        onChange={(e) => handleChildFieldChange('iin', e.target.value)}
                        onBlur={() => handleChildFieldBlur('iin')}
                        isActive={activeChildField === 'iin'}
                        onActivate={() => handleChildFieldActivate('iin')}
                      />
                      {(selectedChild || childData.name || childData.surname) && (
                        <>
                          <InputField
                            label="Фамилия"
                            value={childData.surname}
                            onChange={(e) => handleChildFieldChange('surname', e.target.value)}
                            onBlur={() => handleChildFieldBlur('surname')}
                            isActive={activeChildField === 'surname'}
                            onActivate={() => handleChildFieldActivate('surname')}
                          />
                          <InputField
                            label="Имя"
                            value={childData.name}
                            onChange={(e) => handleChildFieldChange('name', e.target.value)}
                            onBlur={() => handleChildFieldBlur('name')}
                            isActive={activeChildField === 'name'}
                            onActivate={() => handleChildFieldActivate('name')}
                          />
                          <InputField
                            label="Отчество"
                            value={childData.patronymic}
                            onChange={(e) => handleChildFieldChange('patronymic', e.target.value)}
                            onBlur={() => handleChildFieldBlur('patronymic')}
                            isActive={activeChildField === 'patronymic'}
                            onActivate={() => handleChildFieldActivate('patronymic')}
                          />
                          <CalendarField
                            label="Дата рождения"
                            value={childData.birthDate}
                            onChange={(e) => handleChildFieldChange('birthDate', e.target.value)}
                            onBlur={() => handleChildFieldBlur('birthDate')}
                            isActive={activeChildField === 'birthDate'}
                            onActivate={() => handleChildFieldActivate('birthDate')}
                          />
                          <DictionarySelect label="Пол" value={getDictionaryValue(childData.gender)} onClick={handleOpenGender} />
                          <DictionarySelect label="Код сектора экономики" value={getDictionaryValue(childData.economSecId)} onClick={handleOpenSectorCode} />
                          <ToggleButton label="Адрес проживания совпадает с адресом родителя" isPressed={addressMatchesParent} onClick={handleToggleAddressMatchesParent} />
                          <DictionarySelect label="Страна" value={getDictionaryValue(childData.countryId)} onClick={handleOpenCountry} />
                          <DictionarySelect label="Область" value={getDictionaryValue(childData.district_nameru)} onClick={handleOpenRegion} />
                          <DictionarySelect label="Тип документа" value={getDictionaryValue(childData.vidDocId)} onClick={handleOpenDocType} />
                          <InputField
                            label="Номер документа"
                            value={childData.docNumber}
                            onChange={(e) => handleChildFieldChange('docNumber', e.target.value)}
                            onBlur={() => handleChildFieldBlur('docNumber')}
                            isActive={activeChildField === 'docNumber'}
                            onActivate={() => handleChildFieldActivate('docNumber')}
                          />
                          <DictionarySelect label="Кем выдано" value={getDictionaryValue(childData.issuedBy)} onClick={handleOpenIssuedBy} />
                          <CalendarField
                            label="Выдан от"
                            value={childData.issueDate}
                            onChange={(e) => handleChildFieldChange('issueDate', e.target.value)}
                            onBlur={() => handleChildFieldBlur('issueDate')}
                            isActive={activeChildField === 'issueDate'}
                            onActivate={() => handleChildFieldActivate('issueDate')}
                          />
                          {(() => {
                            const docType = getDictionaryValue(childData.vidDocId);
                            const isBirthCertificate = docType === 'Свидетельство о рождении' || childData.vidDocId === 'Свидетельство о рождении';
                            return !isBirthCertificate && (
                              <CalendarField
                                label="Действует до"
                                value={childData.expiryDate}
                                onChange={(e) => handleChildFieldChange('expiryDate', e.target.value)}
                                onBlur={() => handleChildFieldBlur('expiryDate')}
                                isActive={activeChildField === 'expiryDate'}
                                onActivate={() => handleChildFieldActivate('expiryDate')}
                              />
                            );
                          })()}
                          <DictionarySelect label="Тип клиента" value={getDictionaryValue(childData.clientType)} onClick={handleOpenClientType} />
                        </>
                      )}
                      <FileField label="Документ подтверждающий личность" value={childData.documentFile} onClick={() => { }} />
                      <FileField label="Документ подтверждающий опекунство" value="" onClick={() => { }} />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div >
      </div >
    );
  }

  // Основной вид - форма родителя
  const showAllParentFields = manualInput || autoModeState === 'data_loaded';
  // Ребенок доступен когда включен ручной ввод родителя ИЛИ данные получены через сервис
  const canSelectChild = manualInput || autoModeState === 'data_loaded';

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
            <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Застрахованный - Иной ребенок</div>
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
              <div data-layer="Send request button" data-state="pressed" className="SendRequestButton" onClick={isLoading ? undefined : handleHeaderButtonClick} style={{ width: 390, height: 85, background: isLoading ? '#666' : 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                <div data-layer="Button Text" className="ButtonText" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{getHeaderButtonText()}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Alert для уведомлений */}
        {(!manualInput && (autoModeState === 'request_sent' || autoModeState === 'response_received' || waitingSmsResponse)) || errorMessage ? (
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
                      <path fillRule="evenodd" clipRule="evenodd" d="M0.916748 10.9998C0.916748 5.43083 5.43107 0.916504 11.0001 0.916504C16.5691 0.916504 21.0834 5.43083 21.0834 10.9998C21.0834 16.5688 16.5691 21.0832 11.0001 21.0832C5.43107 21.0832 0.916748 16.5688 0.916748 10.9998ZM11.0001 2.74984C6.44359 2.74984 2.75008 6.44335 2.75008 10.9998C2.75008 15.5563 6.44359 19.2498 11.0001 19.2498C15.5566 19.2498 19.2501 15.5563 19.2501 10.9998C19.2501 6.44335 15.5566 2.74984 11.0001 2.74984ZM10.0742 7.33317C10.0742 6.82691 10.4847 6.4165 10.9909 6.4165H11.0001C11.5063 6.4165 11.9167 6.82691 11.9167 7.33317C11.9167 7.83943 11.5063 8.24984 11.0001 8.24984H10.9909C10.4847 8.24984 10.0742 7.83943 10.0742 7.33317ZM11.0001 10.0832C11.5063 10.0832 11.9167 10.4936 11.9167 10.9998V14.6665C11.9167 15.1728 11.5063 15.5832 11.0001 15.5832C10.4938 15.5832 10.0834 15.1728 10.0834 14.6665V10.9998C10.0834 10.4936 10.4938 10.0832 11.0001 10.0832Z" fill="black" />
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
            <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: errorMessage ? '#d32f2f' : 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>
              {errorMessage
                ? errorMessage
                : (waitingSmsResponse || autoModeState === 'request_sent')
                  ? 'На номер телефона будет отправлено СМС для получения согласия, клиенту необходимо ответить 511'
                  : 'Нажмите на обновить, чтобы получить данные клиента'}
            </div>
          </div>
        ) : null}
        <div data-layer="Filds list" className="FildsList" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
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
              <ToggleButton label="Ручной ввод данных" isPressed={manualInput} onClick={handleToggleManualInput} />
              <InputField
                label="ИИН"
                value={parentData.iin}
                onChange={(e) => handleParentFieldChange('iin', e.target.value)}
                onBlur={() => handleParentFieldBlur('iin')}
                isActive={activeParentField === 'iin'}
                onActivate={() => handleParentFieldActivate('iin')}
              />
              <InputField
                label="Номер телефона"
                value={parentData.telephone}
                onChange={(e) => handleParentFieldChange('telephone', e.target.value)}
                onBlur={() => handleParentFieldBlur('telephone')}
                isActive={activeParentField === 'telephone'}
                onActivate={() => handleParentFieldActivate('telephone')}
              />
              {showAllParentFields && (
                <>
                  <InputField
                    label="Фамилия"
                    value={parentData.surname}
                    onChange={(e) => handleParentFieldChange('surname', e.target.value)}
                    onBlur={() => handleParentFieldBlur('surname')}
                    isActive={activeParentField === 'surname'}
                    onActivate={() => handleParentFieldActivate('surname')}
                  />
                  <InputField
                    label="Имя"
                    value={parentData.name}
                    onChange={(e) => handleParentFieldChange('name', e.target.value)}
                    onBlur={() => handleParentFieldBlur('name')}
                    isActive={activeParentField === 'name'}
                    onActivate={() => handleParentFieldActivate('name')}
                  />
                  <InputField
                    label="Отчество"
                    value={parentData.patronymic}
                    onChange={(e) => handleParentFieldChange('patronymic', e.target.value)}
                    onBlur={() => handleParentFieldBlur('patronymic')}
                    isActive={activeParentField === 'patronymic'}
                    onActivate={() => handleParentFieldActivate('patronymic')}
                  />
                  <CalendarField
                    label="Дата рождения"
                    value={parentData.birthDate}
                    onChange={(e) => handleParentFieldChange('birthDate', e.target.value)}
                    onBlur={() => handleParentFieldBlur('birthDate')}
                    isActive={activeParentField === 'birthDate'}
                    onActivate={() => handleParentFieldActivate('birthDate')}
                  />
                  <DictionarySelect label="Пол" value={getDictionaryValue(parentData.gender)} onClick={handleParentOpenGender} />
                  <DictionarySelect label="Код сектора экономики" value={getDictionaryValue(parentData.economSecId)} onClick={handleParentOpenSectorCode} />
                  <DictionarySelect label="Страна" value={getDictionaryValue(parentData.countryId)} onClick={handleParentOpenCountry} />
                  <DictionarySelect label="Область" value={getDictionaryValue(parentData.district_nameru)} onClick={handleParentOpenRegion} />
                  <InputField
                    label="Название населенного пункта"
                    value={parentData.settlementName}
                    onChange={(e) => handleParentFieldChange('settlementName', e.target.value)}
                    onBlur={() => handleParentFieldBlur('settlementName')}
                    isActive={activeParentField === 'settlementName'}
                    onActivate={() => handleParentFieldActivate('settlementName')}
                  />
                  <InputField
                    label="Улица"
                    value={parentData.street}
                    onChange={(e) => handleParentFieldChange('street', e.target.value)}
                    onBlur={() => handleParentFieldBlur('street')}
                    isActive={activeParentField === 'street'}
                    onActivate={() => handleParentFieldActivate('street')}
                  />
                  <InputField
                    label="№ дома"
                    value={parentData.houseNumber}
                    onChange={(e) => handleParentFieldChange('houseNumber', e.target.value)}
                    onBlur={() => handleParentFieldBlur('houseNumber')}
                    isActive={activeParentField === 'houseNumber'}
                    onActivate={() => handleParentFieldActivate('houseNumber')}
                  />
                  <InputField
                    label="№ квартиры"
                    value={parentData.apartmentNumber}
                    onChange={(e) => handleParentFieldChange('apartmentNumber', e.target.value)}
                    onBlur={() => handleParentFieldBlur('apartmentNumber')}
                    isActive={activeParentField === 'apartmentNumber'}
                    onActivate={() => handleParentFieldActivate('apartmentNumber')}
                  />
                  <DictionarySelect label="Тип документа" value={getDictionaryValue(parentData.vidDocId)} onClick={handleParentOpenDocType} />
                  <InputField
                    label="Номер документа"
                    value={parentData.docNumber}
                    onChange={(e) => handleParentFieldChange('docNumber', e.target.value)}
                    onBlur={() => handleParentFieldBlur('docNumber')}
                    isActive={activeParentField === 'docNumber'}
                    onActivate={() => handleParentFieldActivate('docNumber')}
                  />
                  <DictionarySelect label="Кем выдано" value={getDictionaryValue(parentData.issuedBy)} onClick={handleParentOpenIssuedBy} />
                  <CalendarField
                    label="Выдан от"
                    value={parentData.issueDate}
                    onChange={(e) => handleParentFieldChange('issueDate', e.target.value)}
                    onBlur={() => handleParentFieldBlur('issueDate')}
                    isActive={activeParentField === 'issueDate'}
                    onActivate={() => handleParentFieldActivate('issueDate')}
                  />
                  <CalendarField
                    label="Действует до"
                    value={parentData.expiryDate}
                    onChange={(e) => handleParentFieldChange('expiryDate', e.target.value)}
                    onBlur={() => handleParentFieldBlur('expiryDate')}
                    isActive={activeParentField === 'expiryDate'}
                    onActivate={() => handleParentFieldActivate('expiryDate')}
                  />
                </>
              )}
            </>
          )}
          <div data-layer="MessageContainer" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
            <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Данные ребенка</div>
          </div>
          {canSelectChild && (
            <>
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
              <ToggleButton label="Ручной ввод данных" isPressed={manualChildInput} onClick={handleToggleManualChildInput} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherChild;

