import React, { useState, useEffect, useRef, useCallback } from 'react';
import Policyholder from './Policyholder';
import Insured from './Insured/Insured';
import Beneficiary from './Beneficiary';
import Terms from './Terms';
import Questionary from './Questionary';
import History from './History';
import RejectReason from './RejectReason';
import { loadApplicationHistory, loadApplicationBeneficiary, loadApplicationMetadata, saveApplicationMetadata, loadGlobalApplicationData, loadPolicyholderData, loadInsuredData, updateGlobalApplicationSection, getAccessToken, saveApplicationDataByNumber, loadApplicationDataByNumber, getApplicationKey, getUserRole, saveApplicationHistory } from '../../services/storageService';
import { claimTask, sendTaskDecision, getRejectReasons, getProcessInstanceDetails, getProcessHistory, getContragent } from '../../services/processService';

const sanitizeHistoryValue = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '-') {
      return undefined;
    }
    return trimmed;
  }
  return value;
};

const mapHistoryItem = (item = {}) => ({
  stage: sanitizeHistoryValue(item.stage) ||
    sanitizeHistoryValue(item.role) ||
    sanitizeHistoryValue(item.statusTitle) ||
    sanitizeHistoryValue(item.statusCode) ||
    '',
  performer: sanitizeHistoryValue(item.performer) ||
    sanitizeHistoryValue(item.executorName) ||
    sanitizeHistoryValue(item.userFullName) ||
    '',
  eventDate: sanitizeHistoryValue(item.eventDate) ||
    sanitizeHistoryValue(item.executionDate) ||
    sanitizeHistoryValue(item.factEndDate) ||
    sanitizeHistoryValue(item.dateCreated) ||
    '',
  decision: sanitizeHistoryValue(item.decision) ||
    sanitizeHistoryValue(item.status) ||
    sanitizeHistoryValue(item.decisionNameRu) ||
    '',
  comment: sanitizeHistoryValue(item.comment) || sanitizeHistoryValue(item.reason) || ''
});

const normalizeHistoryData = (data = {}) => {
  const items = Array.isArray(data?.items) ? data.items.map(mapHistoryItem) : [];
  const lastItem = items.length > 0 ? items[items.length - 1] : {};

  return {
    items,
    lastEventDate: sanitizeHistoryValue(data?.lastEventDate) ||
      sanitizeHistoryValue(data?.dateTime) ||
      lastItem.eventDate ||
      '',
    lastStage: sanitizeHistoryValue(data?.lastStage) ||
      sanitizeHistoryValue(data?.status) ||
      lastItem.stage ||
      '',
    lastDecision: sanitizeHistoryValue(data?.lastDecision) ||
      lastItem.decision ||
      ''
  };
};

const Application = ({ selectedProduct, applicationId, onBack, processState, onProcessStateRefresh, folderType = 'Statement' }) => {
  const [currentView, setCurrentView] = useState('main');
  const [policyholderData, setPolicyholderData] = useState(null);
  const [insuredData, setInsuredData] = useState(null);
  const [termsData, setTermsData] = useState(null);
  const [questionaryData, setQuestionaryData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [beneficiaryData, setBeneficiaryData] = useState(null);
  const [applicationNumber, setApplicationNumber] = useState(null);
  const [processDetails, setProcessDetails] = useState(null);
  const [isClaimingTask, setIsClaimingTask] = useState(false);
  const [isSendingTask, setIsSendingTask] = useState(false);
  const [isRejectingTask, setIsRejectingTask] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState(null);
  const [reasonsLoading, setReasonsLoading] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const processStateRequestedRef = useRef(false);
  const [isLoadingApplicationData, setIsLoadingApplicationData] = useState(true);
  const formatDateTime = (value) => {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    // Автоматически конвертируем UTC в локальное время браузера
    return parsed.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Загружаем данные истории и выгодоприобретателя при монтировании
  useEffect(() => {
    if (applicationId) {
      // Загружаем данные из API и localStorage параллельно для оптимизации
      const loadData = async () => {
        // Устанавливаем состояние загрузки, если еще не установлено
        if (!isLoadingApplicationData) {
          setIsLoadingApplicationData(true);
        }
        // Загружаем метаданные синхронно (быстро)
        const existingMetadata = loadApplicationMetadata(applicationId);
        if (!existingMetadata) {
          saveApplicationMetadata(applicationId, {
            product: selectedProduct || null,
            createdAt: new Date().toISOString(),
            policyholderIin: '',
            status: 'Черновик'
          });
        } else {
          // Загружаем номер заявления из метаданных
          if (existingMetadata.number) {
            setApplicationNumber(existingMetadata.number);
            
            // ПРИОРИТЕТ: Загружаем данные по номеру заявки (номер постоянный, ID могут меняться)
            const dataByNumber = loadApplicationDataByNumber(existingMetadata.number);
            if (dataByNumber) {
              // НЕ загружаем Policyholder из global storage - используем только локальное состояние
              // if (dataByNumber.policyholder) {
              //   updateGlobalApplicationSection('Policyholder', dataByNumber.policyholder, applicationId);
              // }
              if (dataByNumber.insured) {
                updateGlobalApplicationSection('Insured', dataByNumber.insured, applicationId);
              }
              if (dataByNumber.beneficiary) {
                // Сохраняем данные выгодоприобретателя
                const beneficiaryKey = getApplicationKey(applicationId, 'applicationBeneficiary');
                localStorage.setItem(beneficiaryKey, JSON.stringify(dataByNumber.beneficiary));
              }
              if (dataByNumber.history) {
                const normalizedHistory = normalizeHistoryData(dataByNumber.history);
                saveApplicationHistory(normalizedHistory, applicationId);
                setHistoryData(normalizedHistory);
              }
              if (dataByNumber.terms) {
                const normalizedTerms = normalizeTermsData(dataByNumber.terms);
                updateGlobalApplicationSection('Terms', normalizedTerms, applicationId);
                setTermsData(normalizedTerms);
              }
              if (dataByNumber.questionary) {
                updateGlobalApplicationSection('Questionary', dataByNumber.questionary, applicationId);
                setQuestionaryData(dataByNumber.questionary);
              }
              if (dataByNumber.processDetails) {
                updateGlobalApplicationSection('ProcessDetails', dataByNumber.processDetails, applicationId);
                setProcessDetails(dataByNumber.processDetails);
              }
            }
          }
          
          if (selectedProduct && existingMetadata.product !== selectedProduct) {
            // Обновляем продукт в метаданных, если он изменился
            saveApplicationMetadata(applicationId, {
              ...existingMetadata,
              product: selectedProduct
            });
          }
        }

        // Загружаем локальные данные синхронно (быстро, без await)
        // ПРИОРИТЕТ: Если данные уже загружены по номеру заявки выше, используем их
        // Иначе пытаемся загрузить по applicationId, затем по processId
        const processId = existingMetadata?.processId;
        let globalData = loadGlobalApplicationData(applicationId);
        let loadedHistory = loadApplicationHistory(applicationId);
        let loadedBeneficiary = loadApplicationBeneficiary(applicationId);
        let loadedPolicyholder = globalData?.Policyholder || loadPolicyholderData(applicationId);
        let loadedInsured = globalData?.Insured || loadInsuredData(applicationId);
        if (globalData?.ProcessDetails) {
          setProcessDetails(globalData.ProcessDetails);
        }
        
        // Если данных нет и processId отличается от applicationId, пытаемся загрузить по processId
        if (processId && processId !== applicationId) {
          if (!globalData || !globalData.Policyholder) {
            const processGlobalData = loadGlobalApplicationData(processId);
            if (processGlobalData) {
              globalData = processGlobalData;
              loadedPolicyholder = processGlobalData.Policyholder || loadPolicyholderData(processId);
              loadedInsured = processGlobalData.Insured || loadInsuredData(processId);
            }
          }
          if (!loadedHistory) {
            loadedHistory = loadApplicationHistory(processId);
          }
          if (!loadedBeneficiary) {
            loadedBeneficiary = loadApplicationBeneficiary(processId);
          }
        }

        // Устанавливаем данные из localStorage сразу
        if (loadedHistory) {
          setHistoryData(normalizeHistoryData(loadedHistory));
        } else {
          setHistoryData(normalizeHistoryData());
        }
        
        if (loadedBeneficiary) {
          // Нормализуем значение типа резидентства (исправляем старые варианты)
          const normalizedBeneficiary = {
            ...loadedBeneficiary,
            residencyType: loadedBeneficiary.residencyType === 'не резидент' || 
                          loadedBeneficiary.residencyType === 'Не резидент' 
                          ? 'Нерезидент' 
                          : loadedBeneficiary.residencyType
          };
          setBeneficiaryData(normalizedBeneficiary);
        } else {
          // Устанавливаем значения по умолчанию для выгодоприобретателя
          setBeneficiaryData({ 
            name: 'Madanes Advanced Healthcare Services Ltd.', 
            residencyType: 'Нерезидент' 
          });
        }
        
        if (loadedPolicyholder && (loadedPolicyholder.iin || loadedPolicyholder.name || loadedPolicyholder.surname)) {
          setPolicyholderData(loadedPolicyholder);
        }
        
        if (loadedInsured && (loadedInsured.iin || loadedInsured.lastName || loadedInsured.firstName || loadedInsured.middleName || 
            loadedInsured.surname || loadedInsured.name || loadedInsured.patronymic)) {
          setInsuredData(loadedInsured);
        }

        if (globalData?.Terms) {
          setTermsData(normalizeTermsData(globalData.Terms));
        }

        if (globalData?.Questionary) {
          setQuestionaryData(globalData.Questionary);
        }

      };

      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, selectedProduct]);

  useEffect(() => {
    if (!applicationId) {
      setIsLoadingApplicationData(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingApplicationData(true);

    const fetchProcessData = async () => {
      const token = getAccessToken();
      if (!token) {
        console.warn('Токен недоступен, пропускаем загрузку данных процесса');
        setIsLoadingApplicationData(false);
        return;
      }

      try {
        // Получаем метаданные для определения типа (задача или заявление)
        const metadata = loadApplicationMetadata(applicationId);
        const isTask = metadata?.folderType === 'Task' || metadata?.folderType === 'Tasks' || metadata?.isTask === true;
        
        // Для ProcessInstance: для задач используем applicationId (id/taskId), для заявлений - processId
        const idForProcessInstance = isTask ? applicationId : (metadata?.processId || applicationId);
        
        // Для истории всегда используем processInstanceId (для задач берем из метаданных)
        const idForHistory = metadata?.processId || applicationId;
        
        console.log('🔍 [APPLICATION] Запрос данных:', {
          applicationId,
          isTask,
          idForProcessInstance,
          idForHistory,
          folderType: metadata?.folderType,
          processId: metadata?.processId
        });
        
        // Загружаем ProcessInstance и историю параллельно
        // Обрабатываем ошибку 401 (нет доступа) для ролей underwriter/compliance
        const [details, historyResponse] = await Promise.all([
          getProcessInstanceDetails(idForProcessInstance, token).catch(err => {
            // Если ошибка 401 (нет доступа), это нормально для некоторых ролей - просто пропускаем
            if (err.message && err.message.includes('401')) {
              console.warn('⚠️ [APPLICATION] Нет доступа к ProcessInstance (возможно, ограничения роли)');
              return null;
            }
            // Для других ошибок пробрасываем дальше
            throw err;
          }),
          getProcessHistory(idForHistory, token).catch(err => {
            // Если ошибка 401 (нет доступа), это нормально для некоторых ролей - просто пропускаем
            if (err.message && err.message.includes('401')) {
              console.warn('⚠️ [APPLICATION] Нет доступа к истории процесса (возможно, ограничения роли)');
              return [];
            }
            console.error('Ошибка получения истории процесса:', err);
            return [];
          })
        ]);

        if (isCancelled) {
          return;
        }

        if (details) {
          setProcessDetails(details);
          updateGlobalApplicationSection('ProcessDetails', details, applicationId);

          if (details.regNumber) {
            setApplicationNumber(details.regNumber);
          }

          // Извлекаем данные контрагента (страхователя) из ProcessInstance
          if (details.contragents && Array.isArray(details.contragents)) {
            const clientContragent = details.contragents.find(
              c => c.contragentRoleCode === 'client'
            );
            
            if (clientContragent) {
              console.log('✅ [APPLICATION] Найден контрагент с ролью client в ProcessInstance:', clientContragent);
              
              // Проверяем, есть ли полные данные контрагента в ProcessInstance
              const hasFullData = clientContragent.address || clientContragent.detail || clientContragent.identityDoc;
              
              if (hasFullData) {
                // Если в ProcessInstance есть полные данные, используем их
                console.log('📥 [APPLICATION] Используем полные данные контрагента из ProcessInstance');
                const mapContragentToPolicyholderForApplication = (contragentData) => {
                  if (!contragentData) return {};
                  
                  const address = contragentData.address || {};
                  const detail = contragentData.detail || {};
                  const identityDoc = contragentData.identityDoc || {};
                  const mobileContact = contragentData.contacts?.find(c => c.contactTypeCode === 'mobile');
                  
                  // Функция для преобразования даты из YYYY-MM-DD в DD.MM.YYYY
                  const formatDateForDisplay = (dateValue) => {
                    if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {
                      return '';
                    }
                    const trimmed = String(dateValue).trim();
                    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (ymdMatch) {
                      const [, year, month, day] = ymdMatch;
                      return `${day}.${month}.${year}`;
                    }
                    if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
                      return trimmed;
                    }
                    try {
                      const date = new Date(dateValue);
                      if (isNaN(date.getTime())) return '';
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}.${month}.${year}`;
                    } catch (e) {
                      return '';
                    }
                  };
                  
                  const countryValue = address.countryCode ? {
                    code: address.countryCode,
                    nameRu: address.countryName || address.countryCode
                  } : null;
                  
                  const economicSectorName = detail.economicSectorName || '';
                  const economicSectorCode = detail.economicSectorCode || '';
                  const economicSectorDisplayName = economicSectorCode && economicSectorName 
                    ? `${economicSectorCode} - ${economicSectorName}`
                    : economicSectorName || economicSectorCode || '';
                  
                  return {
                    iin: contragentData.identifier || contragentData.contragentIdentifier || '',
                    telephone: mobileContact?.value || '',
                    name: detail.firstName || '',
                    surname: detail.lastName || '',
                    patronymic: detail.middleName || '',
                    street: address.street || '',
                    houseNumber: address.building || '',
                    apartmentNumber: address.flat || '',
                    docNumber: identityDoc.number || '',
                    birthDate: formatDateForDisplay(detail.birthDate || ''),
                    issueDate: formatDateForDisplay(identityDoc.issuedDate || ''),
                    expiryDate: formatDateForDisplay(identityDoc.expireDate || ''),
                    gender: detail.genderCode ? {
                      code: detail.genderCode,
                      nameRu: detail.genderName || detail.genderCode
                    } : '',
                    economSecId: detail.economicSectorCode ? {
                      code: detail.economicSectorCode,
                      nameRu: economicSectorDisplayName
                    } : '',
                    countryId: countryValue,
                    district_nameru: address.region || address.district || '',
                    settlementName: address.city || '',
                    vidDocId: identityDoc.identityDocTypeCode ? {
                      code: identityDoc.identityDocTypeCode,
                      nameRu: identityDoc.identityDocTypeName || identityDoc.identityDocTypeCode
                    } : '',
                    issuedBy: identityDoc.identityDocIssuerCode ? {
                      code: identityDoc.identityDocIssuerCode,
                      nameRu: identityDoc.identityDocIssuerName || identityDoc.identityDocIssuerCode
                    } : '',
                    clientType: contragentData.clientType || contragentData.insuredType || ''
                  };
                };
                
                const mappedData = mapContragentToPolicyholderForApplication(clientContragent);
                setPolicyholderData(mappedData);
                console.log('✅ [APPLICATION] Полные данные страхователя установлены из ProcessInstance:', mappedData);
              } else {
                // Если полных данных нет, загружаем их через getContragent
                console.log('📥 [APPLICATION] Загружаем полные данные контрагента через getContragent...');
                try {
                  const contragentId = clientContragent.id;
                    const fullContragentData = await getContragent(contragentId, applicationId, token);
                    
                    if (fullContragentData) {
                      console.log('📥 [APPLICATION] Получены полные данные контрагента:', fullContragentData);
                      
                      // Используем ту же функцию маппинга
                      const mapContragentToPolicyholderForApplication = (contragentData) => {
                      if (!contragentData) return {};
                      
                      const address = contragentData.address || {};
                      const detail = contragentData.detail || {};
                      const identityDoc = contragentData.identityDoc || {};
                      const mobileContact = contragentData.contacts?.find(c => c.contactTypeCode === 'mobile');
                      
                      // Функция для преобразования даты из YYYY-MM-DD в DD.MM.YYYY
                      const formatDateForDisplay = (dateValue) => {
                        if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {
                          return '';
                        }
                        const trimmed = String(dateValue).trim();
                        const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
                        if (ymdMatch) {
                          const [, year, month, day] = ymdMatch;
                          return `${day}.${month}.${year}`;
                        }
                        if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
                          return trimmed;
                        }
                        try {
                          const date = new Date(dateValue);
                          if (isNaN(date.getTime())) return '';
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}.${month}.${year}`;
                        } catch (e) {
                          return '';
                        }
                      };
                      
                      const countryValue = address.countryCode ? {
                        code: address.countryCode,
                        nameRu: address.countryName || address.countryCode
                      } : null;
                      
                      const economicSectorName = detail.economicSectorName || '';
                      const economicSectorCode = detail.economicSectorCode || '';
                      const economicSectorDisplayName = economicSectorCode && economicSectorName 
                        ? `${economicSectorCode} - ${economicSectorName}`
                        : economicSectorName || economicSectorCode || '';
                      
                      return {
                        iin: contragentData.identifier || contragentData.contragentIdentifier || '',
                        telephone: mobileContact?.value || '',
                        name: detail.firstName || '',
                        surname: detail.lastName || '',
                        patronymic: detail.middleName || '',
                        street: address.street || '',
                        houseNumber: address.building || '',
                        apartmentNumber: address.flat || '',
                        docNumber: identityDoc.number || '',
                        birthDate: formatDateForDisplay(detail.birthDate || ''),
                        issueDate: formatDateForDisplay(identityDoc.issuedDate || ''),
                        expiryDate: formatDateForDisplay(identityDoc.expireDate || ''),
                        gender: detail.genderCode ? {
                          code: detail.genderCode,
                          nameRu: detail.genderName || detail.genderCode
                        } : '',
                        economSecId: detail.economicSectorCode ? {
                          code: detail.economicSectorCode,
                          nameRu: economicSectorDisplayName
                        } : '',
                        countryId: countryValue,
                        district_nameru: address.region || address.district || '',
                        settlementName: address.city || '',
                        vidDocId: identityDoc.identityDocTypeCode ? {
                          code: identityDoc.identityDocTypeCode,
                          nameRu: identityDoc.identityDocTypeName || identityDoc.identityDocTypeCode
                        } : '',
                        issuedBy: identityDoc.identityDocIssuerCode ? {
                          code: identityDoc.identityDocIssuerCode,
                          nameRu: identityDoc.identityDocIssuerName || identityDoc.identityDocIssuerCode
                        } : '',
                        clientType: contragentData.clientType || contragentData.insuredType || ''
                      };
                    };
                    
                    const mappedData = mapContragentToPolicyholderForApplication(fullContragentData);
                    setPolicyholderData(mappedData);
                    console.log('✅ [APPLICATION] Полные данные страхователя загружены через getContragent:', mappedData);
                  }
                } catch (error) {
                  console.error('❌ [APPLICATION] Ошибка загрузки полных данных контрагента:', error);
                  // Если не удалось загрузить полные данные, используем базовые из ProcessInstance
                  const contragentIdentifier = clientContragent.identifier || '';
                  const contragentLongName = clientContragent.longName || '';
                  
                  let surname = '';
                  let name = '';
                  let patronymic = '';
                  
                  if (contragentLongName) {
                    const nameParts = contragentLongName.trim().split(/\s+/);
                    if (nameParts.length >= 1) surname = nameParts[0] || '';
                    if (nameParts.length >= 2) name = nameParts[1] || '';
                    if (nameParts.length >= 3) patronymic = nameParts.slice(2).join(' ') || '';
                  }
                  
                  const basicData = {
                    iin: contragentIdentifier,
                    surname: surname,
                    name: name,
                    patronymic: patronymic,
                    telephone: '',
                    street: '',
                    houseNumber: '',
                    apartmentNumber: '',
                    docNumber: '',
                    birthDate: '',
                    issueDate: '',
                    expiryDate: '',
                    gender: '',
                    economSecId: '',
                    countryId: '',
                    district_nameru: '',
                    settlementName: '',
                    vidDocId: '',
                    issuedBy: '',
                    clientType: ''
                  };
                  
                  if (contragentIdentifier || surname || name) {
                    setPolicyholderData(basicData);
                    console.log('✅ [APPLICATION] Базовые данные страхователя установлены из ProcessInstance:', basicData);
                  }
                }
              }
            }
            
            // Обрабатываем застрахованного (insured)
            const insuredContragent = details.contragents.find(
              c => c.contragentRoleCode === 'insured'
            );
            
            if (insuredContragent) {
              console.log('✅ [APPLICATION] Найден контрагент с ролью insured в ProcessInstance:', insuredContragent);
              
              // Проверяем, есть ли полные данные контрагента в ProcessInstance
              const hasFullData = insuredContragent.address || insuredContragent.detail || insuredContragent.identityDoc;
              
              if (hasFullData) {
                // Если в ProcessInstance есть полные данные, используем их
                console.log('📥 [APPLICATION] Используем полные данные застрахованного из ProcessInstance');
                const mapContragentToInsuredForApplication = (contragentData) => {
                  if (!contragentData) return {};
                  
                  const address = contragentData.address || {};
                  const detail = contragentData.detail || {};
                  const identityDoc = contragentData.identityDoc || {};
                  const mobileContact = contragentData.contacts?.find(c => c.contactTypeCode === 'mobile');
                  
                  // Функция для преобразования даты из YYYY-MM-DD в DD.MM.YYYY
                  const formatDateForDisplay = (dateValue) => {
                    if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {
                      return '';
                    }
                    const trimmed = String(dateValue).trim();
                    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (ymdMatch) {
                      const [, year, month, day] = ymdMatch;
                      return `${day}.${month}.${year}`;
                    }
                    if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
                      return trimmed;
                    }
                    try {
                      const date = new Date(dateValue);
                      if (isNaN(date.getTime())) return '';
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}.${month}.${year}`;
                    } catch (e) {
                      return '';
                    }
                  };
                  
                  const countryValue = address.countryCode ? {
                    code: address.countryCode,
                    nameRu: address.countryName || address.countryCode
                  } : null;
                  
                  const economicSectorName = detail.economicSectorName || '';
                  const economicSectorCode = detail.economicSectorCode || '';
                  const economicSectorDisplayName = economicSectorCode && economicSectorName 
                    ? `${economicSectorCode} - ${economicSectorName}`
                    : economicSectorName || economicSectorCode || '';
                  
                  return {
                    iin: contragentData.identifier || contragentData.contragentIdentifier || '',
                    telephone: mobileContact?.value || '',
                    name: detail.firstName || '',
                    surname: detail.lastName || '',
                    patronymic: detail.middleName || '',
                    street: address.street || '',
                    houseNumber: address.building || '',
                    apartmentNumber: address.flat || '',
                    docNumber: identityDoc.number || '',
                    birthDate: formatDateForDisplay(detail.birthDate || ''),
                    issueDate: formatDateForDisplay(identityDoc.issuedDate || ''),
                    expiryDate: formatDateForDisplay(identityDoc.expireDate || ''),
                    gender: detail.genderCode ? {
                      code: detail.genderCode,
                      nameRu: detail.genderName || detail.genderCode
                    } : '',
                    economSecId: detail.economicSectorCode ? {
                      code: detail.economicSectorCode,
                      nameRu: economicSectorDisplayName
                    } : '',
                    countryId: countryValue,
                    district_nameru: address.region || address.district || '',
                    settlementName: address.city || '',
                    vidDocId: identityDoc.identityDocTypeCode ? {
                      code: identityDoc.identityDocTypeCode,
                      nameRu: identityDoc.identityDocTypeName || identityDoc.identityDocTypeCode
                    } : '',
                    issuedBy: identityDoc.identityDocIssuerCode ? {
                      code: identityDoc.identityDocIssuerCode,
                      nameRu: identityDoc.identityDocIssuerName || identityDoc.identityDocIssuerCode
                    } : ''
                  };
                };
                
                const mappedInsuredData = mapContragentToInsuredForApplication(insuredContragent);
                setInsuredData(mappedInsuredData);
                console.log('✅ [APPLICATION] Полные данные застрахованного установлены из ProcessInstance:', mappedInsuredData);
              } else {
                // Если полных данных нет, загружаем их через getContragent
                console.log('📥 [APPLICATION] Загружаем полные данные застрахованного через getContragent...');
                try {
                  const contragentId = insuredContragent.id;
                  const fullContragentData = await getContragent(contragentId, applicationId, token);
                  
                  if (fullContragentData) {
                    console.log('📥 [APPLICATION] Получены полные данные застрахованного:', fullContragentData);
                    
                    // Используем ту же функцию маппинга
                    const mapContragentToInsuredForApplication = (contragentData) => {
                      if (!contragentData) return {};
                      
                      const address = contragentData.address || {};
                      const detail = contragentData.detail || {};
                      const identityDoc = contragentData.identityDoc || {};
                      const mobileContact = contragentData.contacts?.find(c => c.contactTypeCode === 'mobile');
                      
                      // Функция для преобразования даты из YYYY-MM-DD в DD.MM.YYYY
                      const formatDateForDisplay = (dateValue) => {
                        if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {
                          return '';
                        }
                        const trimmed = String(dateValue).trim();
                        const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
                        if (ymdMatch) {
                          const [, year, month, day] = ymdMatch;
                          return `${day}.${month}.${year}`;
                        }
                        if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
                          return trimmed;
                        }
                        try {
                          const date = new Date(dateValue);
                          if (isNaN(date.getTime())) return '';
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}.${month}.${year}`;
                        } catch (e) {
                          return '';
                        }
                      };
                      
                      const countryValue = address.countryCode ? {
                        code: address.countryCode,
                        nameRu: address.countryName || address.countryCode
                      } : null;
                      
                      const economicSectorName = detail.economicSectorName || '';
                      const economicSectorCode = detail.economicSectorCode || '';
                      const economicSectorDisplayName = economicSectorCode && economicSectorName 
                        ? `${economicSectorCode} - ${economicSectorName}`
                        : economicSectorName || economicSectorCode || '';
                      
                      return {
                        iin: contragentData.identifier || contragentData.contragentIdentifier || '',
                        telephone: mobileContact?.value || '',
                        name: detail.firstName || '',
                        surname: detail.lastName || '',
                        patronymic: detail.middleName || '',
                        street: address.street || '',
                        houseNumber: address.building || '',
                        apartmentNumber: address.flat || '',
                        docNumber: identityDoc.number || '',
                        birthDate: formatDateForDisplay(detail.birthDate || ''),
                        issueDate: formatDateForDisplay(identityDoc.issuedDate || ''),
                        expiryDate: formatDateForDisplay(identityDoc.expireDate || ''),
                        gender: detail.genderCode ? {
                          code: detail.genderCode,
                          nameRu: detail.genderName || detail.genderCode
                        } : '',
                        economSecId: detail.economicSectorCode ? {
                          code: detail.economicSectorCode,
                          nameRu: economicSectorDisplayName
                        } : '',
                        countryId: countryValue,
                        district_nameru: address.region || address.district || '',
                        settlementName: address.city || '',
                        vidDocId: identityDoc.identityDocTypeCode ? {
                          code: identityDoc.identityDocTypeCode,
                          nameRu: identityDoc.identityDocTypeName || identityDoc.identityDocTypeCode
                        } : '',
                        issuedBy: identityDoc.identityDocIssuerCode ? {
                          code: identityDoc.identityDocIssuerCode,
                          nameRu: identityDoc.identityDocIssuerName || identityDoc.identityDocIssuerCode
                        } : ''
                      };
                    };
                    
                    const mappedInsuredData = mapContragentToInsuredForApplication(fullContragentData);
                    setInsuredData(mappedInsuredData);
                    console.log('✅ [APPLICATION] Полные данные застрахованного загружены через getContragent:', mappedInsuredData);
                  }
                } catch (error) {
                  console.error('❌ [APPLICATION] Ошибка загрузки полных данных застрахованного:', error);
                  // Если не удалось загрузить полные данные, используем базовые из ProcessInstance
                  const contragentIdentifier = insuredContragent.identifier || '';
                  const contragentLongName = insuredContragent.longName || '';
                  
                  let surname = '';
                  let name = '';
                  let patronymic = '';
                  
                  if (contragentLongName) {
                    const nameParts = contragentLongName.trim().split(/\s+/);
                    if (nameParts.length >= 1) surname = nameParts[0] || '';
                    if (nameParts.length >= 2) name = nameParts[1] || '';
                    if (nameParts.length >= 3) patronymic = nameParts.slice(2).join(' ') || '';
                  }
                  
                  const basicData = {
                    iin: contragentIdentifier,
                    surname: surname,
                    name: name,
                    patronymic: patronymic,
                    telephone: '',
                    street: '',
                    houseNumber: '',
                    apartmentNumber: '',
                    docNumber: '',
                    birthDate: '',
                    issueDate: '',
                    expiryDate: '',
                    gender: '',
                    economSecId: '',
                    countryId: '',
                    district_nameru: '',
                    settlementName: '',
                    vidDocId: '',
                    issuedBy: ''
                  };
                  
                  if (contragentIdentifier || surname || name) {
                    setInsuredData(basicData);
                    console.log('✅ [APPLICATION] Базовые данные застрахованного установлены из ProcessInstance:', basicData);
                  }
                }
              }
            }
          }

          const currentMetadata = loadApplicationMetadata(applicationId) || {};
          const updatedMetadata = {
            ...currentMetadata,
            applicationId,
            processId: currentMetadata.processId || applicationId
          };
          let shouldSaveMetadata = false;

          if (details.regNumber && currentMetadata.number !== details.regNumber) {
            updatedMetadata.number = details.regNumber;
            shouldSaveMetadata = true;
          }

          if (details.statusName && currentMetadata.statusName !== details.statusName) {
            updatedMetadata.statusName = details.statusName;
            shouldSaveMetadata = true;
          }

          if (details.statusCode && currentMetadata.statusCode !== details.statusCode) {
            updatedMetadata.statusCode = details.statusCode;
            shouldSaveMetadata = true;
          }

          if (details.processDefinitionName && currentMetadata.processName !== details.processDefinitionName) {
            updatedMetadata.processName = details.processDefinitionName;
            shouldSaveMetadata = true;
          }

          if (details.processDefinitionCode && currentMetadata.processCode !== details.processDefinitionCode) {
            updatedMetadata.processCode = details.processDefinitionCode;
            shouldSaveMetadata = true;
          }

          if (shouldSaveMetadata) {
            saveApplicationMetadata(applicationId, updatedMetadata);
          }
        }

        // Обрабатываем историю
        if (Array.isArray(historyResponse)) {
          const mappedHistory = historyResponse.map((item) => mapHistoryItem(item));
          const historyPayload = normalizeHistoryData({ items: mappedHistory });
          setHistoryData(historyPayload);
          saveApplicationHistory(historyPayload, applicationId);
        } else {
          // Если истории нет, устанавливаем пустую историю
          setHistoryData(normalizeHistoryData());
        }
      } catch (error) {
        console.error('Ошибка получения данных процесса:', error);
      } finally {
        // Завершаем загрузку после получения всех данных
        if (!isCancelled) {
          setIsLoadingApplicationData(false);
          console.log('✅ [APPLICATION] Все данные загружены, открываем заявку');
        }
      }
    };

    fetchProcessData();

    return () => {
      isCancelled = true;
    };
  }, [applicationId]);

  // Получаем роль пользователя при монтировании компонента
  useEffect(() => {
    const role = getUserRole();
    console.log('Определена роль пользователя:', role);
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (!processState && applicationId && onProcessStateRefresh && !processStateRequestedRef.current) {
      processStateRequestedRef.current = true;
      onProcessStateRefresh(applicationId);
    }
  }, [applicationId, onProcessStateRefresh, processState]);

  useEffect(() => {
    processStateRequestedRef.current = false;
  }, [applicationId]);

  // Функция для сбора всех данных заявки
  const collectAllApplicationData = useCallback(() => {
    const globalData = loadGlobalApplicationData(applicationId);
    const metadata = loadApplicationMetadata(applicationId);
    
    return {
      metadata: metadata || {},
      // НЕ сохраняем Policyholder - используем только локальное состояние
      // policyholder: globalData?.Policyholder || policyholderData || null,
      insured: globalData?.Insured || insuredData || null,
      beneficiary: beneficiaryData || null,
      history: historyData || null,
      terms: termsData || null,
      questionary: questionaryData || null,
      processDetails: processDetails || globalData?.ProcessDetails || null,
      processState: processState || null,
      applicationId: applicationId // Сохраняем applicationId для связи
    };
  }, [applicationId, insuredData, beneficiaryData, historyData, termsData, questionaryData, processState, processDetails]);
  
  // Функция для сохранения данных по номеру заявки
  const saveDataByNumber = useCallback(() => {
    if (!applicationNumber) {
      // Пытаемся получить номер из метаданных
      const metadata = loadApplicationMetadata(applicationId);
      if (metadata?.number) {
        const allData = collectAllApplicationData();
        saveApplicationDataByNumber(metadata.number, applicationId, allData);
      }
    } else {
      const allData = collectAllApplicationData();
      saveApplicationDataByNumber(applicationNumber, applicationId, allData);
    }
  }, [applicationNumber, applicationId, collectAllApplicationData]);

  // Автоматическое сохранение всех данных по номеру заявки при любых изменениях
  useEffect(() => {
    if (applicationId) {
      // Небольшая задержка, чтобы избежать сохранения во время начальной загрузки
      const timer = setTimeout(() => {
        saveDataByNumber();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [applicationId, saveDataByNumber]);

  // Прокрутка наверх при изменении view
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleBackToMain = () => {
    setCurrentView('main');
    // Перезагружаем данные при возврате на главный экран
    if (applicationId) {
      const globalData = loadGlobalApplicationData(applicationId);
      let loadedPolicyholder = null;
      
      if (globalData && globalData.Policyholder) {
        loadedPolicyholder = globalData.Policyholder;
      } else {
        loadedPolicyholder = loadPolicyholderData(applicationId);
      }
      
      if (loadedPolicyholder && (loadedPolicyholder.iin || loadedPolicyholder.name || loadedPolicyholder.surname)) {
        setPolicyholderData(loadedPolicyholder);
      }

      let loadedInsured = null;
      if (globalData && globalData.Insured) {
        loadedInsured = globalData.Insured;
      } else {
        loadedInsured = loadInsuredData(applicationId);
      }
      
      if (loadedInsured && (loadedInsured.iin || loadedInsured.lastName || loadedInsured.firstName || loadedInsured.middleName || 
          loadedInsured.surname || loadedInsured.name || loadedInsured.patronymic)) {
        setInsuredData(loadedInsured);
      }
    }
  };
  
  const handleBackToProduct = () => {
    if (onBack) {
      onBack();
    }
  };
  const handleOpenPolicyholder = () => setCurrentView('policyholder');
  const handleOpenInsured = () => setCurrentView('insured');
  const handleOpenTerms = () => setCurrentView('terms');
  const handleOpenQuestionary = () => setCurrentView('questionary');
  const handleViewFullHistory = () => setCurrentView('history');

  // Порядок разделов для навигации

  // Функция для сохранения данных заявки в API
  const saveApplicationToAPI = async (section, data) => {
    if (!applicationId) return;
    
    try {
      const token = getAccessToken();
      if (!token) {
        console.log('Токен не найден, сохраняем только локально');
        return;
      }

      console.log('Сохраняем данные заявки в API:', section, applicationId);
      
      // Загружаем текущие глобальные данные
      const globalData = loadGlobalApplicationData(applicationId) || {};
      
      // Обновляем секцию
      globalData[section] = data;
      
      // Сохраняем в API
      // Обычно используется PUT или PATCH запрос
      const response = await fetch(`https://crm-arm.onrender.com/api/Statement/${applicationId}`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(globalData),
      });

      if (response.ok) {
        console.log('Данные заявки успешно сохранены в API');
      } else if (response.status === 404) {
        // Заявление еще не существует в API - это нормально, данные сохранены локально
        console.warn('Заявление не найдено в API (404). Данные сохранены локально.');
      } else {
        console.error('Ошибка сохранения данных заявки в API:', response.status);
      }
    } catch (error) {
      console.error('Ошибка сохранения данных заявки в API:', error);
      // Продолжаем работу, данные сохранены локально
    }
  };

  const handleInsuredSave = (data) => {
    // Сохраняем все данные (включая fullData для восстановления)
    setInsuredData(data);
    // Сохраняем в глобальное хранилище
    if (applicationId) {
      updateGlobalApplicationSection('Insured', data, applicationId);
      // НЕ сохраняем в API для Insured - только в глобальное хранилище
      // saveApplicationToAPI('Insured', data); // Убрано - Insured сохраняется только в глобальное хранилище
      
      // Сохраняем все данные по номеру заявки
      saveDataByNumber();
    }
  };

  const handlePolicyholderSave = (data) => {
    // data может содержать либо полные данные (mappedData из Policyholder.js),
    // либо displayData с базовыми полями (firstName, lastName, middleName, iin)
    // Преобразуем displayData в формат policyholderData, если нужно
    let policyholderDataToSet = data;
    
    // Если данные приходят в формате displayData (с firstName, lastName, middleName),
    // преобразуем их в формат policyholderData (с name, surname, patronymic)
    if (data.firstName !== undefined || data.lastName !== undefined || data.middleName !== undefined) {
      // Это displayData - преобразуем в policyholderData
      policyholderDataToSet = {
        ...data,
        name: data.firstName || data.name || '',
        surname: data.lastName || data.surname || '',
        patronymic: data.middleName || data.patronymic || '',
        // Удаляем старые поля, если они есть
        firstName: undefined,
        lastName: undefined,
        middleName: undefined
      };
      // Удаляем undefined поля
      Object.keys(policyholderDataToSet).forEach(key => {
        if (policyholderDataToSet[key] === undefined) {
          delete policyholderDataToSet[key];
        }
      });
    }
    
    // Устанавливаем все данные (включая все поля из mappedData)
    setPolicyholderData(policyholderDataToSet);
    console.log('✅ [APPLICATION] policyholderData обновлен:', policyholderDataToSet);
    
    // НЕ сохраняем в глобальное хранилище для Policyholder - используем только локальное состояние
    if (applicationId) {
      // Обновляем метаданные заявки с ИИН страхователя
      const existingMetadata = loadApplicationMetadata(applicationId) || {};
      const iin = policyholderDataToSet.iin || data.iin;
      if (iin && existingMetadata.policyholderIin !== iin) {
        saveApplicationMetadata(applicationId, {
          ...existingMetadata,
          policyholderIin: iin
        });
        console.log('ИИН страхователя сохранен в метаданные:', iin);
      }
      
      // НЕ вызываем saveApplicationToAPI для Policyholder - сохранение Contragent происходит в Policyholder.js через updateContragent
      // saveApplicationToAPI('Policyholder', data); // Убрано - Policyholder сохраняется через Contragent API в Policyholder.js
      
      // НЕ сохраняем Policyholder по номеру заявки - используем только локальное состояние
      // saveDataByNumber(); // Убрано для Policyholder
    }
  };

  const handleTermsSave = (data) => {
    const normalizedTerms = normalizeTermsData(data);
    setTermsData(normalizedTerms);
    // Сохраняем в глобальное хранилище
    if (applicationId) {
      updateGlobalApplicationSection('Terms', normalizedTerms, applicationId);
      // Сохраняем в API
      saveApplicationToAPI('Terms', normalizedTerms);
      
      // Сохраняем все данные по номеру заявки
      saveDataByNumber();
    }
  };

  const handleQuestionarySave = (data) => {
    setQuestionaryData(data);
    // Сохраняем в глобальное хранилище
    if (applicationId) {
      updateGlobalApplicationSection('Questionary', data, applicationId);
      // Сохраняем в API
      saveApplicationToAPI('Questionary', data);
      
      // Сохраняем все данные по номеру заявки
      saveDataByNumber();
    }
  };

  const getInsuranceAmount = (insuranceProduct) => {
    if (!insuranceProduct) {
      return null;
    }
    // Извлекаем число из названия программы (например, "«CEHIM» Бизнес 150" → 150)
    const match = insuranceProduct.match(/(\d+)/);
    if (match) {
      const amount = parseInt(match[1], 10);
      return `${amount} 000 USD`;
    }
    return null;
  };

  const normalizeTermsData = useCallback((data) => {
    if (!data) return null;

    if (data.dictionaryValues) {
      return {
        dictionaryValues: {
          insuranceProduct: data.dictionaryValues.insuranceProduct || '',
          frequencyPayment: data.dictionaryValues.frequencyPayment || '',
          ...data.dictionaryValues
        },
        toggleStates: {
          flightAndAccommodation: data.toggleStates?.flightAndAccommodation ?? false,
          ...data.toggleStates
        },
        dateValues: {
          startDate: data.dateValues?.startDate || data.startDate || '',
          endDate: data.dateValues?.endDate || data.endDate || ''
        }
      };
    }

    // Legacy формат (плоский объект)
    const {
      insuranceProduct = '',
      frequencyPayment = '',
      flightAndAccommodation = false,
      startDate = '',
      endDate = '',
      ...rest
    } = data;

    return {
      dictionaryValues: {
        insuranceProduct,
        frequencyPayment,
        ...rest
      },
      toggleStates: {
        flightAndAccommodation
      },
      dateValues: {
        startDate,
        endDate
      }
    };
  }, []);

  const getTermsInsuranceProductName = (terms) => {
    if (!terms) return '';
    return terms.dictionaryValues?.insuranceProduct || terms.insuranceProduct || '';
  };

  const currentTaskId = processState?.taskId || null;
  const canClaimTaskNow = Boolean(processState?.canClaim && currentTaskId);
  // Кнопки должны быть активны, если taskId есть и canClaim = false (задача уже наша)
  // isDecisionDisabled = true только если нет taskId, идет отправка/отклонение, ИЛИ задача еще не взята (canClaim = true)
  const isDecisionDisabled = !currentTaskId || isSendingTask || isRejectingTask || canClaimTaskNow;
  

  const refreshProcessState = async () => {
    if (onProcessStateRefresh && applicationId) {
      await onProcessStateRefresh(applicationId);
    }
  };

  const handleClaimTask = async () => {
    if (!currentTaskId) return;
    try {
      setProcessError(null);
      setIsClaimingTask(true);
      await claimTask(currentTaskId);
      await refreshProcessState();
    } catch (error) {
      console.error('Ошибка при взятии задачи:', error);
      setProcessError(error.message || 'Не удалось взять задачу');
      alert(error.message || 'Не удалось взять задачу');
    } finally {
      setIsClaimingTask(false);
    }
  };

  const handleSendForApproval = async () => {
    if (isDecisionDisabled) return;
    try {
      setProcessError(null);
      setIsSendingTask(true);
      
      // Сохраняем все данные по номеру заявки перед отправкой
      saveDataByNumber();
      
      await sendTaskDecision({ taskId: currentTaskId, decision: true, reasonId: null });
      await refreshProcessState();
      alert('Задача отправлена на согласование');
      
      // Возвращаемся к списку заявлений после успешной отправки
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Ошибка отправки задачи:', error);
      setProcessError(error.message || 'Не удалось отправить задачу');
      alert(error.message || 'Не удалось отправить задачу');
    } finally {
      setIsSendingTask(false);
    }
  };

  const handleRejectClick = async () => {
    if (isDecisionDisabled) return;
    try {
      setProcessError(null);
      setReasonsLoading(true);
      const reasonsResponse = await getRejectReasons(currentTaskId);
      setReasons(Array.isArray(reasonsResponse) ? reasonsResponse : []);
      setSelectedReasonId(reasonsResponse?.[0]?.id || null);
      setCurrentView('reject');
    } catch (error) {
      console.error('Ошибка загрузки причин отказа:', error);
      setProcessError(error.message || 'Не удалось загрузить причины отказа');
      alert(error.message || 'Не удалось загрузить причины отказа');
    } finally {
      setReasonsLoading(false);
    }
  };

  const handleBackFromReject = () => {
    setCurrentView('main');
    setSelectedReasonId(null);
  };

  const handleConfirmReject = async () => {
    if (!selectedReasonId || !currentTaskId) {
      alert('Выберите причину отказа');
      return;
    }

    try {
      setProcessError(null);
      setIsRejectingTask(true);
      
      // Сохраняем все данные по номеру заявки перед отклонением
      saveDataByNumber();
      
      await sendTaskDecision({ taskId: currentTaskId, decision: false, reasonId: selectedReasonId });
      await refreshProcessState();
      alert('Задача отклонена');
      
      // Возвращаемся к списку заявлений после успешного отклонения
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Ошибка при отклонении задачи:', error);
      setProcessError(error.message || 'Не удалось отклонить задачу');
      alert(error.message || 'Не удалось отклонить задачу');
    } finally {
      setIsRejectingTask(false);
    }
  };

  if (currentView === 'history') {
    return (
      <History
        onBack={handleBackToMain}
        applicationId={applicationId}
      />
    );
  }

  if (currentView === 'policyholder') {
    return <Policyholder onBack={handleBackToMain} onSave={handlePolicyholderSave} applicationId={applicationId} taskId={processState?.taskId} />;
  }

  if (currentView === 'insured') {
    return <Insured onBack={handleBackToMain} policyholderData={policyholderData} onSave={handleInsuredSave} applicationId={applicationId} taskId={processState?.taskId} savedInsuredData={insuredData} />;
  }

  if (currentView === 'beneficiary') {
    return <Beneficiary onBack={handleBackToMain} applicationId={applicationId} />;
  }

  if (currentView === 'terms') {
    return <Terms onBack={handleBackToMain} onSave={handleTermsSave} applicationId={applicationId} />;
  }

  if (currentView === 'questionary') {
    return <Questionary onBack={handleBackToMain} onSave={handleQuestionarySave} applicationId={applicationId} />;
  }

  if (currentView === 'reject') {
    return (
      <RejectReason
        reasons={reasons}
        selectedReasonId={selectedReasonId}
        onReasonSelect={setSelectedReasonId}
        onConfirm={handleConfirmReject}
        onBack={handleBackFromReject}
        isLoading={reasonsLoading}
        isRejectingTask={isRejectingTask}
      />
    );
  }

  // Показываем индикатор загрузки, пока данные загружаются
  if (isLoadingApplicationData) {
    return (
      <div style={{width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white'}}>
        <div style={{textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500'}}>
          Загрузка данных заявки...
        </div>
      </div>
    );
  }

  return (
    <div data-layer="Statements details" className="StatementsDetails" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
  <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Back button" className="BackButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}} onClick={handleBackToProduct}>
      <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
        </svg>
      </div>
    </div>
    <div data-layer="OpenDocument button" className="OpendocumentButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}}>
      <div data-layer="File" className="File" style={{width: 22, height: 22, left: 31, top: 32, position: 'absolute'}}>
        <div data-svg-wrapper data-layer="Frame 1321316875" className="Frame1321316875" style={{left: 3, top: 1, position: 'absolute'}}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0L16.001 6V18.001C16.0009 19.1008 15.1008 20.0008 14.001 20.001H1.99023C0.890252 20.001 0.000107007 19.1009 0 18.001L0.00976562 2C0.00980161 0.900011 0.900014 4.85053e-05 2 0H10ZM2.00293 2V18.001H14.0039V7H9.00293V2H2.00293Z" fill="black"/>
          <line x1="4.00024" y1="11.2505" x2="12.0006" y2="11.2505" stroke="black" strokeWidth="1.5"/>
          <line x1="4.00024" y1="15.2507" x2="10.0005" y2="15.2507" stroke="black" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div data-layer="Statements details" className="StatementsDetails" style={{flex: '1 1 0', alignSelf: 'stretch', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="SubHeader" data-type="OrderHeader" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex', flexWrap: 'wrap', alignContent: 'flex-start'}}>
      <div data-layer="Frame 1321316873" className="Frame1321316873" style={{flex: '1 1 0', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 auto', height: 12, textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Заявление № {applicationNumber || (applicationId ? applicationId.substring(0, 8) : '')}</div>
      </div>
      {/* Показываем кнопки только если заходим через задачу (Task) или создаем новую заявку, но НЕ через заявление (Statement) */}
      {/* Показываем кнопки если: folderType === 'Task' или 'Tasks' ИЛИ folderType не установлен в метаданных (новая заявка) */}
      {(() => {
        const metadata = applicationId ? loadApplicationMetadata(applicationId) : null;
        const metadataFolderType = metadata?.folderType;
        // Показываем кнопки если: folderType === 'Task'/'Tasks' ИЛИ folderType не установлен в метаданных (новая заявка) ИЛИ folderType из props === 'Task'
        const shouldShowButtons = currentTaskId && (
          folderType === 'Task' || 
          folderType === 'Tasks' || 
          metadataFolderType === 'Task' || 
          metadataFolderType === 'Tasks' ||
          !metadataFolderType // Новая заявка без folderType в метаданных
        );
        return shouldShowButtons;
      })() && (
        <div data-layer="Button Container" className="ButtonContainer" style={{flex: '0 0 777px', height: 85, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', justifyContent: 'flex-end', alignItems: 'center', display: 'flex', gap: 16}}>
          {processError && (
            <div style={{color: '#d32f2f', fontSize: 14, fontFamily: 'Inter', fontWeight: 500, marginRight: 12}}>
              {processError}
            </div>
          )}
          {canClaimTaskNow ? (
            <div
              data-layer="Claim button"
              className="ClaimButton"
              style={{
                width: 388.5,
                height: 85,
                background: isClaimingTask ? '#666' : '#000',
                opacity: isClaimingTask ? 0.7 : 1,
                overflow: 'hidden',
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'flex',
                cursor: isClaimingTask ? 'wait' : 'pointer',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: 500
              }}
              onClick={isClaimingTask ? undefined : handleClaimTask}
            >
              <div style={{flex: 1, textAlign: 'center'}}>
                {isClaimingTask ? 'Берем задачу...' : 'Взять задачу'}
              </div>
            </div>
          ) : (
            <>
              <div
                data-layer="Reject button"
                className="RejectButton"
                style={{
                  width: 388.5,
                  height: 85,
                  overflow: 'hidden',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  display: 'flex',
                  cursor: isDecisionDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDecisionDisabled ? 0.5 : 1,
                  color: 'black',
                  fontFamily: 'Inter',
                  fontSize: 16,
                  fontWeight: 500
                }}
                onClick={isDecisionDisabled ? undefined : handleRejectClick}
              >
                <div style={{flex: 1, textAlign: 'center'}}>
                  {isRejectingTask ? 'Отклоняем...' : 'Отклонить'}
                </div>
              </div>
              <div
                data-layer="Send button for approval"
                className="SendButtonForApproval"
                style={{
                  width: 388.5,
                  height: 85,
                  background: isDecisionDisabled ? '#666' : 'black',
                  overflow: 'hidden',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  display: 'flex',
                  cursor: isDecisionDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDecisionDisabled ? 0.7 : 1,
                  color: 'white',
                  fontFamily: 'Inter',
                  fontSize: 16,
                  fontWeight: 500
                }}
                onClick={isDecisionDisabled ? undefined : handleSendForApproval}
              >
                <div style={{flex: 1, textAlign: 'center'}}>
                  {isSendingTask 
                    ? 'Отправляем...' 
                    : (() => {
                        // Если роль не определена, показываем "Отправить на согласование"
                        if (!userRole) {
                          return 'Отправить на согласование';
                        }
                        
                        const roleLower = userRole.toLowerCase().trim();
                        
                        // Только для underwriter и compliance показываем "Согласовать"
                        // Для manager и всех остальных ролей - "Отправить на согласование"
                        if (roleLower === 'underwriter' || roleLower === 'compliance') {
                          return 'Согласовать';
                        }
                        
                        // Для manager и всех остальных ролей
                        return 'Отправить на согласование';
                      })()}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
    <div data-layer="Application data section" className="ApplicationDataSection" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
      <div data-layer="Сounterparty History" data-state="pressed" className="OunterpartyHistory" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
        <div data-layer="Sections History" className="SectionsHistory" style={{width: 1427, height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>История</div>
          </div>
          <div data-layer="Open button" className="OpenButton" onClick={handleViewFullHistory} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        <div data-layer="Info container" data-state="pressed" className="InfoContainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Дата события</div>
            <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{formatDateTime(historyData?.lastEventDate) || '—'}</div>
          </div>
        </div>
        <div data-layer="Input Field" data-state="pressed" className="InputField" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
            <div data-layer="LabelDefault" className="Labeldefault" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Статус процесса</div>
            <div data-layer="%Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{historyData?.lastStage || '—'}</div>
          </div>
        </div>
      </div>
      <div data-layer="Сounterparty Policyholder" data-state={policyholderData ? "pressed" : "not_pressed"} className="OunterpartyPolicyholder" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
        <div data-layer="Sections Policyholder" className="SectionsPolicyholder" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Страхователь</div>
          </div>
          <div data-layer="Open button" className="OpenButton" onClick={handleOpenPolicyholder} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        {policyholderData ? (
          <>
            <div data-layer="Info 'ФИО'" data-state="pressed" className="Info" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>ФИО</div>
                <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                  {[policyholderData.surname || policyholderData.lastName, policyholderData.name || policyholderData.firstName, policyholderData.patronymic || policyholderData.middleName].filter(Boolean).join(' ') || ''}
                </div>
              </div>
            </div>
            {policyholderData.iin && (
              <div data-layer="Info 'ИИН'" data-state="pressed" className="Info" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="LabelDefault" className="Labeldefault" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>ИИН</div>
                  <div data-layer="%Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{policyholderData.iin}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
            <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_373_647)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43095 5.43083 0.916626 10.9998 0.916626C16.5688 0.916626 21.0832 5.43095 21.0832 11C21.0832 16.569 16.5688 21.0833 10.9998 21.0833C5.43083 21.0833 0.916504 16.569 0.916504 11ZM10.9998 2.74996C6.44335 2.74996 2.74984 6.44347 2.74984 11C2.74984 15.5564 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5564 19.2498 11C19.2498 6.44347 15.5563 2.74996 10.9998 2.74996ZM10.074 7.33329C10.074 6.82703 10.4844 6.41663 10.9907 6.41663H10.9998C11.5061 6.41663 11.9165 6.82703 11.9165 7.33329C11.9165 7.83955 11.5061 8.24996 10.9998 8.24996H10.9907C10.4844 8.24996 10.074 7.83955 10.074 7.33329ZM10.9998 10.0833C11.5061 10.0833 11.9165 10.4937 11.9165 11V14.6666C11.9165 15.1729 11.5061 15.5833 10.9998 15.5833C10.4936 15.5833 10.0832 15.1729 10.0832 14.6666V11C10.0832 10.4937 10.4936 10.0833 10.9998 10.0833Z" fill="black"/>
                </g>
                <defs>
                <clipPath id="clip0_373_647">
                <rect width="22" height="22" fill="white"/>
                </clipPath>
                </defs>
                </svg>
              </div>
            </div>
            <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле страхователь, чтобы заполнить данные</div>
          </div>
        )}
      </div>
      <div data-layer="Сounterparty Insured" data-state={insuredData ? "pressed" : "not_pressed"} className="OunterpartyInsured" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
        <div data-layer="Sections Insured" className="SectionsInsured" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Застрахованный</div>
          </div>
          <div data-layer="Open button" className="OpenButton" onClick={handleOpenInsured} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        {insuredData ? (
          <>
            <div data-layer="Info 'ФИО'" data-state="pressed" className="Info" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>ФИО</div>
                <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                  {[insuredData.surname || insuredData.lastName, insuredData.name || insuredData.firstName, insuredData.patronymic || insuredData.middleName].filter(Boolean).join(' ') || ''}
                </div>
              </div>
            </div>
            {insuredData.iin && (
              <div data-layer="Info 'ИИН'" data-state="pressed" className="Info" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="LabelDefault" className="Labeldefault" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>ИИН</div>
                  <div data-layer="%Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{insuredData.iin}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
            <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_373_1495)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43101 5.43083 0.916687 10.9998 0.916687C16.5688 0.916687 21.0832 5.43101 21.0832 11C21.0832 16.569 16.5688 21.0834 10.9998 21.0834C5.43083 21.0834 0.916504 16.569 0.916504 11ZM10.9998 2.75002C6.44335 2.75002 2.74984 6.44353 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.44353 15.5563 2.75002 10.9998 2.75002ZM10.074 7.33335C10.074 6.82709 10.4844 6.41669 10.9907 6.41669H10.9998C11.5061 6.41669 11.9165 6.82709 11.9165 7.33335C11.9165 7.83962 11.5061 8.25002 10.9998 8.25002H10.9907C10.4844 8.25002 10.074 7.83962 10.074 7.33335ZM10.9998 10.0834C11.5061 10.0834 11.9165 10.4938 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5834 10.9998 15.5834C10.4936 15.5834 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4938 10.4936 10.0834 10.9998 10.0834Z" fill="black"/>
                </g>
                <defs>
                <clipPath id="clip0_373_1495">
                <rect width="22" height="22" fill="white"/>
                </clipPath>
                </defs>
                </svg>
              </div>
            </div>
            <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле застрахованный, чтобы заполнить данные</div>
          </div>
        )}
      </div>
      <div data-layer="Сounterparty Beneficiary" data-state="pressed" className="OunterpartyBeneficiary" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
        <div data-layer="Sections Beneficiary" className="SectionsBeneficiary" style={{width: 1427, height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Выгодоприобретатель</div>
          </div>
        </div>
        <div data-layer="Info container" data-state="pressed" className="InfoContainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Наименование </div>
            <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{beneficiaryData?.name || ''}</div>
          </div>
        </div>
        <div data-layer="Input Field" data-state="pressed" className="InputField" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
            <div data-layer="LabelDefault" className="Labeldefault" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Тип резидентства</div>
            <div data-layer="%Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
              {beneficiaryData?.residencyType === 'не резидент' || beneficiaryData?.residencyType === 'Не резидент' 
                ? 'Нерезидент' 
                : (beneficiaryData?.residencyType || '')}
            </div>
          </div>
        </div>
      </div>
      <div data-layer="Insurance conditions" data-state={termsData ? "pressed" : "not_pressed"} className="InsuranceConditions" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
        <div data-layer="Sections Insurance conditions" className="SectionsInsuranceConditions" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Условия</div>
          </div>
          <div data-layer="Open button" className="OpenButton" onClick={handleOpenTerms} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        {termsData ? (
          <>
            {getInsuranceAmount(getTermsInsuranceProductName(termsData)) && (
              <div data-layer="Info container" data-state="pressed" className="InfoContainer" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Страховая сумма</div>
                    <div data-layer="Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{getInsuranceAmount(getTermsInsuranceProductName(termsData))}</div>
                </div>
              </div>
            )}
            {getTermsInsuranceProductName(termsData) && (
              <div data-layer="Input Field" data-state="pressed" className="InputField" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div data-layer="Text field container" className="TextFieldContainer" style={{flex: '1 1 0', height: 85, paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <div data-layer="LabelDefault" className="Labeldefault" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Программа страхования</div>
                    <div data-layer="%Input text" className="InputText" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#071222', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{getTermsInsuranceProductName(termsData)}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
            <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_373_843)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43098 5.43083 0.916656 10.9998 0.916656C16.5688 0.916656 21.0832 5.43098 21.0832 11C21.0832 16.569 16.5688 21.0833 10.9998 21.0833C5.43083 21.0833 0.916504 16.569 0.916504 11ZM10.9998 2.74999C6.44335 2.74999 2.74984 6.4435 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.4435 15.5563 2.74999 10.9998 2.74999ZM10.074 7.33332C10.074 6.82706 10.4844 6.41666 10.9907 6.41666H10.9998C11.5061 6.41666 11.9165 6.82706 11.9165 7.33332C11.9165 7.83958 11.5061 8.24999 10.9998 8.24999H10.9907C10.4844 8.24999 10.074 7.83958 10.074 7.33332ZM10.9998 10.0833C11.5061 10.0833 11.9165 10.4937 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5833 10.9998 15.5833C10.4936 15.5833 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4937 10.4936 10.0833 10.9998 10.0833Z" fill="black"/>
                </g>
                <defs>
                <clipPath id="clip0_373_843">
                <rect width="22" height="22" fill="white"/>
                </clipPath>
                </defs>
                </svg>
              </div>
            </div>
            <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле условия, чтобы заполнить данные</div>
          </div>
        )}
      </div>
      <div data-layer="Health questions" data-state={questionaryData ? "pressed" : "not_pressed"} className="HealthQuestions" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
        <div data-layer="Sections Health questions" className="SectionsHealthQuestions" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="LabelDiv" className="Labeldiv" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Анкета</div>
          </div>
          <div data-layer="Open button" className="OpenButton" onClick={handleOpenQuestionary} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
            <div data-svg-wrapper data-layer="Chewron right" className="ChewronRight" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        {questionaryData ? (
          <>
            {/* Здесь можно добавить отображение данных анкеты, если нужно */}
          </>
        ) : (
          <div data-layer="Info container" className="InfoContainer" style={{alignSelf: 'stretch', height: 169, paddingTop: 6, paddingBottom: 40, paddingLeft: 564, paddingRight: 564, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
            <div data-layer="Info logo" className="InfoLogo" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="Info" className="Info" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_373_1383)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.916504 11C0.916504 5.43099 5.43083 0.916672 10.9998 0.916672C16.5688 0.916672 21.0832 5.43099 21.0832 11C21.0832 16.569 16.5688 21.0833 10.9998 21.0833C5.43083 21.0833 0.916504 16.569 0.916504 11ZM10.9998 2.75001C6.44335 2.75001 2.74984 6.44352 2.74984 11C2.74984 15.5565 6.44335 19.25 10.9998 19.25C15.5563 19.25 19.2498 15.5565 19.2498 11C19.2498 6.44352 15.5563 2.75001 10.9998 2.75001ZM10.074 7.33334C10.074 6.82708 10.4844 6.41667 10.9907 6.41667H10.9998C11.5061 6.41667 11.9165 6.82708 11.9165 7.33334C11.9165 7.8396 11.5061 8.25001 10.9998 8.25001H10.9907C10.4844 8.25001 10.074 7.8396 10.074 7.33334ZM10.9998 10.0833C11.5061 10.0833 11.9165 10.4937 11.9165 11V14.6667C11.9165 15.1729 11.5061 15.5833 10.9998 15.5833C10.4936 15.5833 10.0832 15.1729 10.0832 14.6667V11C10.0832 10.4937 10.4936 10.0833 10.9998 10.0833Z" fill="black"/>
                </g>
                <defs>
                <clipPath id="clip0_373_1383">
                <rect width="22" height="22" fill="white"/>
                </clipPath>
                </defs>
                </svg>
              </div>
            </div>
            <div data-layer="Нажмите на поле страхователь, чтобы заполнить данные" style={{width: 309, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Нажмите на поле анкета, чтобы заполнить данные</div>
          </div>
        )}
      </div>
    </div>
  </div>
  </div>
  );
};

export default Application;
