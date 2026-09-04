// ==========================================================================
// Shelfwise — API client
// ==========================================================================
// Talks to the Django backend on Render:
//   - GET  /api/products/   -> live product catalog (paginated: {count, results})
//   - POST /api/contact/    -> contact form submissions
//   - POST /api/newsletter/ -> newsletter signups
//
// Product grids marked [data-product-grid][data-api-source] are populated
// with live data on page load. If the backend is unreachable, or a grid's
// filtered result is empty, the static demo cards already in the HTML are
// left in place as a fallback — so the site never shows a blank grid.

const ShelfwiseAPI = (() => {
  const BASE = (window.SHELFWISE_CONFIG && window.SHELFWISE_CONFIG.API_BASE_URL) || '';

  const TYPE_TO_CATEGORY = {
    course: 'courses',
    ebook: 'ebooks',
    software: 'software',
    template: 'templates',
  };

  function starString(rating) {
    const full = Math.round(Number(rating) || 0);
    return '★'.repeat(Math.max(0, Math.min(5, full))) + '☆'.repeat(5 - Math.max(0, Math.min(5, full)));
  }

  async function fetchProducts() {
    const res = await fetch(`${BASE}/api/products/`);
    if (!res.ok) throw new Error(`Products request failed: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  }

  function buildCard(p, index) {
    const category = TYPE_TO_CATEGORY[p.product_type] || 'courses';
    const isFree = !!p.is_free;
    const priceLabel = isFree ? 'Free' : (p.display_price || (p.price != null ? `$${p.price}` : ''));
    const priceNum = isFree ? 0 : (parseFloat(p.price) || 0);
    const features = Array.isArray(p.features) ? p.features.slice(0, 2) : [];
    const img = p.image || `https://placehold.co/480x300/EBEEFF/3654FF?text=${encodeURIComponent(p.product_type || 'Product')}`;
    const reviewUrl = p.slug ? `review-template.html?slug=${encodeURIComponent(p.slug)}` : 'review-template.html';
    const affiliateUrl = p.affiliate_url || '#';

    const article = document.createElement('article');
    article.className = 'ticket';
    article.dataset.product = '';
    article.dataset.name = p.name || '';
    article.dataset.desc = p.short_description || '';
    article.dataset.category = category;
    article.dataset.level = p.level || 'beginner';
    article.dataset.type = p.product_type || '';
    article.dataset.rating = p.rating != null ? p.rating : 0;
    article.dataset.price = priceNum;
    article.dataset.added = String(index);
    article.dataset.recommended = p.top_pick_rank != null ? String(p.top_pick_rank) : String(index + 1);

    article.innerHTML = `
      <div class="ticket-media"><img src="${img}" alt="${p.name || ''}" loading="lazy"><span class="ticket-stamp">Live product</span></div>
      <div class="ticket-body">
        <span class="ticket-cat">${p.category || ''}</span>
        <h3>${p.name || ''}</h3>
        <p class="ticket-desc">${p.short_description || ''}</p>
        <div class="ticket-rating"><span class="stars">${starString(p.rating)}</span><span class="rating-num">${p.rating || ''}</span><span class="review-count">(${p.review_count || 0})</span></div>
        <div class="ticket-features">${features.map((f) => `<span class="chip">${f}</span>`).join('')}</div>
      </div>
      <div class="ticket-strip"><span class="ticket-price">${priceLabel}</span><a href="${reviewUrl}" class="btn-ghost btn-sm">View Review</a></div>
      <div class="ticket-cta-row"><a href="${affiliateUrl}" class="btn btn-primary btn-sm" rel="nofollow sponsored" data-affiliate-slot="${p.slug || ''}">${p.cta_text || 'Get Product'}</a></div>
    `;
    return article;
  }

  async function loadProductGrids() {
    const grids = document.querySelectorAll('[data-product-grid][data-api-source]');
    if (!grids.length) return;

    let products;
    try {
      products = await fetchProducts();
    } catch (err) {
      console.warn('Shelfwise: could not load live products, keeping static demo cards.', err);
      return;
    }

    grids.forEach((grid) => {
      const categoryFilter = grid.dataset.apiCategory;
      const featuredOnly = grid.dataset.apiFeatured;
      // Comma-separated list of product_type values, e.g. "software,template"
      const typeFilter = grid.dataset.apiType
        ? grid.dataset.apiType.split(',').map((t) => t.trim()).filter(Boolean)
        : null;

      let list = products;
      if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
      if (typeFilter) list = list.filter((p) => typeFilter.includes(p.product_type));
      if (featuredOnly) list = list.filter((p) => p.is_featured);

      // Keep the static demo cards as a fallback if the API returned
      // nothing for this grid's filter (e.g. category slug mismatch).
      if (!list.length) return;

      grid.innerHTML = '';
      list.forEach((p, i) => grid.appendChild(buildCard(p, i)));

      if (typeof window.__shelfwiseReapplyFilters === 'function') {
        window.__shelfwiseReapplyFilters();
      }
    });
  }

  async function subscribeNewsletter(email, sourcePage) {
    try {
      const res = await fetch(`${BASE}/api/newsletter/subscribe/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: sourcePage }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Shelfwise: newsletter signup failed, backend unreachable.', err);
      return false;
    }
  }

  async function submitContact(payload) {
    try {
      const res = await fetch(`${BASE}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (err) {
      console.warn('Shelfwise: contact form failed, backend unreachable.', err);
      return false;
    }
  }

  document.addEventListener('DOMContentLoaded', loadProductGrids);

  return { fetchProducts, loadProductGrids, subscribeNewsletter, submitContact };
})();
