// Вспомогательные функции для извлечения кода и названия из справочника
const getCodeFromDict = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value.code || value.id || '';
    }
    return '';
};

const getNameFromDict = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value.nameRu || value.name_ru || value.name || '';
    }
    return '';
};

// Функция для нормализации даты
const normalizeDate = (dateValue) => {
    if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {
        return null;
    }
    const trimmed = String(dateValue).trim();

    // Уже в формате YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    // Может быть в формате YYYY-MM-DDTHH:mm:ss → берём только дату
    const dateOnlyMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateOnlyMatch) {
        return dateOnlyMatch[1];
    }

    // Формат DD.MM.YYYY (как в формах после formatDate из personService)
    const dmyMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dmyMatch) {
        const [ , day, month, year ] = dmyMatch;
        return `${year}-${month}-${day}`;
    }

    // Fallback: пробуем распарсить через Date
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            return null;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return null;
    }
};

// Маппинг данных Insured в формат Contragent API
// insuredType может быть: 'policyholder', 'own-child', 'other-child', 'other-person'
export const mapInsuredToContragent = (data, insuredType, loadedIdentifier = null, parentId = null, existingId = null) => {
    // Маппинг типов застрахованного на InsuredTypeCode
    const insuredTypeMapping = {
        'policyholder': '3', // Страхователь является Застрахованным
        'own-child': '1', // Для своего ребенка
        'other-child': '2', // Для иного ребенка
        'other-person': '4' // Иное лицо
    };

    const insuredTypeCode = insuredTypeMapping[insuredType] || '4';

    // Получаем код страны из объекта или строки
    let countryCode = getCodeFromDict(data.countryId);
    const countryName = getNameFromDict(data.countryId);

    // Проверяем, что countryCode - это действительно код (2-3 символа), а не название
    if (countryCode && countryCode.length > 3) {
        countryCode = '';
    }

    // Если страна выбрана из справочника (есть countryId), но код не найден,
    // используем значение по умолчанию 'KZ' (Казахстан) и считаем резидентом
    const hasCountrySelected = data.countryId && (typeof data.countryId === 'object' || data.countryId);
    if (hasCountrySelected && !countryCode) {
        countryCode = 'KZ';
    }

    // Получаем код пола
    let genderCode = getCodeFromDict(data.gender);
    const genderName = getNameFromDict(data.gender);

    const genderMapping = {
        'Мужской': 'male',
        'Женский': 'female',
        'male': 'male',
        'female': 'female'
    };

    if (genderCode && genderCode !== 'male' && genderCode !== 'female') {
        genderCode = genderMapping[genderCode] || '';
    }

    if (!genderCode && genderName) {
        genderCode = genderMapping[genderName] || '';
    }

    // Получаем код сектора экономики
    let economicSectorCode = getCodeFromDict(data.economSecId);
    let economicSectorName = getNameFromDict(data.economSecId);

    if (economicSectorCode && typeof economicSectorCode === 'string' && economicSectorCode.includes(' - ')) {
        const codePart = economicSectorCode.split(' - ')[0].trim();
        if (/^\d+$/.test(codePart)) {
            economicSectorCode = codePart;
        }
    }

    if (economicSectorName && typeof economicSectorName === 'string' && economicSectorName.includes(' - ')) {
        economicSectorName = economicSectorName.split(' - ').slice(1).join(' - ').trim();
    }

    if (economicSectorCode && typeof economicSectorCode === 'string' && economicSectorCode.length > 10 && !economicSectorCode.includes(' - ')) {
        const sectorMapping = {
            'Правительство Республики Казахстан или Правительство иностранного государства': '1',
            'Региональные и местные органы управления': '2',
            'Центральный (национальный) банк': '3',
            'Другие депозитные организации': '4',
            'Другие финансовые организации': '5',
            'Государственные нефинансовые организации': '6',
            'Негосударственные нефинансовые организации': '7',
            'Некоммерческие организации, обслуживающие домашние хозяйства': '8',
            'Домашние хозяйства/физическое лицо': '9'
        };
        economicSectorCode = sectorMapping[economicSectorCode] || '';
    }

    // Получаем код типа документа
    let docTypeCode = getCodeFromDict(data.vidDocId);
    const docTypeName = getNameFromDict(data.vidDocId);

    const docTypeMapping = {
        'Удостоверение личности': '1',
        'Паспорт': '2',
        'Свидетельство о рождении': '3',
        'Вид на жительство иностранца': '4'
    };

    if (docTypeCode) {
        if (docTypeCode.length > 10 || isNaN(docTypeCode)) {
            docTypeCode = docTypeMapping[docTypeCode] || '';
        }
    }

    if (!docTypeCode && docTypeName) {
        docTypeCode = docTypeMapping[docTypeName] || '';
    }

    // Получаем код органа выдачи
    let issuerCode = getCodeFromDict(data.issuedBy);
    const issuerName = getNameFromDict(data.issuedBy);

    const issuerMapping = {
        'Министерство внутренних дел Республики Казахстан': '1',
        'МИНИСТЕРСТВО ВНУТРЕННИХ ДЕЛ РК': '1',
        'МВД РК': '1',
        'Министерство юстиции Республики Казахстан': '2',
        // Для ЗАГС/регистрации актов гражданского состояния backend, судя по ошибке,
        // не знает кода '3', поэтому используем код '2' (система юстиции)
        'Запись актов гражданского состояния': '2',
        'ЗАГС': '2'
    };

    const findIssuerCode = (name) => {
        if (!name) return '';
        if (issuerMapping[name]) {
            return issuerMapping[name];
        }
        const nameLower = name.toLowerCase();
        for (const [key, value] of Object.entries(issuerMapping)) {
            if (key.toLowerCase() === nameLower) {
                return value;
            }
        }
        if (nameLower.includes('внутренних дел') || nameLower.includes('мвд')) {
            return '1';
        }
        if (nameLower.includes('юстиции')) {
            return '2';
        }
        if (nameLower.includes('загс') || nameLower.includes('актов гражданского')) {
            // Любые варианты ЗАГС/актов гражданского состояния → код '2' (юстиция)
            return '2';
        }
        return '';
    };

    if (issuerCode) {
        if (issuerCode.length > 10 || isNaN(issuerCode)) {
            issuerCode = findIssuerCode(issuerCode);
        }
    }

    if (!issuerCode && issuerName) {
        issuerCode = findIssuerCode(issuerName);
    }

    // API требует identifier для поиска или создания контрагента
    const contragentIdentifier = (data.iin || loadedIdentifier || '').trim();

    if (!contragentIdentifier) {
        throw new Error('Необходимо указать ИИН (identifier) для застрахованного');
    }

    // Определяем резидентность
    const residentTypeCode = hasCountrySelected ? 'resident' : 'nonResident';
    const residentTypeName = residentTypeCode === 'resident' ? 'Резидент' : 'Нерезидент';

    // Формируем полное имя
    const longName = `${data.surname || ''} ${data.name || ''} ${data.patronymic || ''}`.trim();

    // Формируем адрес
    const addressData = {
        countryCode: countryCode || 'KZ',
        ...(countryName ? { countryName: countryName } : {}),
        ...(data.district_nameru ? { region: data.district_nameru } : {}),
        ...(data.settlementName ? { city: data.settlementName } : {}),
        ...(data.street ? { street: data.street } : {}),
        ...(data.houseNumber ? { building: data.houseNumber } : {}),
        ...(data.apartmentNumber ? { flat: data.apartmentNumber } : {}),
    };

    // Формируем полный адрес
    const addressParts = [];
    if (data.district_nameru) addressParts.push(data.district_nameru);
    if (data.settlementName) addressParts.push(`г. ${data.settlementName}`);
    if (data.street) addressParts.push(`ул. ${data.street}`);
    if (data.houseNumber) addressParts.push(`д. ${data.houseNumber}`);
    if (data.apartmentNumber) addressParts.push(`кв. ${data.apartmentNumber}`);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '';
    if (fullAddress) {
        addressData.full = fullAddress;
    }
    addressData.katoCode = null;
    addressData.arKato = null;

    // Формируем контакты
    const contacts = [];
    if (data.telephone) {
        contacts.push({
            contactTypeCode: 'mobile',
            contactTypeName: 'Мобильный телефон',
            value: data.telephone
        });
    }
    if (data.email) {
        contacts.push({
            contactTypeCode: 'email',
            contactTypeName: 'E-mail',
            value: data.email
        });
    }

    // Формируем документ
    const identityDocData = {
        ...(docTypeCode ? { identityDocTypeCode: docTypeCode } : {}),
        ...(docTypeName ? { identityDocTypeName: docTypeName } : {}),
        ...(data.docNumber ? { number: data.docNumber } : {}),
        ...(data.series ? { series: data.series || '' } : {}),
        ...(issuerCode ? { identityDocIssuerCode: issuerCode } : {}),
        ...(issuerName ? { identityDocIssuerName: issuerName } : {}),
        ...(normalizeDate(data.issueDate) ? { issuedDate: normalizeDate(data.issueDate) } : {}),
        ...(normalizeDate(data.expiryDate) ? { expireDate: normalizeDate(data.expiryDate) } : {}),
    };

    // Формируем детали
    const detailData = {
        ...(data.surname ? { lastName: data.surname } : {}),
        ...(data.name ? { firstName: data.name } : {}),
        ...(data.patronymic ? { middleName: data.patronymic } : {}),
        ...(normalizeDate(data.birthDate) ? { birthDate: normalizeDate(data.birthDate) } : {}),
        ...(genderCode ? { genderCode: genderCode } : {}),
        ...(genderName ? { genderName: genderName } : {}),
        ...(economicSectorCode ? { economicSectorCode: economicSectorCode } : {}),
        ...(economicSectorName ? { economicSectorName: economicSectorName } : {}),
        ...(data.lastNameLatin ? { lastNameLatin: data.lastNameLatin } : {}),
        ...(data.firstNameLatin ? { firstNameLatin: data.firstNameLatin } : {}),
    };

    // Имя типа застрахованного для insuredDetails
    const insuredTypeNameMapping = {
        '1': 'Для своего ребенка',
        '2': 'Для иного ребенка',
        '3': 'Страхователь является застрахованным',
        '4': 'Иное лицо'
    };
    const insuredTypeName = insuredTypeNameMapping[insuredTypeCode] || '';

    // Извлекаем relationCompanyCode и relationCompanyName из clientType
    // Тип клиента: "1" - Иные лица, "2" - Работник, "3" - Член семьи
    const relationCompanyCode = getCodeFromDict(data.clientType);
    const relationCompanyName = getNameFromDict(data.clientType);

    // Формируем данные контрагента для застрахованного
    // Если передан existingId, используем его (для обновления), иначе пустой GUID (для создания)
    const contragentData = {
        id: existingId || '00000000-0000-0000-0000-000000000000',
        identifier: contragentIdentifier,
        longName: longName || '',
        contragentTypeCode: 'individual',
        contragentTypeName: 'Физическое лицо',
        residentTypeCode: residentTypeCode,
        residentTypeName: residentTypeName,
        contragentRoleCode: 'insured',
        contragentRoleName: 'Клиент',
        ...(Object.keys(addressData).length > 1 ? { address: addressData } : {}),
        ...(contacts.length > 0 ? { contacts: contacts } : {}),
        ...(Object.keys(identityDocData).length > 0 ? { identityDoc: identityDocData } : {}),
        ...(Object.keys(detailData).length > 0 ? { detail: detailData } : {}),
        insuredDetails: {
            // Дублируем код в двух полях (как в ProcessInstance) и сразу пробрасываем имя
            InsuredTypeCode: insuredTypeCode,
            insuredTypeCode: insuredTypeCode,
            ...(insuredTypeName ? { insuredTypeName } : {}),
            // Всегда отправляем relationCompanyCode и relationCompanyName, если clientType указан
            ...(data.clientType ? {
                ...(relationCompanyCode ? { relationCompanyCode } : {}),
                ...(relationCompanyName ? { relationCompanyName } : {})
            } : {})
        }
    };

    // Если передан parentId, добавляем legalRepresentative ТОЛЬКО для детей
    if (parentId && (insuredType === 'own-child' || insuredType === 'other-child')) {
        contragentData.legalRepresentative = {
            ProcessLegalRepId: parentId,
            RelationCode: '7' // Иное лицо (по умолчанию, можно параметризовать если нужно)
        };
    }

    return contragentData;
};

// Маппинг данных Policyholder в формат Contragent API
export const mapPolicyholderToContragent = (data, contragentId = null, contragentRelationId = null, loadedIdentifier = null) => {
    // Получаем код страны из объекта или строки
    let countryCode = getCodeFromDict(data.countryId);
    const countryName = getNameFromDict(data.countryId);

    // Проверяем, что countryCode - это действительно код (2-3 символа), а не название
    if (countryCode && countryCode.length > 3) {
        countryCode = '';
    }

    // Если страна выбрана из справочника (есть countryId), но код не найден,
    // используем значение по умолчанию 'KZ' (Казахстан) и считаем резидентом
    const hasCountrySelected = data.countryId && (typeof data.countryId === 'object' || data.countryId);
    if (hasCountrySelected && !countryCode) {
        countryCode = 'KZ';
    }

    // Получаем коды других справочников
    let genderCode = getCodeFromDict(data.gender);
    const genderName = getNameFromDict(data.gender);

    const genderMapping = {
        'Мужской': 'male',
        'Женский': 'female',
        'male': 'male',
        'female': 'female'
    };

    if (genderCode && genderCode !== 'male' && genderCode !== 'female') {
        genderCode = genderMapping[genderCode] || '';
    }

    if (!genderCode && genderName) {
        genderCode = genderMapping[genderName] || '';
    }

    let economicSectorCode = getCodeFromDict(data.economSecId);
    let economicSectorName = getNameFromDict(data.economSecId);

    if (economicSectorCode && typeof economicSectorCode === 'string' && economicSectorCode.includes(' - ')) {
        const codePart = economicSectorCode.split(' - ')[0].trim();
        if (/^\d+$/.test(codePart)) {
            economicSectorCode = codePart;
        }
    }

    if (economicSectorName && typeof economicSectorName === 'string' && economicSectorName.includes(' - ')) {
        economicSectorName = economicSectorName.split(' - ').slice(1).join(' - ').trim();
    }

    if (economicSectorCode && typeof economicSectorCode === 'string' && economicSectorCode.length > 10 && !economicSectorCode.includes(' - ')) {
        const sectorMapping = {
            'Правительство Республики Казахстан или Правительство иностранного государства': '1',
            'Региональные и местные органы управления': '2',
            'Центральный (национальный) банк': '3',
            'Другие депозитные организации': '4',
            'Другие финансовые организации': '5',
            'Государственные нефинансовые организации': '6',
            'Негосударственные нефинансовые организации': '7',
            'Некоммерческие организации, обслуживающие домашние хозяйства': '8',
            'Домашние хозяйства/физическое лицо': '9'
        };
        economicSectorCode = sectorMapping[economicSectorCode] || '';
    }

    let docTypeCode = getCodeFromDict(data.vidDocId);
    const docTypeName = getNameFromDict(data.vidDocId);

    const docTypeMapping = {
        'Удостоверение личности': '1',
        'Паспорт': '2',
        'Свидетельство о рождении': '3',
        'Вид на жительство иностранца': '4'
    };

    if (docTypeCode) {
        if (docTypeCode.length > 10 || isNaN(docTypeCode)) {
            docTypeCode = docTypeMapping[docTypeCode] || '';
        }
    }

    if (!docTypeCode && docTypeName) {
        docTypeCode = docTypeMapping[docTypeName] || '';
    }

    let issuerCode = getCodeFromDict(data.issuedBy);
    const issuerName = getNameFromDict(data.issuedBy);

    const issuerMapping = {
        'Министерство внутренних дел Республики Казахстан': '1',
        'МИНИСТЕРСТВО ВНУТРЕННИХ ДЕЛ РК': '1',
        'МВД РК': '1',
        'Министерство юстиции Республики Казахстан': '2',
        'Запись актов гражданского состояния': '3',
        'ЗАГС': '3'
    };

    const findIssuerCode = (name) => {
        if (!name) return '';
        if (issuerMapping[name]) {
            return issuerMapping[name];
        }
        const nameLower = name.toLowerCase();
        for (const [key, value] of Object.entries(issuerMapping)) {
            if (key.toLowerCase() === nameLower) {
                return value;
            }
        }
        if (nameLower.includes('внутренних дел') || nameLower.includes('мвд')) {
            return '1';
        }
        if (nameLower.includes('юстиции')) {
            return '2';
        }
        if (nameLower.includes('загс') || nameLower.includes('актов гражданского')) {
            return '';
        }
        return '';
    };

    if (issuerCode) {
        if (issuerCode.length > 10 || isNaN(issuerCode)) {
            issuerCode = findIssuerCode(issuerCode);
        }
    }

    if (!issuerCode && issuerName) {
        issuerCode = findIssuerCode(issuerName);
    }

    const contragentIdentifier = (data.iin || loadedIdentifier || '').trim();

    if (!contragentId && !contragentIdentifier) {
        throw new Error('Необходимо указать либо contragentId контрагента, либо ИИН (identifier)');
    }

    const residentTypeCode = hasCountrySelected ? 'resident' : 'nonResident';

    const longName = `${data.surname || ''} ${data.name || ''} ${data.patronymic || ''}`.trim();

    const addressData = {
        countryCode: countryCode || 'KZ',
        ...(countryName ? { countryName: countryName } : {}),
        ...(data.district_nameru ? { region: data.district_nameru } : {}),
        ...(data.settlementName ? { city: data.settlementName } : {}),
        ...(data.street ? { street: data.street } : {}),
        ...(data.houseNumber ? { building: data.houseNumber } : {}),
        ...(data.apartmentNumber ? { flat: data.apartmentNumber } : {}),
    };

    const identityDocData = {
        ...(docTypeCode ? { identityDocTypeCode: docTypeCode } : {}),
        ...(docTypeName ? { identityDocTypeName: docTypeName } : {}),
        ...(data.docNumber ? { number: data.docNumber } : {}),
        ...(issuerCode ? { identityDocIssuerCode: issuerCode } : {}),
        ...(issuerName ? { identityDocIssuerName: issuerName } : {}),
        ...(normalizeDate(data.issueDate) ? { issuedDate: normalizeDate(data.issueDate) } : {}),
        ...(normalizeDate(data.expiryDate) ? { expireDate: normalizeDate(data.expiryDate) } : {}),
    };

    const detailData = {
        ...(data.surname ? { lastName: data.surname } : {}),
        ...(data.name ? { firstName: data.name } : {}),
        ...(data.patronymic ? { middleName: data.patronymic } : {}),
        ...(normalizeDate(data.birthDate) ? { birthDate: normalizeDate(data.birthDate) } : {}),
        ...(genderCode ? { genderCode: genderCode } : {}),
        ...(genderName ? { genderName: genderName } : {}),
        ...(economicSectorCode ? { economicSectorCode: economicSectorCode } : {}),
        ...(economicSectorName ? { economicSectorName: economicSectorName } : {}),
    };

    const contragentData = {
        ...(contragentRelationId ? { id: contragentRelationId } : {}),
        contragentTypeCode: 'individual',
        residentTypeCode: residentTypeCode,
        contragentRoleCode: 'client',
        contragentRoleName: 'Клиент',
        longName: longName || '',
        ...(Object.keys(addressData).length > 1 ? { address: addressData } : {}),
        ...(data.telephone ? {
            contacts: [{
                contactTypeCode: 'mobile',
                contactTypeName: 'Мобильный телефон',
                value: data.telephone
            }]
        } : {}),
        ...(Object.keys(identityDocData).length > 0 ? { identityDoc: identityDocData } : {}),
        ...(Object.keys(detailData).length > 0 ? { detail: detailData } : {}),
    };

    if (contragentIdentifier) {
        contragentData.identifier = contragentIdentifier;
    }

    return contragentData;
};

// Функция для маппинга родителя в формат Contragent (legalrep)
// Используем ту же логику что и для Policyholder (client), но с другой ролью
export const mapLegalRepToContragent = (data, loadedIdentifier = null) => {
    // Используем mapPolicyholderToContragent как базу, так как структура данных похожа
    const baseContragent = mapPolicyholderToContragent(data, null, null, loadedIdentifier);

    // Переопределяем роль на legalrep
    return {
        ...baseContragent,
        contragentRoleCode: 'legalrep',
        contragentRoleName: 'Клиент', // В примере JSON имя роли "Клиент", код "legalrep"
        id: '00000000-0000-0000-0000-000000000000' // Новый ID для создания
    };
};
