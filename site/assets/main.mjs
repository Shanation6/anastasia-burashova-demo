import { createDemoStore } from './demo-store.mjs';
import { initMotion } from './motion.mjs';

initMotion();

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const setMenu = open => {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('is-open', open);
};
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.header')) setMenu(false); });

let selectedFormat = 'online';
document.querySelectorAll('[data-format]').forEach(button => button.addEventListener('click', () => {
  selectedFormat = button.dataset.format;
  document.querySelectorAll('[data-format]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#individual-price').textContent = selectedFormat === 'office' ? '3 500 ₽' : '3 000 ₽';
  document.querySelector('#format').value = selectedFormat;
}));
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#service').value = link.dataset.service;
  if (link.dataset.service === 'individual') document.querySelector('#format').value = selectedFormat;
}));

const form = document.querySelector('#booking-form');
const error = document.querySelector('#form-error');
const success = document.querySelector('#booking-success');
form.addEventListener('input', event => {
  event.target.removeAttribute('aria-invalid');
  error.textContent = '';
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  const firstInvalid = [...form.elements].find(element => element.willValidate && !element.checkValidity());
  if (firstInvalid) {
    firstInvalid.setAttribute('aria-invalid', 'true');
    error.textContent = firstInvalid.name === 'consent' ? 'Пожалуйста, подтвердите условия демонстрации.' : firstInvalid.name === 'name' ? 'Укажите имя: не менее двух символов.' : 'Укажите демо-контакт: не менее трёх символов.';
    firstInvalid.focus();
    return;
  }
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = [...submit.childNodes].map(node => node.cloneNode(true));
  submit.disabled = true;
  submit.textContent = 'Сохраняем демо-заявку…';
  try {
    await new Promise(resolve => setTimeout(resolve, 350));
    const input = Object.fromEntries(new FormData(form));
    input.consent = form.elements.consent.checked;
    createDemoStore(localStorage).add(input);
    form.hidden = true;
    success.hidden = false;
    success.focus();
  } catch (cause) {
    error.textContent = cause instanceof Error ? cause.message : 'Не удалось сохранить демо-заявку. Попробуйте ещё раз.';
  } finally {
    submit.disabled = false;
    submit.replaceChildren(...submitLabel);
  }
});
document.querySelector('#another-booking').addEventListener('click', () => {
  form.reset(); success.hidden = true; form.hidden = false; form.elements.name.focus();
});
const mobileBooking = document.querySelector('.mobile-booking');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => mobileBooking.classList.toggle('is-hidden', entries[0].isIntersecting), { threshold: 0.05 });
  observer.observe(document.querySelector('#booking'));
}
document.querySelector('#year').textContent = new Date().getFullYear();
