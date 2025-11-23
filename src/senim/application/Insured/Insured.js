import React, { useState, useEffect } from 'react';
import OtherChild from './Other-child';
import OwnChild from './Own-child';
import PolicyholderInsured from './PolicyholderInsured';
import OtherPerson from './Other-person';

const Insured = ({ onBack, policyholderData, onSave, applicationId, savedInsuredData }) => {
  const [selectedInsuredType, setSelectedInsuredType] = useState('');
  const [currentView, setCurrentView] = useState('main');

  // Проверка сохраненных данных при монтировании
  useEffect(() => {
    if (savedInsuredData && savedInsuredData.fullData) {
      // Определяем тип застрахованного по сохраненным данным
      const insuredType = savedInsuredData.fullData.insuredType;
      if (insuredType === 'own-child') {
        setSelectedInsuredType('own-child');
        setCurrentView('own-child');
      } else if (insuredType === 'other-child') {
        setSelectedInsuredType('other-child');
        setCurrentView('other-child');
      } else if (insuredType === 'policyholder') {
        setSelectedInsuredType('policyholder');
        setCurrentView('policyholder');
      } else if (insuredType === 'other-person') {
        setSelectedInsuredType('other-person');
        setCurrentView('other-person');
      }
    }
  }, [savedInsuredData]);

  const handleInsuredTypeSelect = (type) => {
    // Все типы активны
    if (type === 'other-child' || type === 'own-child' || type === 'policyholder' || type === 'other-person') {
      setSelectedInsuredType(type);
    } else {
      // Для остальных показываем сообщение "В разработке"
      alert('В разработке');
    }
  };

  const handleContinue = () => {
    if (selectedInsuredType === 'other-child') {
      setCurrentView('other-child');
    } else if (selectedInsuredType === 'own-child') {
      setCurrentView('own-child');
    } else if (selectedInsuredType === 'policyholder') {
      setCurrentView('policyholder');
    } else if (selectedInsuredType === 'other-person') {
      setCurrentView('other-person');
    } else if (selectedInsuredType) {
      // Для других типов показываем сообщение
      alert('В разработке');
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  // Роутинг на компоненты типов
  if (currentView === 'other-child') {
    return <OtherChild onBack={onBack} onSave={onSave} applicationId={applicationId} policyholderData={policyholderData} savedData={savedInsuredData} />;
  }
  if (currentView === 'own-child') {
    return <OwnChild onBack={onBack} onSave={onSave} applicationId={applicationId} policyholderData={policyholderData} savedData={savedInsuredData} onOpenTypes={handleBackToMain} />;
  }
  if (currentView === 'policyholder') {
    return <PolicyholderInsured onBack={onBack} onSave={onSave} applicationId={applicationId} policyholderData={policyholderData} savedData={savedInsuredData} onOpenTypes={handleBackToMain} />;
  }
  if (currentView === 'other-person') {
    return <OtherPerson onBack={onBack} onSave={onSave} applicationId={applicationId} savedData={savedInsuredData} onOpenTypes={handleBackToMain} />;
  }

  // Основной вид - выбор типа
  return (
    <div data-layer="List variants" className="ListVariants" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Menu button" className="MenuButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
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
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Тип Застрахованного</div>
            <div data-layer="ActionButtonWithoutRounding" data-state="pressed" className="Actionbuttonwithoutrounding" onClick={handleContinue} style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
              <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Продолжить</div>
            </div>
          </div>
        </div>
        <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="InputContainerRadioButton" data-state={selectedInsuredType === 'own-child' ? 'pressed' : 'not_pressed'} className="Inputcontainerradiobutton" onClick={() => handleInsuredTypeSelect('own-child')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Для своего ребенка</div>
            </div>
            <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              {selectedInsuredType === 'own-child' ? (
                <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{left: 35, top: 36, position: 'absolute'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="6.5" fill="black" stroke="black"/>
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
          <div data-layer="InputContainerRadioButton" data-state={selectedInsuredType === 'other-child' ? 'pressed' : 'not_pressed'} className="Inputcontainerradiobutton" onClick={() => handleInsuredTypeSelect('other-child')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Для иного ребенка</div>
            </div>
            <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              {selectedInsuredType === 'other-child' ? (
                <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{left: 35, top: 36, position: 'absolute'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="6.5" fill="black" stroke="black"/>
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
          <div data-layer="InputContainerRadioButton" data-state={selectedInsuredType === 'policyholder' ? 'pressed' : 'not_pressed'} className="Inputcontainerradiobutton" onClick={() => handleInsuredTypeSelect('policyholder')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Страхователь является Застрахованным</div>
            </div>
            <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              {selectedInsuredType === 'policyholder' ? (
                <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{left: 35, top: 36, position: 'absolute'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="6.5" fill="black" stroke="black"/>
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
          <div data-layer="InputContainerRadioButton" data-state={selectedInsuredType === 'other-person' ? 'pressed' : 'not_pressed'} className="Inputcontainerradiobutton" onClick={() => handleInsuredTypeSelect('other-person')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Иное лицо</div>
            </div>
            <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              {selectedInsuredType === 'other-person' ? (
                <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{left: 35, top: 36, position: 'absolute'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="6.5" fill="black" stroke="black"/>
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
        </div>
      </div>
    </div>
  );
};

export default Insured;

