// ==========================================================================
// Shelfwise — shared front-end behavior
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initNewsletterForms();
  initProductFilter();
  initContactForm();
});

/* ---- Mobile nav toggle ---- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

/* ---- Newsletter forms ----
   Posts to the Django backend (see js/config.js + js/api.js) when it's
   configured and reachable. If not — e.g. you haven't deployed the
   backend yet — falls back to a front-end-only success message so the
   form still feels functional while you're still building. */
function initNewsletterForms() {
  document.querySelectorAll('[data-newsletter-form]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value || !input.checkValidity()) {
        input && input.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      if (typeof ShelfwiseAPI !== 'undefined') {
        await ShelfwiseAPI.subscribeNewsletter(input.value.trim(), window.location.pathname);
      }

      const success = form.parentElement.querySelector('.form-success');
      form.style.display = 'none';
      if (success) success.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
    });
  });
}

/* ---- Contact form ----
   Posts to the Django backend's /api/contact/ endpoint when configured,
   landing in the Contact Messages section of the admin. Falls back to a
   front-end-only confirmation if the backend isn't set up yet. */
function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    if (typeof ShelfwiseAPI !== 'undefined') {
      const formData = new FormData(form);
      await ShelfwiseAPI.submitContact({
        name: formData.get('name'),
        email: formData.get('email'),
        topic: mapTopicToApi(formData.get('topic')),
        message: formData.get('message'),
      });
    }

    const note = form.querySelector('[data-contact-success]');
    form.reset();
    if (note) {
      note.style.display = 'block';
      setTimeout(() => (note.style.display = 'none'), 6000);
    }
    if (submitBtn) submitBtn.disabled = false;
  });
}

function mapTopicToApi(label) {
  const map = {
    'Suggest a product': 'suggest_product',
    'Report incorrect information': 'report_issue',
    'Partnership inquiry': 'partnership',
    'Something else': 'other',
  };
  return map[label] || 'other';
}

/* ---- Product search / filter / sort ----
   Reads whatever cards are currently in the grid, so this works equally
   well with the static demo cards baked into the HTML and with cards
   api.js swaps in after fetching from the live backend. */
function initProductFilter() {
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;

  const searchInput = document.querySelector('[data-filter-search]');
  const categorySelect = document.querySelector('[data-filter-category]');
  const levelSelect = document.querySelector('[data-filter-level]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const sortSelect = document.querySelector('[data-filter-sort]');
  const countEl = document.querySelector('[data-filter-count]');
  const emptyState = document.querySelector('[data-empty-state]');

  function apply() {
    const cards = Array.from(grid.querySelectorAll('[data-product]'));
    const q = (searchInput?.value || '').trim().toLowerCase();
    const cat = categorySelect?.value || 'all';
    const level = levelSelect?.value || 'all';
    const type = typeSelect?.value || 'all';
    const sort = sortSelect?.value || 'recommended';

    let visible = 0;
    cards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const desc = (card.dataset.desc || '').toLowerCase();
      const matchesQuery = !q || name.includes(q) || desc.includes(q);
      const matchesCat = cat === 'all' || card.dataset.category === cat;
      const matchesLevel = level === 'all' || card.dataset.level === level;
      const matchesType = type === 'all' || card.dataset.type === type;
      const show = matchesQuery && matchesCat && matchesLevel && matchesType;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    const sorted = cards.slice().sort((a, b) => {
      if (sort === 'rating') return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
      if (sort === 'newest') return parseInt(b.dataset.added) - parseInt(a.dataset.added);
      if (sort === 'price-asc') return parseFloat(a.dataset.price || 0) - parseFloat(b.dataset.price || 0);
      if (sort === 'price-desc') return parseFloat(b.dataset.price || 0) - parseFloat(a.dataset.price || 0);
      return parseInt(a.dataset.recommended || 0) - parseInt(b.dataset.recommended || 0);
    });
    sorted.forEach(card => grid.appendChild(card));

    if (countEl) countEl.textContent = `${visible} product${visible === 1 ? '' : 's'}`;
    if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
  }

  [searchInput, categorySelect, levelSelect, typeSelect, sortSelect].forEach(el => {
    el && el.addEventListener('input', apply);
    el && el.addEventListener('change', apply);
  });

  // Exposed so api.js can re-run filtering/sorting after it swaps in
  // freshly fetched product cards.
  window.__shelfwiseReapplyFilters = apply;

  apply();
}
