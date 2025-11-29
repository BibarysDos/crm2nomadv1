import React, { useState, useEffect } from 'react';
import { useQuestionnaire } from '../../hooks/useQuestionnaire';
import ModeSelection from './ModeSelection';
import WithManager from './WithManager';
import WithoutManager from './WithoutManager';

const Questionary = ({ onBack, onSave, applicationId, clientContragentId, insuredContragentId, taskId, historyData, processDetails }) => {
  // Используем хук для работы с questionnaire API
  const {
    questionnaireData,
    isLoadingQuestionnaire,
    hasLoadedQuestionnaire,
    loadQuestionAnswers,
    updateQuestionAnswer,
    handleSave: handleSaveQuestionnaire,
    forceLoadQuestionnaire,
    loadQuestionnaire
  } = useQuestionnaire(clientContragentId, insuredContragentId, applicationId, taskId, historyData, onSave);

  // Состояния навигации
  const [currentView, setCurrentView] = useState(null); // null означает, что нужно определить начальный view
  const [fillWithoutManager, setFillWithoutManager] = useState(false);

  // При открытии компонента или изменении contragentId сразу вызываем GET
  useEffect(() => {
    // Сбрасываем view при изменении contragentId
    setCurrentView(null);
    
    const loadOnMount = async () => {
      if (!clientContragentId && !insuredContragentId) {
        // Если нет contragentId, сразу показываем mode-selection
        setCurrentView('mode-selection');
        return;
      }

      // Если есть contragentId, вызываем GET (хук сам сделает два запроса)
      try {
        await forceLoadQuestionnaire();
      } catch (error) {
        // В случае ошибки показываем mode-selection
        setCurrentView('mode-selection');
      }
    };

    loadOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientContragentId, insuredContragentId]); // Вызываем при монтировании и при изменении contragentId

  // Определяем начальный view после загрузки данных
  useEffect(() => {
    if (isLoadingQuestionnaire) {
      return; // Ждем завершения загрузки
    }

    // Если нет contragentId, показываем mode-selection
    if (!clientContragentId && !insuredContragentId) {
      setCurrentView('mode-selection');
      return;
    }

    // Если загрузка завершена
    if (hasLoadedQuestionnaire) {
      // Проверяем, есть ли данные анкеты с вопросами
      const hasQuestions = questionnaireData?.contragentQuestionnaires && 
                           questionnaireData.contragentQuestionnaires.length > 0;
      
      // Проверяем, есть ли сохраненный режим
      const savedMode = questionnaireData?.fillWithoutManager;
      
      if (savedMode !== undefined) {
        setFillWithoutManager(savedMode);
        if (savedMode) {
          setCurrentView('without-manager');
        } else if (hasQuestions) {
          // Если есть вопросы, открываем декларацию напрямую
          setCurrentView('questions');
        } else {
          // Если нет вопросов, показываем выбор способа
          setCurrentView('mode-selection');
        }
      } else if (hasQuestions) {
        // Если есть вопросы, но нет сохраненного режима, открываем декларацию
        setCurrentView('questions');
      } else {
        // Если нет вопросов, показываем выбор способа
        setCurrentView('mode-selection');
      }
    } else if (currentView === null) {
      // Если еще не загружали, показываем mode-selection (будет загружено в первом useEffect)
      setCurrentView('mode-selection');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoadedQuestionnaire, isLoadingQuestionnaire, questionnaireData, clientContragentId, insuredContragentId]);

  // Обработчик выбора режима заполнения
  const handleModeSelection = async (withoutManager) => {
    setFillWithoutManager(withoutManager);
    // Сохраняем выбор в questionnaireData
    if (questionnaireData) {
      updateQuestionAnswer(null, null, null, null, null, null, { fillWithoutManager: withoutManager });
    }
    if (withoutManager) {
      setCurrentView('without-manager');
    } else {
      // При выборе "С менеджером" вызываем GET и открываем вопросы
      // Сначала устанавливаем загрузку, чтобы показать индикатор
      setCurrentView('questions'); // Переходим к вопросам, но покажем загрузку если нужно
      try {
        await forceLoadQuestionnaire();
      } catch (error) {
        // В случае ошибки продолжаем работу
      }
    }
  };

  // Показываем индикатор загрузки, пока определяем начальный view или загружаем данные
  if (currentView === null || isLoadingQuestionnaire) {
    return (
      <div style={{width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white'}}>
        <div style={{textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500'}}>
          Загрузка данных анкеты...
        </div>
      </div>
    );
  }

  // Основной return с условным рендерингом
  switch (currentView) {
    case 'mode-selection':
      return (
        <ModeSelection 
          onBack={onBack}
          onModeSelect={handleModeSelection}
          initialMode={fillWithoutManager ? 'without' : 'with'}
          hasContragent={!!(clientContragentId || insuredContragentId)}
        />
      );
    case 'questions':
    case 'answerSelection':
    case 'blank':
      return (
        <WithManager
          onBack={onBack}
          questionnaireData={questionnaireData}
          loadQuestionAnswers={loadQuestionAnswers}
          updateQuestionAnswer={updateQuestionAnswer}
          handleSaveQuestionnaire={handleSaveQuestionnaire}
          setCurrentView={setCurrentView}
          currentView={currentView}
          loadQuestionnaire={loadQuestionnaire}
        />
      );
    case 'without-manager':
      return (
        <WithoutManager
          onBack={onBack}
          questionnaireData={questionnaireData}
          handleSaveQuestionnaire={handleSaveQuestionnaire}
          setCurrentView={setCurrentView}
        />
      );
    default:
      return (
        <ModeSelection 
          onBack={onBack}
          onModeSelect={handleModeSelection}
          initialMode={fillWithoutManager ? 'without' : 'with'}
          hasContragent={!!(clientContragentId || insuredContragentId)}
        />
      );
  }
};

export default Questionary;
