import { useState, useEffect } from 'react';
import { getAccessToken } from '../../services/storageService';
import { getQuestionnaire, getQuestionAnswers, updateQuestionnaire } from '../../services/processService';

export const useQuestionnaire = (clientContragentId, insuredContragentId, applicationId, taskId, historyData, onSaveCallback) => {
  const [questionnaireData, setQuestionnaireData] = useState(null);
  const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(false);
  const [hasLoadedQuestionnaire, setHasLoadedQuestionnaire] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState({}); // Кэш для вариантов ответов по questionCode

  // Получаем последнюю задачу из истории для GET/PUT запросов
  const getLastTaskId = () => {
    if (historyData?.items && historyData.items.length > 0) {
      const lastItem = historyData.items[historyData.items.length - 1];
      if (lastItem.taskId || lastItem.id) {
        return lastItem.taskId || lastItem.id;
      }
    }
    if (taskId) return taskId;
    return applicationId;
  };

  // Сброс флага загрузки при изменении applicationId или contragentId
  useEffect(() => {
    setHasLoadedQuestionnaire(false);
    setQuestionnaireData(null);
    setQuestionAnswers({});
  }, [applicationId, clientContragentId, insuredContragentId]);

  // Загрузка вариантов ответов для вопроса
  const loadQuestionAnswers = async (questionCode) => {
    if (!questionCode) return [];
    
    // Проверяем кэш
    if (questionAnswers[questionCode]) {
      return questionAnswers[questionCode];
    }

    try {
      const token = getAccessToken();
      const answers = await getQuestionAnswers(questionCode, token);
      
      // Сохраняем в кэш
      setQuestionAnswers(prev => ({
        ...prev,
        [questionCode]: answers
      }));
      
      return answers;
    } catch (error) {
      return [];
    }
  };

  // Обновление ответа на вопрос
  const updateQuestionAnswer = (questionId, answerId, answerCode, answerName, answer = null, explanation = null, extraData = null) => {
    // Используем только insuredContragentId
    setQuestionnaireData(prev => {
      // Если данных еще нет, создаем базовую структуру
      if (!prev) {
        return {
          questionnaireTypeCode: 'healthdeclaration',
          contragentId: insuredContragentId,
          contragentQuestionnaires: questionId ? [{
            questionId: questionId,
            answerId,
            answerCode,
            answerName,
            answer,
            explanation
          }] : [],
          ...(extraData || {})
        };
      }

      let updatedQuestionnaires = [...(prev.contragentQuestionnaires || [])];
      if (questionId) {
        const existingIndex = updatedQuestionnaires.findIndex(q => q.questionId === questionId);
        if (existingIndex >= 0) {
          // Обновляем существующий вопрос
          updatedQuestionnaires[existingIndex] = {
            ...updatedQuestionnaires[existingIndex],
            answerId,
            answerCode,
            answerName,
            answer,
            explanation
          };
        } else {
          // Добавляем новый вопрос (для статичных вопросов бланк-опросника)
          updatedQuestionnaires.push({
            questionId: questionId,
            answerId,
            answerCode,
            answerName,
            answer,
            explanation
          });
        }
      }

      return {
        ...prev,
        contragentQuestionnaires: updatedQuestionnaires,
        ...(extraData || {})
      };
    });
  };

  // Сохранение анкеты
  const handleSave = async () => {
    // Используем только insuredContragentId
    if (!insuredContragentId) {
      if (onSaveCallback) {
        onSaveCallback({});
      }
      return;
    }

    try {
      const taskIdForPut = getLastTaskId();
      if (!taskIdForPut) {
        return;
      }

      if (!questionnaireData || !questionnaireData.contragentQuestionnaires || questionnaireData.contragentQuestionnaires.length === 0) {
        if (onSaveCallback) {
          onSaveCallback({});
        }
        return;
      }

      // Фильтруем вопросы в зависимости от типа анкеты
      const questionnaireType = questionnaireData.questionnaireTypeCode || 'healthdeclaration';
      const token = getAccessToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }
      
      if (questionnaireType === 'questionnaire') {
        // При сохранении бланк-опросника сначала сохраняем декларацию (если есть вопрос декларации)
        const declarationQuestion = questionnaireData.contragentQuestionnaires.find(q => {
          if (!q.questionCode) return false;
          const questionCodeNum = parseInt(q.questionCode);
          return questionCodeNum === 46 || questionCodeNum === 21; // 46 - новый формат, 21 - для обратной совместимости
        });

        if (declarationQuestion) {
          // Сначала сохраняем декларацию (только последний вопрос)
          const declarationPayload = {
            questionnaireTypeCode: 'healthdeclaration',
            contragentId: insuredContragentId, // Используем только insuredContragentId
            contragentQuestionnaires: [{
              questionId: declarationQuestion.questionId,
              answerId: declarationQuestion.answerId || null,
              answer: declarationQuestion.answer || null,
              explanation: declarationQuestion.explanation || null
            }],
            fillWithoutManager: questionnaireData.fillWithoutManager || false
          };
          
          await updateQuestionnaire(declarationPayload, taskIdForPut, token);
        }

        // Затем сохраняем бланк-опросник (только вопросы бланк-опросника)
        const questionnaireQuestions = questionnaireData.contragentQuestionnaires.filter(q => {
          if (!q.questionCode) return false;
          const questionCodeNum = parseInt(q.questionCode);
          return questionCodeNum >= 22 && questionCodeNum <= 45;
        });

        const questionnaireQuestionsToSave = questionnaireQuestions.map(q => ({
          questionId: q.questionId,
          answerId: q.answerId || null,
          answer: q.answer || null,
          explanation: q.explanation || null
        }));

        const questionnairePayload = {
          questionnaireTypeCode: 'questionnaire',
          contragentId: insuredContragentId, // Используем только insuredContragentId
          contragentQuestionnaires: questionnaireQuestionsToSave,
          fillWithoutManager: questionnaireData.fillWithoutManager || false
        };
        
        await updateQuestionnaire(questionnairePayload, taskIdForPut, token);
      } else {
        // Для декларации сохраняем вопрос согласия (questionCode 46 или 21 для обратной совместимости)
        const questionToSave = questionnaireData.contragentQuestionnaires.find(q => {
          if (!q.questionCode) return false;
          const questionCodeNum = parseInt(q.questionCode);
          return questionCodeNum === 46 || questionCodeNum === 21; // 46 - новый формат, 21 - для обратной совместимости
        });

        if (questionToSave) {
          const questionnairePayload = {
            questionnaireTypeCode: 'healthdeclaration',
            contragentId: insuredContragentId, // Используем только insuredContragentId
            contragentQuestionnaires: [{
              questionId: questionToSave.questionId,
              answerId: questionToSave.answerId || null,
              answer: questionToSave.answer || null,
              explanation: questionToSave.explanation || null
            }],
            fillWithoutManager: questionnaireData.fillWithoutManager || false
          };
          
          console.log('Сохранение декларации - taskId:', taskIdForPut, 'payload:', JSON.stringify(questionnairePayload, null, 2));
          await updateQuestionnaire(questionnairePayload, taskIdForPut, token);
        } else {
          console.warn('Не найден вопрос декларации для сохранения (questionCode 46 или 21)');
        }
      }

      if (onSaveCallback) {
        onSaveCallback({
          questionnaireData
        });
      }
    } catch (error) {
      alert(`Ошибка при сохранении анкеты: ${error.message || 'Неизвестная ошибка'}`);
      throw error; // Пробрасываем ошибку дальше
    }
  };

  // Функция для принудительной загрузки анкеты
  const forceLoadQuestionnaire = async () => {
    // Всегда устанавливаем загрузку в начале
    setIsLoadingQuestionnaire(true);
    setHasLoadedQuestionnaire(false);
    
    // Используем только insuredContragentId
    if (!insuredContragentId) {
      // Если нет contragentId, создаем пустую структуру
      setQuestionnaireData({
        questionnaireTypeCode: 'healthdeclaration',
        contragentId: null,
        contragentQuestionnaires: []
      });
      setHasLoadedQuestionnaire(true);
      setIsLoadingQuestionnaire(false);
      return;
    }
    
    const taskIdForGet = getLastTaskId();
    if (!taskIdForGet) {
      // Если нет taskId, создаем пустую структуру
      setQuestionnaireData({
        questionnaireTypeCode: 'healthdeclaration',
        contragentId: insuredContragentId,
        contragentQuestionnaires: []
      });
      setHasLoadedQuestionnaire(true);
      setIsLoadingQuestionnaire(false);
      return;
    }

    try {
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }
      
      // Загружаем декларацию (healthdeclaration) для insuredContragentId
      // API возвращает все вопросы (и декларации, и бланк-опросника) в одном ответе
      const promises = [];
      const promiseSources = []; // Запоминаем, какой запрос для какого contragentId
      
      if (insuredContragentId) {
        // Загружаем декларацию с типом healthdeclaration (но она может содержать и вопросы бланк-опросника)
        promises.push(
          getQuestionnaire(insuredContragentId, taskIdForGet, token, 'healthdeclaration')
            .catch(error => {
              // Если 401, пробрасываем ошибку дальше для правильной обработки
              if (error.message && error.message.includes('Сессия устарела')) {
                throw error;
              }
              // Для других ошибок тоже пробрасываем
              throw error;
            })
        );
        promiseSources.push('insured');
      }
      
      const results = await Promise.allSettled(promises);
      
      // Обрабатываем результаты запросов - используем ВСЕ вопросы из ответа (и декларации, и бланк-опросника)
      const allQuestions = [];
      let baseQuestionnaire = null;
      let insuredQuestionnaire = null;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const questionnaire = result.value;
          if (promiseSources[index] === 'insured') {
            insuredQuestionnaire = questionnaire;
          }
        }
      });
      
      // Используем insuredQuestionnaire как базовый
      // API возвращает все вопросы вместе (и декларации questionCode 1-21, и бланк-опросника questionCode 22-45)
      if (insuredQuestionnaire) {
        baseQuestionnaire = insuredQuestionnaire;
        if (insuredQuestionnaire.contragentQuestionnaires) {
          // Используем ВСЕ вопросы из ответа (и декларации, и бланк-опросника)
          insuredQuestionnaire.contragentQuestionnaires.forEach(q => {
            if (!allQuestions.find(existing => existing.questionId === q.questionId)) {
              allQuestions.push(q);
            }
          });
        }
      }
      
      if (baseQuestionnaire && allQuestions.length > 0) {
        setQuestionnaireData({
          ...baseQuestionnaire,
          questionnaireTypeCode: 'healthdeclaration', // Устанавливаем тип декларации (по умолчанию показываем декларацию)
          contragentId: insuredContragentId,
          contragentQuestionnaires: allQuestions // Все вопросы (и декларации, и бланк-опросника)
        });
      } else {
        // Если анкеты нет, создаем пустую структуру для нового создания
        setQuestionnaireData({
          questionnaireTypeCode: 'healthdeclaration',
          contragentId: insuredContragentId,
          contragentQuestionnaires: []
        });
      }
      
      setHasLoadedQuestionnaire(true);
    } catch (error) {
      // Если 404, значит анкеты еще нет - создаем пустую структуру
      if (error.message && (error.message.includes('404') || error.message.includes('Not Found'))) {
        setQuestionnaireData({
          questionnaireTypeCode: 'healthdeclaration',
          contragentId: insuredContragentId,
          contragentQuestionnaires: []
        });
      } else {
        // Для других ошибок тоже создаем пустую структуру
        setQuestionnaireData({
          questionnaireTypeCode: 'healthdeclaration',
          contragentId: insuredContragentId,
          contragentQuestionnaires: []
        });
      }
      setHasLoadedQuestionnaire(true);
    } finally {
      setIsLoadingQuestionnaire(false);
    }
  };

  // Функция для загрузки бланк-опросника (questionnaire)
  const loadQuestionnaire = async () => {
    setIsLoadingQuestionnaire(true);
    
    // Используем только insuredContragentId
    if (!insuredContragentId) {
      setIsLoadingQuestionnaire(false);
      return null;
    }
    
    const taskIdForGet = getLastTaskId();
    if (!taskIdForGet) {
      setIsLoadingQuestionnaire(false);
      return null;
    }

    try {
      // Проверяем, есть ли уже вопросы бланк-опросника (questionCode 22-45) в текущих данных
      const currentData = questionnaireData;
      const hasQuestionnaireQuestions = currentData?.contragentQuestionnaires?.some(q => {
        if (!q.questionCode) return false;
        const questionCodeNum = parseInt(q.questionCode);
        return questionCodeNum >= 22 && questionCodeNum <= 45;
      });

      // Если вопросы бланк-опросника уже есть, просто меняем тип и возвращаем
      if (hasQuestionnaireQuestions && currentData) {
        setQuestionnaireData(prev => ({
          ...prev,
          questionnaireTypeCode: 'questionnaire' // Меняем тип для отображения бланк-опросника
        }));
        setIsLoadingQuestionnaire(false);
        return currentData;
      }

      // Если вопросов бланк-опросника нет, загружаем их из API
      const token = getAccessToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }
      
      // Загружаем бланк-опросник с типом questionnaire
      const questionnaire = await getQuestionnaire(insuredContragentId, taskIdForGet, token, 'questionnaire');
      
      if (questionnaire) {
        // Объединяем вопросы бланк-опросника с существующими данными
        setQuestionnaireData(prev => {
          if (!prev) {
            return {
              ...questionnaire,
              questionnaireTypeCode: 'questionnaire',
              contragentId: insuredContragentId
            };
          }
          
          // Объединяем вопросы: сохраняем все существующие вопросы, обновляем/добавляем вопросы бланк-опросника
          const existingQuestions = prev.contragentQuestionnaires || [];
          const newQuestions = questionnaire.contragentQuestionnaires || [];
          const allQuestions = [...existingQuestions];
          
          // Обновляем или добавляем только вопросы бланк-опросника (questionCode от 22 до 45)
          newQuestions.forEach(newQ => {
            const existingIndex = allQuestions.findIndex(q => q.questionId === newQ.questionId);
            if (existingIndex >= 0) {
              allQuestions[existingIndex] = newQ;
            } else {
              // Добавляем только если это вопрос бланк-опросника
              const questionCodeNum = newQ.questionCode ? parseInt(newQ.questionCode) : 0;
              if (questionCodeNum >= 22 && questionCodeNum <= 45) {
                allQuestions.push(newQ);
              }
            }
          });
          
          return {
            ...prev,
            questionnaireTypeCode: 'questionnaire', // Временно меняем тип для отображения бланк-опросника
            contragentQuestionnaires: allQuestions
          };
        });
      }
      
      setIsLoadingQuestionnaire(false);
      return questionnaire;
    } catch (error) {
      setIsLoadingQuestionnaire(false);
      // Если 404, значит бланк-опросника еще нет
      if (error.message && (error.message.includes('404') || error.message.includes('Not Found'))) {
        return null;
      }
      throw error;
    }
  };

  return {
    questionnaireData,
    isLoadingQuestionnaire,
    hasLoadedQuestionnaire,
    questionAnswers,
    loadQuestionAnswers,
    updateQuestionAnswer,
    handleSave,
    getLastTaskId,
    forceLoadQuestionnaire,
    loadQuestionnaire
  };
};

