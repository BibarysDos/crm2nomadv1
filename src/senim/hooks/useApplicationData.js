import { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadApplicationHistory,
  loadApplicationBeneficiary,
  saveApplicationBeneficiary,
  loadApplicationMetadata,
  saveApplicationMetadata,
  loadGlobalApplicationData,
  loadPolicyholderData,
  loadInsuredData,
  updateGlobalApplicationSection,
  getAccessToken,
  saveApplicationDataByNumber,
  loadApplicationDataByNumber,
  getApplicationKey,
  getUserRole,
  saveApplicationHistory,
  saveInsuredData
} from '../../services/storageService';
import {
  claimTask,
  sendTaskDecision,
  getRejectReasons,
  getProcessInstanceDetails,
  getProcessHistory,
  getContragent,
  updateBeneficiary
} from '../../services/processService';
import { mapContragentToInsuredForApplication, mapContragentToPolicyholderForApplication } from '../services/processFacade';
import { normalizeHistoryData } from '../services/historyService';

// Кэш, чтобы не дергать ProcessInstance/History дважды при StrictMode
const processLoadCache = new Map();

export const useApplicationData = ({ applicationId, selectedProduct, processState, onProcessStateRefresh }) => {
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
  const [isLoadingInsured, setIsLoadingInsured] = useState(false);
  const [isSigned, setIsSigned] = useState(false); // Флаг, что клиент подписал документ

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

  // Загрузка метаданных, истории, выгодоприобретателя, локальных кэшей
  useEffect(() => {
    if (!applicationId) {
      return;
    }
    const loadData = async () => {
      if (!isLoadingApplicationData) {
        setIsLoadingApplicationData(true);
      }
      const existingMetadata = loadApplicationMetadata(applicationId);
      if (!existingMetadata) {
        saveApplicationMetadata(applicationId, {
          product: selectedProduct || null,
          createdAt: new Date().toISOString(),
          policyholderIin: '',
          status: 'Черновик'
        });
      } else {
        if (existingMetadata.number) {
          setApplicationNumber(existingMetadata.number);
          const dataByNumber = loadApplicationDataByNumber(existingMetadata.number);
          if (dataByNumber) {
            if (dataByNumber.insured) {
              saveInsuredData(dataByNumber.insured, applicationId);
            }
            if (dataByNumber.beneficiary) {
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
          saveApplicationMetadata(applicationId, {
            ...existingMetadata,
            product: selectedProduct
          });
        }
      }

      const processId = existingMetadata?.processId;
      let globalData = loadGlobalApplicationData(applicationId);
      let loadedHistory = loadApplicationHistory(applicationId);
      let loadedBeneficiary = loadApplicationBeneficiary(applicationId);
      let loadedPolicyholder = globalData?.Policyholder || loadPolicyholderData(applicationId);
      let loadedInsured = loadInsuredData(applicationId);
      if (globalData?.ProcessDetails) {
        setProcessDetails(globalData.ProcessDetails);
      }

      if (processId && processId !== applicationId) {
        if (!globalData || !globalData.Policyholder) {
          const processGlobalData = loadGlobalApplicationData(processId);
          if (processGlobalData) {
            globalData = processGlobalData;
            loadedPolicyholder = processGlobalData.Policyholder || loadPolicyholderData(processId);
            loadedInsured = loadInsuredData(processId);
          }
        }
        if (!loadedHistory) {
          loadedHistory = loadApplicationHistory(processId);
        }
        if (!loadedBeneficiary) {
          loadedBeneficiary = loadApplicationBeneficiary(processId);
        }
      }

      if (loadedHistory) {
        setHistoryData(normalizeHistoryData(loadedHistory));
      } else {
        setHistoryData(normalizeHistoryData());
      }

      if (loadedBeneficiary) {
        const normalizedBeneficiary = {
          ...loadedBeneficiary,
          residencyType:
            loadedBeneficiary.residencyType === 'не резидент' ||
            loadedBeneficiary.residencyType === 'Не резидент'
              ? 'Нерезидент'
              : loadedBeneficiary.residencyType
        };
        setBeneficiaryData(normalizedBeneficiary);
      } else {
        setBeneficiaryData({
          name: 'Madanes Advanced Healthcare Services Ltd.',
          residencyType: 'Нерезидент'
        });
      }

      if (loadedPolicyholder && (loadedPolicyholder.iin || loadedPolicyholder.name || loadedPolicyholder.surname)) {
        setPolicyholderData(loadedPolicyholder);
      }

      if (
        loadedInsured &&
        (loadedInsured.iin ||
          loadedInsured.lastName ||
          loadedInsured.firstName ||
          loadedInsured.middleName ||
          loadedInsured.surname ||
          loadedInsured.name ||
          loadedInsured.patronymic)
      ) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, selectedProduct]);

  useEffect(() => {
    if (!applicationId) {
      setIsLoadingApplicationData(false);
      return;
    }

    // Всегда загружаем ProcessInstance при открытии заявки
    // Убрали проверку hasLoadedProcessRef.current, чтобы данные всегда обновлялись

    let isCancelled = false;
    setIsLoadingApplicationData(true);

    const fetchProcessData = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoadingApplicationData(false);
        return;
      }

      try {
        // Очищаем кэш для этого applicationId, чтобы всегда загружать свежие данные
        processLoadCache.delete(applicationId);

        const metadata = loadApplicationMetadata(applicationId);
        const isTask =
          metadata?.folderType === 'Task' || metadata?.folderType === 'Tasks' || metadata?.isTask === true;
        const idForProcessInstance = isTask ? applicationId : metadata?.processId || applicationId;
        const idForHistory = metadata?.processId || applicationId;

        const [details, historyResponse] = await Promise.all([
          getProcessInstanceDetails(idForProcessInstance, token).catch(() => null),
          getProcessHistory(idForHistory, token).catch(() => [])
        ]);

        if (isCancelled) {
          return;
        }

        let historyPayload = null;

        if (details) {
          setProcessDetails(details);
          updateGlobalApplicationSection('ProcessDetails', details, applicationId);
          if (details.regNumber) {
            setApplicationNumber(details.regNumber);
          }

          // Заполняем карточки данными из ProcessInstance (без вызова getContragent)
          if (details.contragents && Array.isArray(details.contragents)) {
            const clientContragent = details.contragents.find((c) => c.contragentRoleCode === 'client');
            if (clientContragent) {
              // Используем данные из ProcessInstance напрямую для карточки
              const mappedData = mapContragentToPolicyholderForApplication(clientContragent);
              if (mappedData && (mappedData.iin || mappedData.name || mappedData.surname)) {
                setPolicyholderData(mappedData);
                // Сохраняем в глобальное хранилище
                updateGlobalApplicationSection('Policyholder', mappedData, applicationId);
              }
            }

            const insuredContragent = details.contragents.find((c) => c.contragentRoleCode === 'insured');
            if (insuredContragent) {
              // Используем данные из ProcessInstance напрямую для карточки
              const mappedInsuredData = mapContragentToInsuredForApplication(insuredContragent);
              if (mappedInsuredData) {
                // Определяем тип застрахованного из ProcessInstance
                const insuredTypeCode = String(
                  insuredContragent?.insuredDetails?.insuredTypeCode ||
                  insuredContragent?.insuredDetails?.InsuredTypeCode ||
                  ''
                ).trim();

                let insuredType = null;
                if (insuredTypeCode === '1') insuredType = 'own-child';
                else if (insuredTypeCode === '2') insuredType = 'other-child';
                else if (insuredTypeCode === '3') insuredType = 'policyholder';
                else if (insuredTypeCode === '4') insuredType = 'other-person';

                // Используем legalRep из ProcessInstance, если он есть
                const legalRepContragent = details.contragents.find((c) => c.contragentRoleCode === 'legalrep');
                const legalRep = legalRepContragent || null;

                // Сохраняем тип в fullData для автоматического открытия правильной страницы
                const displayData = {
                  ...mappedInsuredData,
                  fullData: {
                    insuredType,
                    fullInsured: insuredContragent,
                    legalRep,
                    processDetails: details
                  }
                };

                setInsuredData(displayData);
                // Сохраняем в локальное хранилище
                saveInsuredData(displayData, applicationId);
              }
            }

            // Обрабатываем beneficiary из ProcessInstance
            const beneficiaryContragent = details.contragents.find((c) => c.contragentRoleCode === 'beneficiary');
            if (beneficiaryContragent) {
              // Загружаем данные beneficiary из ProcessInstance
              const beneficiaryDataFromProcess = {
                id: beneficiaryContragent.id || null,
                residencyType: beneficiaryContragent.residencyType || 'Нерезидент',
                name: beneficiaryContragent.name || 'Madanes Advanced Healthcare Services Ltd.',
                country: beneficiaryContragent.address?.country || '',
                region: beneficiaryContragent.address?.region || '',
                street: beneficiaryContragent.address?.street || '',
                houseNumber: beneficiaryContragent.address?.houseNumber || '',
                apartmentNumber: beneficiaryContragent.address?.apartmentNumber || ''
              };
              setBeneficiaryData(beneficiaryDataFromProcess);
              saveApplicationBeneficiary(beneficiaryDataFromProcess, applicationId);
            } else if (selectedProduct === 'Сенiм') {
              // Если продукт Сенiм и beneficiary нет в ProcessInstance, создаем его с данными по умолчанию
              const defaultBeneficiary = {
                residencyType: 'Нерезидент',
                name: 'Madanes Advanced Healthcare Services Ltd.',
                country: '',
                region: '',
                street: '',
                houseNumber: '',
                apartmentNumber: ''
              };
              
              // Сохраняем в localStorage
              setBeneficiaryData(defaultBeneficiary);
              saveApplicationBeneficiary(defaultBeneficiary, applicationId);

              // Отправляем PUT запрос для создания beneficiary в API
              try {
                let accessId = idForHistory;
                if (Array.isArray(historyResponse) && historyResponse.length > 0) {
                  const last = historyResponse[historyResponse.length - 1];
                  if (last?.id) {
                    accessId = String(last.id).trim();
                  }
                }
                await updateBeneficiary(defaultBeneficiary, accessId, token);
                console.log('Beneficiary создан в API с данными по умолчанию');
              } catch (error) {
                console.error('Ошибка создания beneficiary в API:', error);
              }
            }
          }

          // Заполняем карточку Условия данными из ProcessInstance.contract
          if (details.contract) {
            const contract = details.contract;
            // Формируем данные для карточки Условия из contract
            // programName содержит название программы (например, "«CEHIM» Бизнес 250")
            const termsDataForCard = {
              dictionaryValues: {
                insuranceProduct: contract.programName || contract.programCode || '',
                frequencyPayment: '' // В ProcessInstance нет информации о частоте оплаты
              },
              toggleStates: {
                flightAndAccommodation: false
              },
              dateValues: {
                startDate: '',
                endDate: ''
              },
              // Сохраняем amount для отображения в карточке
              amount: contract.amount || null,
              currencyCode: contract.currencyCode || 'usd',
              currencyName: contract.currencyName || ''
            };
            const normalizedTerms = normalizeTermsData(termsDataForCard);
            setTermsData(normalizedTerms);
            updateGlobalApplicationSection('Terms', normalizedTerms, applicationId);
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

        if (Array.isArray(historyResponse)) {
          historyPayload = normalizeHistoryData({ items: historyResponse });
          setHistoryData(historyPayload);
          saveApplicationHistory(historyPayload, applicationId);
        } else {
          setHistoryData(normalizeHistoryData());
        }

        processLoadCache.set(applicationId, {
          details,
          historyPayload
        });
      } catch (error) {
        // swallow process load errors, UI будет отображать пустые данные
      } finally {
        if (!isCancelled) {
          setIsLoadingApplicationData(false);
          // данные процесса загружены
        }
      }
    };

    fetchProcessData();

    return () => {
      isCancelled = true;
    };
  }, [applicationId, normalizeTermsData, selectedProduct]);

  useEffect(() => {
    const role = getUserRole();
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

  const collectAllApplicationData = useCallback(() => {
    const globalData = loadGlobalApplicationData(applicationId);
    const metadata = loadApplicationMetadata(applicationId);

    return {
      metadata: metadata || {},
      insured: globalData?.Insured || insuredData || null,
      beneficiary: beneficiaryData || null,
      history: historyData || null,
      terms: termsData || null,
      questionary: questionaryData || null,
      processDetails: processDetails || globalData?.ProcessDetails || null,
      processState: processState || null,
      applicationId
    };
  }, [
    applicationId,
    insuredData,
    beneficiaryData,
    historyData,
    termsData,
    questionaryData,
    processState,
    processDetails
  ]);

  const saveDataByNumber = useCallback(() => {
    if (!applicationId) return;
    const metadata = loadApplicationMetadata(applicationId);
    const number = applicationNumber || metadata?.number;
    if (!number) return;
    const allData = collectAllApplicationData();
    saveApplicationDataByNumber(number, applicationId, allData);
  }, [applicationNumber, applicationId, collectAllApplicationData]);

  useEffect(() => {
    if (applicationId) {
      const timer = setTimeout(() => {
        saveDataByNumber();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [applicationId, saveDataByNumber]);

  // Сохранение застрахованного в локальное хранилище и per-application кэш
  const handleInsuredSave = async (data) => {
    setInsuredData(data);
    if (applicationId) {
      saveInsuredData(data, applicationId);
      saveDataByNumber();
      
      // Обновляем processDetails после сохранения застрахованного, чтобы insuredContragentId был доступен
      try {
        const token = getAccessToken();
        if (token) {
          const metadata = loadApplicationMetadata(applicationId);
          const isTask =
            metadata?.folderType === 'Task' || metadata?.folderType === 'Tasks' || metadata?.isTask === true;
          const idForProcessInstance = isTask ? applicationId : metadata?.processId || applicationId;
          
          const details = await getProcessInstanceDetails(idForProcessInstance, token).catch(() => null);
          if (details) {
            setProcessDetails(details);
            updateGlobalApplicationSection('ProcessDetails', details, applicationId);
          }
        }
      } catch (error) {
        // Игнорируем ошибки обновления processDetails, не критично
      }
    }
  };

  // Сохранение страхователя: локальный стейт + метаданные (policyholderIin)
  const handlePolicyholderSave = (data) => {
    let policyholderDataToSet = data;

    if (data.firstName !== undefined || data.lastName !== undefined || data.middleName !== undefined) {
      policyholderDataToSet = {
        ...data,
        name: data.firstName || data.name || '',
        surname: data.lastName || data.surname || '',
        patronymic: data.middleName || data.patronymic || '',
        firstName: undefined,
        lastName: undefined,
        middleName: undefined
      };
      Object.keys(policyholderDataToSet).forEach((key) => {
        if (policyholderDataToSet[key] === undefined) {
          delete policyholderDataToSet[key];
        }
      });
    }

    setPolicyholderData(policyholderDataToSet);

    if (applicationId) {
      const existingMetadata = loadApplicationMetadata(applicationId) || {};
      const iin = policyholderDataToSet.iin || data.iin;
      if (iin && existingMetadata.policyholderIin !== iin) {
        saveApplicationMetadata(applicationId, {
          ...existingMetadata,
          policyholderIin: iin
        });
      }
    }
  };

  // Вспомогательная функция для сохранения секций Terms/Questionary в API
  // УДАЛЕНО: больше не используется, так как Terms теперь использует updateContract напрямую
  // Terms сохраняет контракт через правильный endpoint: https://crm-statement.onrender.com/api/Contract?accessId=...
  const saveApplicationSectionToAPI = async (section, data) => {
    // Функция отключена - Terms теперь сохраняет контракт через updateContract
    // в правильный endpoint: https://crm-statement.onrender.com/api/Contract?accessId=...
    // Удален лишний запрос на https://crm-arm.onrender.com/api/Statement/${applicationId}
    return;
  };

  const handleTermsSave = (data) => {
    const normalizedTerms = normalizeTermsData(data);
    setTermsData(normalizedTerms);
    if (applicationId) {
      updateGlobalApplicationSection('Terms', normalizedTerms, applicationId);
      // УДАЛЕНО: saveApplicationSectionToAPI('Terms', normalizedTerms);
      // Terms теперь сам сохраняет контракт через updateContract в правильный endpoint
      saveDataByNumber();
    }
  };

  const handleQuestionarySave = (data) => {
    setQuestionaryData(data);
    if (applicationId) {
      updateGlobalApplicationSection('Questionary', data, applicationId);
      saveApplicationSectionToAPI('Questionary', data);
      saveDataByNumber();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const currentTaskId = processState?.taskId || null;
  const canClaimTaskNow = Boolean(processState?.canClaim && currentTaskId);
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
      setProcessError(error.message || 'Не удалось взять задачу');
      alert(error.message || 'Не удалось взять задачу');
    } finally {
      setIsClaimingTask(false);
    }
  };

  // Открыть экран выбора метода подписания
  const handleOpenSigning = () => {
    if (isDecisionDisabled) return;
    setCurrentView('sign');
  };

  // Обработка выбора метода подписания
  const handleSelectSigningMethod = async (method, isConfirmed = false) => {
    if (!isConfirmed) {
      // Если код еще не подтвержден, просто отправляем код (это происходит при нажатии "Отправить код")
      // В этом случае ничего не делаем, просто ждем подтверждения
      return;
    }

    // Если код подтвержден, завершаем подписание
    // Не вызываем API, просто устанавливаем флаг и возвращаемся в заявку
    try {
      setProcessError(null);
      
      // Устанавливаем флаг, что клиент подписал
      setIsSigned(true);
      
      // Возвращаемся на главный экран
      setCurrentView('main');
      
      // Показываем alert, что клиент подписал
      alert('Страхователь и застрахованный подписали заявление');
      
      return true;
    } catch (error) {
      setProcessError(error.message || 'Ошибка при подтверждении подписания');
      return false;
    }
  };

  // Отправить на согласование (отдельная кнопка)
  const handleSendForApproval = async () => {
    if (isDecisionDisabled) return false;
    try {
      setProcessError(null);
      setIsSendingTask(true);
      saveDataByNumber();
      
      // Отправляем только на согласование
      await sendTaskDecision({ taskId: currentTaskId, decision: true, reasonId: null });
      
      // Показываем alert, что клиент подписал
      if (isSigned) {
        alert('Страхователь и застрахованный подписали заявление. Задача отправлена на согласование');
      } else {
        alert('Задача отправлена на согласование');
      }
      
      // Сбрасываем флаг подписания после отправки на согласование
      setIsSigned(false);
      
      return true;
    } catch (error) {
      setProcessError(error.message || 'Не удалось отправить задачу');
      alert(error.message || 'Не удалось отправить задачу');
      return false;
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
      setProcessError(error.message || 'Не удалось загрузить причины отказа');
      alert(error.message || 'Не удалось загрузить причины отказа');
    } finally {
      setReasonsLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedReasonId || !currentTaskId) {
      alert('Выберите причину отказа');
      return false;
    }

    try {
      setProcessError(null);
      setIsRejectingTask(true);
      saveDataByNumber();
      await sendTaskDecision({ taskId: currentTaskId, decision: false, reasonId: selectedReasonId });
      // Не вызываем refreshProcessState, чтобы не делать лишний запрос can-claim-task
      alert('Задача отклонена');
      return true; // Успешное отклонение
    } catch (error) {
      setProcessError(error.message || 'Не удалось отклонить задачу');
      alert(error.message || 'Не удалось отклонить задачу');
      return false;
    } finally {
      setIsRejectingTask(false);
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
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

      const loadedInsured = loadInsuredData(applicationId);

      if (
        loadedInsured &&
        (loadedInsured.iin ||
          loadedInsured.lastName ||
          loadedInsured.firstName ||
          loadedInsured.middleName ||
          loadedInsured.surname ||
          loadedInsured.name ||
          loadedInsured.patronymic)
      ) {
        setInsuredData(loadedInsured);
      }
    }
  };

  const handleOpenPolicyholder = () => setCurrentView('policyholder');

  const handleOpenInsured = async () => {
    const token = getAccessToken();
    if (!applicationId || !token || !processDetails || !Array.isArray(processDetails.contragents)) {
      setCurrentView('insured');
      return;
    }

    setIsLoadingInsured(true);
    setCurrentView('insured'); // Переключаемся на view сразу, чтобы показать индикатор загрузки

    try {
      // Находим контрагентов в ProcessInstance
      const insuredContragent = processDetails.contragents.find(
        (c) => c.contragentRoleCode === 'insured'
      );
      const clientContragent = processDetails.contragents.find(
        (c) => c.contragentRoleCode === 'client'
      );
      const legalRepContragent = processDetails.contragents.find(
        (c) => c.contragentRoleCode === 'legalrep'
      );

      // При открытии формы застрахованного загружаем полные данные через getContragent
      // 1) Загружаем полные данные страхователя (client) для заполнения формы
      if (clientContragent) {
        try {
          const fullClient = await getContragent(clientContragent.id, applicationId, token);
          const mappedPolicyholder = mapContragentToPolicyholderForApplication(fullClient);
          if (
            mappedPolicyholder &&
            (mappedPolicyholder.iin || mappedPolicyholder.name || mappedPolicyholder.surname)
          ) {
            setPolicyholderData(mappedPolicyholder);
          }
        } catch (e) {
          // Fallback: используем данные из ProcessInstance
          const mappedPolicyholder = mapContragentToPolicyholderForApplication(clientContragent);
          if (
            mappedPolicyholder &&
            (mappedPolicyholder.iin || mappedPolicyholder.name || mappedPolicyholder.surname)
          ) {
            setPolicyholderData(mappedPolicyholder);
          }
        }
      }

      // 2) Загружаем полные данные застрахованного
      if (insuredContragent) {
        try {
          const fullInsured = await getContragent(insuredContragent.id, applicationId, token);
          const mappedInsuredData = mapContragentToInsuredForApplication(fullInsured);

          // Определяем тип застрахованного по InsuredTypeCode / insuredTypeCode
          const insuredTypeCode = String(
            fullInsured?.insuredDetails?.insuredTypeCode ||
              fullInsured?.insuredDetails?.InsuredTypeCode ||
              insuredContragent?.insuredDetails?.insuredTypeCode ||
              insuredContragent?.insuredDetails?.InsuredTypeCode ||
              ''
          ).trim();

          let insuredType = null;
          if (insuredTypeCode === '1') insuredType = 'own-child';
          else if (insuredTypeCode === '2') insuredType = 'other-child';
          else if (insuredTypeCode === '3') insuredType = 'policyholder';
          else if (insuredTypeCode === '4') insuredType = 'other-person';

          const fullData = {
            insuredType,
            fullInsured,
            processDetails
          };

          // Загружаем законного представителя, если он есть
          if (legalRepContragent) {
            try {
              const fullLegalRep = await getContragent(legalRepContragent.id, applicationId, token);
              fullData.legalRep = fullLegalRep;
            } catch (e) {
              // Fallback: используем данные из ProcessInstance
              fullData.legalRep = legalRepContragent;
            }
          }

          const displayData = {
            ...mappedInsuredData,
            fullData
          };

          setInsuredData(displayData);
          saveInsuredData(displayData, applicationId);
        } catch (error) {
          // Fallback: используем данные из ProcessInstance
          const mappedInsuredData = mapContragentToInsuredForApplication(insuredContragent);
          if (mappedInsuredData) {
            const insuredTypeCode = String(
              insuredContragent?.insuredDetails?.insuredTypeCode ||
                insuredContragent?.insuredDetails?.InsuredTypeCode ||
                ''
            ).trim();

            let insuredType = null;
            if (insuredTypeCode === '1') insuredType = 'own-child';
            else if (insuredTypeCode === '2') insuredType = 'other-child';
            else if (insuredTypeCode === '3') insuredType = 'policyholder';
            else if (insuredTypeCode === '4') insuredType = 'other-person';

            const fullData = {
              insuredType,
              fullInsured: insuredContragent,
              legalRep: legalRepContragent || null,
              processDetails
            };

            const displayData = {
              ...mappedInsuredData,
              fullData
            };

            setInsuredData(displayData);
            saveInsuredData(displayData, applicationId);
          }
        }
      }
    } catch (error) {
    } finally {
      setIsLoadingInsured(false);
    }
  };
  const handleOpenTerms = () => setCurrentView('terms');
  const handleOpenQuestionary = () => setCurrentView('questionary');
  const handleViewFullHistory = () => setCurrentView('history');

  return {
    state: {
      currentView,
      policyholderData,
      insuredData,
      termsData,
      questionaryData,
      historyData,
      beneficiaryData,
      applicationNumber,
      processDetails,
      isClaimingTask,
      isSendingTask,
      isRejectingTask,
      reasons,
      selectedReasonId,
      reasonsLoading,
      processError,
      userRole,
      isLoadingApplicationData,
      isLoadingInsured,
      isSigned
    },
    derived: {
      currentTaskId,
      canClaimTaskNow,
      isDecisionDisabled
    },
    setters: {
      setCurrentView,
      setPolicyholderData,
      setInsuredData,
      setTermsData,
      setQuestionaryData
    },
    handlers: {
      handleClaimTask,
      handleSendForApproval,
      handleOpenSigning,
      handleSelectSigningMethod,
      handleRejectClick,
      handleConfirmReject,
      handleBackToMain,
      handleOpenPolicyholder,
      handleOpenInsured,
      handleOpenTerms,
      handleOpenQuestionary,
      handleViewFullHistory,
       handleInsuredSave,
       handlePolicyholderSave,
       handleTermsSave,
       handleQuestionarySave,
      setSelectedReasonId
    }
  };
};


