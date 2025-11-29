import { useState, useEffect } from 'react';
import { getAccessToken } from '../../services/storageService';
import { updateContragent, getProcessInstanceDetails, getContragent } from '../../services/processService';
import { getPerson, mapApiDataToForm } from '../../services/personService';
import { mapPolicyholderToContragent } from '../services/contragentService';

export const usePolicyholderForm = (applicationId, taskId, onSaveCallback, initialProcessDetails) => {
    const [policyholderData, setPolicyholderData] = useState({});
    const [activeField, setActiveField] = useState(null);
    const [toggleStates, setToggleStates] = useState({
        manualInput: false,
        pdl: false
    });
    const [autoModeState, setAutoModeState] = useState('initial'); // initial, request_sent, response_received, data_loaded
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingContragent, setIsLoadingContragent] = useState(true);
    const [contragentId, setContragentId] = useState(null);
    const [contragentRelationId, setContragentRelationId] = useState(null);
    const [loadedContragentIdentifier, setLoadedContragentIdentifier] = useState(null);

    // Загрузка данных при монтировании
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingContragent(true);
            try {
                const token = getAccessToken();
                if (applicationId && token) {
                    // Если данные процесса уже есть сверху (из Application), используем их, не дергая API,
                    // иначе подгружаем ProcessInstance здесь
                    const processDetails = initialProcessDetails
                        ? initialProcessDetails
                        : await getProcessInstanceDetails(applicationId, token);

                    // Ищем контрагента с ролью 'client' (Страхователь)
                    const clientContragent = processDetails?.contragents?.find(
                        c => c.contragentRoleCode === 'client'
                    );

                    if (clientContragent) {
                        // Пытаемся получить полные данные контрагента через GET /Contragent
                        let fullContragentData = null;
                        try {
                            fullContragentData = await getContragent(clientContragent.id, applicationId, token);
                        } catch (e) {
                            // если не удалось получить полные данные, используем clientContragent
                        }

                        const effectiveContragent = fullContragentData || clientContragent;

                        // ID самого контрагента и связи
                        setContragentId(effectiveContragent.id);
                        setContragentRelationId(clientContragent.id);
                        setLoadedContragentIdentifier(
                            effectiveContragent.identifier || effectiveContragent.contragentIdentifier
                        );

                        // Маппим данные в форму
                        const mappedData = mapContragentToPolicyholder(effectiveContragent);
                        setPolicyholderData(prev => ({ ...prev, ...mappedData }));

                        // Если данные загружены, переключаем в режим data_loaded
                        setAutoModeState('data_loaded');

                        // Если есть данные, но нет ИИН в форме (например, загрузили только ID), 
                        // то возможно нужно дозагрузить детали, но пока считаем что все ок
                    }
                }
            } catch (error) {
            } finally {
                setIsLoadingContragent(false);
            }
        };

        loadData();
    }, [applicationId, taskId, initialProcessDetails]);

    // Вспомогательная функция маппинга (копия из Policyholder.js)
    const mapContragentToPolicyholder = (contragentData) => {
        if (!contragentData) return {};

        const address = contragentData.address || {};
        const detail = contragentData.detail || {};
        const identityDoc = contragentData.identityDoc || {};
        const mobileContact = contragentData.contacts?.find(c => c.contactTypeCode === 'mobile');

        const countryValue = address.countryCode ? {
            code: address.countryCode,
            nameRu: address.countryName || address.countryCode
        } : null;

        const economicSectorName = detail.economicSectorName || '';
        const economicSectorCode = detail.economicSectorCode || '';
        const economicSectorDisplayName = economicSectorCode && economicSectorName
            ? `${economicSectorCode} - ${economicSectorName}`
            : economicSectorName || economicSectorCode || '';

        // Функция форматирования даты для отображения (DD.MM.YYYY)
        const formatDateForDisplay = (dateValue) => {
            if (!dateValue) return '';
            const trimmed = String(dateValue).trim();
            const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (ymdMatch) {
                const [, year, month, day] = ymdMatch;
                return `${day}.${month}.${year}`;
            }
            if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) return trimmed;
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

    // Обработчики полей
    const handleFieldChange = (fieldName, value) => {
        // Маппинг имен полей (если нужно)
        const mapping = {
            'phone': 'telephone',
            'firstName': 'name',
            'lastName': 'surname',
            'middleName': 'patronymic',
            'documentNumber': 'docNumber'
        };
        const newFieldName = mapping[fieldName] || fieldName;

        let processedValue = value;
        if (newFieldName === 'telephone') {
            // Логика форматирования телефона
            let cleaned = value.replace(/[^\d+]/g, '');
            if (cleaned.startsWith('+7')) cleaned = cleaned.substring(2);
            else if (cleaned.startsWith('7') || cleaned.startsWith('8')) cleaned = cleaned.substring(1);
            cleaned = cleaned.substring(0, 10);

            if (cleaned.length === 0) processedValue = '+7';
            else if (cleaned.length <= 3) processedValue = `+7 (${cleaned}`;
            else if (cleaned.length <= 6) processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
            else if (cleaned.length <= 8) processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
            else processedValue = `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
        }

        setPolicyholderData(prev => ({ ...prev, [newFieldName]: processedValue }));
    };

    const handleFieldBlur = (fieldName) => {
        const mapping = {
            'phone': 'telephone',
            'firstName': 'name',
            'lastName': 'surname',
            'middleName': 'patronymic',
            'documentNumber': 'docNumber'
        };
        const newFieldName = mapping[fieldName] || fieldName;
        const value = policyholderData[newFieldName];

        if (newFieldName === 'telephone') {
            if (!value || value.trim() === '' || value === '+7') {
                setPolicyholderData(prev => ({ ...prev, [newFieldName]: '+7' }));
                return;
            }
        }

        if (!value) {
            setActiveField(null);
        }
    };

    const handleFieldActivate = (fieldName) => {
        setActiveField(fieldName);
        const mapping = { 'phone': 'telephone' };
        const newFieldName = mapping[fieldName] || fieldName;

        if (newFieldName === 'telephone') {
            if (!policyholderData[newFieldName] || policyholderData[newFieldName].trim() === '') {
                setPolicyholderData(prev => ({ ...prev, [newFieldName]: '+7' }));
            }
        }
    };

    const handleDictionarySelect = (fieldName, value) => {
        // Маппинг имен полей для словарей
        const mapping = {
            'sectorCode': 'economSecId',
            'country': 'countryId',
            'region': 'district_nameru',
            'docType': 'vidDocId'
        };
        const newFieldName = mapping[fieldName] || fieldName;

        setPolicyholderData(prev => ({ ...prev, [newFieldName]: value }));
    };

    const handleToggle = (name) => {
        setToggleStates(prev => {
            const newState = { ...prev, [name]: !prev[name] };
            if (name === 'manualInput' && newState.manualInput && !prev.manualInput) {
                setAutoModeState('initial');
            }
            return newState;
        });
    };

    // Логика отправки запроса (получение данных страхователя по ИИН и телефону)
    const handleSendRequest = async () => {
        if (!policyholderData.iin || !policyholderData.telephone) {
            setErrorMessage('Пожалуйста, заполните ИИН и номер телефона');
            return;
        }
        setErrorMessage(null);
        setIsLoading(true);
        // Первое нажатие — считаем, что запрос ушёл (СМС и т.п.)
        setAutoModeState('request_sent');

        try {
            // Очищаем номер телефона и ИИН от лишних символов
            const phone = String(policyholderData.telephone).replace(/\D/g, '');
            const iin = String(policyholderData.iin).replace(/\D/g, '');

            // Реальный запрос данных клиента
            const data = await getPerson(phone, iin);
            if (data) {
                const mappedData = mapApiDataToForm(data);
                setPolicyholderData(prev => ({
                    ...prev,
                    ...mappedData,
                    // Всегда сохраняем введённые ИИН и телефон,
                    // даже если в ответе они пустые или в другом формате
                    iin: prev.iin || mappedData.iin || '',
                    telephone: prev.telephone || mappedData.telephone || ''
                }));
                // Данные получены — ждём, что пользователь нажмёт «Обновить»
                setAutoModeState('response_received');
            } else {
                setErrorMessage('Данные не найдены');
                setAutoModeState('initial');
            }
        } catch (error) {
            setErrorMessage('Ошибка получения данных. Попробуйте еще раз или введите данные вручную.');
            setIsLoading(false);
            setAutoModeState('initial');
            return;
        }

        setIsLoading(false);
    };

    // Логика "Обновить" — НЕ дергаем повторно getPerson, а просто переключаем форму
    // в состояние data_loaded, чтобы показать все поля с уже полученными данными.
    const handleUpdate = () => {
        setAutoModeState('data_loaded');
    };

    // Логика сохранения
    const handleSave = async () => {
        if (applicationId) {
            try {
                const token = getAccessToken();
                if (token) {
                    // В качестве accessId используем тот же идентификатор,
                    // с которым открывали ProcessInstance (applicationId из App)
                    const accessIdForAPI = applicationId?.trim();

                    if (accessIdForAPI) {
                        const contragentData = mapPolicyholderToContragent(
                            policyholderData,
                            contragentId,
                            contragentRelationId,
                            loadedContragentIdentifier
                        );

                        const savedContragent = await updateContragent(contragentData, accessIdForAPI.trim(), token);

                        if (savedContragent?.id) {
                            setContragentId(savedContragent.id);
                        }
                    }
                }
            } catch (error) {
                setErrorMessage('Ошибка сохранения данных');
                return; // Не переходим дальше при ошибке
            }
        }

        // Готовим displayData для Application.handlePolicyholderSave
        const displayData = {
            lastName: policyholderData.surname || '',
            firstName: policyholderData.name || '',
            middleName: policyholderData.patronymic || '',
            iin: policyholderData.iin || '',
            fullData: policyholderData
        };

        if (onSaveCallback) onSaveCallback(displayData);
    };

    return {
        policyholderData,
        activeField,
        toggleStates,
        autoModeState,
        errorMessage,
        isLoading,
        isLoadingContragent,
        handleFieldChange,
        handleFieldBlur,
        handleFieldActivate,
        handleDictionarySelect,
        handleToggle,
        handleSendRequest,
        handleUpdate,
        handleSave
    };
};
