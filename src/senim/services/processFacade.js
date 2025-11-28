// Фасад для работы с ProcessInstance/Contragent и маппинга в формат фронта

// Общая вспомогательная функция для форматирования дат из API в формат DD.MM.YYYY
const formatDateForDisplay = (dateValue) => {
  if (!dateValue && dateValue !== 0) {
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
    if (Number.isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (e) {
    return '';
  }
};

/**
 * Преобразование контрагента insured из API в формат, который использует фронт (Insured формы/карточки)
 * Используется в Application и может переиспользоваться в других местах.
 */
export const mapContragentToInsuredForApplication = (contragentData) => {
  if (!contragentData) return {};

  const address = contragentData.address || {};
  const detail = contragentData.detail || {};
  const identityDoc = contragentData.identityDoc || {};
  const mobileContact = Array.isArray(contragentData.contacts)
    ? contragentData.contacts.find((c) => c.contactTypeCode === 'mobile')
    : null;

  const countryValue = address.countryCode
    ? {
        code: address.countryCode,
        nameRu: address.countryName || address.countryCode
      }
    : null;

  const economicSectorName = detail.economicSectorName || '';
  const economicSectorCode = detail.economicSectorCode || '';
  const economicSectorDisplayName =
    economicSectorCode && economicSectorName
      ? `${economicSectorCode} - ${economicSectorName}`
      : economicSectorName || economicSectorCode || '';

  // ФИО: сначала берем из detail, если пусто — пытаемся разобрать longName
  let name = detail.firstName || '';
  let surname = detail.lastName || '';
  let patronymic = detail.middleName || '';
  if (!name && !surname && !patronymic && contragentData.longName) {
    const parts = String(contragentData.longName).trim().split(/\s+/);
    surname = parts[0] || '';
    name = parts[1] || '';
    patronymic = parts.slice(2).join(' ') || '';
  }

  return {
    iin: contragentData.identifier || contragentData.contragentIdentifier || '',
    telephone: mobileContact?.value || '',
    name,
    surname,
    patronymic,
    street: address.street || '',
    houseNumber: address.building || '',
    apartmentNumber: address.flat || '',
    docNumber: identityDoc.number || '',
    birthDate: formatDateForDisplay(detail.birthDate || ''),
    issueDate: formatDateForDisplay(identityDoc.issuedDate || ''),
    expiryDate: formatDateForDisplay(identityDoc.expireDate || ''),
    gender: detail.genderCode
      ? {
          code: detail.genderCode,
          nameRu: detail.genderName || detail.genderCode
        }
      : '',
    economSecId: detail.economicSectorCode
      ? {
          code: detail.economicSectorCode,
          nameRu: economicSectorDisplayName
        }
      : '',
    countryId: countryValue || '',
    district_nameru: address.region || address.district || '',
    settlementName: address.city || '',
    vidDocId: identityDoc.identityDocTypeCode
      ? {
          code: identityDoc.identityDocTypeCode,
          nameRu: identityDoc.identityDocTypeName || identityDoc.identityDocTypeCode
        }
      : '',
    issuedBy: identityDoc.identityDocIssuerCode
      ? {
          code: identityDoc.identityDocIssuerCode,
          nameRu: identityDoc.identityDocIssuerName || identityDoc.identityDocIssuerCode
        }
      : ''
  };
};

/**
 * Преобразование контрагента client (страхователя) из API в формат приложения.
 * Поля максимально совпадают с формой страхователя.
 */
export const mapContragentToPolicyholderForApplication = (contragentData) => {
  if (!contragentData) return {};

  const address = contragentData.address || {};
  const detail = contragentData.detail || {};
  const identityDoc = contragentData.identityDoc || {};
  const mobileContact = Array.isArray(contragentData.contacts)
    ? contragentData.contacts.find((c) => c.contactTypeCode === 'mobile')
    : null;

  const countryValue = address.countryCode
    ? {
        code: address.countryCode,
        nameRu: address.countryName || address.countryCode
      }
    : null;

  const economicSectorName = detail.economicSectorName || '';
  const economicSectorCode = detail.economicSectorCode || '';
  const economicSectorDisplayName =
    economicSectorCode && economicSectorName
      ? `${economicSectorCode} - ${economicSectorName}`
      : economicSectorName || economicSectorCode || '';

  // ФИО: сначала берем из detail, если пусто — пытаемся разобрать longName
  let name = detail.firstName || '';
  let surname = detail.lastName || '';
  let patronymic = detail.middleName || '';
  if (!name && !surname && !patronymic && contragentData.longName) {
    const parts = String(contragentData.longName).trim().split(/\s+/);
    surname = parts[0] || '';
    name = parts[1] || '';
    patronymic = parts.slice(2).join(' ') || '';
  }

  return {
    iin: contragentData.identifier || contragentData.contragentIdentifier || '',
    telephone: mobileContact?.value || '',
    name,
    surname,
    patronymic,
    street: address.street || '',
    houseNumber: address.building || '',
    apartmentNumber: address.flat || '',
    docNumber: identityDoc.number || '',
    birthDate: formatDateForDisplay(detail.birthDate || ''),
    issueDate: formatDateForDisplay(identityDoc.issuedDate || ''),
    expiryDate: formatDateForDisplay(identityDoc.expireDate || ''),
    gender: detail.genderCode
      ? {
          code: detail.genderCode,
          nameRu: detail.genderName || detail.genderCode
        }
      : '',
    economSecId: detail.economicSectorCode
      ? {
          code: detail.economicSectorCode,
          nameRu: economicSectorDisplayName
        }
      : '',
    countryId: countryValue || '',
    district_nameru: address.region || address.district || '',
    settlementName: address.city || '',
    vidDocId: identityDoc.identityDocTypeCode
      ? {
          code: identityDoc.identityDocTypeCode,
          nameRu: identityDoc.identityDocTypeName || identityDoc.identityDocTypeCode
        }
      : '',
    issuedBy: identityDoc.identityDocIssuerCode
      ? {
          code: identityDoc.identityDocIssuerCode,
          nameRu: identityDoc.identityDocIssuerName || identityDoc.identityDocIssuerCode
        }
      : '',
    clientType: contragentData.clientType || contragentData.insuredType || ''
  };
};


