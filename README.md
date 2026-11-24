# FixMate — Smart Device & Home Appliance Repair Service Platform

FixMate is a full-stack, role-based on-demand device and home appliance repair service booking platform. Verified technicians list repair services, customers browse and track repair requests through a server-enforced job pipeline, pay securely online via Stripe only after job completion, and admins moderate services, users, bookings, and platform revenue.

## Live & Repository Links

- **Live Site:** https://fullstack-final-project-device-repa-ebon.vercel.app
- **Backend API:** https://fullstack-final-project-device-repa.vercel.app
- **Client Repository:** https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-frontend-client
- **Server Repository:** https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-backend-server

## Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `kabul@kabul.com` | `_LIMON20102003I_` |
| **Technician** | `tariq.tech@fixmate.com` | `_LIMON20102003I_` |
| **Customer** | `maksudulhasanlimon@gmail.com` | `_LIMON20102003I_` |

## Key Features

- **Role-Based Access Control (Customer, Technician, Admin):** Authentication powered by BetterAuth with MongoDB Adapter and JWT verification middlewares (`verifyToken`, `verifyCustomer`, `verifyTechnician`, `verifyAdmin`).
- **Server-Side Search, Filter & Sort:** Browse approved services on `/services` with URL-persisted MongoDB search, category/service-mode filtering, and price/date sorting.
- **Technician Service Management (Full CRUD):** Add services with ImgBB photo uploads, edit listings (automatically resets approval status to `pending`), toggle public availability, and delete with confirmation modals.
- **Server-Enforced Job Status Pipeline:** Strict transitions (`requested` → `accepted` / `rejected` → `in-progress` → `completed` with final amount, or customer `cancelled` while `requested`) plus duplicate active booking prevention.
- **Pay-After-Service Stripe Integration:** Customers pay only after a job is marked `completed` and `unpaid`, verified securely via Stripe Checkout & Webhook without duplicate payment records.
- **Admin Moderation & Analytics:** Approve or reject technician listings, manage user roles (preventing self-demotion), monitor all bookings, and track Stripe transactions and total revenue with dashboard charts.
- **Live Profile Sync & Dark/Light Mode:** Update user profile details and ImgBB avatar with instant Navbar/Topbar session sync, alongside full dark/light theme support.

## Tech Stack & NPM Packages

### Frontend
- **Framework & Language:** `next` (App Router), `react`, `react-dom`, `typescript`
- **Styling & UI:** `tailwindcss`, `lucide-react`, `sonner`, `clsx`, `tailwind-merge`
- **Authentication:** `better-auth`, `mongodb`

### Backend
- **Server & Database:** `express`, `mongodb`, `cors`, `dotenv`
- **Auth & Payments:** `jsonwebtoken`, `stripe`

## Environment Variables

### Client (`.env.local`)
```env
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_DB_URI=your_mongodb_connection_uri
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

### Server (`.env`)
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_uri
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_test_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
```

## Running Locally

```bash
# 1. Start the backend server
npm install
npm run dev

# 2. Start the frontend client
npm install
npm run dev
```