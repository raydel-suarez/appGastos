export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDateRange(periodo) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (periodo === 'semanal') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const lunes = new Date(now);
    lunes.setDate(now.getDate() + diff);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { start: toDateStr(lunes), end: toDateStr(domingo) };
  }

  if (periodo === 'mensual') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: toDateStr(start), end: toDateStr(end) };
  }

  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31);
  return { start: toDateStr(start), end: toDateStr(end) };
}

export function getPrevDateRange(periodo) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (periodo === 'semanal') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const lunes = new Date(now);
    lunes.setDate(now.getDate() + diff - 7);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { start: toDateStr(lunes), end: toDateStr(domingo) };
  }

  if (periodo === 'mensual') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: toDateStr(start), end: toDateStr(end) };
  }

  const start = new Date(now.getFullYear() - 1, 0, 1);
  const end = new Date(now.getFullYear() - 1, 11, 31);
  return { start: toDateStr(start), end: toDateStr(end) };
}

export function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
