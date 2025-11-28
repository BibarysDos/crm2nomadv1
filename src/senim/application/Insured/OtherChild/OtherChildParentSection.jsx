import React from 'react';
import Gender from '../../../dictionary/Gender';
import SectorCode from '../../../dictionary/SectorCode';
import Country from '../../../dictionary/Country';
import Region from '../../../dictionary/Region';
import DocType from '../../../dictionary/DocType';
import IssuedBy from '../../../dictionary/IssuedBy';
import { InputField } from '../../../components/ui/InputField';
import { DictionarySelect } from '../../../components/ui/DictionarySelect';
import { CalendarField } from '../../../components/ui/CalendarField';
import { ToggleButton } from '../../../components/ui/ToggleButton';

export const OtherChildParentSection = ({
  manualInput,
  autoModeState,
  parentSectionCollapsed,
  setParentSectionCollapsed,
  parentData,
  activeParentField,
  handleParentFieldChange,
  handleParentFieldBlur,
  handleParentFieldActivate,
  getDictionaryValue,
  handleParentOpenGender,
  handleParentOpenSectorCode,
  handleParentOpenCountry,
  handleParentOpenRegion,
  handleParentOpenDocType,
  handleParentOpenIssuedBy,
  handleToggleManualInput,
  handleTogglePDL,
  toggleStates,
  parentDictionaryView,
  previousParentDictionaryView,
  setParentDictionaryView,
  handleParentDictionaryValueSelect
}) => {
  // Рендер справочников родителя
  if ((parentDictionaryView !== 'main')) {
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

  const showAllParentFields = manualInput || autoModeState === 'data_loaded';

  return (
    <>
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
              <ToggleButton label="Признак ПДЛ" isPressed={toggleStates.pdl} onClick={handleTogglePDL} />
            </>
          )}
        </>
      )}
    </>
  );
};


