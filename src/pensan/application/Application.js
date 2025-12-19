import React from 'react';

const Application = ({ selectedProduct, onBack }) => {
  const handleBackToProduct = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div data-layer="Statements details" className="StatementsDetails" style={{width: 1512, minHeight: '100vh', background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex'}}>
      <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Back button" className="BackButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}} onClick={handleBackToProduct}>
          <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
        </div>
        <div data-layer="OpenDocument button" className="OpendocumentButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}}>
          <div data-layer="File" className="File" style={{width: 22, height: 22, left: 31, top: 32, position: 'absolute'}}>
            <div data-svg-wrapper data-layer="Frame 1321316875" className="Frame1321316875" style={{left: 3, top: 1, position: 'absolute'}}>
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0L16.001 6V18.001C16.0009 19.1008 15.1008 20.0008 14.001 20.001H1.99023C0.890252 20.001 0.000107007 19.1009 0 18.001L0.00976562 2C0.00980161 0.900011 0.900014 4.85053e-05 2 0H10ZM2.00293 2V18.001H14.0039V7H9.00293V2H2.00293Z" fill="black"/>
              <line x1="4.00024" y1="11.2505" x2="12.0006" y2="11.2505" stroke="black" strokeWidth="1.5"/>
              <line x1="4.00024" y1="15.2507" x2="10.0005" y2="15.2507" stroke="black" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div data-layer="Statements details" className="StatementsDetails" style={{flex: '1 1 0', alignSelf: 'stretch', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="OrderHeader" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex', flexWrap: 'wrap', alignContent: 'flex-start'}}>
          <div data-layer="Frame 1321316873" className="Frame1321316873" style={{flex: '1 1 0', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', height: 12, textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заявление №</div>
          </div>
          <div data-layer="Button Container" className="ButtonContainer" style={{width: 777, height: 85, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', justifyContent: 'flex-end', alignItems: 'center', display: 'flex'}}>
            <div data-layer="Reject button" data-state="pressed" className="RejectButton" style={{width: 388.50, height: 85, overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Отклонить</div>
            </div>
            <div data-layer="Send button for approval" data-state="pressed" className="SendButtonForApproval" style={{width: 388.50, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Отправить на согласование</div>
            </div>
          </div>
        </div>
        <div data-layer="Application data section" className="ApplicationDataSection" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="Сounterparty Policyholder" data-state="not_pressed" className="OunterpartyPolicyholder" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div data-layer="Sections Policyholder" className="SectionsPolicyholder" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Страхователь</div>
              </div>
              <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_373_647)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43095 5.43083 0.916626 10.9998 0.916626C16.5688 0.916626 21.0832 5.43095 21.0832 11C21.0832 16.569 16.5688 21.0833 10.9998 21.0833C5.43083 21.0833 0.916504 16.569 0.916504 11ZM10.9998 2.74996C6.44335 2.74996 2.74984 6.44347 2.74984 11C2.74984 15.5564 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5564 19.2498 11C19.2498 6.44347 15.5563 2.74996 10.9998 2.74996ZM10.074 7.33329C10.074 6.82703 10.4844 6.41663 10.9907 6.41663H10.9998C11.5061 6.41663 11.9165 6.82703 11.9165 7.33329C11.9165 7.83955 11.5061 8.24996 10.9998 8.24996H10.9907C10.4844 8.24996 10.074 7.83955 10.074 7.33329ZM10.9998 10.0833C11.5061 10.0833 11.9165 10.4937 11.9165 11V14.6666C11.9165 15.1729 11.5061 15.5833 10.9998 15.5833C10.4936 15.5833 10.0832 15.1729 10.0832 14.6666V11C10.0832 10.4937 10.4936 10.0833 10.9998 10.0833Z" fill="black"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_373_647">
                  <rect width="22" height="22" fill="white"/>
                  </clipPath>
                  </defs>
                  </svg>
                </div>
              </div>
              <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле страхователь, чтобы заполнить данные</div>
            </div>
          </div>
          <div data-layer="Сounterparty Insured" data-state="not_pressed" className="OunterpartyInsured" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div data-layer="Sections Insured" className="SectionsInsured" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Застрахованный</div>
              </div>
              <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_373_1495)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43101 5.43083 0.916687 10.9998 0.916687C16.5688 0.916687 21.0832 5.43101 21.0832 11C21.0832 16.569 16.5688 21.0834 10.9998 21.0834C5.43083 21.0834 0.916504 16.569 0.916504 11ZM10.9998 2.75002C6.44335 2.75002 2.74984 6.44353 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.44353 15.5563 2.75002 10.9998 2.75002ZM10.074 7.33335C10.074 6.82709 10.4844 6.41669 10.9907 6.41669H10.9998C11.5061 6.41669 11.9165 6.82709 11.9165 7.33335C11.9165 7.83962 11.5061 8.25002 10.9998 8.25002H10.9907C10.4844 8.25002 10.074 7.83962 10.074 7.33335ZM10.9998 10.0834C11.5061 10.0834 11.9165 10.4938 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5834 10.9998 15.5834C10.4936 15.5834 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4938 10.4936 10.0834 10.9998 10.0834Z" fill="black"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_373_1495">
                  <rect width="22" height="22" fill="white"/>
                  </clipPath>
                  </defs>
                  </svg>
                </div>
              </div>
              <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле застрахованный, чтобы заполнить данные</div>
            </div>
          </div>
          <div data-layer="Сounterparty Beneficiary" data-state="not_pressed" className="OunterpartyBeneficiary" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div data-layer="Sections Beneficiary" className="SectionsBeneficiary" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Выгодоприобретатель</div>
              </div>
              <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43101 5.43083 0.916687 10.9998 0.916687C16.5688 0.916687 21.0832 5.43101 21.0832 11C21.0832 16.569 16.5688 21.0834 10.9998 21.0834C5.43083 21.0834 0.916504 16.569 0.916504 11ZM10.9998 2.75002C6.44335 2.75002 2.74984 6.44353 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.44353 15.5563 2.75002 10.9998 2.75002ZM10.074 7.33335C10.074 6.82709 10.4844 6.41669 10.9907 6.41669H10.9998C11.5061 6.41669 11.9165 6.82709 11.9165 7.33335C11.9165 7.83962 11.5061 8.25002 10.9998 8.25002H10.9907C10.4844 8.25002 10.074 7.83962 10.074 7.33335ZM10.9998 10.0834C11.5061 10.0834 11.9165 10.4938 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5834 10.9998 15.5834C10.4936 15.5834 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4938 10.4936 10.0834 10.9998 10.0834Z" fill="black"/>
                  </svg>
                </div>
              </div>
              <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле выгодоприобретатель, чтобы заполнить данные</div>
            </div>
          </div>
          <div data-layer="Insurance conditions" data-state="not_pressed" className="InsuranceConditions" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div data-layer="Sections Insurance conditions" className="SectionsInsuranceConditions" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Условия</div>
              </div>
              <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_373_843)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43098 5.43083 0.916656 10.9998 0.916656C16.5688 0.916656 21.0832 5.43098 21.0832 11C21.0832 16.569 16.5688 21.0833 10.9998 21.0833C5.43083 21.0833 0.916504 16.569 0.916504 11ZM10.9998 2.74999C6.44335 2.74999 2.74984 6.4435 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.4435 15.5563 2.74999 10.9998 2.74999ZM10.074 7.33332C10.074 6.82706 10.4844 6.41666 10.9907 6.41666H10.9998C11.5061 6.41666 11.9165 6.82706 11.9165 7.33332C11.9165 7.83958 11.5061 8.24999 10.9998 8.24999H10.9907C10.4844 8.24999 10.074 7.83958 10.074 7.33332ZM10.9998 10.0833C11.5061 10.0833 11.9165 10.4937 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5833 10.9998 15.5833C10.4936 15.5833 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4937 10.4936 10.0833 10.9998 10.0833Z" fill="black"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_373_843">
                  <rect width="22" height="22" fill="white"/>
                  </clipPath>
                  </defs>
                  </svg>
                </div>
              </div>
              <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле условия, чтобы заполнить данные</div>
            </div>
          </div>
          <div data-layer="Health questions" data-state="not_pressed" className="HealthQuestions" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div data-layer="Sections Health questions" className="SectionsHealthQuestions" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
              </div>
              <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_373_1383)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43099 5.43083 0.916672 10.9998 0.916672C16.5688 0.916672 21.0832 5.43099 21.0832 11C21.0832 16.569 16.5688 21.0833 10.9998 21.0833C5.43083 21.0833 0.916504 16.569 0.916504 11ZM10.9998 2.75001C6.44335 2.75001 2.74984 6.44352 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.44352 15.5563 2.75001 10.9998 2.75001ZM10.074 7.33334C10.074 6.82708 10.4844 6.41667 10.9907 6.41667H10.9998C11.5061 6.41667 11.9165 6.82708 11.9165 7.33334C11.9165 7.8396 11.5061 8.25001 10.9998 8.25001H10.9907C10.4844 8.25001 10.074 7.8396 10.074 7.33334ZM10.9998 10.0833C11.5061 10.0833 11.9165 10.4937 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5833 10.9998 15.5833C10.4936 15.5833 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4937 10.4936 10.0833 10.9998 10.0833Z" fill="black"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_373_1383">
                  <rect width="22" height="22" fill="white"/>
                  </clipPath>
                  </defs>
                  </svg>
                </div>
              </div>
              <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле анкета, чтобы заполнить данные</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Application;
