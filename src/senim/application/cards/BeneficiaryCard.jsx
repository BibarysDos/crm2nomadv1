import React from 'react';

const BeneficiaryCard = ({ beneficiaryData }) => {
  return (
    <div
      data-layer="Сounterparty Beneficiary"
      data-state="pressed"
      className="OunterpartyBeneficiary"
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
      <div
        data-layer="Sections Beneficiary"
        className="SectionsBeneficiary"
        style={{
          width: 1427,
          height: 85,
          paddingLeft: 20,
          background: '#FCFCFC',
          overflow: 'hidden',
          borderBottom: '1px #F8E8E8 solid',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 10,
          display: 'inline-flex'
        }}
      >
        <div
          data-layer="Text container"
          className="TextContainer"
          style={{
            flex: '1 1 0',
            paddingTop: 20,
            paddingBottom: 20,
            overflow: 'hidden',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 10,
            display: 'flex'
          }}
        >
          <div
            data-layer="LabelDiv"
            className="Labeldiv"
            style={{
              flex: '1 1 0',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: 'black',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: '500',
              wordWrap: 'break-word'
            }}
          >
            Выгодоприобретатель
          </div>
        </div>
      </div>
      <div
        data-layer="Info container"
        data-state="pressed"
        className="InfoContainer"
        style={{
          alignSelf: 'stretch',
          height: 85,
          paddingLeft: 20,
          background: 'white',
          overflow: 'hidden',
          borderBottom: '1px #F8E8E8 solid',
          justifyContent: 'flex-start',
          alignItems: 'center',
          display: 'inline-flex'
        }}
      >
        <div
          data-layer="Text field container"
          className="TextFieldContainer"
          style={{
            flex: '1 1 0',
            height: 85,
            paddingTop: 20,
            paddingBottom: 20,
            paddingRight: 16,
            overflow: 'hidden',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 10,
            display: 'inline-flex'
          }}
        >
          <div
            data-layer="Label"
            className="Label"
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: '#6B6D80',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: '500',
              wordWrap: 'break-word'
            }}
          >
            Наименование
          </div>
          <div
            data-layer="Input text"
            className="InputText"
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: '#071222',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: '500',
              wordWrap: 'break-word'
            }}
          >
            {beneficiaryData?.name || ''}
          </div>
        </div>
      </div>
      <div
        data-layer="Input Field"
        data-state="pressed"
        className="InputField"
        style={{
          alignSelf: 'stretch',
          height: 85,
          paddingLeft: 20,
          background: 'white',
          overflow: 'hidden',
          borderBottom: '1px #F8E8E8 solid',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 10,
          display: 'inline-flex'
        }}
      >
        <div
          data-layer="Text field container"
          className="TextFieldContainer"
          style={{
            flex: '1 1 0',
            height: 85,
            paddingTop: 20,
            paddingBottom: 20,
            paddingRight: 16,
            overflow: 'hidden',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 10,
            display: 'inline-flex'
          }}
        >
          <div
            data-layer="LabelDefault"
            className="Labeldefault"
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: '#6B6D80',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: '500',
              wordWrap: 'break-word'
            }}
          >
            Тип резидентства
          </div>
          <div
            data-layer="%Input text"
            className="InputText"
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: '#071222',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: '500',
              wordWrap: 'break-word'
            }}
          >
            {beneficiaryData?.residencyType === 'не резидент' ||
            beneficiaryData?.residencyType === 'Не резидент'
              ? 'Нерезидент'
              : beneficiaryData?.residencyType || ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryCard;


