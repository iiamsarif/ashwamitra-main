# ASWAMITHRA Backend

## Quick Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` — update these values:**
   ```
   MONGODB_URI=mongodb://localhost:27017/aswamithra
   JWT_SECRET=your_random_secret_key_here
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   ```

   For **MongoDB Atlas** (cloud), use:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/aswamithra
   ```

4. **Create uploads folder:**
   ```bash
   mkdir -p uploads/products
   ```

5. **Start the server:**
   ```bash
   npm run dev    # development (auto-restart)
   npm start      # production
   ```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (farmer/b2b/customer/admin) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user + profile |
| PUT | `/api/auth/change-password` | Change password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all (filters: category, state, district, village, search, minPrice, maxPrice) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (farmer only) |
| PUT | `/api/products/:id` | Update product (farmer only) |
| DELETE | `/api/products/:id` | Delete product (farmer only) |
| GET | `/api/products/farmer/my-products` | Farmer's own products |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (b2b/customer) |
| GET | `/api/orders/my-orders` | My orders |
| GET | `/api/orders/:id` | Order details |
| PUT | `/api/orders/:id/status` | Update status |
| PUT | `/api/orders/:id/cancel` | Cancel order |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| GET | `/api/payments/my-payments` | My payments |
| GET | `/api/payments/:id` | Payment details |
| PUT | `/api/payments/:id/settle` | Settle payment (admin) |

### Farmer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farmers/profile` | Farmer profile |
| PUT | `/api/farmers/profile` | Update profile |
| GET | `/api/farmers/dashboard` | Dashboard stats |
| GET | `/api/farmers/orders` | Farmer's orders |
| GET | `/api/farmers/payments` | Farmer's payments |

### B2B Business
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses/profile` | Business profile |
| PUT | `/api/businesses/profile` | Update profile |
| GET | `/api/businesses/dashboard` | Dashboard stats |
| GET | `/api/businesses/orders` | Business orders |
| GET | `/api/businesses/payments` | Business payments |

### Customer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers/profile` | Customer profile |
| PUT | `/api/customers/profile` | Update profile |
| GET | `/api/customers/dashboard` | Dashboard stats (includes savings message) |
| GET | `/api/customers/orders` | Customer orders |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform-wide stats |
| GET | `/api/admin/users` | All users (filters: role, status, search) |
| GET | `/api/admin/farmers` | All farmers with profiles |
| GET | `/api/admin/businesses` | All businesses |
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/payments` | All payments |
| PUT | `/api/admin/farmers/:id/approve` | Approve/reject farmer |
| PUT | `/api/admin/businesses/:id/verify` | Verify/reject business |
| PUT | `/api/admin/users/:id/status` | Suspend/activate user |
| GET | `/api/admin/export?type=users` | Export data (users/orders/payments/farmers/businesses) |

### Delivery
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/delivery/orders/:id/delivery` | Update delivery info |
| GET | `/api/delivery/in-transit` | Orders in transit |
| GET | `/api/delivery/track/:orderId` | Track order with timeline |

---

## Connecting Frontend

In your frontend, set the API base URL:

```typescript
// src/config.ts
export const API_BASE_URL = "http://localhost:5000/api";
```

Example API call:
```typescript
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, role }),
});
const data = await response.json();
// Store data.token in localStorage
```

For authenticated requests:
```typescript
const token = localStorage.getItem("token");
const response = await fetch(`${API_BASE_URL}/farmers/dashboard`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

## Folder Structure
```
backend/
├── server.js              # Entry point
├── package.json
├── .env.example           # Config template
├── middleware/
│   └── auth.js            # JWT auth + role middleware
├── models/
│   ├── User.js            # All users (farmer/b2b/customer/admin)
│   ├── Farmer.js          # Farmer profile + location + bank
│   ├── Business.js        # B2B business profile + GSTIN
│   ├── Customer.js        # Customer profile + savings
│   ├── Product.js         # Farm products
│   ├── Order.js           # Orders with items
│   ├── Payment.js         # UPI/bank payments
│   └── Notification.js    # Real-time notifications
└── routes/
    ├── auth.js            # Register/login/me
    ├── farmers.js         # Farmer dashboard/orders/payments
    ├── businesses.js      # B2B dashboard/orders/payments
    ├── customers.js       # Customer dashboard/orders
    ├── products.js        # CRUD + search + filters
    ├── orders.js          # Create/track/cancel
    ├── payments.js        # Create/settle payments
    ├── admin.js           # Admin panel (approve/export/manage)
    └── delivery.js        # Tracking + delivery management
```
