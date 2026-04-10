/**
 * FerroTec — Carrito de Compras Flotante
 * Instrucciones:
 * 1. Copia este archivo (ferrotec-carrito.js) a tu proyecto
 * 2. Agrega en tu HTML, justo antes de </body>:
 *      <link rel="stylesheet" href="ferrotec-carrito.css">
 *      <script src="ferrotec-carrito.js"></script>
 * 3. En tus tarjetas de producto, agrega este atributo al botón "Ver más" o crea un botón nuevo:
 *      <button onclick="FerroCart.add('Nombre del producto', 99.95)">Agregar al carrito</button>
 */

const FerroCart = (() => {
  let cart = JSON.parse(localStorage.getItem('ferrotec_cart') || '[]');

  function save() {
    localStorage.setItem('ferrotec_cart', JSON.stringify(cart));
  }

  function totalItems() {
    return cart.reduce((s, i) => s + i.qty, 0);
  }

  function totalPrice() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function updateBadge() {
    const badge = document.getElementById('ft-badge');
    const n = totalItems();
    badge.textContent = n;
    badge.style.display = n > 0 ? 'flex' : 'none';
  }

  function renderItems() {
    const list = document.getElementById('ft-list');
    if (cart.length === 0) {
      list.innerHTML = '<p class="ft-empty">Tu carrito está vacío</p>';
      return;
    }
    list.innerHTML = cart.map((item, idx) => `
      <div class="ft-item">
        <div class="ft-item-info">
          <span class="ft-item-name">${item.name}</span>
          <span class="ft-item-price">Q${(item.price * item.qty).toFixed(2)}</span>
        </div>
        <div class="ft-qty">
          <button onclick="FerroCart.changeQty(${idx}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="FerroCart.changeQty(${idx}, 1)">+</button>
          <button class="ft-remove" onclick="FerroCart.remove(${idx})">✕</button>
        </div>
      </div>
    `).join('');
  }

  function renderTotal() {
    document.getElementById('ft-total').textContent = 'Q' + totalPrice().toFixed(2);
  }

  function refresh() {
    updateBadge();
    renderItems();
    renderTotal();
  }

  function add(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price: parseFloat(price), qty: 1 });
    }
    save();
    refresh();
    // Mostrar el panel brevemente
    document.getElementById('ft-panel').classList.add('ft-open');
    // Animación del botón flotante
    const fab = document.getElementById('ft-fab');
    fab.classList.add('ft-bounce');
    setTimeout(() => fab.classList.remove('ft-bounce'), 400);
  }

  function remove(idx) {
    cart.splice(idx, 1);
    save();
    refresh();
  }

  function changeQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    save();
    refresh();
  }

  function clear() {
    cart = [];
    save();
    refresh();
  }

  function togglePanel() {
    const panel = document.getElementById('ft-panel');
    panel.classList.toggle('ft-open');
  }

  function checkout() {
    if (cart.length === 0) return;
    const lines = cart.map(i => `• ${i.qty}x ${i.name} — Q${(i.price * i.qty).toFixed(2)}`).join('\n');
    const total = totalPrice().toFixed(2);
    const msg = `Hola FerroTec, quiero realizar el siguiente pedido:\n\n${lines}\n\nTotal: Q${total}`;
    const wa = `https://wa.me/50250015001?text=${encodeURIComponent(msg)}`;
    window.open(wa, '_blank');
  }

  function init() {
    // Inyectar estilos
    if (!document.getElementById('ft-styles')) {
      const link = document.createElement('link');
      link.id = 'ft-styles';
      link.rel = 'stylesheet';
      link.href = 'ferrotec-carrito.css';
      document.head.appendChild(link);
    }

    // Inyectar HTML del carrito
    const html = `
      <button id="ft-fab" onclick="FerroCart.togglePanel()" aria-label="Carrito de compras">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span id="ft-badge">0</span>
      </button>

      <div id="ft-overlay" onclick="FerroCart.togglePanel()"></div>

      <div id="ft-panel">
        <div class="ft-panel-header">
          <h2>Tu carrito</h2>
          <button onclick="FerroCart.togglePanel()" class="ft-close">✕</button>
        </div>
        <div id="ft-list"></div>
        <div class="ft-panel-footer">
          <div class="ft-total-row">
            <span>Total</span>
            <strong id="ft-total">Q0.00</strong>
          </div>
          <button class="ft-checkout-btn" onclick="FerroCart.checkout()">
            Enviar pedido por WhatsApp
          </button>
          <button class="ft-clear-btn" onclick="FerroCart.clear()">Vaciar carrito</button>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.id = 'ft-root';
    container.innerHTML = html;
    document.body.appendChild(container);

    // Cerrar panel al hacer click fuera
    document.getElementById('ft-overlay').addEventListener('click', () => {
      document.getElementById('ft-panel').classList.remove('ft-open');
      document.getElementById('ft-overlay').classList.remove('ft-open');
    });

    // Sincronizar overlay
    const panel = document.getElementById('ft-panel');
    const observer = new MutationObserver(() => {
      const overlay = document.getElementById('ft-overlay');
      if (panel.classList.contains('ft-open')) {
        overlay.classList.add('ft-open');
      } else {
        overlay.classList.remove('ft-open');
      }
    });
    observer.observe(panel, { attributes: true });

    refresh();
  }

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { add, remove, changeQty, clear, togglePanel, checkout };
})();