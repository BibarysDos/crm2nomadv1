import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAllApplications, getAccessToken, loadApplicationMetadata, saveApplicationMetadata, loadApplicationDataByNumber } from './services/storageService';

const PROCESS_TYPES = ['Все', 'Оформление', 'Изменение', 'Расторжение', 'Выплаты'];
const PRODUCTS = ['Все', 'Сенiм'];
const STATUSES = ['Все', 'Новая заявка', 'Отклонено', 'Подписаное'];

const Statements = ({ onCreateApplication, onLogout, onOpenApplication }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [selectedProcessType, setSelectedProcessType] = useState('Все');
  const [selectedProduct, setSelectedProduct] = useState('Все');
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessTypeDropdownOpen, setIsProcessTypeDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const filterPanelRef = useRef(null);
  const searchInputRef = useRef(null);

  const closeAllDropdowns = () => {
    setIsProcessTypeDropdownOpen(false);
    setIsProductDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  // Загружаем список папок при монтировании
  useEffect(() => {
    loadFolders();
    // Не загружаем заявления здесь, они загрузятся после установки selectedFolder
  }, []);

  // Загружаем заявления при изменении выбранной папки
  useEffect(() => {
    console.log('useEffect selectedFolder изменился:', selectedFolder);
    if (selectedFolder) {
      console.log('Загружаем заявления для папки:', selectedFolder.code);
      // Очищаем старые данные перед загрузкой новых
      setApplications([]);
      setFilteredApplications([]);
      // Принудительно обновляем данные при переключении папок
      loadApplications(true);
    } else {
      console.log('selectedFolder еще не установлен');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder]);

  // Закрываем выпадающий список при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.Sectionsdropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (applications.length) {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications([]);
    }
  }, [applications]);

  useEffect(() => {
    const handleClickOutsideFilters = (event) => {
      if (!isFilterPanelOpen) return;
      const isInsidePanel = filterPanelRef.current && filterPanelRef.current.contains(event.target);
      const isFilterButton = event.target?.closest?.('.FilterButton');
      if (!isInsidePanel && !isFilterButton) {
        setIsFilterPanelOpen(false);
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutsideFilters);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideFilters);
    };
  }, [isFilterPanelOpen]);

  useEffect(() => {
    if (isSearchPanelOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchPanelOpen]);

  // Загружаем папки из API с кэшированием
  const loadFolders = async (forceRefresh = false) => {
    // Проверяем кэш (папки редко меняются, кэшируем на 5 минут)
    if (!forceRefresh) {
      const cachedFolders = localStorage.getItem('cached_folders');
      const cacheTimestamp = localStorage.getItem('cached_folders_timestamp');
      if (cachedFolders && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp, 10);
        const CACHE_DURATION = 5 * 60 * 1000; // 5 минут
        if (cacheAge < CACHE_DURATION) {
          console.log('Используем кэшированные папки');
          const foldersData = JSON.parse(cachedFolders);
          setFolders(foldersData);
          const statementFolder = foldersData.find(f => f.code === 'Statement') || foldersData[0];
          if (statementFolder) {
            setSelectedFolder(statementFolder);
          }
          return;
        }
      }
    }

    setLoadingFolders(true);
    try {
      const token = getAccessToken();
      console.log('loadFolders: Токен получен:', token ? 'Да (первые 20 символов: ' + token.substring(0, 20) + '...)' : 'НЕТ!');
      
      if (!token) {
        console.error('Токен авторизации не найден в loadFolders');
        throw new Error('Токен авторизации не найден');
      }

      console.log('Загружаем папки с токеном...');
      const authHeader = `Bearer ${token}`;
      
      const response = await fetch('https://crm-arm.onrender.com/api/Statement/Folders', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Ответ от сервера (статус):', response.status);

      if (!response.ok) {
        throw new Error(`Ошибка загрузки папок: ${response.status}`);
      }

      const foldersData = await response.json();
      console.log('Получены папки:', foldersData);
      
      if (Array.isArray(foldersData)) {
        // Кэшируем папки
        localStorage.setItem('cached_folders', JSON.stringify(foldersData));
        localStorage.setItem('cached_folders_timestamp', Date.now().toString());
        
        setFolders(foldersData);
        
        // По умолчанию выбираем "Statement" (Заявление) - все заявки в системе, если есть, иначе первую папку
        const statementFolder = foldersData.find(f => f.code === 'Statement');
        if (statementFolder) {
          console.log('Выбрана папка Statement:', statementFolder);
          setSelectedFolder(statementFolder);
        } else if (foldersData.length > 0) {
          console.log('Выбрана первая папка:', foldersData[0]);
          setSelectedFolder(foldersData[0]);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки папок:', error);
      // В случае ошибки устанавливаем дефолтную папку
      const defaultFolder = { code: 'Statement', name: 'Заявление' };
      setFolders([defaultFolder]);
      setSelectedFolder(defaultFolder);
    } finally {
      setLoadingFolders(false);
    }
  };

  // Функция для получения отображаемого названия папки
  const getFolderDisplayName = (folder) => {
    if (!folder) return 'Заявление';
    
    // Маппинг названий: если от API приходит "Заявки", показываем "Заявление"
    if (folder.code === 'Statement') {
      return 'Заявление';
    }
    
    // Маппинг для папки "Задачи"
    if (folder.code === 'Task' || folder.code === 'Tasks') {
      return 'Задачи';
    }
    
    // Для остальных папок используем название от API
    return folder.name;
  };

  const handleFolderSelect = (folder) => {
    // Очищаем старые данные перед переключением
    setApplications([]);
    setFilteredApplications([]);
    setSelectedFolder(folder);
    setIsDropdownOpen(false);
    // Загружаем данные для выбранной папки с принудительным обновлением
    // Не вызываем loadApplications здесь, так как useEffect для selectedFolder сделает это автоматически
  };

  // Обработчик кнопки обновления - принудительно обновляет данные из API
  const handleRefresh = async () => {
    console.log('Обновление списка заявлений...');
    await loadApplications(true);
  };

  const loadApplications = async (forceRefresh = false) => {
    setLoadingApplications(true);
    try {
      const token = getAccessToken();
      console.log('loadApplications: Токен получен:', token ? 'Да (первые 20 символов: ' + token.substring(0, 20) + '...)' : 'НЕТ!');
      
      if (!token) {
        console.log('Токен не найден, используем данные из localStorage');
        // Если нет токена, используем данные из localStorage
        const apps = getAllApplications();
        setApplications(apps);
        setLoadingApplications(false);
        return;
      }

      // Загружаем папки, если еще не загружены
      if (!selectedFolder && folders.length > 0) {
        const statementFolder = folders.find(f => f.code === 'Statement') || folders[0];
        if (statementFolder) {
          setSelectedFolder(statementFolder);
        }
      }

      const folderType = selectedFolder?.code || 'Statement';
      console.log('Загружаем заявления для папки:', folderType);

      // Загружаем заявления из API
      const authHeader = `Bearer ${token}`;
      console.log('Заголовок Authorization для заявлений (первые 30 символов):', authHeader.substring(0, 30) + '...');
      console.log('Принудительное обновление:', forceRefresh ? 'Да' : 'Нет');
      
      // Всегда используем no-cache и добавляем timestamp для предотвращения кэширования
      const timestamp = Date.now();
      const response = await fetch(`https://crm-arm.onrender.com/api/Statement/List?_t=${timestamp}`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'accept': '*/*',
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          pageNumber: 1,
          pageSize: 10,
          dateFrom: null,
          dateTo: null,
          direction: 'asc',
          folderType: folderType
        }),
      });
      
      console.log('Ответ от сервера для заявлений (статус):', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка загрузки заявлений:', response.status, errorText);
        throw new Error(`Ошибка загрузки заявлений: ${response.status}`);
      }

      const data = await response.json();
      console.log('Получены данные от API:', data);
      
      if (data && data.statements && Array.isArray(data.statements)) {
        console.log('Найдено заявлений:', data.statements.length);
        
        // Преобразуем формат данных из API в формат, который ожидает компонент
        // ВАЖНО: Список заявок всегда берется из API, данные из localStorage - только дополнение
        const transformedApps = data.statements.map(statement => {
          try {
            // В Statement/List taskId может быть отдельным полем, а id не всегда равен taskId
            const statementTaskId = statement.taskId || statement.task_id || statement.id;
            const statementTaskStatusName = statement.taskStatusName || statement.task_status_name || null;
            const statementTaskStatusCode = statement.taskStatusCode || statement.task_status_code || null;
            
            // Загружаем метаданные по taskId и processInstanceId
            const metadataTask = loadApplicationMetadata(statement.id) || {};
            const metadataProcess = statement.processInstanceId
              ? (loadApplicationMetadata(statement.processInstanceId) || {})
              : {};
            const combinedMetadata = { ...metadataTask, ...metadataProcess };
            
            // Основной источник ИИН - данные из API
            let policyholderIin = statement.insurerIIN || combinedMetadata.policyholderIin || '';
            let insuranceAmount = null; // Страховая сумма из Terms данных
            const extractInsuranceAmount = (insuranceProductName) => {
              if (!insuranceProductName) return null;
              const match = insuranceProductName.match(/(\d+)/);
              if (match) {
                const amount = parseInt(match[1], 10);
                if (!Number.isNaN(amount)) {
                  return `${amount} 000 USD`;
                }
              }
              return null;
            };
            
            // Пытаемся загрузить дополнительные данные из localStorage (опционально, только для дополнения)
            try {
              // Если в метаданных есть ИИН, используем его (может быть более актуальным)
              if (combinedMetadata?.policyholderIin) {
                policyholderIin = combinedMetadata.policyholderIin;
              }
              
            // Дополнительно: проверяем данные по номеру заявки (если есть)
            // Загружаем один раз для извлечения ИИН и страховой суммы
            let dataByNumber = null;
            const applicationNumber = statement.number || combinedMetadata?.number;
              if (applicationNumber) {
                try {
                  dataByNumber = loadApplicationDataByNumber(applicationNumber);
                  // Извлекаем ИИН страхователя из глобальных данных (приоритет: глобальные данные > метаданные > API)
                const policyholderFromData = dataByNumber?.policyholder || dataByNumber?.Policyholder;
                if (policyholderFromData?.iin) {
                  policyholderIin = policyholderFromData.iin;
                  }
                  // Извлекаем страховую сумму из Terms данных
                const termsData = dataByNumber?.terms || dataByNumber?.Terms;
                const insuranceProductName =
                  termsData?.dictionaryValues?.insuranceProduct ||
                  termsData?.dictionary_values?.insuranceProduct ||
                  termsData?.dictionaryValues?.insuranceProgramName ||
                  termsData?.dictionary_values?.insuranceProgramName;
                insuranceAmount = extractInsuranceAmount(insuranceProductName);
                } catch (error) {
                  // Игнорируем ошибки загрузки данных по номеру - не критично
                  console.warn('Не удалось загрузить данные по номеру заявки:', applicationNumber, error);
                }
              }
              
              // Обновляем метаданные свежими данными по задаче и статусу
              const folderType = selectedFolder?.code || 'Statement';
              const finalStatusName = combinedMetadata?.statusName || statement.statusName || metadataTask?.statusName || 'Черновик';
              const finalStatusCode = combinedMetadata?.statusCode || statement.statusCode || metadataTask?.statusCode || null;
              const finalTaskStatusName = combinedMetadata?.taskStatusName || statementTaskStatusName || null;
              const finalTaskStatusCode = combinedMetadata?.taskStatusCode || statementTaskStatusCode || null;
              const metadataToPersist = {
                ...metadataTask,
                applicationId: statement.id,
                product: metadataTask?.product || statement.processName || '',
                processId: metadataTask?.processId || statement.processInstanceId || statement.id,
                processName: statement.processName || metadataTask?.processName,
                processCode: statement.processCode || metadataTask?.processCode,
                status: finalStatusName,
                statusName: finalStatusName,
                statusCode: finalStatusCode,
                taskId: statementTaskId, // id = taskId!
                taskStatusName: finalTaskStatusName,
                taskStatusCode: finalTaskStatusCode,
                folderType: folderType, // Сохраняем тип папки
                number: statement.number || metadataTask?.number || null, // Сохраняем номер заявки!
                policyholderIin: policyholderIin, // Сохраняем найденный ИИН
                operationTypeName: statement.operationTypeName || metadataTask?.operationTypeName || null // Сохраняем тип операции
              };
              saveApplicationMetadata(statement.id, metadataToPersist);
              
              // Также сохраняем метаданные по processId, если он отличается от taskId
              const processId = statement.processInstanceId || statement.id;
              if (processId !== statement.id) {
                const processMetadata = {
                  ...metadataToPersist,
                  applicationId: processId,
                  processId: processId,
                  statusName: combinedMetadata?.statusName || metadataToPersist.statusName,
                  statusCode: combinedMetadata?.statusCode || metadataToPersist.statusCode
                };
                saveApplicationMetadata(processId, processMetadata);
              }
            } catch (error) {
              // Игнорируем ошибки загрузки метаданных - не критично для отображения заявки
              console.warn('Не удалось загрузить метаданные для заявки:', statement.id, error);
            }
            
            // Если не удалось извлечь страховую сумму выше (когда metadata не загрузился), пытаемся еще раз
            if (!insuranceAmount && statement.number) {
              try {
                const dataByNumber = loadApplicationDataByNumber(statement.number);
                const termsData = dataByNumber?.terms || dataByNumber?.Terms;
                const insuranceProductName =
                  termsData?.dictionaryValues?.insuranceProduct ||
                  termsData?.dictionary_values?.insuranceProduct ||
                  termsData?.dictionaryValues?.insuranceProgramName ||
                  termsData?.dictionary_values?.insuranceProgramName;
                insuranceAmount = extractInsuranceAmount(insuranceProductName);
              } catch (error) {
                // Игнорируем ошибки
              }
            }
            
            // Рассчитываем финальные статусы для отображения (приоритет: метаданные процесса -> метаданные задачи -> API)
            const displayStatusName = combinedMetadata?.statusName || statement.statusName || 'Черновик';
            const displayTaskStatusName = combinedMetadata?.taskStatusName || statementTaskStatusName || null;
            const displayTaskStatusCode = combinedMetadata?.taskStatusCode || statementTaskStatusCode || null;
            
            // ВСЕГДА возвращаем заявку из API, даже если не удалось загрузить дополнительные данные
            return {
              applicationId: statement.id,
              number: statement.number,
              policyholderIin: policyholderIin, // ИИН из API или из localStorage (если удалось загрузить)
              createdAt: statement.date,
              product: statement.processName || '',
              status: displayStatusName,
              processCode: statement.processCode,
              processName: statement.processName,
              operationTypeName: statement.operationTypeName || null, // Тип операции из API
              insuranceAmount: insuranceAmount, // Страховая сумма из Terms данных
              processInstanceId: statement.processInstanceId || statement.id, // Важно: processId для загрузки данных
              taskId: statementTaskId, // id = taskId!
              taskStatusName: displayTaskStatusName,
              taskStatusCode: displayTaskStatusCode,
              userFullName: statement.userFullName,
              // Сохраняем оригинальные данные для возможного использования
              originalData: statement
            };
          } catch (error) {
            // В случае любой ошибки все равно возвращаем заявку из API с базовыми данными
            console.error('Ошибка при обработке заявки:', statement.id, error);
            return {
              applicationId: statement.id,
              number: statement.number,
              policyholderIin: statement.insurerIIN || '', // Используем данные из API
              createdAt: statement.date,
              product: statement.processName || '',
              status: statement.statusName || 'Черновик',
              processCode: statement.processCode,
              processName: statement.processName,
              operationTypeName: statement.operationTypeName || null, // Тип операции из API
              insuranceAmount: null, // Не удалось загрузить
              processInstanceId: statement.processInstanceId || statement.id,
              taskId: statement.id,
              taskStatusName: statement.taskStatusName || statement.task_status_name || null,
              taskStatusCode: statement.taskStatusCode || statement.task_status_code || null,
              userFullName: statement.userFullName,
              originalData: statement
            };
          }
        });
        
        console.log('Преобразованные заявления:', transformedApps);
        setApplications(transformedApps);
        
        // НЕ сохраняем в localStorage, чтобы избежать показа старых данных при переключении папок
        // Каждый раз загружаем свежие данные из API
      } else {
        console.warn('Данные от API в неожиданном формате:', data);
        // Если нет данных из API, используем данные из localStorage
        const apps = getAllApplications();
        setApplications(apps);
      }
    } catch (error) {
      console.error('Ошибка загрузки заявлений из API:', error);
      // В случае ошибки используем данные из localStorage
      const apps = getAllApplications();
      setApplications(apps);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Форматирование даты (вынесено за компонент для оптимизации)
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
  }, []);

  // Форматирование номера заявления (первые 8 символов)
  const formatApplicationId = useCallback((applicationId) => {
    if (!applicationId) return '';
    return applicationId.substring(0, 8).toUpperCase();
  }, []);

  const handleApplicationClick = (applicationId) => {
    // Находим полные данные заявки
    const application = applications.find(app => app.applicationId === applicationId);
    if (onOpenApplication) {
      // Передаем ID, полные данные заявки и тип папки (Statement или Task)
      const folderType = selectedFolder?.code || 'Statement';
      onOpenApplication(applicationId, { ...application, folderType });
    }
  };

  // Константа для отображения прочерка
  const DASH = '-';
  const handleCreateApplication = () => {
    if (onCreateApplication) {
      onCreateApplication();
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen((prev) => !prev);
    closeAllDropdowns();
  };

  const toggleSearchPanel = () => {
    setIsSearchPanelOpen((prev) => {
      if (prev) {
        setSearchQuery('');
        return false;
      }
      return true;
    });
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    if (!isSearchPanelOpen) {
      setIsSearchPanelOpen(true);
    }
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchClose = () => {
    setSearchQuery('');
    setIsSearchPanelOpen(false);
  };

  const handleProcessTypeSelect = (value) => {
    setSelectedProcessType(value);
    setIsProcessTypeDropdownOpen(false);
  };

  const handleProductSelect = (value) => {
    setSelectedProduct(value);
    setIsProductDropdownOpen(false);
  };

  const handleStatusSelect = (value) => {
    setSelectedStatus(value);
    setIsStatusDropdownOpen(false);
  };

  const applyFilters = () => {
    if (!applications.length) {
      return [];
    }

    return applications.filter((app) => {
      const processMatch =
        selectedProcessType === 'Все' ||
        (app.operationTypeName || app.processName || '').toLowerCase() === selectedProcessType.toLowerCase();
      const productMatch =
        selectedProduct === 'Все' ||
        (app.product || '').toLowerCase() === selectedProduct.toLowerCase();
      const statusMatch =
        selectedStatus === 'Все' ||
        (app.status || '').toLowerCase() === selectedStatus.toLowerCase();

      return processMatch && productMatch && statusMatch;
    });
  };

  const handleApplyFilters = () => {
    setFilteredApplications(applyFilters());
    setIsFilterPanelOpen(false);
    closeAllDropdowns();
  };

  const handleResetFilters = () => {
    setSelectedProcessType('Все');
    setSelectedProduct('Все');
    setSelectedStatus('Все');
    closeAllDropdowns();
    setFilteredApplications(applications);
  };

  const handleCloseFilters = () => {
    setIsFilterPanelOpen(false);
    closeAllDropdowns();
  };

  const isAnyFilterSelected =
    selectedProcessType !== 'Все' ||
    selectedProduct !== 'Все' ||
    selectedStatus !== 'Все';

  const applySearch = (apps) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return apps;

    return apps.filter((app) => {
      const fields = [
        app.number,
        app.policyholderIin,
        app.operationTypeName,
        app.processName,
        app.status,
      ];

      return fields.some((value) => {
        if (!value) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  };

  const baseApplications =
    filteredApplications.length || isAnyFilterSelected ? filteredApplications : applications;

  const displayedApplications = applySearch(baseApplications);

  return (
    <>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .Refresh.rotating {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div data-layer="Sections applications" className="SectionsApplications" style={{width: 1512, height: 1436, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div data-layer="Menu" data-property-1="Menu four" className="Menu" style={{width: 85, height: 1436, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Sidebar" className="Sidebar" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="Menu button" className="MenuButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}}>
            <div data-layer="360" style={{left: 27, top: 33, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>360</div>
          </div>
          {/* Filter panel renders inside ApplicationSection */}
          <button
            data-layer="Increase button" 
            className="IncreaseButton" 
            type="button"
            style={{
              width: 85, 
              height: 85, 
              position: 'relative', 
              background: 'black', 
              overflow: 'hidden', 
              borderRight: '1px #F8E8E8 solid', 
              borderLeft: 'none',
              borderTop: 'none',
              borderBottom: 'none',
              cursor: 'pointer', 
              zIndex: 10,
              userSelect: 'none',
              padding: 0,
              margin: 0,
              outline: 'none'
            }} 
            onClick={handleCreateApplication}
          >
            <div data-svg-wrapper data-layer="Plus" className="Plus" style={{left: 31, top: 32, position: 'absolute', pointerEvents: 'none'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M11 3C11.5523 3 12 3 12 3V10H19C19 10 19 10.4477 19 11C19 11.5523 19 12 19 12L12 12V19C12 19 11.5523 19 11 19C10.4477 19 10 19 10 19V12L3.00004 12C3.00004 12 3 11.5523 3 11C3 10.4477 3.00004 10 3.00004 10L10 10V3C10 3 10.4477 3 11 3Z" fill="white"/>
              </svg>
            </div>
          </button>
          <div
            data-layer="Filter button"
            className="FilterButton"
            style={{
              width: 85,
              height: 85,
              position: 'relative',
              background: isFilterPanelOpen || isAnyFilterSelected ? '#EDEDED' : '#FBF9F9',
              overflow: 'hidden',
              borderBottom: '1px #F8E8E8 solid',
              cursor: 'pointer'
            }}
            onClick={toggleFilterPanel}
          >
            <div data-svg-wrapper data-layer="filter" className="Filter" style={{left: 31.50, top: 31.50, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5768 2.80361C3.56788 2.80919 3.53999 2.817 3.51544 2.82146C3.43957 2.83485 3.30903 2.9018 3.23762 2.96539C3.09927 3.08701 3.01782 3.25102 3.0022 3.44181C2.9877 3.61475 3.0446 3.78434 3.18183 3.97513C3.21642 4.022 3.27556 4.10456 3.31461 4.16035C3.35366 4.21502 3.40387 4.28531 3.42618 4.31655C3.4485 4.34667 3.52102 4.45044 3.58796 4.54528C3.65491 4.64011 3.72743 4.74276 3.74974 4.774C3.82338 4.87442 3.98963 5.10761 4.01752 5.14889C4.04207 5.18571 4.20385 5.41555 4.29645 5.54386C4.34332 5.60857 4.38014 5.6599 4.5832 5.94553C4.66576 6.06156 4.75391 6.18764 4.77957 6.22446C4.80523 6.26128 4.84763 6.32153 4.87441 6.35835C4.90118 6.39517 4.9804 6.50563 5.04958 6.60381C5.11987 6.70199 5.18904 6.80018 5.20466 6.82249C5.22028 6.84481 5.26268 6.90394 5.29839 6.95415C5.33297 7.00324 5.39099 7.08469 5.4267 7.1349C5.46128 7.18511 5.51819 7.26433 5.55166 7.3123C5.71009 7.53768 5.7603 7.60797 5.79266 7.65037C5.81163 7.67603 5.86406 7.74967 5.90869 7.81438C5.95332 7.8791 6.00911 7.95608 6.03143 7.98732C6.05486 8.01745 6.09391 8.07324 6.11957 8.11005C6.16531 8.17588 6.20771 8.23502 6.4554 8.58424C6.60491 8.794 6.6819 8.90334 6.79347 9.06066C6.87269 9.17335 7.05456 9.42885 7.21076 9.64754C7.25539 9.71002 7.30448 9.7792 7.31898 9.80151C7.33461 9.82383 7.41159 9.93205 7.48969 10.0414C7.56779 10.1519 7.64143 10.2534 7.65147 10.269C7.74631 10.404 7.81549 10.5011 7.98396 10.7376C8.09107 10.8871 8.18703 11.021 8.19595 11.0355C8.20488 11.0489 8.27517 11.1482 8.35216 11.2564C8.42914 11.3647 8.52175 11.5019 8.55968 11.561C8.66345 11.7262 8.74266 11.9437 8.77948 12.1591C8.78729 12.2037 8.79287 13.3429 8.79734 15.4516L8.80515 18.6761L8.82858 18.7386C8.87432 18.8613 8.91226 18.9204 8.99817 19.0041C9.13875 19.1436 9.28714 19.2049 9.47682 19.2061C9.57612 19.2061 9.60625 19.2016 9.69439 19.1715C9.7948 19.1391 9.99787 19.0632 10.1318 19.0108C10.1686 18.9963 10.3069 18.9427 10.4386 18.8925C10.8983 18.7185 11.1973 18.6047 11.4427 18.5098C11.532 18.4764 11.7574 18.3893 11.9448 18.319C12.1323 18.2476 12.3577 18.1617 12.4469 18.1271C12.5362 18.0925 12.6489 18.0502 12.698 18.0323C12.8441 17.9799 12.9244 17.9363 13.0003 17.8649C13.0762 17.7935 13.1431 17.6864 13.1788 17.5771C13.1989 17.5191 13.2 17.3952 13.2067 14.8714C13.2112 13.1766 13.2179 12.2015 13.2246 12.1546C13.248 12.0073 13.2848 11.8812 13.3417 11.7552C13.3585 11.7172 13.373 11.6815 13.373 11.6771C13.373 11.6603 13.5269 11.4305 13.7188 11.1605C13.7523 11.1136 13.8204 11.0177 13.8695 10.9485C13.9186 10.8793 13.9788 10.7934 14.0034 10.7588C14.0737 10.6595 14.2254 10.4475 14.2432 10.4219C14.2522 10.4085 14.3314 10.2969 14.4184 10.1742C14.5054 10.0514 14.5869 9.9354 14.6003 9.91755C14.6137 9.89858 14.6427 9.85841 14.665 9.82717C14.6873 9.79593 14.7252 9.74349 14.7487 9.71002C14.7721 9.67655 14.8469 9.57279 14.9149 9.47795C14.9819 9.38311 15.0611 9.27154 15.0901 9.23137C15.1448 9.15104 15.2987 8.93458 15.3534 8.85871C15.3969 8.79735 15.5487 8.58313 15.6268 8.47267C15.6602 8.42469 15.7428 8.30866 15.8097 8.21382C15.8767 8.1201 15.9548 8.01075 15.9827 7.97059C16.0117 7.93042 16.0507 7.87575 16.0708 7.84786C16.0909 7.81996 16.1188 7.7798 16.1344 7.7586C16.169 7.70839 16.2081 7.6526 16.3565 7.44396C16.4234 7.35024 16.5093 7.23085 16.5461 7.17841C16.5829 7.12597 16.6276 7.06349 16.6454 7.03895C16.6633 7.0144 16.7525 6.88832 16.8429 6.76001C17.1252 6.3617 17.1486 6.32934 17.1888 6.27355C17.21 6.24454 17.3004 6.11623 17.3896 5.99016C17.4789 5.86408 17.5815 5.71903 17.6183 5.66771C17.6552 5.61638 17.7043 5.54721 17.7277 5.51485C17.7511 5.48138 17.8381 5.35865 17.9207 5.24261C18.0044 5.12546 18.0892 5.00496 18.1115 4.97484C18.1327 4.94359 18.1818 4.8733 18.222 4.81863C18.261 4.76285 18.3023 4.70594 18.3135 4.69032C18.3413 4.64904 18.6359 4.23399 18.6738 4.18266C18.6917 4.15812 18.7319 4.1001 18.7642 4.05435C18.7955 4.00861 18.8323 3.95728 18.8457 3.94166C18.8948 3.88253 18.974 3.70401 18.9907 3.6181C19.0108 3.50764 18.9974 3.34251 18.9595 3.23763C18.926 3.14837 18.839 3.02564 18.7642 2.96539C18.7352 2.94196 18.7028 2.91407 18.6928 2.90514C18.6738 2.88841 18.5611 2.84489 18.4529 2.81142C18.4005 2.79469 17.7199 2.79357 10.9942 2.79357C6.92401 2.79357 3.58573 2.79803 3.5768 2.80361Z" fill="black"/>
              </svg>
            </div>
          </div>
          <div
            data-layer="Search button"
            className="SearchButton"
            style={{
              width: 85,
              height: 85,
              position: 'relative',
              background: isSearchPanelOpen || searchQuery ? '#EDEDED' : '#FBF9F9',
              overflow: 'hidden',
              borderBottom: '1px #F8E8E8 solid',
              cursor: 'pointer'
            }}
            onClick={toggleSearchPanel}
          >
            <div data-svg-wrapper data-layer="Search" className="Search" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.25 19.25L13.7501 13.75M15.5833 9.16667C15.5833 12.7105 12.7105 15.5833 9.16667 15.5833C5.62284 15.5833 2.75 12.7105 2.75 9.16667C2.75 5.62284 5.62284 2.75 9.16667 2.75C12.7105 2.75 15.5833 5.62284 15.5833 9.16667Z" stroke="black" strokeWidth="1.83333" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div data-layer="Download  button" className="DownloadButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}}>
            <div data-svg-wrapper data-layer="Download" className="Download" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 18.5L5 12.5L6.41016 11.0801L10 14.6699L10 0.5L12 0.5L12 14.6699L15.5898 11.0898L17 12.5L11 18.5ZM17 21.5L5 21.5V19.5L17 19.5V21.5Z" fill="black"/>
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="Log-out button" className="LogOutButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}} onClick={handleLogout}>
          <div data-layer="log-out" className="LogOut" style={{width: 22, height: 22, left: 31, top: 32, position: 'absolute', overflow: 'hidden'}}>
            <div data-svg-wrapper data-layer="Frame 1321316876" className="Frame1321316876" style={{left: 2.04, top: 2.08, position: 'absolute'}}>
              <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.74693 0.00292778L0.623591 0.0092907L0.54087 0.0398331C0.437786 0.0780125 0.30416 0.163279 0.229074 0.238365C0.150171 0.317268 0.066177 0.450895 0.0305432 0.556524L0 0.645607V8.91137V17.1771L0.0292706 17.2611C0.1209 17.5309 0.332158 17.7307 0.604501 17.8033C0.682132 17.8249 0.915024 17.8262 4.79147 17.8262H8.89571V17.018V16.2099L5.25598 16.2036L1.61625 16.1972V8.91137V1.62554L5.25598 1.61917L8.89571 1.61281L8.89953 0.809778C8.90208 0.172188 8.89953 0.00419998 8.88681 0.00165558C8.8779 -0.000890732 7.01476 -0.000890732 4.74693 0.00292778Z" fill="black"/>
              <path d="M11.3353 4.05404C11.0261 4.36329 10.7728 4.62164 10.7728 4.62673C10.7728 4.63182 11.5491 5.41194 12.4972 6.36133C13.4466 7.30944 14.2191 8.09084 14.2153 8.09847C14.2102 8.10611 12.1574 8.10993 8.72767 8.10993C4.3409 8.10993 3.24516 8.11247 3.23626 8.1252C3.23116 8.13411 3.22607 8.48917 3.22607 8.91296C3.22607 9.50983 3.22989 9.68799 3.24262 9.70454C3.25662 9.7249 3.59387 9.72617 8.73404 9.72363C13.6019 9.71981 14.2089 9.72236 14.2089 9.7389C14.2089 9.74908 13.4364 10.5318 12.4909 11.476C11.5466 12.4203 10.7728 13.1966 10.7728 13.2005C10.7728 13.2132 11.8927 14.3267 11.908 14.3306C11.9169 14.3318 13.033 13.2234 14.3884 11.868C17.0634 9.19039 16.9056 9.35711 16.9731 9.14713C16.996 9.07459 17.0011 9.02877 16.9998 8.90532C16.9998 8.76661 16.996 8.74243 16.9603 8.64825C16.94 8.59098 16.9005 8.51081 16.8738 8.47008C16.842 8.42045 16.0122 7.58179 14.3756 5.94263C13.0279 4.59364 11.9194 3.49027 11.9118 3.49027C11.9042 3.49027 11.6458 3.74352 11.3353 4.05404Z" fill="black"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div data-layer="Application section" className="ApplicationSection" style={{flex: '1 1 0', alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Container with elements" className="ContainerWithElements" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div 
            data-layer="SectionsDropdown" 
            data-state={isDropdownOpen ? "dropdown_selected" : "dropdown"} 
            className="Sectionsdropdown" 
            style={{
              width: 1427, 
              height: 85, 
              paddingLeft: 20, 
              background: 'white', 
              overflow: 'visible', 
              borderBottom: '1px #F8E8E8 solid', 
              justifyContent: 'flex-start', 
              alignItems: 'center', 
              display: 'inline-flex',
              position: 'relative',
              zIndex: 10
            }}
          >
            <div 
              data-layer="Text container" 
              className="TextContainer" 
              style={{
                flex: '1 1 0', 
                paddingTop: 20, 
                paddingBottom: 20, 
                paddingRight: 16, 
                overflow: 'hidden', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 10, 
                display: 'flex',
                cursor: 'pointer'
              }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div 
                data-layer="Label" 
                className="Label" 
                style={{
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
                {loadingFolders ? 'Загрузка...' : getFolderDisplayName(selectedFolder)}
              </div>
            </div>
            <div 
              data-layer="Open button" 
              className="OpenButton" 
              style={{
                width: 85, 
                height: 85, 
                position: 'relative', 
                background: '#FBF9F9', 
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div 
                data-svg-wrapper 
                data-layer="Chewron down" 
                className="ChewronDown" 
                style={{
                  left: 31, 
                  top: 32, 
                  position: 'absolute',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5 7.5L11 15.5L3.5 7.5" stroke="black" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            {isDropdownOpen && folders.length > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px #F8E8E8 solid',
                  borderTop: 'none',
                  zIndex: 1000,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                {folders.map((folder) => (
                  <div
                    key={folder.code}
                    onClick={() => handleFolderSelect(folder)}
                    style={{
                      padding: '20px',
                      cursor: 'pointer',
                      background: selectedFolder?.code === folder.code ? '#FBF9F9' : 'white',
                      borderBottom: '1px #F8E8E8 solid',
                      color: 'black',
                      fontSize: 16,
                      fontFamily: 'Inter',
                      fontWeight: selectedFolder?.code === folder.code ? '600' : '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFolder?.code !== folder.code) {
                        e.currentTarget.style.backgroundColor = '#FBF9F9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFolder?.code !== folder.code) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {getFolderDisplayName(folder)}
                  </div>
                ))}
              </div>
            )}
          </div>
          {isSearchPanelOpen && (
            <div
              data-layer="Search panel"
              data-state="pressed"
              className="SearchPanel"
              style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}
            >
              <div
                data-layer="Text container"
                className="TextContainer"
                style={{
                  flex: '1 1 0',
                  paddingTop: 20,
                  paddingBottom: 20,
                  paddingRight: 16,
                  overflow: 'hidden',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: 10,
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
                  Поиск
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Введите номер, ИИН или статус"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: '#071222',
                    fontSize: 16,
                    fontFamily: 'Inter',
                    fontWeight: '500',
                    padding: 0,
                    margin: 0
                  }}
                />
              </div>
              <div data-layer="Button container" className="ButtonContainer" style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
                <div
                  data-layer="Clean button"
                  className="CleanButton"
                  style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', cursor: 'pointer'}}
                  onClick={handleSearchClear}
                >
                  <div data-svg-wrapper data-layer="keyboard" className="Keyboard" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.8753 6.08464V9.7513H5.80283L9.08449 6.46047L7.79199 5.16797L2.29199 10.668L7.79199 16.168L9.08449 14.8755L5.80283 11.5846H19.7087V6.08464H17.8753Z" fill="black"/>
                    </svg>
                  </div>
                </div>
                <div
                  data-layer="Close button"
                  className="CloseButton"
                  style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}
                  onClick={handleSearchClose}
                >
                  <div data-svg-wrapper data-layer="Close" className="Close" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_search_panel)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.34338 5.34315C5.7339 4.95262 6.05048 4.63604 6.05048 4.63604L11.0002 9.58579L15.95 4.63604C15.95 4.63604 16.2666 4.95262 16.6571 5.34315C17.0476 5.73367 17.3642 6.05025 17.3642 6.05025L12.4144 11L17.3642 15.9497C17.3642 15.9497 17.0476 16.2663 16.6571 16.6569C16.2666 17.0474 15.95 17.364 15.95 17.364L11.0002 12.4142L6.05051 17.3639C6.05051 17.3639 5.7339 17.0474 5.34338 16.6569C4.95285 16.2663 4.6363 15.9497 4.6363 15.9497L9.58602 11L4.63627 6.05025C4.63627 6.05025 4.95285 5.73367 5.34338 5.34315Z" fill="black"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_search_panel">
                    <rect width="22" height="22" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isFilterPanelOpen && (
            <div
              ref={filterPanelRef}
              data-layer="FilterSearchPanel"
              className="Filtersearchpanel"
              style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}
            >
              <div data-layer="Process type" data-state="dropdown_selected" className="ProcessType" style={{flex: '1 1 0', height: 85, paddingLeft: 20, background: 'white', overflow: 'visible', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', position: 'relative'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex', cursor: 'pointer'}} onClick={() => setIsProcessTypeDropdownOpen((prev) => !prev)}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Тип процесса</div>
                  <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{selectedProcessType}</div>
                </div>
                <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', cursor: 'pointer'}} onClick={() => setIsProcessTypeDropdownOpen((prev) => !prev)}>
                  <div data-svg-wrapper data-layer="Chewron down" className="ChewronDown" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5 7.5L11 15.5L3.5 7.5" stroke="black" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                {isProcessTypeDropdownOpen && (
                  <div style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px #F8E8E8 solid', borderTop: 'none', zIndex: 20}}>
                    {PROCESS_TYPES.map((type) => (
                      <div
                        key={type}
                        onClick={() => handleProcessTypeSelect(type)}
                        style={{
                          padding: '20px',
                          cursor: 'pointer',
                          background: selectedProcessType === type ? '#FBF9F9' : 'white',
                          borderBottom: '1px #F8E8E8 solid',
                          color: 'black',
                          fontSize: 16,
                          fontFamily: 'Inter',
                          fontWeight: selectedProcessType === type ? '600' : '500'
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div data-layer="Products" data-state="dropdown_selected" className="Products" style={{flex: '1 1 0', height: 85, paddingLeft: 20, background: 'white', overflow: 'visible', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', position: 'relative'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex', cursor: 'pointer'}} onClick={() => setIsProductDropdownOpen((prev) => !prev)}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Продукты</div>
                  <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{selectedProduct}</div>
                </div>
                <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}} onClick={() => setIsProductDropdownOpen((prev) => !prev)}>
                  <div data-svg-wrapper data-layer="Chewron down" className="ChewronDown" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5 7.5L11 15.5L3.5 7.5" stroke="black" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                {isProductDropdownOpen && (
                  <div style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px #F8E8E8 solid', borderTop: 'none', zIndex: 20}}>
                    {PRODUCTS.map((product) => (
                      <div
                        key={product}
                        onClick={() => handleProductSelect(product)}
                        style={{
                          padding: '20px',
                          cursor: 'pointer',
                          background: selectedProduct === product ? '#FBF9F9' : 'white',
                          borderBottom: '1px #F8E8E8 solid',
                          color: 'black',
                          fontSize: 16,
                          fontFamily: 'Inter',
                          fontWeight: selectedProduct === product ? '600' : '500'
                        }}
                      >
                        {product}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div data-layer="Status" data-state="dropdown_selected" className="Status" style={{flex: '1 1 0', height: 85, paddingLeft: 20, background: 'white', overflow: 'visible', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', position: 'relative'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex', cursor: 'pointer'}} onClick={() => setIsStatusDropdownOpen((prev) => !prev)}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Статус</div>
                  <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{selectedStatus}</div>
                </div>
                <div data-layer="Open button" className="OpenButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', cursor: 'pointer'}} onClick={() => setIsStatusDropdownOpen((prev) => !prev)}>
                  <div data-svg-wrapper data-layer="Chewron down" className="ChewronDown" style={{left: 31, top: 32, position: 'absolute'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5 7.5L11 15.5L3.5 7.5" stroke="black" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                {isStatusDropdownOpen && (
                  <div style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px #F8E8E8 solid', borderTop: 'none', zIndex: 20}}>
                    {STATUSES.map((status) => (
                      <div
                        key={status}
                        onClick={() => handleStatusSelect(status)}
                        style={{
                          padding: '20px',
                          cursor: 'pointer',
                          background: selectedStatus === status ? '#FBF9F9' : 'white',
                          borderBottom: '1px #F8E8E8 solid',
                          color: 'black',
                          fontSize: 16,
                          fontFamily: 'Inter',
                          fontWeight: selectedStatus === status ? '600' : '500'
                        }}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div data-layer="Сheck button" className="HeckButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}} onClick={handleApplyFilters}>
                <div data-svg-wrapper data-layer="done" className="Done" style={{left: 32, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.06644 14.5741L4.21644 10.7241L2.93311 12.0074L8.06644 17.1408L19.0664 6.14076L17.7831 4.85742L8.06644 14.5741Z" fill="black"/>
                  </svg>
                </div>
              </div>
              <div data-layer="Reset button" className="ResetButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}} onClick={handleResetFilters}>
                <div data-svg-wrapper data-layer="Cancel" className="Cancel" style={{left: 32, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.66441 4.37567C6.31042 2.80117 8.54218 1.83398 10.9998 1.83398C16.0624 1.83398 20.1665 5.93804 20.1665 11.0007C20.1665 12.9457 19.5607 14.7492 18.5275 16.2329C18.354 16.4821 18.1685 16.7222 17.9717 16.9525C17.9698 16.9546 17.968 16.9568 17.9661 16.959C17.767 17.1916 17.5564 17.4141 17.3353 17.6256C15.6893 19.2001 13.4575 20.1673 10.9998 20.1673C5.93723 20.1673 1.83317 16.0633 1.83317 11.0007C1.83317 9.05561 2.43896 7.25206 3.47216 5.76838C3.64566 5.51923 3.83121 5.2791 4.02797 5.04884C4.02983 5.04666 4.03169 5.04449 4.03355 5.04232C4.23268 4.80972 4.44326 4.58721 4.66441 4.37567ZM6.06634 5.57475C7.37034 4.38796 9.10022 3.66732 10.9998 3.66732C15.0499 3.66732 18.3332 6.95056 18.3332 11.0007C18.3332 12.4921 17.8895 13.8768 17.1257 15.0339L6.06634 5.57475ZM15.9333 16.4266L4.87399 6.96738C4.11017 8.12445 3.6665 9.50918 3.6665 11.0007C3.6665 15.0507 6.94975 18.334 10.9998 18.334C12.8995 18.334 14.6293 17.6133 15.9333 16.4266Z" fill="black"/>
                  </svg>
                </div>
              </div>
              <div data-layer="Close button" className="CloseButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}} onClick={handleCloseFilters}>
                <div data-svg-wrapper data-layer="Close" className="Close" style={{left: 32, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_845_6526)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.34338 5.34315C5.7339 4.95262 6.05048 4.63604 6.05048 4.63604L11.0002 9.58579L15.95 4.63604C15.95 4.63604 16.2666 4.95262 16.6571 5.34315C17.0476 5.73367 17.3642 6.05025 17.3642 6.05025L12.4144 11L17.3642 15.9497C17.3642 15.9497 17.0476 16.2663 16.6571 16.6569C16.2666 17.0474 15.95 17.364 15.95 17.364L11.0002 12.4142L6.05051 17.3639C6.05051 17.3639 5.7339 17.0474 5.34338 16.6569C4.95285 16.2663 4.6363 15.9497 4.6363 15.9497L9.58602 11L4.63627 6.05025C4.63627 6.05025 4.95285 5.73367 5.34338 5.34315Z" fill="black"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_845_6526">
                  <rect width="22" height="22" fill="white"/>
                  </clipPath>
                  </defs>
                  </svg>
                </div>
              </div>
            </div>
          )}
          <div data-layer="Table of applications" className="TableOfApplications" style={{alignSelf: 'stretch', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div data-layer="Header" data-state="not_pressed" className="Header" style={{alignSelf: 'stretch', position: 'relative', paddingLeft: 20, background: '#F6F6F6', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
              <div data-layer="Container" className="Container" style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 20, display: 'flex'}}>
                <div data-layer="Select button" className="SelectButton" style={{width: 85, minWidth: 85, height: 85, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div data-svg-wrapper data-layer="CheckButton" data-state="not_pressed" className="Checkbutton" style={{position: 'relative'}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.75064" y="1.75" width="18.5" height="18.5" stroke="black" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
                <div data-layer="Text container" className="TextContainer" style={{width: 150, minWidth: 150, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Номер заявления</div>
                </div>
                <div data-layer="Text container" className="TextContainer" style={{width: 180, minWidth: 180, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>ИИН Страхователя</div>
                </div>
                <div data-layer="Text container" className="TextContainer" style={{width: 150, minWidth: 150, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Дата создания</div>
                </div>
                <div data-layer="Text container" className="TextContainer" style={{width: 120, minWidth: 120, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Продукт</div>
                </div>
                <div data-layer="Text container" className="TextContainer" style={{width: 150, minWidth: 150, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Страховая сумма</div>
                </div>
                <div data-layer="Text container" className="TextContainer" style={{width: 140, minWidth: 140, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Тип процесса</div>
                </div>
                <div data-layer="Text container" className="TextContainer" style={{width: 200, minWidth: 200, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Статус</div>
                </div>
              </div>
              <div 
                data-layer="Refresh button" 
                className="RefreshButton" 
                onClick={handleRefresh}
                style={{
                  width: 85, 
                  height: 85, 
                  left: 1342, 
                  top: 0, 
                  position: 'absolute', 
                  background: loadingApplications ? '#E0E0E0' : '#FBF9F9', 
                  overflow: 'hidden', 
                  cursor: loadingApplications ? 'wait' : 'pointer',
                  opacity: loadingApplications ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <div 
                  data-svg-wrapper 
                  data-layer="refresh" 
                  className={`Refresh ${loadingApplications ? 'rotating' : ''}`}
                  style={{
                    left: 31, 
                    top: 32, 
                    position: 'absolute'
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1746 5.82067C14.8454 4.4915 13.0213 3.6665 10.9954 3.6665C6.94376 3.6665 3.67126 6.94817 3.67126 10.9998C3.67126 15.0515 6.94376 18.3332 10.9954 18.3332C14.4146 18.3332 17.2654 15.9957 18.0813 12.8332H16.1746C15.4229 14.969 13.3879 16.4998 10.9954 16.4998C7.96126 16.4998 5.49543 14.034 5.49543 10.9998C5.49543 7.96567 7.96126 5.49984 10.9954 5.49984C12.5171 5.49984 13.8738 6.13234 14.8638 7.1315L11.9121 10.0832H18.3288V3.6665L16.1746 5.82067Z" fill="black"/>
                  </svg>
                </div>
              </div>
            </div>
            {loadingApplications ? (
              <div style={{alignSelf: 'stretch', padding: 40, textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter'}}>
                Загрузка заявлений...
              </div>
            ) : displayedApplications.length === 0 ? (
              <div style={{alignSelf: 'stretch', padding: 40, textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter'}}>
                Заявлений пока нет. Создайте новое заявление, нажав кнопку "+"
              </div>
            ) : (
              displayedApplications.map((app) => (
                <div 
                  key={app.applicationId} 
                  onClick={() => handleApplicationClick(app.applicationId)}
                  style={{
                    alignSelf: 'stretch', 
                    height: 85, 
                    paddingLeft: 20, 
                    background: 'white', 
                    overflow: 'hidden', 
                    borderBottom: '1px #F8E8E8 solid', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center', 
                    gap: 16, 
                    display: 'inline-flex',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FBF9F9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div data-layer="Container" className="Container" style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 20, display: 'flex'}}>
                    <div data-layer="Select button" className="SelectButton" style={{width: 85, minWidth: 85, height: 85, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <div data-svg-wrapper data-layer="CheckButton" data-state="not_pressed" className="Checkbutton" style={{position: 'relative'}}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1.75064" y="1.75" width="18.5" height="18.5" stroke="black" strokeWidth="1.5"/>
                        </svg>
                      </div>
                    </div>
                    <div data-layer="Text container" className="TextContainer" style={{width: 150, minWidth: 150, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                      <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{app.number || formatApplicationId(app.applicationId)}</div>
                    </div>
                    <div data-layer="Text container" className="TextContainer" style={{width: 180, minWidth: 180, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                      <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{app.policyholderIin || DASH}</div>
                    </div>
                    <div data-layer="Text container" className="TextContainer" style={{width: 150, minWidth: 150, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                      <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{formatDate(app.createdAt)}</div>
                    </div>
                    <div data-layer="Text container" className="TextContainer" style={{width: 120, minWidth: 120, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                      <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{app.product || DASH}</div>
                    </div>
                    <div data-layer="Text container" className="TextContainer" style={{width: 150, minWidth: 150, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                      <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{app.insuranceAmount || DASH}</div>
                    </div>
                    <div data-layer="Text container" className="TextContainer" style={{width: 140, minWidth: 140, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                      <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{app.operationTypeName || DASH}</div>
                    </div>
                    <div data-layer="Text container" className="TextContainer" style={{width: 200, minWidth: 200, height: 19, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                      <div data-layer="Label" className="Label" style={{width: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{app.status || 'Черновик'}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* TODO: Пагинация будет работать с данными из API */}
        <div data-layer="Pagination" className="Pagination" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderTop: '1px #F8E8E8 solid', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Back page button" className="BackPageButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
            <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div data-layer="Page" className="Page" style={{flex: '1 1 0', height: 85, paddingLeft: 20, paddingRight: 20, paddingTop: 33, paddingBottom: 33, background: '#FBF9F9', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Label" className="Label" style={{flex: '1 1 0', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{displayedApplications.length} из {displayedApplications.length}</div>
          </div>
          <div data-layer="Next page button" className="NextPageButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Statements;



