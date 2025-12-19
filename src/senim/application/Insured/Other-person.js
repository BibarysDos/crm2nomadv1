import React from 'react';
import Gender from '../../dictionary/Gender';
import SectorCode from '../../dictionary/SectorCode';
import Country from '../../dictionary/Country';
import Region from '../../dictionary/Region';
import DocType from '../../dictionary/DocType';
import IssuedBy from '../../dictionary/IssuedBy';
import ClientType from '../../dictionary/ClientType';
import useOtherPerson from '../../hooks/useOtherPerson';
import OtherPersonHeader from './OtherPerson/OtherPersonHeader';
import OtherPersonInsuredSection from './OtherPerson/OtherPersonInsuredSection';

const OtherPerson = ({ onBack, onSave, applicationId, taskId, savedData, onOpenTypes, policyholderData }) => {
  const {
    dictionaryView,
    previousDictionaryView,
    manualInput,
    autoModeState,
    waitingSmsResponse,
    isLoading,
    errorMessage,
    insuredData,
    toggleStates,
    activeField,
    setDictionaryView,
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
    handleOpenClientType,
    handleTogglePDL,
    handleToggleManualInput,
    getHeaderButtonText,
    handleHeaderButtonClick
  } = useOtherPerson({
    applicationId,
    taskId,
    savedData,
    onSave,
    onBack,
    policyholderData
  });

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
  if (dictionaryView === 'clientType') {
    return <ClientType onBack={() => setDictionaryView(previousDictionaryView)} onSave={(value) => handleDictionaryValueSelect('clientType', value)} initialValue={insuredData.clientType} />;
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

  // Основной вид
  return (
    <div data-layer="Insured data page" className="InsuredDataPage" style={{ width: 1512, minHeight: '100vh', background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex' }}>
      {renderMenu()}
      <div data-layer="Insured data" className="InsuredData" style={{ width: 1427, alignSelf: 'stretch', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <OtherPersonHeader
          title="Застрахованный - Иное лицо"
          isLoading={isLoading}
          getHeaderButtonText={getHeaderButtonText}
          onHeaderButtonClick={handleHeaderButtonClick}
        />
            <OtherPersonInsuredSection
              manualInput={manualInput}
              autoModeState={autoModeState}
              waitingSmsResponse={waitingSmsResponse}
              errorMessage={errorMessage}
              isLoading={isLoading}
              insuredData={insuredData}
              toggleStates={toggleStates}
              activeField={activeField}
              getDictionaryDisplayValue={getDictionaryDisplayValue}
              handleFieldChange={handleFieldChange}
              handleFieldClick={handleFieldClick}
              handleFieldBlur={handleFieldBlur}
              handleOpenGender={handleOpenGender}
              handleOpenSectorCode={handleOpenSectorCode}
              handleOpenCountry={handleOpenCountry}
              handleOpenRegion={handleOpenRegion}
              handleOpenDocType={handleOpenDocType}
              handleOpenIssuedBy={handleOpenIssuedBy}
              handleOpenClientType={handleOpenClientType}
              handleTogglePDL={handleTogglePDL}
              handleToggleManualInput={handleToggleManualInput}
            />
      </div>
    </div>
  );
};

export default OtherPerson;
