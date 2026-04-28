# Ayyanar Vilas Kadalai Mittai & Sarbath Company Website

A fully editable business website built with your own source code using plain **HTML + CSS + JavaScript**.

## Features
- Product listing with editable prices
- Product search
- Shopping cart with quantity controls
- Checkout with customer details
- Payment mode options:
  - Cash on Delivery
  - UPI intent
  - Razorpay integration (add your own key)
- One-click WhatsApp Business order message
- Downloadable order receipt (`.json`)
- Mobile responsive layout

## How to Run
Just open `index.html` in your browser.

For local development server:

```bash
python3 -m http.server 5500
```

Then open: `http://localhost:5500`

## Customization (Important)
Open `script.js` and edit:
- `CONFIG.whatsappNumber` → your WhatsApp Business number (with country code)
- `CONFIG.razorpayKeyId` → your Razorpay key to enable card/UPI/netbanking payment
- `PRODUCTS` array → add/edit/remove products, units, prices, and images
- `CONFIG.deliveryCharge` and `CONFIG.freeDeliveryAbove`

## Notes
- For real Razorpay verification/webhooks you typically add a backend server.
- This starter is fully owned by you and easy to change anytime.
