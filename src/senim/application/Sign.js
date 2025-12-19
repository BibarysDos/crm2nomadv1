import React, { useState } from 'react';

const Sign = ({ onBack, onSelectSigningMethod, taskId }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phoneNumber] = useState('+7 800 890 88 99');
  const [documentName] = useState('Заявление анкета.pdf');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [linkMethod, setLinkMethod] = useState(null);
  const [documentAttached, setDocumentAttached] = useState(false);

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handleSendCode = () => {
    // Отправляем код на телефон
    setCodeSent(true);
  };

  const handleConfirmCode = () => {
    if (!code.trim()) {
      alert('Введите код');
      return;
    }
    
    // Подтверждаем код и завершаем подписание
    if (onSelectSigningMethod) {
      onSelectSigningMethod(selectedMethod, true); // true - подписание завершено
    }
  };

  const handleBackToMethodSelection = () => {
    setSelectedMethod(null);
    setCodeSent(false);
    setCode('');
    setLinkMethod(null);
    setShowLinkMethodSelection(false);
    setDocumentAttached(false);
  };

  const [showLinkMethodSelection, setShowLinkMethodSelection] = useState(false);

  const handleSelectLinkMethod = (method) => {
    setLinkMethod(method);
  };

  const handleSaveLinkMethod = () => {
    if (!linkMethod) {
      alert('Выберите способ передачи ссылки');
      return;
    }
    // После сохранения возвращаемся к экрану Egov Mobile
    setShowLinkMethodSelection(false);
  };

  const handleOpenLinkMethodSelection = () => {
    setShowLinkMethodSelection(true);
  };

  // Если выбран Egov Mobile и открыт экран выбора способа передачи ссылки
  if (selectedMethod === 'egov' && showLinkMethodSelection) {
    const linkMethods = [
      { id: 'whatsapp', name: 'WhatsApp' },
      { id: 'sms', name: 'SMS' },
      { id: 'telegram', name: 'Telegram' },
      { id: 'email', name: 'E-mail' },
      { id: 'egovqr', name: 'Egov QR' }
    ];

    return (
      <div data-layer="List variants" className="ListVariants" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div 
            data-layer="Menu button" 
            className="MenuButton" 
            onClick={() => setShowLinkMethodSelection(false)}
            style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}
          >
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="List variants" className="ListVariants" style={{flex: '1 1 0', height: 982, background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Способ передачи ссылки</div>
              <div 
                data-layer="ActionButtonWithoutRounding" 
                data-state="pressed" 
                className="Actionbuttonwithoutrounding" 
                onClick={handleSaveLinkMethod}
                style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}
              >
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
              </div>
            </div>
          </div>
          <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            {linkMethods.map((method) => (
              <div 
                key={method.id}
                data-layer="InputContainerRadioButton" 
                data-state={linkMethod === method.id ? 'pressed' : 'not_pressed'} 
                className="Inputcontainerradiobutton" 
                onClick={() => handleSelectLinkMethod(method.id)}
                style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}
              >
                <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{method.name}</div>
                </div>
                <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                  {linkMethod === method.id ? (
                    <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{left: 35, top: 36, position: 'absolute'}}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6.5" stroke="black" fill="black"/>
                      </svg>
                    </div>
                  ) : (
                    <div data-svg-wrapper data-layer="Ellipse-off" className="EllipseOff" style={{left: 35, top: 36, position: 'absolute'}}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6.5" stroke="black"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Если выбран Egov Mobile, показываем экран Egov Mobile с полями
  if (selectedMethod === 'egov') {
    const linkMethodNames = {
      'whatsapp': 'WhatsApp',
      'sms': 'SMS',
      'telegram': 'Telegram',
      'email': 'E-mail',
      'egovqr': 'Egov QR'
    };

    const handleConfirmEgov = () => {
      if (!linkMethod) {
        alert('Выберите способ передачи ссылки');
        return;
      }
      // После подтверждения завершаем подписание
      if (onSelectSigningMethod) {
        onSelectSigningMethod('egov', true);
      }
    };

    return (
      <div data-layer="List variants" className="ListVariants" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div 
            data-layer="Menu button" 
            className="MenuButton" 
            onClick={handleBackToMethodSelection}
            style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}
          >
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="List variants" className="ListVariants" style={{flex: '1 1 0', height: 982, background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Egov Mobile</div>
              {linkMethod && (
                <div 
                  data-layer="ActionButtonWithoutRounding" 
                  data-state="pressed" 
                  className="Actionbuttonwithoutrounding" 
                  onClick={handleConfirmEgov}
                  style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}
                >
                  <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Подтвердить</div>
                </div>
              )}
            </div>
          </div>
          <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div 
              data-layer="InputContainerDictionaryButton" 
              data-state={linkMethod ? 'pressed' : 'not_pressed'} 
              className="Inputcontainerdictionarybutton" 
              onClick={handleOpenLinkMethodSelection}
              style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex', cursor: 'pointer'}}
            >
              {linkMethod ? (
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Способ передачи ссылки</div>
                  <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                    {linkMethodNames[linkMethod] || ''}
                  </div>
                </div>
              ) : (
                <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Способ передачи ссылки</div>
                </div>
              )}
              <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
                <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <div data-layer="InputContainerVisibilityButton" data-state="pressed" className="Inputcontainervisibilitybutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Документ</div>
                <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{documentName}</div>
              </div>
              <div data-layer="Frame 1" className="Frame1" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
                <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                  <div data-svg-wrapper data-layer="visibility" className="Visibility" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.9995 4.125C15.5828 4.125 19.4977 6.97583 21.0835 11C19.4977 15.0242 15.5828 17.875 10.9995 17.875C6.41632 17.8749 2.5023 15.0241 0.916504 11C2.5023 6.97593 6.41632 4.12514 10.9995 4.125ZM10.9995 5.95801C7.52548 5.95813 4.427 7.91093 2.91455 11C4.427 14.0891 7.52548 16.0419 10.9995 16.042C14.4736 16.042 17.5719 14.0891 19.0845 11C17.5719 7.91092 14.4736 5.95801 10.9995 5.95801ZM10.9995 6.875C13.2728 6.875 15.1245 8.72667 15.1245 11C15.1245 13.2733 13.2728 15.125 10.9995 15.125C8.72633 15.1248 6.87451 13.2732 6.87451 11C6.87451 8.72678 8.72633 6.87518 10.9995 6.875ZM10.9995 8.70801C9.73467 8.70819 8.7085 9.73511 8.7085 11C8.7085 12.2649 9.73467 13.2918 10.9995 13.292C12.2645 13.292 13.2915 12.265 13.2915 11C13.2915 9.735 12.2645 8.70801 10.9995 8.70801Z" fill="black"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadDocument = () => {
    // Логика скачивания документа
    console.log('Скачивание документа:', documentName);
    // Здесь должна быть реальная логика скачивания
  };

  const handleAttachDocument = () => {
    // Логика прикрепления документа
    console.log('Прикрепление документа');
    // Здесь должна быть реальная логика прикрепления файла
    setDocumentAttached(true);
  };

  const handleConfirmManual = () => {
    if (!documentAttached) {
      alert('Вложите подписанный документ');
      return;
    }
    // После подтверждения завершаем подписание
    if (onSelectSigningMethod) {
      onSelectSigningMethod('manual', true);
    }
  };

  // Если выбран метод "Ручная подпись"
  if (selectedMethod === 'manual') {
    return (
      <div data-layer="List variants" className="ListVariants" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div 
            data-layer="Menu button" 
            className="MenuButton" 
            onClick={handleBackToMethodSelection}
            style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}
          >
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="List variants" className="ListVariants" style={{flex: '1 1 0', height: 982, background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ручная подпись</div>
              <div 
                data-layer="ActionButtonWithoutRounding" 
                data-state="pressed" 
                className="Actionbuttonwithoutrounding" 
                onClick={handleConfirmManual}
                style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}
              >
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Подписать</div>
              </div>
            </div>
          </div>
          <div data-layer="Alert" className="Alert" style={{width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div data-layer="Info container" className="InfoContainer" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_1053_19133)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11.0013C0.916504 5.43229 5.43083 0.917969 10.9998 0.917969C16.5688 0.917969 21.0832 5.43229 21.0832 11.0013C21.0832 16.5703 16.5688 21.0846 10.9998 21.0846C5.43083 21.0846 0.916504 16.5703 0.916504 11.0013ZM10.9998 2.7513C6.44335 2.7513 2.74984 6.44481 2.74984 11.0013C2.74984 15.5578 6.44335 19.2513 10.9998 19.2513C15.5563 19.2513 19.2498 15.5578 19.2498 11.0013C19.2498 6.44481 15.5563 2.7513 10.9998 2.7513ZM10.074 7.33464C10.074 6.82837 10.4844 6.41797 10.9907 6.41797H10.9998C11.5061 6.41797 11.9165 6.82837 11.9165 7.33464C11.9165 7.8409 11.5061 8.2513 10.9998 8.2513H10.9907C10.4844 8.2513 10.074 7.8409 10.074 7.33464ZM10.9998 10.0846C11.5061 10.0846 11.9165 10.495 11.9165 11.0013V14.668C11.9165 15.1742 11.5061 15.5846 10.9998 15.5846C10.4936 15.5846 10.0832 15.1742 10.0832 14.668V11.0013C10.0832 10.495 10.4936 10.0846 10.9998 10.0846Z" fill="black"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1053_19133">
                      <rect width="22" height="22" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Скачайте документ, передайте клиенту для подписание, вложите отсканированный подписанный документ.</div>
          </div>
          <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div 
              data-layer="InputContainerDownloadButton" 
              data-state="pressed" 
              className="Inputcontainerdownloadbutton" 
              style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}
            >
              <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Документ</div>
                <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{documentName}</div>
              </div>
              <div 
                data-layer="Open button" 
                className="OpenButton" 
                onClick={handleDownloadDocument}
                style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}
              >
                <div data-svg-wrapper data-layer="Download" className="Download" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 18.5L5 12.5L6.41016 11.0801L10 14.6699L10 0.5L12 0.5L12 14.6699L15.5898 11.0898L17 12.5L11 18.5ZM17 21.5L5 21.5V19.5L17 19.5V21.5Z" fill="black"/>
                  </svg>
                </div>
              </div>
            </div>
            <div 
              data-layer="InputContainerAttachButton" 
              data-state={documentAttached ? 'pressed' : 'not_pressed'} 
              className="Inputcontainerattachbutton" 
              style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}
            >
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Вложить документ</div>
              </div>
              <div 
                data-layer="Open button" 
                className="OpenButton" 
                onClick={handleAttachDocument}
                style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}
              >
                <div data-svg-wrapper data-layer="Attach" className="Attach" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.4653 2.1888C13.7354 2.1888 13.0354 2.47875 12.5193 2.99486L4.09511 11.419C3.235 12.2791 2.75179 13.4457 2.75179 14.6621C2.75179 15.8785 3.235 17.045 4.09511 17.9052C4.95523 18.7653 6.1218 19.2485 7.33818 19.2485C8.55457 19.2485 9.72114 18.7653 10.5813 17.9052L19.0054 9.48099C19.3634 9.12301 19.9438 9.12301 20.3018 9.48099C20.6598 9.83897 20.6598 10.4194 20.3018 10.7774L11.8776 19.2015C10.6737 20.4055 9.0408 21.0818 7.33818 21.0818C5.63557 21.0818 4.00268 20.4055 2.79875 19.2015C1.59482 17.9976 0.918457 16.3647 0.918457 14.6621C0.918457 12.9595 1.59482 11.3266 2.79875 10.1227L11.2229 1.69849C12.0828 0.838569 13.2491 0.355469 14.4653 0.355469C15.6814 0.355469 16.8477 0.838569 17.7076 1.69849C18.5675 2.55842 19.0506 3.72472 19.0506 4.94084C19.0506 6.15696 18.5675 7.32327 17.7076 8.18319L9.27428 16.6074C8.75837 17.1233 8.05863 17.4131 7.32902 17.4131C6.5994 17.4131 5.89967 17.1233 5.38375 16.6074C4.86784 16.0914 4.578 15.3917 4.578 14.6621C4.578 13.9325 4.86784 13.2327 5.38375 12.7168L13.1666 4.94311C13.5248 4.58534 14.1052 4.58568 14.463 4.94388C14.8208 5.30207 14.8204 5.88247 14.4622 6.24024L6.68011 14.0132C6.50825 14.1853 6.41133 14.4189 6.41133 14.6621C6.41133 14.9055 6.50801 15.1389 6.68011 15.311C6.85221 15.4831 7.08563 15.5798 7.32902 15.5798C7.5724 15.5798 7.80582 15.4831 7.97792 15.311L16.4113 6.88683C16.9271 6.37075 17.2173 5.67056 17.2173 4.94084C17.2173 4.21095 16.9274 3.51096 16.4113 2.99486C15.8951 2.47875 15.1952 2.1888 14.4653 2.1888Z" fill="black"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если метод выбран, показываем форму для этого метода
  if (selectedMethod === 'otp') {
    return (
      <div data-layer="List variants" className="ListVariants" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div 
            data-layer="Menu button" 
            className="MenuButton" 
            onClick={handleBackToMethodSelection}
            style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}
          >
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="List variants" className="ListVariants" style={{flex: '1 1 0', height: 982, background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>OTP подписание</div>
              <div 
                data-layer="ActionButtonWithoutRounding" 
                data-state="pressed" 
                className="Actionbuttonwithoutrounding" 
                onClick={codeSent ? handleConfirmCode : handleSendCode}
                style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}
              >
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                  {codeSent ? 'Подтвердить' : 'Отправить код'}
                </div>
              </div>
            </div>
          </div>
          <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div data-layer="InputContainerVisibilityButton" data-state="pressed" className="Inputcontainervisibilitybutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заявление</div>
                <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{documentName}</div>
              </div>
              <div data-layer="Frame 1" className="Frame1" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
                <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                  <div data-svg-wrapper data-layer="visibility" className="Visibility" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.9995 4.125C15.5828 4.125 19.4977 6.97583 21.0835 11C19.4977 15.0242 15.5828 17.875 10.9995 17.875C6.41632 17.8749 2.5023 15.0241 0.916504 11C2.5023 6.97593 6.41632 4.12514 10.9995 4.125ZM10.9995 5.95801C7.52548 5.95813 4.427 7.91093 2.91455 11C4.427 14.0891 7.52548 16.0419 10.9995 16.042C14.4736 16.042 17.5719 14.0891 19.0845 11C17.5719 7.91092 14.4736 5.95801 10.9995 5.95801ZM10.9995 6.875C13.2728 6.875 15.1245 8.72667 15.1245 11C15.1245 13.2733 13.2728 15.125 10.9995 15.125C8.72633 15.1248 6.87451 13.2732 6.87451 11C6.87451 8.72678 8.72633 6.87518 10.9995 6.875ZM10.9995 8.70801C9.73467 8.70819 8.7085 9.73511 8.7085 11C8.7085 12.2649 9.73467 13.2918 10.9995 13.292C12.2645 13.292 13.2915 12.265 13.2915 11C13.2915 9.735 12.2645 8.70801 10.9995 8.70801Z" fill="black"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div data-layer="InputContainerWithoutButton" data-state="pressed" className="Inputcontainerwithoutbutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Номер телефона</div>
                <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{phoneNumber}</div>
              </div>
            </div>
            {codeSent && (
              <div data-layer="InputContainerWithoutButton" data-state="pressed" className="Inputcontainerwithoutbutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Код</div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Введите код"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: '#071222',
                      fontSize: 16,
                      fontFamily: 'Inter',
                      fontWeight: '500',
                      width: '100%',
                      padding: 0,
                      alignSelf: 'stretch'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Форма выбора метода подписания
  return (
    <div data-layer="List variants" className="ListVariants" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div 
          data-layer="Menu button" 
          className="MenuButton" 
          onClick={onBack}
          style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}
        >
          <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
      <div data-layer="List variants" className="ListVariants" style={{flex: '1 1 0', height: 982, background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Выбор метода подписания</div>
          </div>
        </div>
        <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div 
            data-layer="InputContainerDictionaryButton" 
            data-state="not_pressed" 
            className="Inputcontainerdictionarybutton" 
            onClick={() => handleSelectMethod('otp')}
            style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex', cursor: 'pointer'}}
          >
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>OTP подписание</div>
            </div>
            <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
          <div 
            data-layer="InputContainerDictionaryButton" 
            data-state="not_pressed" 
            className="Inputcontainerdictionarybutton" 
            onClick={() => handleSelectMethod('egov')}
            style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex', cursor: 'pointer'}}
          >
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Egov Mobile</div>
            </div>
            <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
          <div 
            data-layer="InputContainerDictionaryButton" 
            data-state="not_pressed" 
            className="Inputcontainerdictionarybutton" 
            onClick={() => handleSelectMethod('manual')}
            style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex', cursor: 'pointer'}}
          >
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ручная подпись</div>
            </div>
            <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sign;
