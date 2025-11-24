import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import Authorization from './Authorization';
import Statements from './Statements';
import Products from './Products';
import GonsApplication from './senim/application/Application';
import SenimApplication from './pensan/application/Application';
import {
  clearAllData,
  setCurrentApplicationId,
  saveApplicationMetadata,
  loadApplicationMetadata,
  getAccessToken
} from './services/storageService';
import {
  startStatementProcess,
  getStatementStatus,
  getTaskClaimAvailability
} from './services/processService';

function App() {
  // Проверяем наличие токена при инициализации и восстанавливаем состояние из sessionStorage
  const [currentView, setCurrentView] = useState(() => {
    const token = getAccessToken();
    if (!token) {
      return 'auth';
    }
    // Восстанавливаем состояние из sessionStorage
    const savedView = sessionStorage.getItem('currentView');
    return savedView || 'main';
  });

  // Сохраняем текущий view в sessionStorage при изменении
  useEffect(() => {
    if (currentView !== 'auth') {
      sessionStorage.setItem('currentView', currentView);
    }
  }, [currentView]);

  // Прокрутка наверх при изменении view
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);
  
  const [selectedProduct, setSelectedProduct] = useState(() => {
    const saved = sessionStorage.getItem('selectedProduct');
    return saved || null;
  });
  
  const [currentApplicationId, setCurrentApplicationIdState] = useState(() => {
    const saved = sessionStorage.getItem('currentApplicationId');
    return saved || null;
  });
  
  // Сохраняем selectedProduct и currentApplicationId в sessionStorage
  useEffect(() => {
    if (selectedProduct) {
      sessionStorage.setItem('selectedProduct', selectedProduct);
    }
  }, [selectedProduct]);
  
  useEffect(() => {
    if (currentApplicationId) {
      sessionStorage.setItem('currentApplicationId', currentApplicationId);
    }
  }, [currentApplicationId]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [processState, setProcessState] = useState(null);
  const [folderType, setFolderType] = useState('Statement'); // Тип папки: Statement или Task

  const extractProcessStateFromMetadata = (metadata) => {
    if (!metadata) return null;
    return {
      processId: metadata.processId || metadata.applicationId || null,
      taskId: metadata.taskId || null,
      statusCode: metadata.statusCode || null,
      statusName: metadata.statusName || metadata.status || null,
      taskStatusCode: metadata.taskStatusCode || null,
      taskStatusName: metadata.taskStatusName || null,
      canClaim: Boolean(metadata.canClaim)
    };
  };

  // Проверяет, нужно ли получать taskId через API (если taskId отсутствует или равен processInstanceId)
  const isTaskIdMissingOrProcessId = (taskId, processInstanceId) => {
    return !taskId || taskId === processInstanceId;
  };

  // Функция для получения статуса при создании новой заявки (повторяет запросы до получения taskId)
  const waitForTaskId = useCallback(
    async (processInstanceId, token, maxRetries = 10, delay = 1000) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const statusData = await getStatementStatus(processInstanceId, token);
          
          if (statusData?.taskId) {
            return statusData;
          }
          
          // Если taskId еще нет, ждем перед следующей попыткой
          if (attempt < maxRetries - 1) {
            const waitTime = delay * Math.pow(1.5, attempt); // Экспоненциальная задержка
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } catch (error) {
          console.error(`Ошибка при попытке ${attempt + 1} получения статуса:`, error);
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(1.5, attempt)));
          }
        }
      }
      return null;
    },
    []
  );

  // Функция для обновления статуса существующей заявки (использует только can-claim-task)
  const refreshProcessState = useCallback(
    async (targetApplicationId) => {
      const appId = targetApplicationId || currentApplicationId;
      if (!appId) return null;

      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error('Токен авторизации не найден');
        }

        // Загружаем метаданные, чтобы получить taskId и folderType
        const existingMetadata = loadApplicationMetadata(appId) || {};
        const folderType = existingMetadata.folderType || 'Statement'; // По умолчанию Statement

        let metadataUpdate = {
          ...existingMetadata,
          applicationId: appId,
          folderType
        };

        let statusData = null;
        let taskId = metadataUpdate.taskId || null;

        // Если taskId отсутствует или равен processInstanceId, получаем его через API
        if (isTaskIdMissingOrProcessId(taskId, appId)) {
          try {
            statusData = await getStatementStatus(appId, token);
            if (statusData?.taskId) {
              taskId = statusData.taskId;
            }
          } catch (error) {
            console.error('Не удалось получить статус процесса при обновлении:', error);
          }
        }

        if (!taskId) {
          const fallback = extractProcessStateFromMetadata(existingMetadata);
          if (fallback) {
            setProcessState(fallback);
          }
          return fallback;
        }

        // can-claim-task вызываем ТОЛЬКО для папки "Задачи" (Task), не для "Заявления" (Statement)
        let canClaimInfo = null;
        // Для всех заявок проверяем canClaim, если есть taskId
        if (taskId) {
          try {
            canClaimInfo = await getTaskClaimAvailability(taskId, token);
          } catch (error) {
            console.error('Не удалось получить canClaim при обновлении:', error);
            // Если не удалось получить canClaim, считаем что canClaim = false (задача уже наша)
            canClaimInfo = { canClaim: false };
          }
        } else {
          // Если нет taskId, считаем что canClaim = false
          canClaimInfo = { canClaim: false };
        }
        
        // Устанавливаем folderType в state при обновлении
        setFolderType(folderType);

        metadataUpdate = {
          ...metadataUpdate,
          taskId,
          canClaim: canClaimInfo?.canClaim ?? existingMetadata.canClaim ?? false
        };

        // Если получили данные из API, обновляем статусы
        if (statusData) {
          metadataUpdate = {
            ...metadataUpdate,
            statusCode: statusData.statusCode ?? metadataUpdate.statusCode,
            statusName: statusData.statusName ?? metadataUpdate.statusName,
            taskStatusCode: statusData.taskStatusCode ?? metadataUpdate.taskStatusCode,
            taskStatusName: statusData.taskStatusName ?? metadataUpdate.taskStatusName,
            status: (statusData.statusName ?? metadataUpdate.status) || 'Черновик',
            processId: statusData.processInstanceId || metadataUpdate.processId || appId
          };
        }

        saveApplicationMetadata(appId, metadataUpdate);
        const updatedProcessState = extractProcessStateFromMetadata(metadataUpdate);
        setProcessState(updatedProcessState);
        return updatedProcessState;
      } catch (error) {
        console.error('Ошибка обновления состояния процесса:', error);
        const fallback = extractProcessStateFromMetadata(loadApplicationMetadata(appId));
        if (fallback) {
          setProcessState(fallback);
        }
        return fallback;
      }
    },
    [currentApplicationId]
  );

  const handleLogin = () => {
    setCurrentView('main');
  };

  const handleLogout = () => {
    // Очищаем все данные из localStorage и sessionStorage при выходе (хард ресет)
    clearAllData();
    sessionStorage.removeItem('currentView');
    sessionStorage.removeItem('selectedProduct');
    sessionStorage.removeItem('currentApplicationId');
    setCurrentView('auth');
    setSelectedProduct(null);
    setCurrentApplicationIdState(null);
    setProcessState(null);
  };

  const handleCreateApplication = () => {
    // Не создаем ID заранее, он будет получен из API при выборе продукта
    setCurrentView('product');
  };

  const handleSelectProduct = async (product) => {
    if (!product || !product.code) {
      console.error('Продукт не выбран или неверный формат');
      return;
    }

    setIsCreatingApplication(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      // Вызываем API для создания заявки
      const result = await startStatementProcess(
        {
          productCode: product.code,
          operationType: 'New'
        },
        token
      );
      
      if (!result.processId) {
        throw new Error('processId не получен от сервера');
      }

      // Используем processId как applicationId
      const applicationId = result.processId;
      
      // Получаем номер заявки из List API с оптимизацией
      // Используем функцию для повторных попыток с экспоненциальной задержкой
      const getApplicationNumber = async (maxRetries = 3, delay = 500) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const listResponse = await fetch('https://crm-arm.onrender.com/api/Statement/List', {
              method: 'POST',
              mode: 'cors',
              headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pageNumber: 1,
                pageSize: 100,
                dateFrom: null,
                dateTo: null,
                direction: 'asc',
                folderType: 'Statement'
              }),
            });

            if (listResponse.ok) {
              const listData = await listResponse.json();
              
              if (listData && listData.statements && Array.isArray(listData.statements)) {
                const foundStatement = listData.statements.find(
                  st => st.processInstanceId === applicationId || st.id === applicationId
                );
                
                if (foundStatement && foundStatement.number) {
                  console.log('Найден номер заявки:', foundStatement.number);
                  return foundStatement.number;
                }
              }
            }
            
            // Если не найдено и есть еще попытки, ждем перед следующей попыткой
            if (attempt < maxRetries - 1) {
              const waitTime = delay * Math.pow(2, attempt); // Экспоненциальная задержка: 500ms, 1000ms, 2000ms
              console.log(`Заявка не найдена, повторная попытка через ${waitTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          } catch (error) {
            console.error(`Ошибка при попытке ${attempt + 1}:`, error);
            if (attempt < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
            }
          }
        }
        return null;
      };

      // Получаем номер заявки (не блокируем переход, если номер не найден сразу)
      const applicationNumber = await getApplicationNumber();
      
      setCurrentApplicationId(applicationId);
      setCurrentApplicationIdState(applicationId);
      
      // Определяем название продукта для отображения
      const productName = product.nameRu || product.nameKz || product.code;
      
      // Маппинг кода продукта на название для компонента
      let mappedProductName = productName;
      if (product.code === 'Senim') {
        mappedProductName = 'Сенiм';
      }
      
      setSelectedProduct(mappedProductName);
      
      // Сохраняем метаданные новой заявки с номером
      saveApplicationMetadata(applicationId, {
        applicationId: applicationId,
        product: mappedProductName,
        productCode: product.code,
        createdAt: new Date().toISOString(),
        policyholderIin: '',
        status: 'Черновик',
        processId: result.processId,
        number: applicationNumber // Сохраняем номер заявки
      });

      // При создании новой заявки: повторно запрашиваем GetStatus до получения taskId
      const statusData = await waitForTaskId(result.processId, token);

      // Получаем canClaim для новой задачи
      let canClaimInfo = null;
      if (statusData?.taskId) {
        canClaimInfo = await getTaskClaimAvailability(statusData.taskId, token);
      }

      // Обновляем метаданные с полученными данными
      const metadataUpdate = {
        applicationId: applicationId,
        product: mappedProductName,
        productCode: product.code,
        createdAt: new Date().toISOString(),
        policyholderIin: '',
        status: statusData?.statusName || 'Черновик',
        processId: result.processId,
        number: applicationNumber,
        statusCode: statusData?.statusCode || null,
        statusName: statusData?.statusName || null,
        taskStatusCode: statusData?.taskStatusCode || null,
        taskStatusName: statusData?.taskStatusName || null,
        taskId: statusData?.taskId || null,
        canClaim: canClaimInfo?.canClaim ?? false,
        folderType: 'Task' // Новая заявка - это задача
      };

      saveApplicationMetadata(applicationId, metadataUpdate);
      const processState = extractProcessStateFromMetadata(metadataUpdate);
      setProcessState(processState);
      
      // Устанавливаем folderType для новой заявки (это задача)
      setFolderType('Task');
      
      // Обновляем processState через refreshProcessState для консистентности
      await refreshProcessState(applicationId);
      
      // Переходим к заявлению
      setCurrentView('application');
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      // Ошибка логируется в консоль, pop-up уведомление убрано
    } finally {
      setIsCreatingApplication(false);
    }
  };

  const handleOpenApplication = async (applicationId, applicationData) => {
    if (!applicationId) return;
    
    // Определяем продукт по processName из данных заявки
    let product = null;
    // processInstanceId - это основной ID для работы с данными (processId)
    // applicationId из списка - это taskId, но данные сохраняются по processId
    let processInstanceId = applicationId;
    
    if (applicationData) {
      // Маппинг processName на название продукта
      if (applicationData.processName === 'Сеним') {
        product = 'Сенiм';
      } else if (applicationData.processName === 'ГОНС' || applicationData.processName === 'Пенсионный Аннуитет') {
        product = applicationData.processName;
      } else {
        // Используем processName как есть, если нет точного совпадения
        product = applicationData.processName || 'Сенiм';
      }
      
      // processInstanceId может быть в applicationData или равен applicationId
      const folderType = applicationData?.folderType || 'Statement'; // Тип папки: Statement или Task
      const isTask = folderType === 'Task' || folderType === 'Tasks' || applicationData?.isTask === true;
      
      // Для задач (Task) используем applicationId (который является id/taskId), для заявлений (Statement) - processInstanceId
      if (isTask) {
        // Для задач: applicationId = id (taskId), processInstanceId берем из данных
        processInstanceId = applicationData.processInstanceId || applicationId;
      } else {
        // Для заявлений: applicationId может быть и taskId, и processId, используем processInstanceId
        processInstanceId = applicationData.processInstanceId || applicationId;
      }
      
      const taskIdFromList = applicationData?.taskId || applicationData?.originalData?.taskId || (isTask ? applicationId : null);
      const taskStatusNameFromList = applicationData?.taskStatusName || applicationData?.originalData?.taskStatusName || null;
      const taskStatusCodeFromList = applicationData?.taskStatusCode || applicationData?.originalData?.taskStatusCode || null;
      
      let statusData = null;
      let canClaimInfo = null;
      let resolvedTaskId = taskIdFromList;

      // Если taskId отсутствует или равен processInstanceId, получаем его через API
      if (isTaskIdMissingOrProcessId(resolvedTaskId, processInstanceId)) {
        try {
          const token = getAccessToken();
          if (token) {
            statusData = await getStatementStatus(processInstanceId, token);
            if (statusData?.taskId) {
              resolvedTaskId = statusData.taskId;
            }
            if ((folderType === 'Task' || folderType === 'Tasks') && resolvedTaskId) {
              canClaimInfo = await getTaskClaimAvailability(resolvedTaskId, token);
            }
          }
        } catch (error) {
          console.error('Не удалось получить статус заявки при открытии:', error);
        }
      } else if ((folderType === 'Task' || folderType === 'Tasks') && resolvedTaskId) {
        try {
          const token = getAccessToken();
          if (token) {
            canClaimInfo = await getTaskClaimAvailability(resolvedTaskId, token);
          }
        } catch (error) {
          console.error('Не удалось получить canClaim при открытии:', error);
        }
      }
      
      // Сохраняем метаданные и по taskId (applicationId из списка), и по processId
      const metadataToSave = {
        applicationId: processInstanceId, // Используем processId как основной ID
        product: product,
        createdAt: applicationData.createdAt || new Date().toISOString(),
        policyholderIin: applicationData.policyholderIin || '',
        status: applicationData.status || 'Черновик',
        number: applicationData.number,
        processCode: applicationData.processCode,
        processName: applicationData.processName,
        processId: processInstanceId, // Сохраняем processId для использования в API
        folderType: folderType, // Сохраняем тип папки
        taskId: resolvedTaskId || applicationId, // Сохраняем актуальный taskId
        canClaim: canClaimInfo?.canClaim ?? false
      };

      if (taskStatusNameFromList) {
        metadataToSave.taskStatusName = taskStatusNameFromList;
      }

      if (taskStatusCodeFromList) {
        metadataToSave.taskStatusCode = taskStatusCodeFromList;
      }

      // Если получили данные из API, обновляем статусы
      if (statusData) {
        metadataToSave.statusCode = statusData.statusCode ?? metadataToSave.statusCode;
        metadataToSave.statusName = statusData.statusName ?? metadataToSave.statusName;
        metadataToSave.taskStatusCode = statusData.taskStatusCode ?? metadataToSave.taskStatusCode;
        metadataToSave.taskStatusName = statusData.taskStatusName ?? metadataToSave.taskStatusName;
      }

      // Сохраняем метаданные по processId (основной ID для данных)
      saveApplicationMetadata(processInstanceId, metadataToSave);
      
      // Также сохраняем метаданные по taskId для быстрого доступа
      if (applicationId !== processInstanceId) {
        saveApplicationMetadata(applicationId, {
          ...metadataToSave,
          applicationId: applicationId,
          processId: processInstanceId
        });
      }
      
      // Сохраняем folderType в state для передачи в компонент
      setFolderType(folderType);
    } else {
      // Если данных нет, загружаем из localStorage
      const metadata = loadApplicationMetadata(applicationId);
      if (metadata) {
        product = metadata.product;
        // Если есть processId, используем его
        if (metadata.processId) {
          processInstanceId = metadata.processId;
        }
        // Загружаем folderType из метаданных
        const savedFolderType = metadata.folderType || 'Statement';
        setFolderType(savedFolderType);
      } else {
        // Если метаданных нет, используем значение по умолчанию
        setFolderType('Statement');
      }
    }
    
    // Для задач используем applicationId (id/taskId), для заявлений - processInstanceId
    const finalApplicationId = (applicationData && (applicationData.folderType === 'Task' || applicationData.folderType === 'Tasks' || applicationData.isTask === true)) 
      ? applicationId  // Для задач используем id (taskId)
      : processInstanceId; // Для заявлений используем processInstanceId
    
    setCurrentApplicationId(finalApplicationId);
    setCurrentApplicationIdState(finalApplicationId);
    setSelectedProduct(product || 'Сенiм'); // По умолчанию Сенiм

    // Для refreshProcessState используем processInstanceId (нужен для API)
    await refreshProcessState(processInstanceId);
    setCurrentView('application');
  };

  // Восстанавливаем состояние application view при загрузке, если оно было сохранено
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }
    
    const savedView = sessionStorage.getItem('currentView');
    const savedApplicationId = sessionStorage.getItem('currentApplicationId');
    const savedProduct = sessionStorage.getItem('selectedProduct');
    
    // Если была открыта заявка, восстанавливаем состояние
    if (savedView === 'application' && savedApplicationId && savedProduct) {
      // Устанавливаем состояния, компонент Application сам загрузит данные
      setCurrentApplicationIdState(savedApplicationId);
      setSelectedProduct(savedProduct);
      // Обновляем processState используя сохраненный ID напрямую
      refreshProcessState(savedApplicationId).then(state => {
        if (state) {
          setProcessState(state);
        }
      }).catch(err => {
        console.error('Ошибка восстановления processState:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Выполняется только при монтировании

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedProduct(null);
    setCurrentApplicationIdState(null);
    setProcessState(null);
    // Очищаем sessionStorage при возврате на main
    sessionStorage.removeItem('currentView');
    sessionStorage.removeItem('selectedProduct');
    sessionStorage.removeItem('currentApplicationId');
    // Принудительно обновляем список заявлений при возврате
    setRefreshKey(prev => prev + 1);
  };

  const getApplicationComponent = () => {
    if (selectedProduct === 'Сенiм') {
      return (
        <GonsApplication
          selectedProduct={selectedProduct}
          applicationId={currentApplicationId}
          onBack={handleBackToMain}
          processState={processState}
          onProcessStateRefresh={refreshProcessState}
          folderType={folderType}
        />
      );
    } else if (selectedProduct === 'ГОНС' || selectedProduct === 'Пенсионный Аннуитет') {
      return <SenimApplication selectedProduct={selectedProduct} applicationId={currentApplicationId} onBack={handleBackToMain} folderType={folderType} />;
    }
    // Fallback to GonsApplication if product is not recognized
    return <GonsApplication selectedProduct={selectedProduct} applicationId={currentApplicationId} onBack={handleBackToMain} folderType={folderType} />;
  };

  const containerStyle = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    background: 'white'
  };


  if (currentView === 'auth') {
    return (
      <>
        <div style={containerStyle}>
          <Authorization onLogin={handleLogin} />
        </div>
      </>
    );
  }

  if (currentView === 'main') {
    return (
      <>
        <div style={containerStyle}>
          <Statements key={refreshKey} onCreateApplication={handleCreateApplication} onLogout={handleLogout} onOpenApplication={handleOpenApplication} />
        </div>
      </>
    );
  }

  if (currentView === 'product') {
    return (
      <>
        <div style={containerStyle}>
          <Products onSelectProduct={handleSelectProduct} onBack={handleBackToMain} isCreating={isCreatingApplication} />
        </div>
      </>
    );
  }

  if (currentView === 'application') {
    return (
      <>
        <div style={containerStyle}>
          {getApplicationComponent()}
        </div>
      </>
    );
  }

  return null;
}

export default App;
