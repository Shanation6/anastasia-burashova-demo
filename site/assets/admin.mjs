import { createDemoStore, DEMO_PASSWORD, SESSION_KEY, isDemoSessionValid, statuses, formats, services } from './demo-store.mjs';

function hasSession() {
  try { return isDemoSessionValid(sessionStorage.getItem(SESSION_KEY)); }
  catch { return false; }
}

if (document.body.dataset.page === 'login') {
  const form = document.querySelector('#login-form');
  const error = document.querySelector('#login-error');
  document.querySelector('#demo-password').textContent = DEMO_PASSWORD;
  document.querySelector('#fill-demo').addEventListener('click', () => {
    form.elements.login.value = 'admin';
    form.elements.password.value = DEMO_PASSWORD;
    error.textContent = '';
    form.querySelector('[type="submit"]').focus();
  });
  document.querySelector('#show-password').addEventListener('click', event => {
    const show = form.elements.password.type === 'password';
    form.elements.password.type = show ? 'text' : 'password';
    event.currentTarget.textContent = show ? 'Скрыть' : 'Показать';
    event.currentTarget.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
    event.currentTarget.setAttribute('aria-pressed', String(show));
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.elements.login.value.trim() !== 'admin' || form.elements.password.value !== DEMO_PASSWORD) {
      error.textContent = 'Логин или демо-пароль не совпадают. Доступ для просмотра указан ниже.';
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, String(Date.now()));
      location.assign('./index.html');
    } catch { error.textContent = 'Хранилище сессии недоступно. Разрешите локальное хранение в браузере.'; }
  });
} else {
  function requireSession() {
    if (hasSession()) return true;
    document.querySelector('#dashboard').hidden = true;
    location.replace('./login.html');
    return false;
  }
  if (requireSession()) {
    document.querySelector('#dashboard').hidden = false;
    let store;
    const list = document.querySelector('#application-list');
    const search = document.querySelector('#search');
    const statusFilter = document.querySelector('#status-filter');
    const formatFilter = document.querySelector('#format-filter');
    const error = document.querySelector('#admin-error');
    const message = document.querySelector('#admin-status');
    const dialog = document.querySelector('#confirm-dialog');
    let pending = null;
    let dialogTrigger = null;

    function element(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }
    function guarded(action) {
      if (!requireSession()) return;
      try { error.textContent = ''; action(); }
      catch (cause) { error.textContent = cause instanceof Error ? cause.message : 'Не удалось изменить демо-данные.'; }
    }
    function render() {
      guarded(() => {
        store = createDemoStore(localStorage);
        const records = store.list();
        document.querySelector('#count-all').textContent = records.length;
        for (const key of ['new', 'contacted', 'booked']) document.querySelector(`#count-${key}`).textContent = records.filter(record => record.status === key).length;
        const query = search.value.trim().toLocaleLowerCase('ru');
        const visible = records.filter(record => (!query || `${record.name} ${record.contact}`.toLocaleLowerCase('ru').includes(query))
          && (statusFilter.value === 'all' || record.status === statusFilter.value)
          && (formatFilter.value === 'all' || record.format === formatFilter.value));
        list.replaceChildren();
        for (const record of visible) {
          const card = element('article', 'application-card');
          const person = element('div', 'application-person');
          person.append(element('h2', '', record.name), element('p', 'application-contact', record.contact));
          const date = element('time', 'application-date', new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(record.createdAt)));
          date.dateTime = record.createdAt;
          person.append(date);
          const details = element('div', 'application-details');
          details.append(element('span', 'application-format', `${services[record.service]} · ${formats[record.format]}`), element('p', '', record.time || 'Время согласуется лично'));
          const status = element('div', 'application-status');
          const select = element('select', 'admin-filter');
          select.setAttribute('aria-label', `Статус заявки: ${record.name}`);
          for (const [value, text] of Object.entries(statuses)) {
            const option = element('option', '', text); option.value = value; option.selected = value === record.status; select.append(option);
          }
          select.addEventListener('change', () => guarded(() => {
            const newStatus = select.value;
            store.update(record.id, newStatus);
            message.textContent = `Статус заявки «${record.name}»: ${statuses[newStatus]}.`;
            render();
            const replacement = [...list.querySelectorAll('select')].find(item => item.getAttribute('aria-label') === select.getAttribute('aria-label'));
            (replacement ?? statusFilter).focus();
          }));
          status.append(select);
          const remove = element('button', 'delete-button', 'Удалить');
          remove.type = 'button';
          remove.setAttribute('aria-label', `Удалить заявку: ${record.name}`);
          remove.addEventListener('click', () => {
            if (!requireSession()) return;
            pending = { type: 'delete', id: record.id, name: record.name };
            dialogTrigger = remove;
            document.querySelector('#confirm-title').textContent = 'Удалить демо-заявку?';
            document.querySelector('#confirm-text').textContent = `Запись «${record.name}» исчезнет из этого браузера. Это действие нельзя отменить.`;
            document.querySelector('#confirm-action').textContent = 'Удалить';
            dialog.showModal();
          });
          card.append(person, details, status, remove);
          list.append(card);
        }
        const empty = document.querySelector('#empty-state');
        empty.hidden = visible.length > 0;
        document.querySelector('#empty-message').textContent = records.length ? 'Нет заявок по выбранным условиям. Попробуйте изменить фильтры.' : 'Все демо-заявки удалены. Добавьте новую через форму на сайте или восстановите примеры кнопкой «Сбросить демо».';
      });
    }
    function clearFilters() { search.value = ''; statusFilter.value = 'all'; formatFilter.value = 'all'; render(); }
    [search, statusFilter, formatFilter].forEach(control => control.addEventListener(control === search ? 'input' : 'change', () => { render(); message.textContent = `Показано заявок: ${list.children.length}.`; }));
    document.querySelector('#clear-filters').addEventListener('click', () => { clearFilters(); search.focus(); });
    document.querySelector('#reset-demo').addEventListener('click', event => {
      if (!requireSession()) return;
      pending = { type: 'reset' };
      dialogTrigger = event.currentTarget;
      document.querySelector('#confirm-title').textContent = 'Начать демо заново?';
      document.querySelector('#confirm-text').textContent = 'Ваши локальные примеры будут удалены. Восстановятся три исходные демо-заявки.';
      document.querySelector('#confirm-action').textContent = 'Сбросить демо';
      dialog.showModal();
    });
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'confirm' && pending) guarded(() => {
        if (pending.type === 'reset') { store.reset(); clearFilters(); message.textContent = 'Восстановлены три исходные демо-заявки.'; }
        else { store.remove(pending.id); render(); message.textContent = `Демо-заявка «${pending.name}» удалена.`; }
      });
      pending = null;
      if (dialogTrigger?.isConnected) dialogTrigger.focus(); else search.focus();
    });
    document.querySelector('#logout').addEventListener('click', () => {
      try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Exit even when browser storage is unavailable. */ }
      location.replace('./login.html');
    });
    window.addEventListener('pageshow', requireSession);
    window.addEventListener('focus', () => { if (requireSession()) render(); });
    window.addEventListener('storage', () => { if (requireSession()) render(); });
    setInterval(requireSession, 60000);
    render();
  }
}
