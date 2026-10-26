const KEY = 'burashova-demo-v1';
export const DEMO_PASSWORD = 'Demo!Burashova-2026#Green';
export const SESSION_KEY = 'burashova-demo-session';
export const statuses = { new: 'Новая', contacted: 'Связались', booked: 'Записан', closed: 'Закрыта' };
export const formats = { online: 'Онлайн', office: 'В Красноярске' };
export const services = { individual: 'Индивидуальная', couple: 'Для пары', group: 'Группа' };

export function validateBooking(input) {
  const value = Object.fromEntries(['name', 'contact', 'format', 'service', 'time'].map(k => [k, String(input[k] ?? '').trim()]));
  if (value.name.length < 2 || value.name.length > 80) throw new Error('Укажите имя: от 2 до 80 символов.');
  if (value.contact.length < 3 || value.contact.length > 120) throw new Error('Укажите контакт: от 3 до 120 символов.');
  if (!Object.hasOwn(formats, value.format) || !Object.hasOwn(services, value.service)) throw new Error('Выберите формат встречи.');
  if (value.time.length > 200) throw new Error('Пожелание ко времени должно быть короче 200 символов.');
  if (input.consent !== true) throw new Error('Подтвердите согласие с условиями демонстрации.');
  return value;
}

function seeds() {
  const day = 86400000;
  return [
    { id: 'demo-anna', name: 'Анна · пример', contact: 'anna@example.com', format: 'online', service: 'individual', time: 'В будни после 18:00', status: 'new', createdAt: new Date(Date.now() - day / 2).toISOString() },
    { id: 'demo-mikhail', name: 'Михаил · пример', contact: 'mikhail@example.com', format: 'office', service: 'couple', time: 'В субботу', status: 'contacted', createdAt: new Date(Date.now() - day).toISOString() },
    { id: 'demo-elena', name: 'Елена · пример', contact: 'elena@example.com', format: 'online', service: 'group', time: '', status: 'booked', createdAt: new Date(Date.now() - day * 2).toISOString() },
  ];
}

function isRecord(r) {
  return r && typeof r.id === 'string' && typeof r.name === 'string' && typeof r.contact === 'string' && typeof r.time === 'string'
    && Object.hasOwn(formats, r.format) && Object.hasOwn(services, r.service) && Object.hasOwn(statuses, r.status) && Number.isFinite(Date.parse(r.createdAt));
}

export function createDemoStore(storage) {
  const save = records => {
    try { storage.setItem(KEY, JSON.stringify({ version: 1, records })); }
    catch { throw new Error('Хранилище браузера недоступно. Разрешите локальное хранение и попробуйте ещё раз.'); }
  };
  const list = () => {
    let raw;
    try { raw = storage.getItem(KEY); }
    catch { throw new Error('Хранилище браузера недоступно. Разрешите локальное хранение.'); }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.version === 1 && Array.isArray(parsed.records) && parsed.records.every(isRecord)) return parsed.records;
      } catch { /* Recover malformed demo-only browser data. */ }
    }
    const records = seeds();
    save(records);
    return records;
  };
  return {
    list,
    add(input) {
      const value = validateBooking(input);
      const record = { ...value, id: crypto.randomUUID(), status: 'new', createdAt: new Date().toISOString() };
      save([record, ...list()]);
      return record;
    },
    update(id, status) {
      if (!Object.hasOwn(statuses, status)) throw new Error('Неизвестный статус.');
      save(list().map(r => r.id === id ? { ...r, status } : r));
    },
    remove(id) { save(list().filter(r => r.id !== id)); },
    reset() { save(seeds()); },
  };
}

export function isDemoSessionValid(value, now = Date.now()) {
  const timestamp = Number(value);
  return Boolean(value) && Number.isFinite(timestamp) && timestamp <= now && now - timestamp <= 4 * 60 * 60 * 1000;
}
