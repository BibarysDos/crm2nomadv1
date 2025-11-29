import React from 'react';

const QuestionaryCard = ({ hasQuestionary, questionnaireData, onOpen }) => {
  // Проверяем, заполнена ли декларация
  // Декларация заполнена, если все вопросы декларации (questionCode 1-21) имеют ответы
  const isDeclarationFilled = () => {
    if (!questionnaireData?.contragentQuestionnaires) {
      return false;
    }
    
    // Фильтруем вопросы декларации (questionCode от 1 до 21)
    const declarationQuestions = questionnaireData.contragentQuestionnaires.filter(q => {
      if (!q.questionCode) return false; // Включаем только вопросы с questionCode
      const questionCodeNum = parseInt(q.questionCode);
      return questionCodeNum >= 1 && questionCodeNum <= 21;
    });
    
    // Если нет вопросов декларации, считаем не заполненной
    if (declarationQuestions.length === 0) {
      return false;
    }
    
    // Проверяем, что все вопросы декларации имеют ответы
    return declarationQuestions.every(q => {
      // Для справочника проверяем answerId или answerCode
      if (q.answerTypeCode === 'dic') {
        return !!(q.answerId || q.answerCode);
      }
      // Для числовых полей проверяем answer
      if (q.answerTypeCode === 'num') {
        return !!(q.answer && String(q.answer).trim() !== '');
      }
      // Для других типов проверяем наличие любого ответа
      return !!(q.answerId || q.answerCode || (q.answer && String(q.answer).trim() !== ''));
    });
  };

  // Проверяем, заполнен ли бланк-опросник
  // Бланк-опросник заполнен, если все вопросы бланк-опросника (questionCode 22-45) имеют ответы
  const isQuestionnaireFilled = () => {
    if (!questionnaireData?.contragentQuestionnaires) {
      return false;
    }
    
    // Фильтруем вопросы бланк-опросника (questionCode от 22 до 45)
    const questionnaireQuestions = questionnaireData.contragentQuestionnaires.filter(q => {
      if (!q.questionCode) return false;
      const questionCodeNum = parseInt(q.questionCode);
      return questionCodeNum >= 22 && questionCodeNum <= 45;
    });
    
    // Если нет вопросов бланк-опросника, считаем не заполненным
    if (questionnaireQuestions.length === 0) {
      return false;
    }
    
    // Проверяем, что все вопросы бланк-опросника имеют ответы
    return questionnaireQuestions.every(q => {
      // Для справочника проверяем answerId или answerCode
      if (q.answerTypeCode === 'dic') {
        return !!(q.answerId || q.answerCode);
      }
      // Для числовых полей проверяем answer
      if (q.answerTypeCode === 'num') {
        return !!(q.answer && String(q.answer).trim() !== '');
      }
      // Для других типов проверяем наличие любого ответа
      return !!(q.answerId || q.answerCode || (q.answer && String(q.answer).trim() !== ''));
    });
  };

  const declarationStatus = isDeclarationFilled() ? 'Заполнено' : 'Не заполнено';
  const questionnaireStatus = isQuestionnaireFilled() ? 'Заполнено' : 'Не заполнено';
  
  return (
    <div
      data-layer="Health questions"
      data-state={hasQuestionary ? 'pressed' : 'not_pressed'}
      className="HealthQuestions"
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
        data-layer="Sections Health questions"
        className="SectionsHealthQuestions"
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
            Анкета
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
      {hasQuestionary ? (
        <>
          <div
            data-layer="Info container"
            className="InfoContainer"
            style={{
              alignSelf: 'stretch',
              height: 85,
              paddingLeft: 20,
              paddingRight: 20,
              background: 'white',
              overflow: 'hidden',
              borderBottom: '1px #F8E8E8 solid',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              display: 'flex'
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
              Декларация о состоянии здоровья Застрахованного
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
              {declarationStatus}
            </div>
          </div>
          {/* Показываем статус бланк-опросника, если есть вопросы бланк-опросника */}
          {questionnaireData?.contragentQuestionnaires?.some(q => {
            if (!q.questionCode) return false;
            const questionCodeNum = parseInt(q.questionCode);
            return questionCodeNum >= 22 && questionCodeNum <= 45;
          }) && (
            <div
              data-layer="Info container"
              className="InfoContainer"
              style={{
                alignSelf: 'stretch',
                height: 85,
                paddingLeft: 20,
                paddingRight: 20,
                background: 'white',
                overflow: 'hidden',
                borderBottom: '1px #F8E8E8 solid',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                display: 'flex'
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
                Бланк-опросник
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
                {questionnaireStatus}
              </div>
            </div>
          )}
          {questionnaireData?.fillWithoutManager !== undefined && (
            <div
              data-layer="Info container"
              className="InfoContainer"
              style={{
                alignSelf: 'stretch',
                height: 85,
                paddingLeft: 20,
                paddingRight: 20,
                background: 'white',
                overflow: 'hidden',
                borderBottom: '1px #F8E8E8 solid',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                display: 'flex'
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
                Режим заполнения
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
                {questionnaireData.fillWithoutManager ? 'Без менеджера' : 'С менеджером'}
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
                <g clipPath="url(#clip0_373_1383)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.916504 11C0.916504 5.43099 5.43083 0.916672 10.9998 0.916672C16.5688 0.916672 21.0832 5.43099 21.0832 11C21.0832 16.569 16.5688 21.0833 10.9998 21.0833C5.43083 21.0833 0.916504 16.569 0.916504 11ZM10.9998 2.75001C6.44335 2.75001 2.74984 6.44352 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.44352 15.5563 2.75001 10.9998 2.75001ZM10.074 7.33334C10.074 6.82708 10.4844 6.41667 10.9907 6.41667H10.9998C11.5061 6.41667 11.9165 6.82708 11.9165 7.33334C11.9165 7.8396 11.5061 8.25001 10.9998 8.25001H10.9907C10.4844 8.25001 10.074 7.8396 10.074 7.33334ZM10.9998 10.0833C11.5061 10.0833 11.9165 10.4937 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5833 10.9998 15.5833C10.4936 15.5833 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4937 10.4936 10.0833 10.9998 10.0833Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_373_1383">
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
            Нажмите на поле анкета, чтобы заполнить данные
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionaryCard;
