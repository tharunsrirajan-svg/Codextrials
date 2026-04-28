/**
 * Customization area:
 * 1) Update WhatsApp number in CONFIG.whatsappNumber.
 * 2) Update or add products in PRODUCTS list.
 * 3) Add Razorpay key in CONFIG.razorpayKeyId to accept live online payment.
 */
const CONFIG = {
  companyName: 'Ayyanar Vilas Kadalai Mittai & Sarbath Company',
  whatsappNumber: '919999999999',
  deliveryCharge: 40,
  freeDeliveryAbove: 700,
  razorpayKeyId: ''
};

const PRODUCTS = [
  {
    id: 1,
    name: 'Kadalai Mittai Classic',
    price: 120,
    unit: '250 g pack',
    image:
      'https://images.unsplash.com/photo-1612197528122-16d15b79f00f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'Kadalai Mittai Family Box',
    price: 220,
    unit: '500 g box',
    image:
      'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'Nannari Sarbath Syrup',
    price: 180,
    unit: '750 ml bottle',
    image:
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    name: 'Rose Sarbath',
    price: 150,
    unit: '750 ml bottle',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    name: 'Lemon Sarbath Concentrate',
    price: 140,
    unit: '750 ml bottle',
    image:
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=600&q=80'
  }
];

const state = {
  products: PRODUCTS,
  cart: JSON.parse(localStorage.getItem('av_cart') || '{}')
};

const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const deliveryEl = document.getElementById('delivery');
const grandTotalEl = document.getElementById('grandTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const checkoutForm = document.getElementById('checkoutForm');
const paymentMethodSelect = document.getElementById('paymentMethod');

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('productCount').textContent = PRODUCTS.length;

document.getElementById('whatsappButton').href = `https://wa.me/${CONFIG.whatsappNumber}`;
document.getElementById('shopNowBtn').addEventListener('click', () => {
  document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  state.products = PRODUCTS.filter((product) => product.name.toLowerCase().includes(query));
  renderProducts();
});

checkoutBtn.addEventListener('click', () => {
  if (Object.keys(state.cart).length === 0) {
    alert('Your cart is empty. Please add products first.');
    return;
  }
  checkoutModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => checkoutModal.classList.add('hidden'));
checkoutModal.addEventListener('click', (event) => {
  if (event.target === checkoutModal) checkoutModal.classList.add('hidden');
});

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(checkoutForm);
  const order = {
    customerName: formData.get('customerName'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    paymentMethod: formData.get('paymentMethod'),
    items: getCartDetailedItems(),
    totals: calculateTotals(),
    orderDate: new Date().toISOString()
  };

  processPayment(order);
});

function renderProducts() {
  productGrid.innerHTML = state.products
    .map(
      (product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <h4>${product.name}</h4>
        <p>${product.unit}</p>
        <p class="price">₹${product.price}</p>
        <button class="btn" data-id="${product.id}">Add to Cart</button>
      </article>
    `
    )
    .join('');

  productGrid.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)));
  });
}

function addToCart(productId) {
  state.cart[productId] = (state.cart[productId] || 0) + 1;
  persistCart();
  renderCart();
}

function updateQty(productId, delta) {
  state.cart[productId] = (state.cart[productId] || 0) + delta;
  if (state.cart[productId] <= 0) delete state.cart[productId];
  persistCart();
  renderCart();
}

function getCartDetailedItems() {
  return Object.entries(state.cart).map(([id, qty]) => {
    const product = PRODUCTS.find((item) => item.id === Number(id));
    return {
      id: product.id,
      name: product.name,
      unit: product.unit,
      quantity: qty,
      price: product.price,
      total: product.price * qty
    };
  });
}

function calculateTotals() {
  const subtotal = getCartDetailedItems().reduce((sum, item) => sum + item.total, 0);
  const delivery = subtotal === 0 || subtotal >= CONFIG.freeDeliveryAbove ? 0 : CONFIG.deliveryCharge;
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

function renderCart() {
  const items = getCartDetailedItems();

  if (items.length === 0) {
    cartItems.innerHTML = '<p>No products added yet.</p>';
  } else {
    cartItems.innerHTML = items
      .map(
        (item) => `
        <div class="cart-row">
          <div>
            <strong>${item.name}</strong>
            <small>${item.quantity} × ₹${item.price}</small>
          </div>
          <div class="cart-controls">
            <button data-action="minus" data-id="${item.id}">−</button>
            <button data-action="plus" data-id="${item.id}">+</button>
          </div>
        </div>
      `
      )
      .join('');

    cartItems.querySelectorAll('button[data-action]').forEach((btn) => {
      const id = Number(btn.dataset.id);
      const delta = btn.dataset.action === 'plus' ? 1 : -1;
      btn.addEventListener('click', () => updateQty(id, delta));
    });
  }

  const totals = calculateTotals();
  subtotalEl.textContent = `₹${totals.subtotal}`;
  deliveryEl.textContent = `₹${totals.delivery}`;
  grandTotalEl.textContent = `₹${totals.total}`;
}

function processPayment(order) {
  if (order.paymentMethod === 'razorpay') {
    if (!CONFIG.razorpayKeyId) {
      alert('Add your Razorpay key in script.js to enable this payment mode.');
      return;
    }

    const options = {
      key: CONFIG.razorpayKeyId,
      amount: order.totals.total * 100,
      currency: 'INR',
      name: CONFIG.companyName,
      description: 'Product Purchase',
      prefill: {
        name: order.customerName,
        contact: order.phone
      },
      handler: () => finalizeOrder(order)
    };

    const rzp = new Razorpay(options);
    rzp.open();
    return;
  }

  if (order.paymentMethod === 'upi') {
    const upiId = 'merchant@upi';
    const url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(CONFIG.companyName)}&am=${order.totals.total}&cu=INR`;
    window.location.href = url;
  }

  finalizeOrder(order);
}

function finalizeOrder(order) {
  const whatsappMessage = buildOrderMessage(order);
  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  window.open(waUrl, '_blank');

  downloadOrderReceipt(order);

  state.cart = {};
  persistCart();
  renderCart();
  checkoutForm.reset();
  checkoutModal.classList.add('hidden');

  alert('Order placed successfully! Order details opened in WhatsApp.');
}

function buildOrderMessage(order) {
  const lines = [
    `Hello ${CONFIG.companyName},`,
    'I would like to place an order:',
    ...order.items.map(
      (item) => `- ${item.name} (${item.unit}) x ${item.quantity} = ₹${item.total}`
    ),
    `Subtotal: ₹${order.totals.subtotal}`,
    `Delivery: ₹${order.totals.delivery}`,
    `Total: ₹${order.totals.total}`,
    `Payment: ${order.paymentMethod.toUpperCase()}`,
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}`
  ];
  return lines.join('\n');
}

function downloadOrderReceipt(order) {
  const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `order-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function persistCart() {
  localStorage.setItem('av_cart', JSON.stringify(state.cart));
}

renderProducts();
renderCart();
