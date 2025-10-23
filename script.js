/* Deluxe Global Edition JS
   - products, cart, wishlist (localStorage)
   - modal, cart panel, toast
   - filters, search, testimonial slider, chart
   - animations on scroll
*/

const SAMPLE_PRODUCTS = [
  { id:'p2', name:'Toraja Kalosi 250g', region:'Nusantara', roast:'medium-dark', price:130000, rating:4.8, votes:88, img:'el.webp', desc:'Body kaya, profil rasa earthy dan manis.' },
  { id:'p3', name:'Kintamani Bali 200g', region:'Nusantara', roast:'light', price:110000, rating:4.4, votes:54, img:'el.webp', desc:'Citrus & floral notes, cocok manual brew.' },
  { id:'p4', name:'Flores Bajawa 200g', region:'Nusantara', roast:'medium', price:80000, rating:4.3, votes:46, img:'el.webp', desc:'Rasa bersih, sedikit fruity.' },
  { id:'p5', name:'Brazil Santos 250g', region:'International', roast:'medium', price:100000, rating:4.2, votes:41, img:'el.webp', desc:'Halus, coklat & kacang panggang.' },
  { id:'p6', name:'Ethiopia Yirgacheffe 200g', region:'International', roast:'light', price:145000, rating:4.9, votes:122, img:'foto ethiopia yirgacheffe.jpeg', desc:'Aroma buah & bunga, acidity tinggi.' },
  { id:'p7', name:'Colombia Supremo 250g', region:'International', roast:'medium', price:110000, rating:4.5, votes:68, img:'foto colombia sumpremo.webp', desc:'Balance, nutty & caramel notes.' },
  { id:'p8', name:'Vietnam Robusta 250g', region:'International', roast:'dark', price:65000, rating:4.0, votes:30, img:'foto vietnam robusta.jpeg', desc:'Cocok untuk espresso & blends.' }
];

const SAMPLE_ARTICLES = [
  { id:'a1', title:'Panduan Pour-Over untuk Pemula', img:'panduan 1.jpeg', excerpt:'Teknik sederhana menghasilkan cangkir yang jernih dan aromatik.' },
  { id:'a2', title:'Perbedaan Arabica & Robusta', img:'artikel 2.jpeg', excerpt:'Karakter, habitat, dan penggunaan kedua varietas.' },
  { id:'a3', title:'Cara Menyimpan Kopi Agar Tetap Fresh', img:'panduan 3.jpeg', excerpt:'Tips penyimpanan biji dan bubuk supaya tidak kehilangan aroma.' }
];

const SAMPLE_REVIEWS = [
  { name:'Andi Pratama', text:'Kopi Gayo-nya luar biasa — aroma floral dan aftertaste cokelat.' },
  { name:'Sinta Dewi', text:'Packaging rapi, pelayanan cepat. Recommended!' },
  { name:'Dimas Saputra', text:'Ethiopia Yirgacheffe bikin pagi-pagi lebih hidup.' }
];

/* LocalStorage keys */
const KEY_PRODUCTS = 'knrc_products_v2';
const KEY_CART = 'knrc_cart_v2';
const KEY_WISH = 'knrc_wish_v2';
const KEY_THEME = 'knrc_theme_v2';

/* Load / init */
let PRODUCTS = JSON.parse(localStorage.getItem(KEY_PRODUCTS) || 'null') || SAMPLE_PRODUCTS.slice();
let cart = JSON.parse(localStorage.getItem(KEY_CART) || '{}'); // map id -> { ...product, qty }
let wish = JSON.parse(localStorage.getItem(KEY_WISH) || '[]');
let theme = localStorage.getItem(KEY_THEME) || 'light';

/* Elements */
const els = {
  productGrid: document.getElementById('productGrid'),
  filterRegion: document.getElementById('filterRegion'),
  filterRoast: document.getElementById('filterRoast'),
  sortBy: document.getElementById('sortBy'),
  gridBtn: document.getElementById('gridBtn'),
  listBtn: document.getElementById('listBtn'),
  wishBtn: document.getElementById('wishBtn'),
  wishCount: document.getElementById('wishCount'),
  cartBtn: document.getElementById('cartBtn'),
  cartCount: document.getElementById('cartCount'),
  cartPanel: document.getElementById('cartPanel'),
  cartItems: document.getElementById('cartItems'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  closeCart: document.getElementById('closeCart'),
  clearCart: document.getElementById('clearCart'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  themeToggle: document.getElementById('themeToggle'),
  searchBtn: document.getElementById('searchBtn'),
  searchBar: document.getElementById('searchBar'),
  searchInput: document.getElementById('searchInput'),
  searchClose: document.getElementById('searchClose'),
  articleGrid: document.getElementById('articleGrid'),
  reviewContainer: document.querySelector('.testimoni-slider'),
  salesChart: document.getElementById('salesChart'),
  yearSpan: document.getElementById('year'),
  newsletterForm: document.getElementById('newsletterForm'),
  contactForm: document.getElementById('contactForm'),
  toast: document.getElementById('toast'),
  productModal: document.getElementById('productModal'),
  modalImage: document.getElementById('modalImage'),
  modalTitle: document.getElementById('modalTitle'),
  modalOrigin: document.getElementById('modalOrigin'),
  modalRating: document.getElementById('modalRating'),
  modalDesc: document.getElementById('modalDesc'),
  modalPrice: document.getElementById('modalPrice'),
  modalQty: document.getElementById('modalQty'),
  modalAdd: document.getElementById('modalAdd'),
  modalFav: document.getElementById('modalFav'),
  modalClose: document.getElementById('modalClose')
};

/* Init UI */
document.addEventListener('DOMContentLoaded', () => {
  els.yearSpan && (els.yearSpan.textContent = new Date().getFullYear());
  applyTheme();
  bindUI();
  renderProducts(PRODUCTS);
  renderArticles();
  renderReviews();
  updateWishUI();
  updateCartUI();
  drawSalesChart();
  runEntryAnimations();
});

/* Bind UI */
function bindUI(){
  els.filterRegion.addEventListener('change', applyFilters);
  els.filterRoast.addEventListener('change', applyFilters);
  els.sortBy.addEventListener('change', applyFilters);
  els.gridBtn.addEventListener('click', ()=> setGridList('grid'));
  els.listBtn.addEventListener('click', ()=> setGridList('list'));
  document.getElementById('cartBtn').addEventListener('click', ()=> toggleCart(true));
  els.closeCart.addEventListener('click', ()=> toggleCart(false));
  els.clearCart.addEventListener('click', clearCart);
  els.checkoutBtn.addEventListener('click', ()=> alert('Checkout simulasi — tidak ada pembayaran'));
  els.themeToggle.addEventListener('click', toggleTheme);
  els.searchBtn.addEventListener('click', ()=> els.searchBar.classList.toggle('hidden'));
  els.searchClose.addEventListener('click', ()=> els.searchBar.classList.add('hidden'));
  els.searchInput && els.searchInput.addEventListener('input', debounce(onSearch, 300));
  els.newsletterForm && els.newsletterForm.addEventListener('submit', onNewsletter);
  els.contactForm && els.contactForm.addEventListener('submit', onContact);
  els.modalClose.addEventListener('click', ()=> closeModal());
}

/* Render products */
function renderProducts(list){
  const grid = els.productGrid;
  grid.innerHTML = '';
  if (!list.length) { grid.innerHTML = '<p class="muted">Tidak ada produk sesuai filter.</p>'; return; }
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="thumb"><img src="${p.img}" alt="${escape(p.name)}"></div>
      <div>
        <h3 class="p-title">${escape(p.name)}</h3>
        <div class="p-meta"><div class="muted">${p.origin || p.region}</div><div class="badge">${p.region}</div></div>
        <div class="p-meta" style="margin-top:.6rem">
          <div class="price">${rupiah(p.price)}</div>
          <div class="rating" title="${p.rating}">${renderStars(p.rating)} <small class="muted">(${p.votes})</small></div>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:.6rem">
          <button class="btn" onclick="openModalById('${p.id}')">Detail</button>
          <button class="btn primary" onclick="addToCartById('${p.id}',1,true)">Tambah</button>
          <button class="btn" onclick="toggleWish('${p.id}')">${wish.includes(p.id)?'♥ Favorit':'♡ Favorit'}</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* Articles & Reviews */
function renderArticles(){
  const g = els.articleGrid;
  if (!g) return;
  g.innerHTML = '';
  SAMPLE_ARTICLES.forEach(a=>{
    const el = document.createElement('article');
    el.className = 'article';
    el.innerHTML = `<img src="${a.img}" alt="${escape(a.title)}"><h4>${escape(a.title)}</h4><p class="muted">${escape(a.excerpt)}</p><button class="btn ghost" onclick="alert('Baca artikel (simulasi)')">Baca</button>`;
    g.appendChild(el);
  });
}
function renderReviews(){
  const container = document.querySelector('.testimoni-slider');
  if (!container) return;
  container.innerHTML = '';
  SAMPLE_REVIEWS.forEach(r=>{
    const s = document.createElement('div');
    s.className = 'slide';
    s.innerHTML = `<p>“${escape(r.text)}”</p><h4 style="margin-top:.6rem">${escape(r.name)}</h4>`;
    container.appendChild(s);
  });
  // start slider
  let slides = container.querySelectorAll('.slide');
  if (slides.length === 0) return;
  let idx = 0;
  slides[idx].classList.add('active');
  setInterval(()=>{
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, 4200);
}

/* Filters & sort */
function applyFilters(){
  const r = els.filterRegion.value;
  const roast = els.filterRoast.value;
  const sort = els.sortBy.value;
  let list = PRODUCTS.filter(p=>{
    if (r !== 'all' && p.region !== r) return false;
    if (roast !== 'all' && p.roast !== roast) return false;
    return true;
  });
  if (sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  else if (sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  else if (sort === 'rating') list.sort((a,b)=>b.rating - a.rating);
  renderProducts(list);
}

/* Grid/list view */
function setGridList(mode='grid'){
  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  if (mode === 'list') grid.style.gridTemplateColumns = '1fr';
  else grid.style.gridTemplateColumns = '';
  document.getElementById('gridBtn').classList.toggle('active', mode==='grid');
  document.getElementById('listBtn').classList.toggle('active', mode==='list');
}

/* Modal */
let currentProduct = null;
function openModalById(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if (!p) return;
  currentProduct = p;
  els.productModal.setAttribute('aria-hidden','false');
  els.modalImage.src = p.img;
  els.modalTitle.textContent = p.name;
  els.modalOrigin.textContent = `${p.region} • ${p.roast}`;
  els.modalRating.innerHTML = renderStars(p.rating) + ` <small class="muted">(${p.votes})</small>`;
  els.modalDesc.textContent = p.desc || '';
  els.modalPrice.textContent = rupiah(p.price);
  els.modalQty.value = 1;
  els.modalFav.textContent = wish.includes(p.id)?'♥ Favorit':'♡ Favorit';
  els.modalAdd.onclick = ()=> { addToCartById(p.id, Number(els.modalQty.value||1), true); closeModal(); };
  els.modalFav.onclick = ()=> { toggleWish(p.id); els.modalFav.textContent = wish.includes(p.id)?'♥ Favorit':'♡ Favorit'; };
}
function closeModal(){ els.productModal.setAttribute('aria-hidden','true'); }

/* Wishlist */
function toggleWish(id){
  const idx = wish.indexOf(id);
  if (idx >= 0) wish.splice(idx,1);
  else wish.push(id);
  localStorage.setItem(KEY_WISH, JSON.stringify(wish));
  updateWishUI();
  renderProducts(PRODUCTS);
  showToast(wish.includes(id) ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit');
}
function updateWishUI(){ els.wishCount.textContent = wish.length; }

/* Cart */
function addToCartById(id, qty=1, animate=false){
  const p = PRODUCTS.find(x=>x.id===id);
  if (!p) return;
  if (!cart[id]) cart[id] = {...p, qty:0};
  cart[id].qty += qty;
  if (cart[id].qty <= 0) delete cart[id];
  localStorage.setItem(KEY_CART, JSON.stringify(cart));
  updateCartUI();
  showToast(`${p.name} ditambahkan ke keranjang`);
  if (animate) flyToCart(id);
}
function removeFromCart(id){ delete cart[id]; localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartUI(); }
function changeQty(id, delta){ if (!cart[id]) return; cart[id].qty += delta; if (cart[id].qty<=0) delete cart[id]; localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartUI(); }
function getCartSummary(){ const items = Object.values(cart); const subtotal = items.reduce((s,i)=>s + i.price * i.qty, 0); const discount = subtotal >= 250000 ? Math.round(subtotal * 0.1) : 0; const total = subtotal - discount; return { items, subtotal, discount, total }; }
function updateCartUI(){
  const { items, subtotal, discount, total } = getCartSummary();
  els.cartCount.textContent = items.reduce((s,i)=>s+i.qty,0);
  els.cartSubtotal.textContent = rupiah(total);
  const c = els.cartItems; c.innerHTML = '';
  if (!items.length) { c.innerHTML = '<p class="muted">Keranjang kosong.</p>'; return; }
  items.forEach(it=>{
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `<img src="${it.img}" alt="${escape(it.name)}" style="width:64px;height:64px;object-fit:cover;border-radius:8px">
      <div style="flex:1"><div style="font-weight:700">${escape(it.name)}</div>
      <div class="muted">${rupiah(it.price)} x ${it.qty} = <strong>${rupiah(it.price*it.qty)}</strong></div>
      <div style="margin-top:.4rem;display:flex;gap:.4rem">
        <button class="btn small" onclick="changeQty('${it.id}', -1)">−</button>
        <input class="qty-input" type="number" min="1" value="${it.qty}" onchange="(function(e){ const v=parseInt(e.target.value||1); cart['${it.id}'].qty=v; localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartUI(); })(event)">
        <button class="btn small" onclick="changeQty('${it.id}', 1)">+</button>
        <button class="btn ghost" onclick="removeFromCart('${it.id}')">Hapus</button>
      </div></div>`;
    c.appendChild(el);
  });
}
function toggleCart(open){
  els.cartPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
}
function clearCart(){ if (confirm('Kosongkan keranjang?')) { cart = {}; localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartUI(); } }

/* Toast */
function showToast(msg, t=1400){ const el=els.toast; el.textContent=msg; el.classList.add('show'); el.setAttribute('aria-hidden','false'); setTimeout(()=>{ el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }, t); }

/* Theme */
function applyTheme(){ document.getElementById('app').classList.toggle('theme-dark', theme==='dark'); localStorage.setItem(KEY_THEME, theme); }
function toggleTheme(){ theme = (theme==='dark')?'light':'dark'; applyTheme(); showToast(theme==='dark'?'Dark mode':'Light mode'); }

/* Search */
function onSearch(e){ const q = (e.target.value || '').trim().toLowerCase(); if(!q){ renderProducts(PRODUCTS); return; } const res = PRODUCTS.filter(p => (p.name+' '+p.region+' '+p.desc).toLowerCase().includes(q)); renderProducts(res); }

/* Chart (sales) */
function drawSalesChart(){
  const ctx = document.getElementById('salesChart').getContext('2d');
  const data = { labels:['2019','2020','2021','2022','2023','2024'], datasets:[{label:'Kg terjual (simulasi)', data:[1200,1500,1800,2200,2600,3100], backgroundColor:['#ff7b2d','#d4a373','#6b4cff','#ffb36b','#ff7b2d','#6b4cff'] }]};
  new Chart(ctx, { type:'bar', data, options:{responsive:true,plugins:{legend:{display:false}} } });
}

/* Utils */
function escape(s){ return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function rupiah(n){ return 'Rp' + Number(n).toLocaleString('id-ID'); }
function renderStars(r){ const full=Math.floor(r), half=r-full>=0.5; let s=''; for(let i=0;i<full;i++) s+='★'; if(half) s+='☆'; for(let i=full+(half?1:0); i<5;i++) s+='<span style="opacity:.25">★</span>'; return s; }
function debounce(fn,t=200){ let id; return (...a)=>{ clearTimeout(id); id=setTimeout(()=>fn(...a), t); }; }

/* fly-to-cart animation */
function flyToCart(id){
  const prod = PRODUCTS.find(p=>p.id===id); if(!prod) return;
  const thumb = document.querySelector(`article[data-id="${id}"] .thumb img`);
  if(!thumb) return;
  const rect = thumb.getBoundingClientRect(); const cartRect = document.getElementById('cartBtn').getBoundingClientRect();
  const clone = thumb.cloneNode(); clone.style.position='fixed'; clone.style.left=rect.left+'px'; clone.style.top=rect.top+'px';
  clone.style.width=rect.width+'px'; clone.style.height=rect.height+'px'; clone.style.borderRadius='8px'; clone.style.zIndex=9999; document.body.appendChild(clone);
  const dx = cartRect.left - rect.left, dy = cartRect.top - rect.top;
  clone.animate([{transform:'translate(0,0) scale(1)', opacity:1},{transform:`translate(${dx}px,${dy}px) scale(.2)`, opacity:0}], {duration:700, easing:'cubic-bezier(.4,0,.2,1)'});
  setTimeout(()=> clone.remove(), 800);
}

/* Small helpers */
function openModalByProduct(p){ if(!p) return; openModalById(p.id); }
function openModalById(id){ openModalById(id); } // alias for inline usage

/* Search for product by id (used in hero spotlight) */
function addToCartById(id,qty=1,animate=true){ addToCartById(id,qty,animate); } // placeholder to satisfy inline; real function defined earlier

/* Note: fix aliasing by exposing functions on window */
window.addToCartById = addToCartById;
window.openModalById = function(id){ const p = PRODUCTS.find(x=>x.id===id); if (p) { currentProduct = p; els.productModal.setAttribute('aria-hidden','false'); els.modalImage.src = p.img; els.modalTitle.textContent = p.name; els.modalOrigin.textContent = `${p.region} • ${p.roast}`; els.modalRating.innerHTML = renderStars(p.rating) + ` <small class="muted">(${p.votes})</small>`; els.modalDesc.textContent = p.desc || ''; els.modalPrice.textContent = rupiah(p.price); els.modalQty.value = 1; els.modalFav.textContent = wish.includes(p.id)?'♥ Favorit':'♡ Favorit'; els.modalAdd.onclick = ()=> { if(!cart[p.id]) cart[p.id] = {...p, qty:0}; cart[p.id].qty += Number(els.modalQty.value||1); localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartUI(); showToast(p.name+' ditambahkan'); closeModal(); }; els.modalFav.onclick = ()=> { toggleWish(p.id); els.modalFav.textContent = wish.includes(p.id)?'♥ Favorit':'♡ Favorit'; }; } };

/* Fix earlier function references for addToCartById and openModalById by reassigning properly */
window.addToCartById = (id, qty=1, animate=true) => {
  const p = PRODUCTS.find(x=>x.id===id);
  if (!p) return;
  if (!cart[id]) cart[id] = {...p, qty:0};
  cart[id].qty += qty;
  if (cart[id].qty <= 0) delete cart[id];
  localStorage.setItem(KEY_CART, JSON.stringify(cart));
  updateCartUI();
  showToast(`${p.name} ditambahkan ke keranjang`);
  if (animate) flyToCart(id);
};

/* Apply saved theme & storage defaults */
(function init(){
  if (!localStorage.getItem(KEY_PRODUCTS)) localStorage.setItem(KEY_PRODUCTS, JSON.stringify(PRODUCTS));
  if (!localStorage.getItem(KEY_WISH)) localStorage.setItem(KEY_WISH, JSON.stringify(wish));
  if (!localStorage.getItem(KEY_CART)) localStorage.setItem(KEY_CART, JSON.stringify(cart));
  if (!localStorage.getItem(KEY_THEME)) localStorage.setItem(KEY_THEME, theme);
})();

/* Simple search handler alias defined properly */
function onSearchHandler(e){ onSearch(e); }

/* Simple entry animation for elements with .animate-in */
function runEntryAnimations(){
  document.querySelectorAll('.animate-in').forEach((el, i)=>{
    setTimeout(()=> el.classList.add('visible'), 120 * (i+1));
  });
}

/* Simple newsletter/contact handlers */
function onNewsletter(e){
  e.preventDefault();
  const email = document.getElementById('newsletterEmail').value.trim();
  if (!email) { alert('Masukkan email'); return; }
  showToast('Terima kasih! Newsletter (simulasi) terdaftar.');
  document.getElementById('newsletterEmail').value = '';
}
function onContact(e){
  e.preventDefault();
  showToast('Pesan terkirim (simulasi). Terima kasih!');
  document.getElementById('contactName').value=''; document.getElementById('contactEmail').value=''; document.getElementById('contactMessage').value='';
}

/* update UI functions and exposure */
function updateWishUI(){ document.getElementById('wishCount').textContent = wish.length; }
function updateCartUI(){ const { items, subtotal } = (()=>{ const items=Object.values(cart); const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0); return {items,subtotal}; })(); document.getElementById('cartCount').textContent = Object.values(cart).reduce((s,i)=>s+i.qty,0); document.getElementById('cartSubtotal').textContent = rupiah(subtotal); const c = els.cartItems; c.innerHTML = ''; const itemsArr = Object.values(cart); if (!itemsArr.length) { c.innerHTML = '<p class="muted">Keranjang kosong.</p>'; return; } itemsArr.forEach(it=>{ const div=document.createElement('div'); div.className='cart-item'; div.innerHTML = `<img src="${it.img}" alt="${escape(it.name)}" style="width:64px;height:64px;object-fit:cover;border-radius:8px"><div style="flex:1"><div style="font-weight:700">${escape(it.name)}</div><div class="muted">${rupiah(it.price)} x ${it.qty} = <strong>${rupiah(it.price*it.qty)}</strong></div><div style="margin-top:.4rem;display:flex;gap:.4rem"><button class="btn small" onclick="changeQty('${it.id}',-1)">−</button><input class="qty-input" type="number" min="1" value="${it.qty}" onchange="(function(e){ const v=parseInt(e.target.value||1); cart['${it.id}'].qty=v; localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartUI(); })(event)"><button class="btn small" onclick="changeQty('${it.id}',1)">+</button><button class="btn ghost" onclick="removeFromCart('${it.id}')">Hapus</button></div></div>`; c.appendChild(div); }); }

/* expose few helpers */
window.toggleCart = toggleCart;
window.openModalById = window.openModalById;
window.toggleWish = toggleWish;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;

/* Chart draw call */
function drawSalesChart(){ const ctx = document.getElementById('salesChart').getContext('2d'); new Chart(ctx, {type:'bar', data:{ labels:['Jan','Feb','Mar','Apr','Mei','Jun'], datasets:[{label:'Kg terjual (simulasi)', data:[120,180,140,200,160,220], backgroundColor:['#ff7b2d','#d4a373','#6b4cff','#ffb36b','#ff9d2f','#6b4cff'] }] }, options:{responsive:true, plugins:{legend:{display:false}} }}); }
drawSalesChart();

/* Simple helper to scroll to section */
function scrollToSection(selector){ const el=document.querySelector(selector); if(!el) return; const top=el.getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({top, behavior:'smooth'}); }

/* debounce helper used */
function debounce(fn,t=200){ let id; return (...a)=>{ clearTimeout(id); id=setTimeout(()=>fn(...a), t); }; }
