import React, { useEffect } from 'react';

const WithoutManager = ({
  onBack,
  questionnaireData,
  handleSaveQuestionnaire,
  setCurrentView
}) => {
  // Показываем alert при открытии
  useEffect(() => {
    alert('Нажмите на кнопку "Отправить анкету клиенту"');
  }, []);

  // Рендеринг меню
  const renderMenu = () => (
    <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div data-layer="Back button" className="BackButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
        <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  );

  // Обработчик отправки анкеты клиенту
  const handleSendToClient = async () => {
    try {
      // Здесь будет логика отправки анкеты клиенту
      await handleSaveQuestionnaire();
      alert('Анкета отправлена клиенту');
      // После успешного сохранения возвращаемся в заявку
      if (onBack) {
        onBack();
      }
    } catch (error) {
      // Ошибка уже обработана в handleSaveQuestionnaire
      // Не вызываем onBack при ошибке
    }
  };

  return (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, height: 982, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, height: 982, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSendToClient} style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Отправить анкету клиенту</div>
              </div>
            </div>
          </div>
        </div>
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="Alert" className="Alert" style={{width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div data-layer="Info container" className="InfoContainer" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_535_15378)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.916016 10.9993C0.916016 5.43034 5.43034 0.916016 10.9993 0.916016C16.5684 0.916016 21.0827 5.43034 21.0827 10.9993C21.0827 16.5684 16.5684 21.0827 10.9993 21.0827C5.43034 21.0827 0.916016 16.5684 0.916016 10.9993ZM10.9993 2.74935C6.44286 2.74935 2.74935 6.44286 2.74935 10.9993C2.74935 15.5558 6.44286 19.2494 10.9993 19.2494C15.5558 19.2494 19.2494 15.5558 19.2494 10.9993C19.2494 6.44286 15.5558 2.74935 10.9993 2.74935ZM10.0735 7.33268C10.0735 6.82642 10.4839 6.41602 10.9902 6.41602H10.9993C11.5056 6.41602 11.916 6.82642 11.916 7.33268C11.916 7.83894 11.5056 8.24935 10.9993 8.24935H10.9902C10.4839 8.24935 10.0735 7.83894 10.0735 7.33268ZM10.9993 10.0827C11.5056 10.0827 11.916 10.4931 11.916 10.9993V14.666C11.916 15.1723 11.5056 15.5827 10.9993 15.5827C10.4931 15.5827 10.0827 15.1723 10.0827 14.666V10.9993C10.0827 10.4931 10.4931 10.0827 10.9993 10.0827Z" fill="black"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_535_15378">
                      <rect width="22" height="22" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на кнопку "Отправить анкету клиенту"</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithoutManager;
