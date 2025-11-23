import React, { useState, useEffect } from 'react';
import { loadGlobalApplicationData, updateGlobalApplicationSection } from '../../services/storageService';

const Questionary = ({ onBack, onSave, applicationId }) => {
  // Состояния навигации
  const [currentView, setCurrentView] = useState('main-off');
  
  // Состояния тоглов
  const [fillWithoutManager, setFillWithoutManager] = useState(false);
  const [answerEverywhereNoDeclaration, setAnswerEverywhereNoDeclaration] = useState(false);
  const [answerEverywhereNoBlank, setAnswerEverywhereNoBlank] = useState(false);
  
  // Состояния ответов
  const [declarationAnswers, setDeclarationAnswers] = useState({});
  const [blankAnswers, setBlankAnswers] = useState({});
  
  // Состояния для отслеживания автоматически установленных ответов
  const [autoSetDeclarationAnswers, setAutoSetDeclarationAnswers] = useState(new Set());
  const [autoSetBlankAnswers, setAutoSetBlankAnswers] = useState(new Set());
  
  // Временные состояния для выбранных ответов (применяются только после сохранения формы)
  const [pendingDeclarationAnswers, setPendingDeclarationAnswers] = useState({});
  const [pendingBlankAnswers, setPendingBlankAnswers] = useState({});
  
  // Состояния для подробных ответов
  const [declarationDetailedAnswers, setDeclarationDetailedAnswers] = useState({});
  const [blankDetailedAnswers, setBlankDetailedAnswers] = useState({});
  
  // Состояние для AnswerSelection
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questionType, setQuestionType] = useState(null); // 'declaration' или 'blank'
  
  // Состояние для отслеживания активных полей подробных ответов
  const [activeDetailedField, setActiveDetailedField] = useState(null);
  
  // Состояние для полей роста и веса
  const [heightWeightValues, setHeightWeightValues] = useState({ height: '', weight: '' });
  const [activeHeightWeightField, setActiveHeightWeightField] = useState(null);
  
  // Флаг для предотвращения сохранения при начальной загрузке
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Загрузка данных из глобального хранилища при монтировании
  useEffect(() => {
    if (applicationId) {
      const globalData = loadGlobalApplicationData(applicationId);
      if (globalData && globalData.Questionary) {
        const savedData = globalData.Questionary;
        console.log('📖 [АНКЕТА] Загружено из глобального хранилища:', savedData);
        if (savedData.fillWithoutManager !== undefined) setFillWithoutManager(savedData.fillWithoutManager);
        if (savedData.answerEverywhereNoDeclaration !== undefined) setAnswerEverywhereNoDeclaration(savedData.answerEverywhereNoDeclaration);
        if (savedData.answerEverywhereNoBlank !== undefined) setAnswerEverywhereNoBlank(savedData.answerEverywhereNoBlank);
        if (savedData.declarationAnswers) setDeclarationAnswers(savedData.declarationAnswers);
        if (savedData.blankAnswers) setBlankAnswers(savedData.blankAnswers);
        if (savedData.declarationDetailedAnswers) setDeclarationDetailedAnswers(savedData.declarationDetailedAnswers);
        if (savedData.blankDetailedAnswers) setBlankDetailedAnswers(savedData.blankDetailedAnswers);
        if (savedData.heightWeightValues) setHeightWeightValues(savedData.heightWeightValues);
        if (savedData.currentView) setCurrentView(savedData.currentView);
      }
    }
    setIsInitialLoad(false);
  }, [applicationId]);

  // Автоматическое сохранение данных в глобальное хранилище при их изменении
  useEffect(() => {
    if (!isInitialLoad && applicationId) {
      const questionaryData = {
        fillWithoutManager,
        answerEverywhereNoDeclaration,
        answerEverywhereNoBlank,
        declarationAnswers,
        blankAnswers,
        declarationDetailedAnswers,
        blankDetailedAnswers,
        heightWeightValues,
        currentView
      };
      console.log('💾 [АНКЕТА] Автосохранение в глобальное хранилище:', questionaryData);
      updateGlobalApplicationSection('Questionary', questionaryData, applicationId);
    }
  }, [fillWithoutManager, answerEverywhereNoDeclaration, answerEverywhereNoBlank, declarationAnswers, blankAnswers, declarationDetailedAnswers, blankDetailedAnswers, heightWeightValues, currentView, isInitialLoad, applicationId]);
  
  // Прокрутка наверх при изменении view
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);
  
  // Автоматическое заполнение "Нет" при включении тогла в Declaration
  useEffect(() => {
    if (answerEverywhereNoDeclaration && currentView === 'declaration') {
      const allNoAnswers = {};
      const autoSet = new Set();
      // Список всех вопросов декларации
      const declarationQuestions = [
        'danger', 'drugs', 'alcohol', 'smoking', 'aids', 'sickleave', 
        'surgery', 'testresults', 'cancer', 'blood', 'bonemarrow',
        'cardiovascular', 'hearttransplant', 'neurological', 'cardiovascular2',
        'organtransplant', 'liver', 'kidney', 'lung', 'cardiovascular3', 'diabetes'
      ];
      declarationQuestions.forEach(q => {
        // Устанавливаем "Нет" только если ответ не был изменен вручную (не равен "Да")
        // или если ответ еще не заполнен
        const currentAnswer = pendingDeclarationAnswers[q] || declarationAnswers[q];
        if (!currentAnswer || currentAnswer === 'Нет') {
          allNoAnswers[q] = 'Нет';
          autoSet.add(q);
        }
      });
      setDeclarationAnswers(prev => ({ ...prev, ...allNoAnswers }));
      setAutoSetDeclarationAnswers(autoSet);
    } else if (!answerEverywhereNoDeclaration && currentView === 'declaration') {
      // При выключении тогла очищаем только автоматически установленные ответы
      setDeclarationAnswers(prev => {
        const newAnswers = { ...prev };
        autoSetDeclarationAnswers.forEach(qId => {
          delete newAnswers[qId];
        });
        return newAnswers;
      });
      setAutoSetDeclarationAnswers(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerEverywhereNoDeclaration, currentView]);
  
  // Автоматическое заполнение "Нет" при включении тогла в Blank
  useEffect(() => {
    if (answerEverywhereNoBlank && currentView === 'blank') {
      const allNoAnswers = {};
      const autoSet = new Set();
      // Список всех вопросов бланка (22 вопроса)
      for (let i = 1; i <= 22; i++) {
        const qId = `q${i}`;
        // Устанавливаем "Нет" только если ответ не был изменен вручную (не равен "Да")
        // или если ответ еще не заполнен
        const currentAnswer = pendingBlankAnswers[qId] || blankAnswers[qId];
        if (!currentAnswer || currentAnswer === 'Нет') {
          allNoAnswers[qId] = 'Нет';
          autoSet.add(qId);
        }
      }
      setBlankAnswers(prev => ({ ...prev, ...allNoAnswers }));
      setAutoSetBlankAnswers(autoSet);
    } else if (!answerEverywhereNoBlank && currentView === 'blank') {
      // При выключении тогла очищаем только автоматически установленные ответы
      setBlankAnswers(prev => {
        const newAnswers = { ...prev };
        autoSetBlankAnswers.forEach(qId => {
          delete newAnswers[qId];
        });
        return newAnswers;
      });
      setAutoSetBlankAnswers(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerEverywhereNoBlank, currentView]);
  
  // Обработчики навигации
  const handleBackToMain = () => {
    if (fillWithoutManager) {
      setCurrentView('main-on');
    } else {
      // Проверяем, есть ли хотя бы один ответ "Да" в декларации
      const hasYesInDeclaration = Object.values(declarationAnswers).some(v => v === 'Да');
      const hasAnyBlankAnswer = Object.keys(blankAnswers).length > 0;
      
      if (hasYesInDeclaration && hasAnyBlankAnswer) {
        setCurrentView('main-all-filled');
      } else if (hasYesInDeclaration) {
        setCurrentView('main-declaration-filled');
      } else {
        setCurrentView('main-off');
      }
    }
  };
  
  const handleOpenDeclaration = () => setCurrentView('declaration');
  const handleOpenBlank = () => setCurrentView('blank');
  
  const handleOpenAnswerSelection = (questionId, type) => {
    setCurrentQuestionId(questionId);
    setQuestionType(type);
    setCurrentView('answerSelection');
  };
  
  // Обработчики тоглов
  const handleToggleFillWithoutManager = () => {
    const newValue = !fillWithoutManager;
    setFillWithoutManager(newValue);
    if (newValue) {
      setCurrentView('main-on');
    } else {
      setCurrentView('main-off');
    }
  };
  
  const handleToggleAnswerEverywhereNoDeclaration = () => {
    setAnswerEverywhereNoDeclaration(!answerEverywhereNoDeclaration);
  };
  
  const handleToggleAnswerEverywhereNoBlank = () => {
    setAnswerEverywhereNoBlank(!answerEverywhereNoBlank);
  };
  
  // Обработчик сохранения ответа (сохраняет во временное состояние, не применяет сразу)
  const handleSaveAnswer = (answer) => {
    if (questionType === 'declaration') {
      setPendingDeclarationAnswers(prev => ({
        ...prev,
        [currentQuestionId]: answer
      }));
      // Не возвращаемся на экран формы, остаемся на AnswerSelection
    } else if (questionType === 'blank') {
      setPendingBlankAnswers(prev => ({
        ...prev,
        [currentQuestionId]: answer
      }));
      // Не возвращаемся на экран формы, остаемся на AnswerSelection
    }
    // Не очищаем currentQuestionId и questionType, чтобы можно было вернуться на форму
  };
  
  // Обработчик сохранения декларации (применяет временные ответы)
  const handleSaveDeclaration = () => {
    // Применяем все временные ответы к основным
    const finalDeclarationAnswers = {
      ...declarationAnswers,
      ...pendingDeclarationAnswers
    };
    setDeclarationAnswers(finalDeclarationAnswers);
    // Очищаем временные ответы
    setPendingDeclarationAnswers({});
    // Проверяем, есть ли хотя бы один ответ "Да" (с учетом временных)
    const allAnswers = finalDeclarationAnswers;
    const hasYes = Object.values(allAnswers).some(v => v === 'Да');
    if (hasYes) {
      setCurrentView('main-declaration-filled');
    } else {
      // Если нет ответов "Да", возвращаемся на главный экран
      setCurrentView('main-off');
    }
  };
  
  // Обработчик сохранения бланка (применяет временные ответы)
  const handleSaveBlank = () => {
    // Применяем все временные ответы к основным
    const finalBlankAnswers = {
      ...blankAnswers,
      ...pendingBlankAnswers
    };
    setBlankAnswers(finalBlankAnswers);
    // Очищаем временные ответы
    setPendingBlankAnswers({});
    // Возвращаемся в справочник декларации
    setCurrentView('declaration');
  };
  
  // Обработчик сохранения анкеты из основного вида
  const handleSaveQuestionary = () => {
    // Собираем все данные анкеты
    // Применяем временные ответы к основным, если они есть
    const finalDeclarationAnswers = {
      ...declarationAnswers,
      ...pendingDeclarationAnswers
    };
    const finalBlankAnswers = {
      ...blankAnswers,
      ...pendingBlankAnswers
    };
    
    const questionaryData = {
      fillWithoutManager,
      answerEverywhereNoDeclaration,
      answerEverywhereNoBlank,
      declarationAnswers: finalDeclarationAnswers,
      blankAnswers: finalBlankAnswers,
      declarationDetailedAnswers,
      blankDetailedAnswers,
      heightWeightValues,
      currentView
    };
    
    // Сохраняем в глобальное хранилище
    if (applicationId) {
      console.log('💾 [АНКЕТА] Сохранение по кнопке:', questionaryData);
      updateGlobalApplicationSection('Questionary', questionaryData, applicationId);
    }
    
    // Сохраняем данные анкеты
    if (onSave) {
      onSave({
        declarationAnswers: finalDeclarationAnswers,
        blankAnswers: finalBlankAnswers,
        declarationDetailedAnswers,
        blankDetailedAnswers,
        heightWeightValues
      });
    }
    
    // Возвращаемся на главный экран
    if (onBack) {
      onBack();
    }
  };
  
  // Обработчик отправки анкеты клиенту
  const handleSendToClient = () => {
    // Переходим в состояние ожидания ответа от клиента
    setCurrentView('main-on-1');
    
    // Эмуляция вебхука - симулируем получение ответа от клиента через 3 секунды
    setTimeout(() => {
      // Когда клиент заполнил анкету
      handleClientFilled();
    }, 3000);
  };
  
  // Обработчик когда клиент заполнил
  const handleClientFilled = () => {
    setCurrentView('main-on-2');
  };
  
  // Обработчик возврата на форму из AnswerSelection
  const handleBackToForm = () => {
    if (questionType === 'declaration') {
      setCurrentView('declaration');
    } else if (questionType === 'blank') {
      setCurrentView('blank');
    }
    // Не очищаем currentQuestionId и questionType, чтобы можно было вернуться
  };
  
  // Вспомогательные функции для работы с ответами
  const getAnswerText = (questionId, type) => {
    if (type === 'declaration') {
      // Сначала проверяем временные ответы, затем основные
      return pendingDeclarationAnswers[questionId] || declarationAnswers[questionId] || 'Ответ';
    } else {
      // Сначала проверяем временные ответы, затем основные
      return pendingBlankAnswers[questionId] || blankAnswers[questionId] || 'Ответ';
    }
  };
  
  const getDetailedAnswer = (questionId, type) => {
    if (type === 'declaration') {
      return declarationDetailedAnswers[questionId] || '';
    } else {
      return blankDetailedAnswers[questionId] || '';
    }
  };
  
  // Обработчик клика на поле подробного ответа
  const handleDetailedFieldClick = (questionId) => {
    setActiveDetailedField(questionId);
  };
  
  const handleDetailedAnswerChange = (questionId, type, value) => {
    if (type === 'declaration') {
      setDeclarationDetailedAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    } else {
      setBlankDetailedAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };
  
  // Обработчик потери фокуса поля подробного ответа
  const handleDetailedFieldBlur = (questionId, type) => {
    const detailedAnswer = getDetailedAnswer(questionId, type);
    if (!detailedAnswer || detailedAnswer.trim() === '') {
      setActiveDetailedField(null);
    }
  };
  
  // Обработчики для полей роста и веса
  const handleHeightWeightFieldClick = (fieldName) => {
    setActiveHeightWeightField(fieldName);
  };
  
  const handleHeightWeightFieldChange = (fieldName, value) => {
    setHeightWeightValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  const handleHeightWeightFieldBlur = (fieldName) => {
    if (!heightWeightValues[fieldName]) {
      setActiveHeightWeightField(null);
    }
  };
  
  // Функция рендеринга полей роста и веса
  const renderHeightWeightField = (fieldName, label) => {
    const isActive = activeHeightWeightField === fieldName;
    const hasValue = !!heightWeightValues[fieldName];
    
    if (isActive || hasValue) {
      // Активное состояние - с полем ввода
      return (
        <div data-layer="InputContainerWithoutButton" data-state="pressed" className="Inputcontainerwithoutbutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
            <div data-layer="LabelDefault" className="Labeldefault" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{label}</div>
            <div data-layer="%Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
              <input
                type="text"
                value={heightWeightValues[fieldName] || ''}
                onChange={(e) => handleHeightWeightFieldChange(fieldName, e.target.value)}
                onBlur={() => handleHeightWeightFieldBlur(fieldName)}
                autoFocus={isActive}
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
          </div>
        </div>
      );
    } else {
      // Обычное состояние - только название
      return (
        <div data-layer="InputContainerWithoutButton" data-state="not_pressed" className="Inputcontainerwithoutbutton" onClick={() => handleHeightWeightFieldClick(fieldName)} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{label}</div>
          </div>
        </div>
      );
    }
  };
  
  // Рендеринг AnswerSelection
  if (currentView === 'answerSelection') {
    const currentAnswer = getAnswerText(currentQuestionId, questionType);
    const isYes = currentAnswer === 'Да';
    const isNo = currentAnswer === 'Нет';
    
    return (
      <div data-layer="List variants" className="ListVariants" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div data-layer="Menu button" className="MenuButton" onClick={handleBackToForm} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
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
              <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Выберите вариант</div>
              <div data-layer="ActionButtonWithoutRounding" data-state="pressed" className="Actionbuttonwithoutrounding" onClick={handleBackToForm} style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
              </div>
            </div>
          </div>
          <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div data-layer="InputContainerRadioButton" data-state={isYes ? 'pressed' : 'not_pressed'} className="Inputcontainerradiobutton" onClick={() => handleSaveAnswer('Да')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Да</div>
              </div>
              <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                {isYes ? (
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
            <div data-layer="InputContainerRadioButton" data-state={isNo ? 'pressed' : 'not_pressed'} className="Inputcontainerradiobutton" onClick={() => handleSaveAnswer('Нет')} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нет</div>
              </div>
              <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                {isNo ? (
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
  }

  // Вспомогательные функции для рендеринга состояний
  const renderSwitch = (isOn) => (
    <div data-svg-wrapper data-layer="tui-switches" className="TuiSwitches" style={{left: 26, top: 35, position: 'absolute'}}>
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="16" rx="8" fill={isOn ? "black" : "#E0E0E0"}/>
        <circle cx={isOn ? 24 : 8} cy="8" r="6" fill="white"/>
      </svg>
    </div>
  );
  
  const isDeclarationFilled = () => Object.keys(declarationAnswers).length > 0;
  const isBlankFilled = () => Object.keys(blankAnswers).length > 0;
  
  // Проверка наличия хотя бы одного ответа "Да" в декларации (с учетом временных ответов)
  const hasYesInDeclaration = () => {
    const allAnswers = {
      ...declarationAnswers,
      ...pendingDeclarationAnswers
    };
    return Object.values(allAnswers).some(v => v === 'Да');
  };
  
  // Общий компонент меню
  const renderMenu = (onBackClick = onBack) => (
    <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div data-layer="Back button" className="BackButton" onClick={onBackClick} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
      <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  </div>
  );
  
  // Рендеринг main-off (Questionary-main-off.js)
  const renderMainOff = () => (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, height: 982, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
          <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSaveQuestionary} style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
              </div>
            </div>
          </div>
        </div>
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="InputContainerToggleButton" data-state={fillWithoutManager ? "pressed" : "not_pressed"} className="Inputcontainertogglebutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
        <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
          <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнить анкету без участия Менеджера</div>
        </div>
            <div data-layer="Switch container" className="SwitchContainer" onClick={handleToggleFillWithoutManager} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
              {renderSwitch(fillWithoutManager)}
          </div>
        </div>
          <div data-layer="InputContainerDictionaryButton" data-state={isDeclarationFilled() ? "pressed" : "not_pressed"} className="Inputcontainerdictionarybutton" style={{alignSelf: 'stretch', paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Label" className="Label" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Декларация о состоянии здоровья Застрахованного</div>
              <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{isDeclarationFilled() ? 'Заполнено' : 'Не заполнено'}</div>
        </div>
            <div data-layer="Open button" className="OpenButton" onClick={handleOpenDeclaration} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
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
  
  // Рендеринг main-on (Questionary-main-on.js)
  const renderMainOn = () => (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, height: 982, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, height: 982, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
      {fillWithoutManager && (
        <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSendToClient} style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
          <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Отправить анкету клиенту</div>
        </div>
      )}
      {!fillWithoutManager && (
        <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSaveQuestionary} style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
          <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
      )}
            </div>
          </div>
        </div>
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="InputContainerToggleButton" data-state="pressed" className="Inputcontainertogglebutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнить анкету без участия Менеджера</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" onClick={handleToggleFillWithoutManager} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
              {renderSwitch(true)}
            </div>
          </div>
        </div>
      </div>
        </div>
  );
  
  // Рендеринг main-on-1 (Questionary-main-on-1.js)
  const renderMainOn1 = () => (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, height: 982, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, height: 982, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
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
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ожидаем заполнения анкеты клиентом</div>
          </div>
          <div data-layer="InputContainerToggleButton" data-state="pressed" className="Inputcontainertogglebutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнить анкету без участия Менеджера</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" onClick={handleToggleFillWithoutManager} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
              {renderSwitch(true)}
            </div>
          </div>
        </div>
      </div>
        </div>
  );
  
  // Рендеринг main-on-2 (Questionary-main-on-2.js)
  const renderMainOn2 = () => (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, height: 982, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, height: 982, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
            </div>
          </div>
        </div>
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="Alert" className="Alert" style={{width: 1427, height: 85, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div data-layer="Info container" className="InfoContainer" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_535_14093)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.916992 10.9993C0.916992 5.43034 5.43131 0.916016 11.0003 0.916016C16.5693 0.916016 21.0837 5.43034 21.0837 10.9993C21.0837 16.5684 16.5693 21.0827 11.0003 21.0827C5.43131 21.0827 0.916992 16.5684 0.916992 10.9993ZM11.0003 2.74935C6.44384 2.74935 2.75033 6.44286 2.75033 10.9993C2.75033 15.5558 6.44384 19.2494 11.0003 19.2494C15.5568 19.2494 19.2503 15.5558 19.2503 10.9993C19.2503 6.44286 15.5568 2.74935 11.0003 2.74935ZM10.0745 7.33268C10.0745 6.82642 10.4849 6.41602 10.9912 6.41602H11.0003C11.5066 6.41602 11.917 6.82642 11.917 7.33268C11.917 7.83894 11.5066 8.24935 11.0003 8.24935H10.9912C10.4849 8.24935 10.0745 7.83894 10.0745 7.33268ZM11.0003 10.0827C11.5066 10.0827 11.917 10.4931 11.917 10.9993V14.666C11.917 15.1723 11.5066 15.5827 11.0003 15.5827C10.4941 15.5827 10.0837 15.1723 10.0837 14.666V10.9993C10.0837 10.4931 10.4941 10.0827 11.0003 10.0827Z" fill="black"/>
                </g>
                <defs>
                <clipPath id="clip0_535_14093">
                <rect width="22" height="22" fill="white"/>
                </clipPath>
                </defs>
            </svg>
          </div>
        </div>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета заполнена</div>
          </div>
          <div data-layer="InputContainerToggleButton" data-state="pressed" className="Inputcontainertogglebutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнить анкету без участия Менеджера</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" onClick={handleToggleFillWithoutManager} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
              {renderSwitch(true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Вспомогательная функция для рендеринга вопроса с кнопкой ответа
  const renderQuestionWithAnswer = (questionText, questionId, type, questionNumber = null) => {
    const answer = getAnswerText(questionId, type);
    const isFilled = answer !== 'Ответ';
    const detailedAnswer = getDetailedAnswer(questionId, type);
    const isYes = answer === 'Да';
    // Показываем значение только если ответ выбран (не "Ответ")
    const displayValue = isFilled ? answer : '';
    
    return (
      <>
        <div data-layer="MessageContainer" data-type="desktop" className="Messagecontainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, paddingRight: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
          <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{questionText}</div>
        </div>
        <div data-layer="InputContainerDictionaryButton" data-state={isFilled ? "pressed" : "not_pressed"} className="Inputcontainerdictionarybutton" style={{width: 1427, height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          {isFilled ? (
            <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Label" className="Label" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ответ</div>
              <div data-layer="Input text" className="InputText" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{displayValue}</div>
      </div>
          ) : (
        <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ответ</div>
        </div>
          )}
          <div data-layer="Open button" className="OpenButton" onClick={() => handleOpenAnswerSelection(questionId, type)} style={{width: 85, alignSelf: 'stretch', position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
          <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
        {isYes && type === 'blank' && (() => {
          const isActive = activeDetailedField === questionId;
          const hasValue = !!detailedAnswer && detailedAnswer.trim() !== '';
          const labelText = questionNumber ? `Ответьте подробнее на «Вопрос ${questionNumber}»` : 'Ответьте подробнее';
          
          if (isActive || hasValue) {
            // Активное состояние - с полем ввода
            return (
              <div data-layer="InputContainerWithoutButton" data-state="pressed" className="Inputcontainerwithoutbutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', paddingTop: 12, paddingBottom: 12, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="LabelDefault" className="Labeldefault" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{labelText}</div>
                  <div data-layer="%Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                    <input
                      type="text"
                      value={detailedAnswer || ''}
                      onChange={(e) => handleDetailedAnswerChange(questionId, type, e.target.value)}
                      onBlur={() => handleDetailedFieldBlur(questionId, type)}
                      autoFocus={isActive}
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
                </div>
      </div>
            );
          } else {
            // Обычное состояние - только название
            return (
              <div data-layer="InputContainerWithoutButton" data-state="not_pressed" className="Inputcontainerwithoutbutton" onClick={() => handleDetailedFieldClick(questionId)} style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}>
        <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{labelText}</div>
                </div>
        </div>
            );
          }
        })()}
      </>
    );
  };
  
  // Массив вопросов декларации
  const declarationQuestions = [
    { id: 'danger', text: 'Я не подвергаюсь опасности при выполнении своих профессиональных обязанностей, в том числе: работа на высоте/под водой/под землей или работа со взрывоопасными/канцерогенными/токсичными веществами или радиацией.' },
    { id: 'drugs', text: 'Я не употребляю и никогда не употреблял наркотики' },
    { id: 'alcohol', text: 'Я не употребляю алкоголь в количестве более 20 мл в день в пересчёте на чистый спирт' },
    { id: 'smoking', text: 'Я не выкуриваю ежедневно более 20 сигарет, включая сигары, электронные сигареты, никотиновые жевательные резинки /пластыри, трубочный /скрученный табак или другие заменители никотина' },
    { id: 'aids', text: 'Я не страдаю заболеваниями, вызванными СПИДом и другими заболеваниями, связанными с вирусом иммунодефицита человека' },
    { id: 'sickleave', text: 'Я не находился на больничном более 14 дней подряд, за исключением заболевания гриппом, и у меня нет инвалидности, связанной с состоянием здоровья, требующей сокращённого или неполного рабочего дня' },
    { id: 'surgery', text: 'Я не подвергался хирургическому вмешательству или госпитализации в течение последних 12 месяцев (исключения составляют: аппендэктомия, стоматологические операции, геморрой, тонзиллэктомия, прерывание беременности, операция на венах)' },
    { id: 'testresults', text: 'У меня нет результатов анализов или онкологических заключений, требующих дальнейшего обследования (или лечения)' },
    { id: 'cancer', text: 'Я не страдаю в настоящее время и не страдал в течение последних 10 лет онкологическими заболеваниями, включая: предраковые опухоли, доброкачественные или злокачественные опухоли кожи (включая кисты, язвы или любые новообразования), опухоли щитовидной железы, доброкачественные или злокачественные опухоли мозга, поликистоз почек, карцинома и меланома in situ, рак крови/лейкемия; и у меня не был диагностирован вирус папилломы человека, вирус Эпштейна-Барра' },
    { id: 'blood', text: 'Я не страдаю заболеваниями крови и иммунной системы, включая: анемию, проблемы со свёртываемостью крови, нарушения иммунной системы; язвенный колит и болезнь Крона' },
    { id: 'bonemarrow', text: 'Я не подвергался хирургическому вмешательству и госпитализации для трансплантации костного мозга' },
    { id: 'cardiovascular', text: 'Я не страдаю в настоящее время и не страдал в течение последних 10 лет сердечно-сосудистыми заболеваниями, включая нарушения кровообращения (например, высокое кровяное давление), инсультом или заболеваниями сердца, включая боль в груди, шум в сердце, повышенное сердцебиение, стенокардию, инфаркт миокарда, атеросклероз, заболевания клапанов сердца, аритмию, кардиомиопатию, ишемическую болезнь сердца, сердечную недостаточность' },
    { id: 'hearttransplant', text: 'У меня не было пересадки сердца' },
    { id: 'neurological', text: 'Я не страдаю в настоящее время и не страдал в течение последних 10 лет заболеваниями нервной системы и мозга, а также пороками развития, включая: эпилепсию, инсульт, паралич, рассеянный склероз, болезнь Гоше, атрофию мышц, ALS (боковой амиотрофический склероз), болезнь Паркинсона, деменцию, болезнь Альцгеймера, умственную отсталость, синдром Дауна, нарушения развития и/или роста' },
    { id: 'cardiovascular2', text: 'Я не страдаю в настоящее время и не страдал в течение последних 10 лет сердечно-сосудистыми заболеваниями, включая нарушения кровообращения (например, высокое кровяное давление), инсульт или заболевания сердца, включая боль в груди, шум в сердце, сердцебиение, стенокардию, инфаркт миокарда, атеросклероз, заболевания клапанов сердца, аритмию, кардиомиопатию, ишемическую болезнь сердца, сердечную недостаточность' },
    { id: 'organtransplant', text: 'Я не подвергался хирургическому вмешательству и госпитализации для трансплантации органов' },
    { id: 'liver', text: 'Я не страдаю заболеваниями печени, желчного пузыря и желчных протоков, включая: желтуху, гепатит, цирроз, жировой гепатоз печени, спленомегалию' },
    { id: 'kidney', text: 'Я не страдаю заболеваниями почек и мочевыделительной системы, в том числе: простатитом, нефритом, почечной недостаточностью в настоящее время или в прошлом' },
    { id: 'lung', text: 'Я не страдаю лёгочными и системными заболеваниями, в том числе: астмой (бронхитом), хронической обструктивной болезнью лёгких, эмфиземой, туберкулёзной инфекцией в настоящем или прошлом' },
    { id: 'cardiovascular3', text: 'Я не страдаю в настоящее время и не страдал в течение последних 10 лет сердечно-сосудистыми заболеваниями, включая нарушения кровообращения (например, высокое кровяное давление), инсульт или заболевания сердца, включая боль в груди, шум в сердце, сердцебиение, стенокардию, инфаркт миокарда, атеросклероз, заболевания клапанов сердца, аритмию, кардиомиопатию, ишемическую болезнь сердца, сердечную недостаточность' },
    { id: 'diabetes', text: 'У меня нет сахарного диабета' }
  ];
  
  // Рендеринг declaration (Declaration.js)
  const renderDeclaration = () => (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu(handleBackToMain)}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Декларация</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSaveDeclaration} style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
          </div>
        </div>
      </div>
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="InputContainerToggleButton" data-state={answerEverywhereNoDeclaration ? "pressed" : "not_pressed"} className="Inputcontainertogglebutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ответить везде нет</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" onClick={handleToggleAnswerEverywhereNoDeclaration} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
              {renderSwitch(answerEverywhereNoDeclaration)}
            </div>
          </div>
          {hasYesInDeclaration() && (
            <div data-layer="InputContainerDictionaryButton" data-state={isBlankFilled() ? "pressed" : "not_pressed"} className="Inputcontainerdictionarybutton" style={{alignSelf: 'stretch', paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Label" className="Label" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Бланк-опросник</div>
                <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{isBlankFilled() ? 'Заполнено' : 'Не заполнено'}</div>
              </div>
              <div data-layer="Open button" className="OpenButton" onClick={handleOpenBlank} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
                <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
          <div data-layer="MessageContainer" data-type="desktop" className="Messagecontainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, paddingRight: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Я заявляю о правдивости и достоверности следующих утверждений</div>
          </div>
          {declarationQuestions.map(q => (
            <React.Fragment key={q.id}>
              {renderQuestionWithAnswer(q.text, q.id, 'declaration', null)}
            </React.Fragment>
          ))}
        </div>
      </div>
      </div>
  );
  
  // Массив вопросов бланка (22 вопроса)
  const blankQuestions = [
    { id: 'q1', text: 'Вопрос 1. Наблюдалась ли у Вас непроизвольная потеря веса более 10% от массы тела за последние 12 месяцев?' },
    { id: 'q2', text: 'Вопрос 2. Курите ли Вы? Как долго?Каково ежедневное количество потребляемых Вами табачных изделий? Если Вы бросили курить, укажите дату окончательного прекращения курения.' },
    { id: 'q3', text: 'Вопрос 3. Рак у биологических родственников первой степени (родителей, детей, братьев /сестёр)? В случае положительного ответа просьба указать степень вашего родства, заболевание и возраст, в котором было диагностировано заболевание или произошла смерть.' },
    { id: 'q4', text: 'Вопрос 4. Расстройства, связанные с нарушением деятельности нервной системы и мозга, и дефекты развития, в том числе: эпилепсия, инсульт, паралич, рассеянный склероз, болезнь Гоше, атрофия мышц, болезнь Паркинсона, слабоумие, болезнь Альцгеймера, умственная отсталость, синдром Дауна, дефицит внимания, первазивные расстройства развития, нарушения развития и/или роста?' },
    { id: 'q5', text: 'Вопрос 5. Психические заболевания, в том числе: депрессия, страхи, навязчивые идеи, шизофрения?' },
    { id: 'q6', text: 'Вопрос 6. Лёгочные и системные заболевания, в том числе: астма (бронхит), хроническое обструктивное заболевание лёгких, эмфизема?' },
    { id: 'q7', text: 'Вопрос 7. Кожные заболевания, в том числе: опухоли и/или язвы, псориаз, воспаления?' },
    { id: 'q8', text: 'Вопрос 8. Повышенное/Пониженное кровяное давление, болезни сердца и сердечно-сосудистые заболевания, в том числе: гипертония, сердечный приступ, боль в груди, аритмия, врожденная аномалия, порок сердечного клапана, атеросклероз, аневризм аорты, тромбоз, варикозные вены, периферийное васкулярное заболевание?' },
    { id: 'q9', text: 'Вопрос 9. Заболевания пищеварительной системы и грыжи, в том числе: рефлюкс, хроническое заболевание и/или кровотечение, геморрой, пилонидальный абсцесс, грыжи любых видов?' },
    { id: 'q10', text: 'Вопрос 10. Заболевания печени, желчного пузыря и желчных протоков, в том числе: желтуха, гепатит, жировой гепатоз печени, спленомегалия?' },
    { id: 'q11', text: 'Вопрос 11. Заболевания почек и мочевой системы, в том числе: простата, мочекаменная болезнь, нефрит, энурез, кровь и/или белок в моче?' },
    { id: 'q12', text: 'Вопрос 12. Нарушения обмена веществ и эндокринные расстройства, в том числе: диабет, ожирение, повышенное содержание триглицеридов в крови, заболевания щитовидной и паращитовидной железы, пролактинома, подагра?' },
    { id: 'q13', text: 'Вопрос 13. Заболевания крови и иммунной системы, в том числе: анемия, проблемы со свертываемостью крови, расстройства иммунной системы?' },
    { id: 'q14', text: 'Вопрос 14. Инфекционная и/или венерическая болезнь,  включая туберкулез, ВИЧ, СПИД, постоянная высокая температура, хеликобактер, папиллома (HPV), гепатит, герпес (HHV 8), буллёзный эпидермолиза?' },
    { id: 'q15', text: 'Вопрос 15. Злокачественные заболевания и/или опухолевый злокачественный рост, в том числе: предраковые опухоли, рак?' },
    { id: 'q16', text: 'Вопрос 16. Заболевания опорно-двигательного аппарата, в том числе: заболевания позвоночника, заболевания костей, деформация костей таза, остеопороз?' },
    { id: 'q17', text: 'Вопрос 17. Нарушения зрения и/или патологии уха, горла и носа, в том числе: кератоконус, ухудшение зрения ниже -7 D, катаракта, рецидивирующий отит, рецидивирующий синусит, полипы, воспаления миндалин, синдром ночного апноэ?' },
    { id: 'q18', text: 'Вопрос 18. Заболевания половых и/или репродуктивных органов, в том числе: образования в груди, не менструальное кровотечение, миомы матки, существующая беременность, бесплодие (также у мужчин), крипторхизм (неопустившееся яичко), варикоцеле?' },
    { id: 'q19', text: 'Вопрос 19. Ревматизм и/или аутоиммунные заболевания и/или расстройства, в том числе: ревматический артрит, ревматизм, артрит, волчанка?' },
    { id: 'q20', text: 'Вопрос 20. Злоупотребление наркотическими средствами (в настоящее время или в прошлом)?' },
    { id: 'q21', text: 'Вопрос 21. Злоупотребление алкоголем?' },
    { id: 'q22', text: 'Вопрос 22. Подвергались ли вы когда-либо и/или за последнее время воздействию химикатов и/или токсических веществ и/или газов, в том числе асбеста, разбавителей краски, бензола, винила, хлора, хрома, радона, пестицидов, кварцевой пыли, диоксинов, бериллия, никеля, радиации, в том числе ультрафиолетовому излучению, высокочастотному излучению, микроволновому излучению, воздействию электромагнитных полей линий электропередачи и т.п. (если да, то укажите подробнее?' }
  ];
  
  // Рендеринг blank (blank.js)
  const renderBlank = () => (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu(handleBackToMain)}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Бланк-опросник</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSaveBlank} style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
          </div>
        </div>
      </div>
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          {renderHeightWeightField('height', 'Рост застрахованного (см)')}
          {renderHeightWeightField('weight', 'Вес застрахованного (кг)')}
          <div data-layer="MessageContainer" data-type="desktop" className="Messagecontainer" style={{alignSelf: 'stretch', padding: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
              <span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Бланк-опросник заполняет (отвечает на вопросы) Застрахованный. Ваши ответы на предлагаемые ниже вопросы являются основным критерием для оценки страхового риска, поэтому просим Вас предоставить на них достоверные ответы:<br/><br/></span>
              <span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Для каждого вопроса, на который ответили «Да», пожалуйста, уточните ниже, заболевание, его начало, какие лекарства Вы принимаете или принимали, проходили ли Вы какую-либо операцию или лечение в связи с заболеванием, является ли заболевание врождённым или когда оно было впервые выявлено, находились ли Вы на больничном в связи с данным заболеванием и как долго, было ли рекомендовано какое-либо лечение в связи с данным заболеванием, имеете ли Вы степень инвалидности в связи с данным заболеванием.<br/></span>
              <span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}><br/></span>
              <span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Пожалуйста, приложите актуальные медицинские выписки в связи с данным заболеванием и/или имеющиеся актуальные результаты патологических и\или радиологических исследований. </span>
            </div>
          </div>
          <div data-layer="InputContainerToggleButton" data-state={answerEverywhereNoBlank ? "pressed" : "not_pressed"} className="Inputcontainertogglebutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ответить везде нет</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" onClick={handleToggleAnswerEverywhereNoBlank} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
              {renderSwitch(answerEverywhereNoBlank)}
            </div>
        </div>
          {blankQuestions.map(q => {
            const questionNumber = parseInt(q.id.replace('q', ''));
            return (
              <React.Fragment key={q.id}>
                {renderQuestionWithAnswer(q.text, q.id, 'blank', questionNumber)}
              </React.Fragment>
            );
          })}
          </div>
        </div>
      </div>
  );
  
  // Рендеринг main-declaration-filled (Questionary-main-off-declarationfill-ansno.js)
  const renderMainDeclarationFilled = () => (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, height: 982, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSaveQuestionary} style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
          </div>
        </div>
      </div>
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="InputContainerToggleButton" data-state="not_pressed" className="Inputcontainertogglebutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнить декларацию без участия Менеджера</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              {renderSwitch(false)}
            </div>
          </div>
          <div data-layer="InputContainerDictionaryButton" data-state="pressed" className="Inputcontainerdictionarybutton" style={{alignSelf: 'stretch', paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Label" className="Label" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Декларация о состоянии здоровья Застрахованного</div>
              <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнено</div>
        </div>
            <div data-layer="Open button" className="OpenButton" onClick={handleOpenDeclaration} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
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
  
  // Рендеринг main-all-filled (Questionary-main-off-declarationfill-ansno-blank.js)
  const renderMainAllFilled = () => (
    <div data-layer="Health questions page" className="HealthQuestionsPage" style={{width: 1512, height: 982, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="Health questions" className="HealthQuestions" style={{width: 1427, overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="SectionApplication" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
            <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
              <div data-layer="Save button" data-state="pressed" className="SaveButton" style={{width: 390, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex'}}>
                <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
          </div>
        </div>
      </div>
        <div data-layer="Filds list" className="FildsList" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="InputContainerToggleButton" data-state="not_pressed" className="Inputcontainertogglebutton" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="LabelDiv" className="Labeldiv" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнить декларацию без участия Менеджера</div>
            </div>
            <div data-layer="Switch container" className="SwitchContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              {renderSwitch(false)}
            </div>
          </div>
          <div data-layer="InputContainerDictionaryButton" data-state="pressed" className="Inputcontainerdictionarybutton" style={{alignSelf: 'stretch', paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Label" className="Label" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Декларация о состоянии здоровья Застрахованного</div>
              <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнено</div>
        </div>
            <div data-layer="Open button" className="OpenButton" onClick={handleOpenDeclaration} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
          <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
          <div data-layer="InputContainerDictionaryButton" data-state="pressed" className="Inputcontainerdictionarybutton" style={{alignSelf: 'stretch', paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
            <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Label" className="Label" style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Бланк-опросник</div>
              <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заполнено</div>
        </div>
            <div data-layer="Open button" className="OpenButton" onClick={handleOpenBlank} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
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
  
  // Основной return с условным рендерингом
  return (() => {
    switch (currentView) {
      case 'main-off':
        return renderMainOff();
      case 'main-on':
        return renderMainOn();
      case 'main-on-1':
        return renderMainOn1();
      case 'main-on-2':
        return renderMainOn2();
      case 'declaration':
        return renderDeclaration();
      case 'blank':
        return renderBlank();
      case 'main-declaration-filled':
        return renderMainDeclarationFilled();
      case 'main-all-filled':
        return renderMainAllFilled();
      default:
        return renderMainOff();
    }
  })();
};

export default Questionary;

