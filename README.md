# FixMate — Repair Service Marketplace API (Server)

![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-REST%20API-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-fixmatedb-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Role%20Auth-D63AFF?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout%20%26%20Webhook-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

The RESTful backend server powering **FixMate**, a smart device and home appliance repair service platform. It handles MongoDB persistence, JWT-based role authorization, server-side search/filter/sort, strict repair job state transitions, and idempotent Stripe Checkout & Webhook payment processing.

---

## Live Links & Repositories

| Resource | Link |
| :--- | :--- |
| **Live Server API** | [https://fullstack-final-project-device-repa.vercel.app](https://fullstack-final-project-device-repa.vercel.app) |
| **Live Client App** | [https://fullstack-final-project-device-repa-ebon.vercel.app](https://fullstack-final-project-device-repa-ebon.vercel.app) |
| **Server Repository** | [https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-backend-server](https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-backend-server) |
| **Client Repository** | [https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-frontend-client](https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-frontend-client) |

---

## Admin & Test Credentials (Live Environment)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `kabul@kabul.com` | `_LIMON20102003l_` |
| **Technician** | `tariq.tech@fixmate.com` | `_LIMON20102003l_` |
| **Customer** | `maksudulhasanlimon@gmail.com` | `_LIMON20102003l_` |

---

## Key Backend Features

- **Custom JWT & Role-Based Middlewares:** Every protected endpoint is guarded by `verifyToken` alongside role-specific middlewares (`verifyCustomer`, `verifyTechnician`, `verifyAdmin`). Missing/invalid tokens return `401 Unauthorized`; mismatched roles return `403 Forbidden`.
- **Ownership Enforcement:** Customers can only read, cancel, or pay for their own bookings; technicians can only edit/delete their own services and update status on jobs assigned to them.
- **Server-Side Search, Filter & Sort:** MongoDB query pipelines handle search (`title` / `category`), filtering (`category`, `serviceMode`), and sorting (`price_asc`, `price_desc`, `newest`) directly at the database layer.
- **Strict Job Status Pipeline:** Enforces linear, server-validated job transitions:
  - `requested` → `accepted` or `rejected` (Technician owner only)
  - `requested` → `cancelled` (Customer owner only)
  - `accepted` → `in-progress` (Technician owner only)
  - `in-progress` → `completed` (Technician owner only; requires positive `finalAmount > 0`)
  - Any invalid transition (e.g., `requested` → `completed`, or mutating a `cancelled`/`rejected` booking) is rejected with `400 Bad Request`.
- **Duplicate Active Request Prevention:** Blocks a customer from creating multiple active bookings (`requested`, `accepted`, or `in-progress`) for the same service.
- **Secure Pay-After-Repair Stripe Integration:**
  - Checkout sessions are only created for bookings owned by the logged-in customer with `status: "completed"` and `paymentStatus: "unpaid"`.
  - Charge amounts are read strictly from `booking.finalAmount` in MongoDB (never trusted from client payloads).
  - **Idempotent Payment Recording:** Verified via both Stripe Webhook (`checkout.session.completed`) and `/api/payments/verify` using atomic upsert logic and a **unique index on `stripeSessionId`**, guaranteeing zero duplicate payment documents even on webhook retries.

---

## Database Architecture (`fixmatedb`)

The server operates on 4 core collections alongside BetterAuth's auto-managed auth collections (`account`, `session`, `verification`):

| Collection | Primary Purpose | Key Relations |
| :--- | :--- | :--- |
| `user` | Stores all users, roles (`customer` \| `technician` \| `admin`), and profile info | Linked via unique `email` |
| `services` | Repair listings created by technicians and moderated by admins | `technicianEmail` → `user.email` |
| `bookings` | Customer repair requests, job status pipeline, `finalAmount`, and `paymentStatus` | `serviceId` → `services._id` |
| `payments` | Verified Stripe transaction records with unique `stripeSessionId` index | `bookingId` → `bookings._id` |

---

## API Endpoints Reference

### Public Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/services` | Public | Fetch approved & available services with search, filter, sort, and limit |
| `GET` | `/api/services/:id` | Public | Fetch single approved & available service with technician profile |

### Shared Authenticated Routes
| Method | Endpoint | Middlewares | Description |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/users/profile` | `verifyToken` | Update profile (`name`, `phone`, `area`, `bio`, `image`) and sync technician name |

### Customer Routes
| Method | Endpoint | Middlewares | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | `verifyToken`, `verifyCustomer` | Create a new repair request (blocks duplicate active requests) |
| `GET` | `/api/bookings/my` | `verifyToken`, `verifyCustomer` | Get all bookings belonging to the authenticated customer |
| `PATCH` | `/api/bookings/:id/cancel` | `verifyToken`, `verifyCustomer` | Cancel own booking while status is `requested` |
| `POST` | `/api/payments/create-checkout-session` | `verifyToken`, `verifyCustomer` | Create Stripe Checkout session for own `completed` & `unpaid` booking |
| `GET` | `/api/payments/verify` | `verifyToken`, `verifyCustomer` | Verify Stripe Checkout session and record payment idempotently |
| `GET` | `/api/payments/my` | `verifyToken`, `verifyCustomer` | Retrieve customer's Stripe payment history |

### Technician Routes
| Method | Endpoint | Middlewares | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/services` | `verifyToken`, `verifyTechnician` | Create a new service (saved with `approvalStatus: "pending"`) |
| `GET` | `/api/services/my` | `verifyToken`, `verifyTechnician` | Fetch all services created by the logged-in technician |
| `PATCH` | `/api/services/:id` | `verifyToken`, `verifyTechnician` | Update own service (resets `approvalStatus` to `pending`) or toggle availability |
| `DELETE` | `/api/services/:id` | `verifyToken`, `verifyTechnician` | Delete own service |
| `GET` | `/api/bookings/technician` | `verifyToken`, `verifyTechnician` | Fetch incoming repair jobs assigned to the logged-in technician |
| `PATCH` | `/api/bookings/:id/status` | `verifyToken`, `verifyTechnician` | Advance job status through validated pipeline & set `finalAmount` on completion |

### Admin Routes
| Method | Endpoint | Middlewares | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | `verifyToken`, `verifyAdmin` | List all platform users |
| `PATCH` | `/api/admin/users/:id/role` | `verifyToken`, `verifyAdmin` | Change a user's role (blocks admin self-role modification) |
| `GET` | `/api/admin/services` | `verifyToken`, `verifyAdmin` | List all services across all approval statuses |
| `PATCH` | `/api/admin/services/:id/approval` | `verifyToken`, `verifyAdmin` | Approve or reject a technician's service |
| `GET` | `/api/admin/bookings` | `verifyToken`, `verifyAdmin` | View all platform bookings |
| `GET` | `/api/admin/payments` | `verifyToken`, `verifyAdmin` | View all platform payments and total revenue |

### Stripe Webhook
| Method | Endpoint | Security | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/webhook` | `stripe-signature` + raw body | Processes `checkout.session.completed` events atomically |

---

## NPM Packages Used

| Package | Purpose |
| :--- | :--- |
| `express` | Web server and REST API routing |
| `mongodb` | Official MongoDB driver (`fixmatedb`) |
| `stripe` | Stripe Checkout sessions and Webhook signature verification |
| `jsonwebtoken` | JWT issuance and verification |
| `cors` | Cross-Origin Resource Sharing configuration |
| `dotenv` | Environment variable management |

---

## Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-backend-server.git
cd fullstack-final-project-Device_Repair-platform-_PH_Assginment-backend-server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

### 4. Run the Server
```bash
# Development
npm run dev

# Production
npm start
```

### 5. Stripe Webhook Setup (Production)
Configure a webhook destination in the **Stripe Test Dashboard** listening to `checkout.session.completed` pointing to:

```text
https://fullstack-final-project-device-repa.vercel.app/api/payments/webhook
```

Save the generated signing secret (`whsec_...`) in your deployment environment as `STRIPE_WEBHOOK_SECRET`.