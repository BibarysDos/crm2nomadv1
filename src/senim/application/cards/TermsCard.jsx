import React from 'react';

const getTermsInsuranceProductName = (terms) => {
  if (!terms) return '';
  return terms.dictionaryValues?.insuranceProduct || terms.insuranceProduct || '';
};

const getInsuranceAmount = (insuranceProduct) => {
  if (!insuranceProduct) {
    return null;
  }
  const match = insuranceProduct.match(/(\d+)/);
  if (match) {
    const amount = parseInt(match[1], 10);
    return `${amount} 000 USD`;
  }
  return null;
};

const TermsCard = ({ termsData, onOpen }) => {
  const productName = getTermsInsuranceProductName(termsData);
  const insuranceAmount = getInsuranceAmount(productName);

  return (
    <div
      data-layer="Insurance conditions"
      data-state={termsData ? 'pressed' : 'not_pressed'}
      className="InsuranceConditions"
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
        data-layer="Sections Insurance conditions"
        className="SectionsInsuranceConditions"
        style={{
          alignSelf: 'stretch',
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
            Условия
          </div>
        </div>
        <div
          data-layer="Open button"
          className="OpenButton"
          onClick={onOpen}
          style={{
            width: 85,
            height: 85,
            position: 'relative',
            background: '#FBF9F9',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
        >
          <div
            data-svg-wrapper
            data-layer="Chewron right"
            className="ChewronRight"
            style={{ left: 31, top: 32, position: 'absolute' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
      {termsData ? (
        <>
          {insuranceAmount && (
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
                  Страховая сумма
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
                  {insuranceAmount}
                </div>
              </div>
            </div>
          )}
          {productName && (
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
                  Программа страхования
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
                  {productName}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          data-layer="Info container"
          className="InfoContainer"
          style={{
            alignSelf: 'stretch',
            height: 169,
            paddingTop: 6,
            paddingBottom: 40,
            paddingLeft: 564,
            paddingRight: 564,
            background: 'white',
            overflow: 'hidden',
            borderBottom: '1px #F8E8E8 solid',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex'
          }}
        >
          <div
            data-layer="Info logo"
            className="InfoLogo"
            style={{
              width: 85,
              height: 85,
              position: 'relative',
              background: 'white',
              overflow: 'hidden'
            }}
          >
            <div
              data-svg-wrapper
              data-layer="Info"
              className="Info"
              style={{ left: 31, top: 32, position: 'absolute' }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_373_843)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.916504 11C0.916504 5.43098 5.43083 0.916656 10.9998 0.916656C16.5688 0.916656 21.0832 5.43098 21.0832 11C21.0832 16.569 16.5688 21.0833 10.9998 21.0833C5.43083 21.0833 0.916504 16.569 0.916504 11ZM10.9998 2.74999C6.44335 2.74999 2.74984 6.4435 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.4435 15.5563 2.74999 10.9998 2.74999ZM10.074 7.33332C10.074 6.82706 10.4844 6.41666 10.9907 6.41666H10.9998C11.5061 6.41666 11.9165 6.82706 11.9165 7.33332C11.9165 7.83958 11.5061 8.24999 10.9998 8.24999H10.9907C10.4844 8.24999 10.074 7.83958 10.074 7.33332ZM10.9998 10.0833C11.5061 10.0833 11.9165 10.4937 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5833 10.9998 15.5833C10.4936 15.5833 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4937 10.4936 10.0833 10.9998 10.0833Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_373_843">
                    <rect width="22" height="22" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <div
            data-layer="Нажмите на поле страхователь, чтобы заполнить данные"
            style={{
              width: 309,
              textAlign: 'center',
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
            Нажмите на поле условия, чтобы заполнить данные
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsCard;


