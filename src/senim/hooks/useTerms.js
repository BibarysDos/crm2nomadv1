import { useState, useEffect } from 'react';
import { getAccessToken } from '../../services/storageService';
import { getContract, updateContract, getPrograms, getProgramPaymentFrequencies } from '../../services/processService';

export const useTerms = (applicationId, taskId, historyData, onSaveCallback) => {
  const [contractId, setContractId] = useState(null);
  const [dictionaryValues, setDictionaryValues] = useState({
    insuranceProduct: '',
    frequencyPayment: ''
  });
  const [toggleStates, setToggleStates] = useState({
    flightAndAccommodation: false
  });
  const [dateValues, setDateValues] = useState({
    startDate: '',
    endDate: ''
  });
  const [activeField, setActiveField] = useState(null);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [hasLoadedContract, setHasLoadedContract] = useState(false);

  // Получаем последнюю задачу из истории для GET/PUT запросов
  const getLastTaskId = () => {
    if (taskId) return taskId;
    if (historyData?.items && historyData.items.length > 0) {
      const lastItem = historyData.items[historyData.items.length - 1];
      return lastItem.taskId || applicationId;
    }
    return applicationId;
  };

  // Сброс флага загрузки при изменении applicationId
  useEffect(() => {
    setHasLoadedContract(false);
    setContractId(null);
  }, [applicationId]);

  // Загрузка контракта из API при монтировании (только один раз)
  useEffect(() => {
    if (hasLoadedContract) {
      return;
    }

    const loadContract = async () => {
      const taskIdForGet = getLastTaskId();
      
      if (!taskIdForGet) {
        setIsLoadingContract(false);
        setHasLoadedContract(true);
        return;
      }

      try {
        setIsLoadingContract(true);
        const token = getAccessToken();
        
        const contract = await getContract(taskIdForGet, token);

        if (contract) {
          // Сохраняем полученный id контракта
          if (contract.id) {
            setContractId(contract.id);
          }

          // Загружаем программу по ID
          if (contract.programId) {
            try {
              const programsData = await getPrograms('SenimNew', token);
              const foundProgram = programsData.find(p => p.id === contract.programId);
              if (foundProgram) {
                setDictionaryValues(prev => ({
                  ...prev,
                  insuranceProduct: foundProgram
                }));
                
                // После загрузки программы, загружаем частоты оплаты
                if (contract.paymentFrequencyCode) {
                  try {
                    const frequenciesData = await getProgramPaymentFrequencies(contract.programId, token);
                    const foundFrequency = frequenciesData.find(f => f.paymentFrequencyCode === contract.paymentFrequencyCode);
                    if (foundFrequency) {
                      setDictionaryValues(prev => ({
                        ...prev,
                        frequencyPayment: foundFrequency
                      }));
                    } else {
                      setDictionaryValues(prev => ({
                        ...prev,
                        frequencyPayment: { paymentFrequencyCode: contract.paymentFrequencyCode }
                      }));
                    }
                  } catch (freqError) {
                    setDictionaryValues(prev => ({
                      ...prev,
                      frequencyPayment: { paymentFrequencyCode: contract.paymentFrequencyCode }
                    }));
                  }
                }
              } else {
                setDictionaryValues(prev => ({
                  ...prev,
                  insuranceProduct: { id: contract.programId }
                }));
              }
            } catch (progError) {
              setDictionaryValues(prev => ({
                ...prev,
                insuranceProduct: { id: contract.programId }
              }));
            }
          }

          // Преобразуем даты из ISO в DD.MM.YYYY
          if (contract.startDate) {
            try {
              const startDate = new Date(contract.startDate);
              if (!isNaN(startDate.getTime())) {
                const startDateStr = `${String(startDate.getUTCDate()).padStart(2, '0')}.${String(startDate.getUTCMonth() + 1).padStart(2, '0')}.${startDate.getUTCFullYear()}`;
                setDateValues(prev => ({ ...prev, startDate: startDateStr }));
              }
            } catch (e) {
              // Ошибка парсинга startDate
            }
          }

          if (contract.endDate) {
            try {
              const endDate = new Date(contract.endDate);
              if (!isNaN(endDate.getTime())) {
                const endDateStr = `${String(endDate.getUTCDate()).padStart(2, '0')}.${String(endDate.getUTCMonth() + 1).padStart(2, '0')}.${endDate.getUTCFullYear()}`;
                setDateValues(prev => ({ ...prev, endDate: endDateStr }));
              }
            } catch (e) {
              // Ошибка парсинга endDate
            }
          }
        }
        
        setHasLoadedContract(true);
      } catch (error) {
        setHasLoadedContract(true);
      } finally {
        setIsLoadingContract(false);
      }
    };

    loadContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, taskId, historyData]);

  // Функция для вычисления даты окончания (дата начала + 1 год - 1 день)
  const calculateEndDate = (startDateStr) => {
    if (!startDateStr) return '';
    
    const dateMatch = startDateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!dateMatch) return '';
    
    const [, day, month, year] = dateMatch;
    const startDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    
    if (isNaN(startDate.getTime())) return '';
    
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setDate(endDate.getDate() - 1);
    
    const endDay = String(endDate.getDate()).padStart(2, '0');
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endYear = endDate.getFullYear();
    
    return `${endDay}.${endMonth}.${endYear}`;
  };

  // Функция для преобразования даты из DD.MM.YYYY в ISO формат
  // Создаем дату в UTC, чтобы избежать проблем с часовыми поясами
  const convertDateToISO = (dateStr) => {
    if (!dateStr) return null;
    const dateMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!dateMatch) return null;
    const [, day, month, year] = dateMatch;
    // Используем Date.UTC для создания даты в UTC, чтобы избежать сдвига из-за часового пояса
    const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), 0, 0, 0, 0));
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  // Функция для получения текущей даты в ISO формате
  const getCurrentDateISO = () => {
    return new Date().toISOString();
  };

  // Функция для извлечения суммы из строки
  const extractAmount = () => {
    if (!dictionaryValues.insuranceProduct) return null;
    let programText = '';
    if (typeof dictionaryValues.insuranceProduct === 'object') {
      programText = dictionaryValues.insuranceProduct.nameRu || dictionaryValues.insuranceProduct.nameKz || dictionaryValues.insuranceProduct.code || '';
    } else {
      programText = dictionaryValues.insuranceProduct;
    }
    const match = programText.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10) * 1000;
    }
    return null;
  };

  const handleDictionaryValueSelect = (fieldName, value) => {
    setDictionaryValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleToggleClick = (toggleName) => {
    setToggleStates(prev => ({
      ...prev,
      [toggleName]: !prev[toggleName]
    }));
  };

  const handleFieldClick = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleDateChange = (fieldName, value) => {
    const updatedDates = {
      ...dateValues,
      [fieldName]: value
    };
    
    // Если изменяется дата начала, автоматически вычисляем дату окончания
    if (fieldName === 'startDate' && value) {
      const calculatedEndDate = calculateEndDate(value);
      if (calculatedEndDate) {
        updatedDates.endDate = calculatedEndDate;
      }
    }
    
    setDateValues(updatedDates);
  };

  const handleSave = async () => {
    // Отправляем данные контракта в API
    if (applicationId && dictionaryValues.insuranceProduct && typeof dictionaryValues.insuranceProduct === 'object') {
      try {
        const taskIdForPut = getLastTaskId();
        if (!taskIdForPut) {
          return;
        }

        const programId = dictionaryValues.insuranceProduct.id;
        const paymentFrequencyCode = dictionaryValues.frequencyPayment && typeof dictionaryValues.frequencyPayment === 'object'
          ? dictionaryValues.frequencyPayment.paymentFrequencyCode
          : null;
        const amount = extractAmount();

        const contractData = {
          id: contractId || null,
          programId: programId,
          conclusionDate: getCurrentDateISO(),
          startDate: convertDateToISO(dateValues.startDate),
          endDate: convertDateToISO(dateValues.endDate),
          amount: amount,
          premium: null,
          currencyCode: 'usd',
          paymentFrequencyCode: paymentFrequencyCode,
          calculationBasisCode: 'insurancesum',
          indexedCurrencyCode: null,
          period: 12,
          periodTypeCode: 'month',
          amountCurrency: null,
          premiumCurrency: null,
          currencyRate: null
        };

        const token = getAccessToken();
        const savedContract = await updateContract(contractData, taskIdForPut, token);
        
        // Сохраняем полученный id контракта для последующих GET запросов
        if (savedContract && savedContract.id) {
          setContractId(savedContract.id);
        }

        if (onSaveCallback) {
          onSaveCallback({
            dictionaryValues,
            toggleStates,
            dateValues
          });
        }
      } catch (error) {
        alert(`Ошибка при сохранении контракта: ${error.message || 'Неизвестная ошибка'}`);
      }
    } else if (onSaveCallback) {
      onSaveCallback({
        dictionaryValues,
        toggleStates,
        dateValues
      });
    }
  };

  const getInsuranceAmount = () => {
    if (!dictionaryValues.insuranceProduct) {
      return null;
    }
    let programText = '';
    if (typeof dictionaryValues.insuranceProduct === 'object') {
      programText = dictionaryValues.insuranceProduct.nameRu || dictionaryValues.insuranceProduct.nameKz || dictionaryValues.insuranceProduct.code || '';
    } else {
      programText = dictionaryValues.insuranceProduct;
    }
    const match = programText.match(/(\d+)/);
    if (match) {
      const amount = parseInt(match[1], 10);
      return `${amount} 000 USD`;
    }
    return null;
  };

  const getTransplantationAmount = () => {
    if (!dictionaryValues.insuranceProduct) {
      return null;
    }
    let programText = '';
    if (typeof dictionaryValues.insuranceProduct === 'object') {
      programText = dictionaryValues.insuranceProduct.nameRu || dictionaryValues.insuranceProduct.nameKz || dictionaryValues.insuranceProduct.code || '';
    } else {
      programText = dictionaryValues.insuranceProduct;
    }
    const match = programText.match(/(\d+)/);
    if (match) {
      const programNumber = parseInt(match[1], 10);
      if (programNumber === 150) {
        return '500 000 USD';
      } else if (programNumber === 200 || programNumber === 250) {
        return '1 000 000 USD';
      }
    }
    return null;
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getDisplayValue = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.paymentFrequencyNameRu || value.paymentFrequencyNameKz || value.nameRu || value.nameKz || value.name || '';
    }
    return value;
  };

  return {
    dictionaryValues,
    toggleStates,
    dateValues,
    activeField,
    isLoadingContract,
    handleDictionaryValueSelect,
    handleToggleClick,
    handleFieldClick,
    handleDateChange,
    handleSave,
    getLastTaskId,
    calculateEndDate,
    getInsuranceAmount,
    getTransplantationAmount,
    getCurrentDate,
    getDisplayValue
  };
};

