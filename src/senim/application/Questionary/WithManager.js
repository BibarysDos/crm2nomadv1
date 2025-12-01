import React, { useState, useEffect } from 'react';
import AnswerSelection from './AnswerSelection';

const WithManager = ({
  onBack,
  questionnaireData,
  loadQuestionAnswers,
  updateQuestionAnswer,
  handleSaveQuestionnaire,
  setCurrentView,
  currentView,
  loadQuestionnaire
}) => {
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [currentQuestionAnswers, setCurrentQuestionAnswers] = useState([]);
  const [activeDetailedField, setActiveDetailedField] = useState(null);
  const [showBlank, setShowBlank] = useState(false);
  const [answerAllNo, setAnswerAllNo] = useState(false);

  // Проверяем, есть ли ответ "да" на любой вопрос декларации
  useEffect(() => {
    if (questionnaireData?.contragentQuestionnaires) {
      // Фильтруем вопросы декларации (questionCode от 1 до 21)
      const declarationQuestions = questionnaireData.contragentQuestionnaires.filter(q => {
        if (!q.questionCode) return false;
        const questionCodeNum = parseInt(q.questionCode);
        return questionCodeNum >= 1 && questionCodeNum <= 21;
      });

      // Проверяем все вопросы декларации - если хотя бы на один ответ "да", показываем бланк-опросник
      const hasYesAnswer = declarationQuestions.some(q => {
        const isYes = q.answerCode === 'yes' ||
          q.answerName === 'Да' ||
          (q.answerName && q.answerName.toLowerCase().includes('да'));
        return isYes;
      });
      
      setShowBlank(hasYesAnswer);
    } else {
      setShowBlank(false);
    }
  }, [questionnaireData]);

  // Обработчик открытия выбора ответа
  const handleOpenAnswerSelection = async (questionId, questionCode, answerTypeCode) => {
    setCurrentQuestionId(questionId);

    if (answerTypeCode === 'dic' && questionCode) {
      const answers = await loadQuestionAnswers(questionCode);
      setCurrentQuestionAnswers(answers);
    } else {
      setCurrentQuestionAnswers([]);
    }

    setCurrentView('answerSelection');
  };

  // Обработчик сохранения ответа
  const handleSaveAnswer = (answerId, answerCode, answerName) => {
    if (!currentQuestionId) return;
    // Если это вопрос из бланк-опросника (начинается с blank-), сохраняем с questionName
    if (currentQuestionId.startsWith('blank-')) {
      const questionKey = currentQuestionId.replace('blank-', '');
      // Находим вопрос по ключу или создаем новый
      const existingQuestion = questionnaireData?.contragentQuestionnaires?.find(
        q => q.questionCode === questionKey || q.questionName?.includes(questionKey)
      );
      if (existingQuestion) {
        updateQuestionAnswer(existingQuestion.questionId, answerId, answerCode, answerName);
      } else {
        // Для статичных вопросов сохраняем через updateQuestionAnswer с временным ID
        updateQuestionAnswer(currentQuestionId, answerId, answerCode, answerName);
      }
    } else {
      updateQuestionAnswer(currentQuestionId, answerId, answerCode, answerName);
    }
    setCurrentView('questions');
  };

  // Обработчик изменения подробного ответа
  const handleDetailedAnswerChange = (questionId, value) => {
    // Получаем текущие данные вопроса
    const question = questionnaireData?.contragentQuestionnaires?.find(q => q.questionId === questionId);
    const currentAnswerId = question?.answerId || null;
    const currentAnswerCode = question?.answerCode || null;
    const currentAnswerName = question?.answerName || null;

    // Проверяем, это бланк-опросник или декларация
    const isQuestionnaire = questionnaireData?.questionnaireTypeCode === 'questionnaire';
    if (isQuestionnaire) {
      // В бланк-опроснике сохраняем в "answer"
      updateQuestionAnswer(questionId, currentAnswerId, currentAnswerCode, currentAnswerName, value, null);
    } else {
      // В декларации сохраняем в "explanation"
      updateQuestionAnswer(questionId, currentAnswerId, currentAnswerCode, currentAnswerName, null, value);
    }
  };

  // Обработчик потери фокуса поля подробного ответа
  const handleDetailedFieldBlur = (questionId) => {
    const question = questionnaireData?.contragentQuestionnaires?.find(q => q.questionId === questionId);
    if (!question?.explanation || question.explanation.trim() === '') {
      setActiveDetailedField(null);
    }
  };

  // Получаем текст ответа
  const getAnswerText = (questionId) => {
    const question = questionnaireData?.contragentQuestionnaires?.find(q => q.questionId === questionId);
    return question?.answerName || question?.answerCode || 'Ответ';
  };

  // Получаем подробный ответ
  const getDetailedAnswer = (questionId) => {
    const question = questionnaireData?.contragentQuestionnaires?.find(q => q.questionId === questionId);
    // В бланк-опроснике используем answer, в декларации - explanation
    const isQuestionnaire = questionnaireData?.questionnaireTypeCode === 'questionnaire';
    if (isQuestionnaire) {
      return question?.answer || '';
    }
    return question?.explanation || '';
  };

  // Проверяем, есть ли ответ "Да"
  const isYes = (questionId) => {
    const question = questionnaireData?.contragentQuestionnaires?.find(q => q.questionId === questionId);
    return question?.answerCode === 'yes' || question?.answerName === 'Да';
  };


  // Обработчик "Ответить на все вопросы нет"
  const handleAnswerAllNo = async () => {
    const newValue = !answerAllNo;
    setAnswerAllNo(newValue);

    if (newValue) {
      // Получаем все вопросы текущего типа (декларация или бланк-опросник)
      const isQuestionnaire = questionnaireData?.questionnaireTypeCode === 'questionnaire';
      const questions = (questionnaireData?.contragentQuestionnaires || []).filter(q => {
        if (!q.questionCode) return false;
        const questionCodeNum = parseInt(q.questionCode);
        if (isQuestionnaire) {
          return questionCodeNum >= 22 && questionCodeNum <= 45;
        } else {
          return questionCodeNum >= 1 && questionCodeNum <= 21;
        }
      });

      // Один раз загружаем ответ "Нет" из справочника (используем первый вопрос для получения справочника)
      const firstQuestion = questions.find(q => q.answerTypeCode !== 'num');
      let noAnswer = null;
      if (firstQuestion) {
        const answers = await loadQuestionAnswers(firstQuestion.questionCode || '1');
        noAnswer = answers.find(a => a.code === 'no' || a.nameRu === 'Нет');
      }

      // Проставляем ответ "Нет" всем вопросам локально (без await, чтобы все обновления были в одном цикле)
      questions.forEach(question => {
        // Пропускаем числовые поля
        if (question.answerTypeCode === 'num') return;

        if (noAnswer) {
          updateQuestionAnswer(question.questionId, noAnswer.id, noAnswer.code, noAnswer.nameRu);
        } else {
          // Если не нашли в справочнике, используем стандартные значения
          updateQuestionAnswer(question.questionId, null, 'no', 'Нет');
        }
      });
    } else {
      // Если тогл выключен, очищаем все ответы
      const isQuestionnaire = questionnaireData?.questionnaireTypeCode === 'questionnaire';
      const questions = (questionnaireData?.contragentQuestionnaires || []).filter(q => {
        if (!q.questionCode) return false;
        const questionCodeNum = parseInt(q.questionCode);
        if (isQuestionnaire) {
          return questionCodeNum >= 22 && questionCodeNum <= 45;
        } else {
          return questionCodeNum >= 1 && questionCodeNum <= 21;
        }
      });

      questions.forEach(question => {
        if (question.answerTypeCode === 'num') return;
        updateQuestionAnswer(question.questionId, null, null, null, null, null);
      });
    }
  };

  // Получаем числовое значение ответа
  const getNumericAnswer = (questionId) => {
    const question = questionnaireData?.contragentQuestionnaires?.find(q => q.questionId === questionId);
    return question?.answer || '';
  };

  // Обработчик изменения числового ответа
  const handleNumericAnswerChange = (questionId, value) => {
    // Разрешаем только числа
    const numericValue = value.replace(/[^\d]/g, '');

    // Получаем текущие данные вопроса
    const question = questionnaireData?.contragentQuestionnaires?.find(q => q.questionId === questionId);
    const currentAnswerId = question?.answerId || null;
    const currentAnswerCode = question?.answerCode || null;
    const currentAnswerName = question?.answerName || null;

    updateQuestionAnswer(questionId, currentAnswerId, currentAnswerCode, currentAnswerName, numericValue, null);
  };

  // Рендеринг вопроса
  const renderQuestion = (question, questionIndex = null) => {
    const questionId = question.questionId;
    const questionText = question.questionName;
    const questionCode = question.questionCode;
    const answerTypeCode = question.answerTypeCode;
    // Используем переданный индекс, если он есть, иначе вычисляем из order
    const questionNumber = questionIndex !== null ? questionIndex + 1 : (question.order !== null && question.order !== undefined ? question.order + 1 : null);

    // Если это числовое поле (рост, вес)
    if (answerTypeCode === 'num') {
      const numericValue = getNumericAnswer(questionId);
      const isActive = activeDetailedField === questionId;
      const hasValue = !!numericValue && numericValue.trim() !== '';

      return (
        <React.Fragment key={questionId}>
          <div
            data-layer="InputContainerWithoutButton"
            data-state={isActive || hasValue ? "pressed" : "not_pressed"}
            className="Inputcontainerwithoutbutton"
            onClick={(e) => {
              if (!isActive) {
                e.stopPropagation();
                setActiveDetailedField(questionId);
              }
            }}
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
              display: 'inline-flex',
              cursor: isActive ? 'text' : 'pointer'
            }}
          >
            <div data-layer="Text field container" className="TextFieldContainer" style={{ flex: '1 1 0', paddingTop: isActive || hasValue ? 12 : 20, paddingBottom: isActive || hasValue ? 12 : 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex' }}>
              {isActive || hasValue ? (
                <>
                  <div data-layer="LabelDefault" className="Labeldefault" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{questionText}</div>
                  <div data-layer="%Input text" className="InputText" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={numericValue || ''}
                      onChange={(e) => handleNumericAnswerChange(questionId, e.target.value)}
                      onBlur={() => {
                        if (!numericValue || String(numericValue).trim() === '') {
                          setActiveDetailedField(null);
                        }
                      }}
                      onFocus={() => setActiveDetailedField(questionId)}
                      autoFocus={isActive}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: 16,
                        fontFamily: 'Inter',
                        fontWeight: '500',
                        color: '#071222',
                        paddingLeft: 0,
                        marginLeft: 0
                      }}
                    />
                  </div>
                </>
              ) : (
                <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{questionText}</div>
              )}
            </div>
          </div>
        </React.Fragment>
      );
    }

    // Обычный вопрос со справочником
    const answer = getAnswerText(questionId);
    const isFilled = answer !== 'Ответ';
    const detailedAnswer = getDetailedAnswer(questionId);
    const isYesAnswer = isYes(questionId);
    const displayValue = isFilled ? answer : '';

    return (
      <React.Fragment key={questionId}>
        <div data-layer="MessageContainer" data-type="desktop" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
          <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{questionText}</div>
        </div>
        <div data-layer="InputContainerDictionaryButton" data-state={isFilled ? "pressed" : "not_pressed"} className="Inputcontainerdictionarybutton" onClick={() => handleOpenAnswerSelection(questionId, questionCode, answerTypeCode)} style={{ width: 1427, height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
          {isFilled ? (
            <div data-layer="Text field container" className="TextFieldContainer" style={{ flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex' }}>
              <div data-layer="Label" className="Label" style={{ alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Ответ</div>
              <div data-layer="Input text" className="InputText" style={{ alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{displayValue}</div>
            </div>
          ) : (
            <div data-layer="Text container" className="TextContainer" style={{ flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
              <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Ответ</div>
            </div>
          )}
          <div data-layer="Open button" className="OpenButton" onClick={(e) => { e.stopPropagation(); handleOpenAnswerSelection(questionId, questionCode, answerTypeCode); }} style={{ width: 85, alignSelf: 'stretch', position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer' }}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{ left: 31, top: 32, position: 'absolute' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        {/* Показываем поле подробного ответа только в бланк-опроснике, не в декларации */}
        {isYesAnswer && questionnaireData?.questionnaireTypeCode === 'questionnaire' && (() => {
          const isActive = activeDetailedField === questionId;
          const hasValue = !!detailedAnswer && String(detailedAnswer).trim() !== '';
          const labelText = questionNumber ? `Ответьте подробнее на «Вопрос ${questionNumber}»` : 'Ответьте подробнее';

          return (
            <div
              data-layer="InputContainerWithoutButton"
              data-state={isActive || hasValue ? "pressed" : "not_pressed"}
              className="Inputcontainerwithoutbutton"
              onClick={(e) => {
                // Не обрабатываем клик если поле уже активно или клик был на input
                if (!isActive && e.target.tagName !== 'INPUT') {
                  e.stopPropagation();
                  setActiveDetailedField(questionId);
                }
              }}
              onMouseDown={(e) => {
                // Предотвращаем закрытие поля при клике на input
                if (e.target.tagName === 'INPUT') {
                  e.stopPropagation();
                }
              }}
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
                display: 'inline-flex',
                cursor: isActive ? 'text' : 'pointer'
              }}
            >
              <div data-layer="Text field container" className="TextFieldContainer" style={{ flex: '1 1 0', paddingTop: isActive || hasValue ? 12 : 20, paddingBottom: isActive || hasValue ? 12 : 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex' }}>
                {isActive || hasValue ? (
                  <>
                    <div data-layer="LabelDefault" className="Labeldefault" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{labelText}</div>
                    <div data-layer="%Input text" className="InputText" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>
                      <input
                        type="text"
                        value={detailedAnswer || ''}
                        onChange={(e) => handleDetailedAnswerChange(questionId, e.target.value)}
                        onBlur={(e) => {
                          // Не закрываем поле если в нем есть текст
                          // Используем setTimeout чтобы дать возможность обработать другие события (например, клик на другое поле)
                          setTimeout(() => {
                            const currentValue = getDetailedAnswer(questionId);
                            if (!currentValue || String(currentValue).trim() === '') {
                              if (activeDetailedField === questionId) {
                                handleDetailedFieldBlur(questionId);
                              }
                            }
                          }, 150);
                        }}
                        onFocus={() => setActiveDetailedField(questionId)}
                        autoFocus={isActive}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDetailedField(questionId);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActiveDetailedField(questionId);
                        }}
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: 16,
                          fontFamily: 'Inter',
                          fontWeight: '500',
                          color: '#071222',
                          paddingLeft: 0,
                          marginLeft: 0
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>{labelText}</div>
                )}
              </div>
            </div>
          );
        })()}
      </React.Fragment>
    );
  };


  // Обработчик возврата назад
  const handleBack = () => {
    // Если открыт бланк-опросник, возвращаемся к декларации
    if (currentView === 'blank') {
      // Восстанавливаем тип декларации через updateQuestionAnswer с extraData
      // Находим первый вопрос декларации (questionCode от 1 до 21) для обновления типа
      if (questionnaireData && questionnaireData.contragentQuestionnaires) {
        const declarationQuestion = questionnaireData.contragentQuestionnaires.find(q => {
          if (!q.questionCode) return false;
          const questionCodeNum = parseInt(q.questionCode);
          return questionCodeNum >= 1 && questionCodeNum <= 21;
        });
        
        if (declarationQuestion) {
          // Обновляем тип анкеты, сохраняя все данные вопроса
          updateQuestionAnswer(
            declarationQuestion.questionId,
            declarationQuestion.answerId || null,
            declarationQuestion.answerCode || null,
            declarationQuestion.answerName || null,
            declarationQuestion.answer || null,
            declarationQuestion.explanation || null,
            { questionnaireTypeCode: 'healthdeclaration' }
          );
        } else {
          // Если нет вопроса декларации, используем первый доступный вопрос
          const firstQuestion = questionnaireData.contragentQuestionnaires[0];
          if (firstQuestion) {
            updateQuestionAnswer(
              firstQuestion.questionId || null,
              firstQuestion.answerId || null,
              firstQuestion.answerCode || null,
              firstQuestion.answerName || null,
              firstQuestion.answer || null,
              firstQuestion.explanation || null,
              { questionnaireTypeCode: 'healthdeclaration' }
            );
          }
        }
      }
      setCurrentView('questions');
    } else {
      onBack();
    }
  };

  // Рендеринг меню
  const renderMenu = () => (
    <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{ width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
      <div data-layer="Back button" className="BackButton" onClick={handleBack} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer' }}>
        <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{ left: 32, top: 32, position: 'absolute' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );

  // Обработчик сохранения
  const handleSave = async () => {
    try {
      await handleSaveQuestionnaire();
      // После успешного сохранения возвращаемся в заявку
      if (onBack) {
        onBack();
      }
    } catch (error) {
      // Ошибка уже обработана в handleSaveQuestionnaire
      // Не вызываем onBack при ошибке
    }
  };

  // Обработчик открытия бланка
  const handleOpenBlank = async () => {
    // Загружаем бланк-опросник с типом questionnaire
    if (loadQuestionnaire) {
      try {
        await loadQuestionnaire();
      } catch (error) {
        console.error('Ошибка загрузки бланк-опросника:', error);
      }
    }
    setCurrentView('blank');
  };

  // Если открыт экран выбора ответа
  if (currentView === 'answerSelection') {
    const currentAnswer = questionnaireData?.contragentQuestionnaires?.find(q => q.questionId === currentQuestionId);
    const currentAnswerObj = currentAnswer ? { answerId: currentAnswer.answerId, answerCode: currentAnswer.answerCode, answerName: currentAnswer.answerName } : null;

    return (
      <AnswerSelection
        questionAnswers={currentQuestionAnswers}
        onSelectAnswer={handleSaveAnswer}
        onBack={() => setCurrentView('questions')}
        currentAnswer={currentAnswerObj}
      />
    );
  }

  // Если открыт бланк-опросник
  if (currentView === 'blank') {
    return (
      <div data-layer="Health questions page" className="HealthQuestionsPage" style={{ width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        {renderMenu()}
        <div data-layer="Health questions" className="HealthQuestions" style={{ width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{ alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
            <div data-layer="Title" className="Title" style={{ flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
              <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Бланк-опросник</div>
              <div data-layer="Button container" className="ButtonContainer" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
                <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSave} style={{ width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer' }}>
                  <div data-layer="Button Text" className="ButtonText" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Сохранить</div>
                </div>
              </div>
            </div>
          </div>
          <div data-layer="Filds list" className="FildsList" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
            <div data-layer="MessageContainer" data-type="desktop" className="Messagecontainer" style={{ alignSelf: 'stretch', padding: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
              <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Бланк-опросник заполняет (отвечает на вопросы) Застрахованный. Ваши ответы на предлагаемые ниже вопросы являются основным критерием для оценки страхового риска, поэтому просим Вас предоставить на них достоверные ответы:<br /><br /></span>
                <span style={{ color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Для каждого вопроса, на который ответили «Да», пожалуйста, уточните ниже, заболевание, его начало, какие лекарства Вы принимаете или принимали, проходили ли Вы какую-либо операцию или лечение в связи с заболеванием, является ли заболевание врождённым или когда оно было впервые выявлено, находились ли Вы на больничном в связи с данным заболеванием и как долго, было ли рекомендовано какое-либо лечение в связи с данным заболеванием, имеете ли Вы степень инвалидности в связи с данным заболеванием.<br /></span>
                <span style={{ color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}><br /></span>
                <span style={{ color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Пожалуйста, приложите актуальные медицинские выписки в связи с данным заболеванием и/или имеющиеся актуальные результаты патологических и\или радиологических исследований. </span>
              </div>
            </div>
            {/* Тогл "Ответить на все вопросы нет" */}
            <div data-layer="InputContainerToggleButton" data-state={answerAllNo ? "pressed" : "not_pressed"} className="Inputcontainertogglebutton" onClick={handleAnswerAllNo} style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer' }}>
              <div data-layer="Text container" className="TextContainer" style={{ flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                <div data-layer="LabelDiv" className="Labeldiv" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Ответить на все вопросы нет</div>
              </div>
              <div data-layer="Switch container" className="SwitchContainer" style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden' }}>
                <div data-svg-wrapper data-layer="tui-switches" className="TuiSwitches" style={{ left: 26, top: 35, position: 'absolute' }}>
                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="16" rx="8" fill={answerAllNo ? "black" : "#E0E0E0"} />
                    <circle cx={answerAllNo ? "24" : "8"} cy="8" r="6" fill="white" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Вопросы бланк-опросника из API */}
            {(() => {
              const questionnaireQuestions = (questionnaireData?.contragentQuestionnaires || []).filter(q => {
                if (!q.questionCode) return false;
                const questionCodeNum = parseInt(q.questionCode);
                return questionCodeNum >= 22 && questionCodeNum <= 45;
              }).sort((a, b) => {
                if (a.order !== null && a.order !== undefined && b.order !== null && b.order !== undefined) {
                  return a.order - b.order;
                }
                const codeA = parseInt(a.questionCode) || 0;
                const codeB = parseInt(b.questionCode) || 0;
                return codeA - codeB;
              });

              // Фильтруем числовые поля для правильной нумерации
              const nonNumericQuestions = questionnaireQuestions.filter(q => q.answerTypeCode !== 'num');

              return questionnaireQuestions.length > 0 ? (
                questionnaireQuestions.map(question => {
                  // Находим индекс вопроса в списке без числовых полей для правильной нумерации
                  const questionIndex = question.answerTypeCode === 'num' ? null : nonNumericQuestions.findIndex(q => q.questionId === question.questionId);
                  return renderQuestion(question, questionIndex);
                })
              ) : (
                <div data-layer="MessageContainer" data-type="desktop" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
                  <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Вопросы бланк-опросника будут загружены</div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // Если нет данных, показываем загрузку
  if (!questionnaireData) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white' }}>
        <div style={{ textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>
          Загрузка данных анкеты...
        </div>
      </div>
    );
  }

  // Фильтруем вопросы в зависимости от текущего типа анкеты
  // Если это бланк-опросник (questionnaireTypeCode === 'questionnaire'), показываем вопросы бланк-опросника (questionCode от 22 до 45)
  // Если это декларация (healthdeclaration), показываем вопросы декларации (questionCode от 1 до 21)
  const isQuestionnaire = questionnaireData?.questionnaireTypeCode === 'questionnaire';

  const declarationQuestions = (questionnaireData.contragentQuestionnaires || []).filter(q => {
    if (!q.questionCode) {
      // Если нет questionCode, включаем в декларацию (на случай, если придут вопросы без кода)
      return !isQuestionnaire;
    }
    const questionCodeNum = parseInt(q.questionCode);
    if (isQuestionnaire) {
      // Для бланк-опросника показываем вопросы с questionCode от 22 до 45
      return questionCodeNum >= 22 && questionCodeNum <= 45;
    } else {
      // Для декларации показываем вопросы с questionCode от 1 до 21
      return questionCodeNum >= 1 && questionCodeNum <= 21;
    }
  });

  return (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{ width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
      {renderMenu()}
      <div data-layer="Health questions" className="HealthQuestions" style={{ width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{ alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
          <div data-layer="Title" className="Title" style={{ flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>
              {questionnaireData?.questionnaireTypeCode === 'questionnaire' ? 'Бланк-опросник' : 'Декларация'}
            </div>
            <div data-layer="Button container" className="ButtonContainer" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
              {/* Скрываем кнопку "Сохранить" в декларации, если нужно заполнить бланк-опросник */}
              {!(showBlank && questionnaireData?.questionnaireTypeCode !== 'questionnaire' && currentView !== 'blank') && (
                <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSave} style={{ width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer' }}>
                  <div data-layer="Button Text" className="ButtonText" style={{ flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Сохранить</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div data-layer="Filds list" className="FildsList" style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
          {/* Кнопка "Бланк-опросник" показывается только в декларации, не в самом бланк-опроснике */}
          {showBlank && currentView !== 'blank' && questionnaireData?.questionnaireTypeCode !== 'questionnaire' && (
            <div data-layer="InputContainerDictionaryButton" data-state="not_pressed" className="Inputcontainerdictionarybutton" style={{ alignSelf: 'stretch', paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
              <div data-layer="Text field container" className="TextFieldContainer" style={{ flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex' }}>
                <div data-layer="Label" className="Label" style={{ alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Бланк-опросник</div>
                <div data-layer="Input text" className="InputText" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Не заполнено</div>
              </div>
              <div data-layer="Open button" className="OpenButton" onClick={handleOpenBlank} style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer' }}>
                <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{ left: 31, top: 32, position: 'absolute' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <div data-layer="MessageContainer" data-type="desktop" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, paddingRight: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
            <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Я заявляю о правдивости и достоверности следующих утверждений</div>
          </div>
          {/* Тогл "Ответить на все вопросы нет" */}
          <div data-layer="InputContainerToggleButton" data-state={answerAllNo ? "pressed" : "not_pressed"} className="Inputcontainertogglebutton" onClick={handleAnswerAllNo} style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer' }}>
            <div data-layer="Text container" className="TextContainer" style={{ flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Ответить на все вопросы нет</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden' }}>
              <div data-svg-wrapper data-layer="tui-switches" className="TuiSwitches" style={{ left: 26, top: 35, position: 'absolute' }}>
                <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="16" rx="8" fill={answerAllNo ? "black" : "#E0E0E0"} />
                  <circle cx={answerAllNo ? "24" : "8"} cy="8" r="6" fill="white" />
                </svg>
              </div>
            </div>
          </div>
          {declarationQuestions.length > 0 ? (
            (() => {
              // Фильтруем числовые поля для правильной нумерации в декларации
              const nonNumericQuestions = declarationQuestions.filter(q => q.answerTypeCode !== 'num');
              return declarationQuestions.map(question => {
                // Находим индекс вопроса в списке без числовых полей для правильной нумерации
                const questionIndex = question.answerTypeCode === 'num' ? null : nonNumericQuestions.findIndex(q => q.questionId === question.questionId);
                return renderQuestion(question, questionIndex);
              });
            })()
          ) : (
            <div data-layer="MessageContainer" data-type="desktop" className="Messagecontainer" style={{ alignSelf: 'stretch', height: 85, paddingLeft: 20, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
              <div data-layer="Label" className="Label" style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word' }}>Вопросы декларации будут загружены после заполнения основных данных</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithManager;
