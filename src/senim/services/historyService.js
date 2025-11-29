export const sanitizeHistoryValue = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '-' || trimmed === '—') {
      return undefined;
    }
    return trimmed;
  }
  return value;
};

export const mapHistoryItem = (item = {}) => ({
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
  comment: sanitizeHistoryValue(item.comment) ||
    sanitizeHistoryValue(item.reason) ||
    '',
  // Сохраняем taskId из оригинального элемента для использования в API запросах
  taskId: item.taskId || item.id || null
});

export const normalizeHistoryData = (data = {}) => {
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

export const formatHistoryDateTime = (value) => {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


