/** Progressive enhancement: native CSS owns every animated property.
 * Observers only announce visibility. There are no scroll/rAF polling loops. */
export function initMotion() {
  const root = document.documentElement;
  const toggle = document.querySelector('.motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = sessionStorage.getItem('burashova-motion-paused') === 'true'; } catch { /* Preferences are optional. */ }

  const applyPreference = () => {
    const allowed = !paused && !preference.matches && 'IntersectionObserver' in window;
    root.classList.toggle('motion-enabled', allowed);
    root.classList.toggle('motion-paused', paused);
    root.classList.toggle('motion-reduced', preference.matches);
    toggle.hidden = preference.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    const label = paused ? 'Включить анимацию' : 'Приостановить анимацию';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('burashova-motion-paused', String(paused)); } catch { /* Keep the current page operable. */ }
    applyPreference();
  });
  preference.addEventListener('change', applyPreference);
  applyPreference();

  if ('IntersectionObserver' in window) {
    document.querySelectorAll('.request-list details').forEach(element => element.classList.add('reveal'));
    const reveals = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        reveals.unobserve(entry.target);
      }
    }, { threshold: .08, rootMargin: '0px 0px -15px 0px' });
    document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));

    // A small bounded stagger groups comparisons and process steps.
    for (const selector of ['.format-grid .reveal', '.steps .reveal', '.reviews-grid .reveal']) {
      document.querySelectorAll(selector).forEach((element, index) => element.style.setProperty('--reveal-delay', `${Math.min(index, 2) * 75}ms`));
    }

    const loops = new IntersectionObserver(entries => {
      for (const entry of entries) entry.target.classList.toggle('is-inview', entry.isIntersecting);
    });
    document.querySelectorAll('[data-loop]').forEach(element => loops.observe(element));

    const header = document.querySelector('.header');
    const sentinel = document.querySelector('.header-sentinel');
    new IntersectionObserver(entries => header.classList.toggle('is-scrolled', !entries[0].isIntersecting)).observe(sentinel);
  }
  const syncVisibility = () => root.classList.toggle('page-hidden', document.hidden);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
}
