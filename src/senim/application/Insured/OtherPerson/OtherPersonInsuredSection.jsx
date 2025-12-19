import React from 'react';
import { renderInputField, renderDictionaryButton, renderCalendarField, renderAttachField, renderToggleButton } from '../InsuredFormFields';

const OtherPersonInsuredSection = ({
  manualInput,
  autoModeState,
  waitingSmsResponse,
  errorMessage,
  isLoading,
  insuredData,
  toggleStates,
  activeField,
  getDictionaryDisplayValue,
  handleFieldChange,
  handleFieldClick,
  handleFieldBlur,
  handleOpenGender,
  handleOpenSectorCode,
  handleOpenCountry,
  handleOpenRegion,
  handleOpenDocType,
  handleOpenIssuedBy,
  handleOpenClientType,
  handleTogglePDL,
  handleToggleManualInput
}) => {
  return (
    <>
      {/* Alert для уведомлений */}
      {(!manualInput && (autoModeState === 'request_sent' || autoModeState === 'response_received' || waitingSmsResponse)) || errorMessage ? (
        <div
          data-layer="Alert"
          className="Alert"
          style={{
            alignSelf: 'stretch',
            height: 85,
            paddingRight: 20,
            background: errorMessage ? '#fff5f5' : 'white',
            overflow: 'hidden',
            borderBottom: '1px #F8E8E8 solid',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 8,
            display: 'inline-flex'
          }}
        >
          <div
            data-layer="Info container"
            className="InfoContainer"
            style={{ width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden' }}
          >
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
          <div
            data-layer="Label"
            className="Label"
            style={{
              flex: '1 1 0',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: errorMessage ? '#d32f2f' : 'black',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: '500',
              wordWrap: 'break-word'
            }}
          >
            {errorMessage
              ? errorMessage
              : (waitingSmsResponse || autoModeState === 'request_sent')
                ? 'На номер телефона будет отправлено СМС для получения согласия, клиенту необходимо ответить 511'
                : 'Нажмите на обновить, чтобы получить данные клиента'}
          </div>
        </div>
      ) : null}

      <div
        data-layer="Filds list"
        className="FildsList"
        style={{
          alignSelf: 'stretch',
          background: 'white',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex'
        }}
      >
        {renderToggleButton('Ручной ввод данных', manualInput, handleToggleManualInput)}
        {!manualInput && (
          <>
            {renderInputField('iin', 'ИИН', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
            {renderInputField('telephone', 'Номер телефона', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
            {/* В состоянии data_loaded показываем все остальные поля */}
            {autoModeState === 'data_loaded' && (
              <>
                {renderDictionaryButton('residency', 'Признак резидентства', getDictionaryDisplayValue(insuredData.residency), () => {}, !!insuredData.residency)}
                {renderInputField('surname', 'Фамилия', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
                {renderInputField('name', 'Имя', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
                {renderInputField('patronymic', 'Отчество', insuredData, activeField, handleFieldChange, handleFieldClick, handleFieldBlur)}
                {renderCalendarField('birthDate', 'Дата рождения', insuredData.birthDate)}
                {renderDictionaryButton('gender', 'Пол', getDictionaryDisplayValue(insuredData.gender), handleOpenGender, !!insuredData.gender)}
                {renderDictionaryButton('economSecId', 'Код сектора экономики', getDictionaryDisplayValue(insuredData.economSecId), handleOpenSectorCode, !!insuredData.economSecId)}
                {renderDictionaryButton('countryId', 'Страна', getDictionaryDisplayValue(insuredData.countryId), handleOpenCountry, !!insuredData.countryId)}
                {renderDictionaryButton(
                  'district_nameru',
                  'Область',
                  getDictionaryDisplayValue(insuredData.district_nameru),
                  handleOpenRegion,
                  !!insuredData.district_nameru
                )}
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
                {renderDictionaryButton('clientType', 'Тип клиента', getDictionaryDisplayValue(insuredData.clientType), handleOpenClientType, !!insuredData.clientType)}
              </>
            )}
          </>
        )}
        {manualInput && (
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
            {renderDictionaryButton(
              'district_nameru',
              'Область',
              getDictionaryDisplayValue(insuredData.district_nameru),
              handleOpenRegion,
              !!insuredData.district_nameru
            )}
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
            {renderDictionaryButton('clientType', 'Тип клиента', getDictionaryDisplayValue(insuredData.clientType), handleOpenClientType, !!insuredData.clientType)}
          </>
        )}
      </div>
    </>
  );
};

export default OtherPersonInsuredSection;


