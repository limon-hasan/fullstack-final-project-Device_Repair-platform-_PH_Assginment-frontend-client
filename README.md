# FixMate — Smart Device & Home Appliance Repair Service Platform (Client)

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![BetterAuth](https://img.shields.io/badge/BetterAuth-MongoDB%20Adapter-10B981?style=for-the-badge)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

**FixMate** is a full-stack, role-based on-demand repair service marketplace connecting customers with verified device and home appliance technicians. Built with a transparent **Pay-After-Repair** model, customers can browse approved services, request repairs, track every stage of the job lifecycle, and complete secure Stripe payments only after the work is finished.

---

## Live Links & Repositories

| Resource | Link |
| :--- | :--- |
| **Live Client App** | [https://fullstack-final-project-device-repa-ebon.vercel.app](https://fullstack-final-project-device-repa-ebon.vercel.app) |
| **Live Backend API** | [https://fullstack-final-project-device-repa.vercel.app](https://fullstack-final-project-device-repa.vercel.app) |
| **Client Repository** | [https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-frontend-client](https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-frontend-client) |
| **Server Repository** | [https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-backend-server](https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-backend-server) |

---

## Demo Credentials

> Use the accounts below to test every role-based dashboard and workflow on the live site.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `kabul@kabul.com` | `_LIMON20102003l_` |
| **Technician** | `tariq.tech@fixmate.com` | `_LIMON20102003l_` |
| **Customer** | `maksudulhasanlimon@gmail.com` | `_LIMON20102003l_` |

---

## Purpose

Finding trustworthy repair technicians for smartphones, laptops, ACs, refrigerators, and home appliances is often stressful due to unclear pricing, lack of job visibility, and upfront payment risks. **FixMate** solves this for all three stakeholders:

- **Customers** discover admin-approved services, send structured repair requests, monitor live status changes, and pay online via Stripe only after completion.
- **Technicians** list repair services with ImgBB-hosted banners, manage incoming requests through a strict workflow, set final repair amounts, and track earnings.
- **Admins** moderate service listings before publication, manage platform user roles, oversee all repair bookings, and monitor platform-wide Stripe revenue.

---

## Key Features

### Authentication & Role-Based Access Control
- **BetterAuth with MongoDB Adapter:** Supports Email/Password authentication with custom user fields (`role`, `phone`, `area`, `bio`).
- **Server-Side Role Sanitization:** Self-registration strictly allows `customer` or `technician` roles; any attempt to inject `admin` is automatically coerced to `customer`.
- **Protected Routes & Reload Persistence:** Role-guarded dashboards redirect unauthenticated users to `/sign-in` (preserving return URLs) and prevent cross-role access without breaking on page reloads.

### Discovery, Search & Filtering (Server-Side)
- **Browse Approved Services (`/services`):** Displays only `approved` and `isAvailable: true` services in a responsive grid.
- **MongoDB-Powered Querying:** Full server-side search (title/category), filters (category & service mode), and sorting (Price Low–High, High–Low, Newest) synced with URL query parameters (e.g., `/services?category=AC`) so state persists across reloads.
- **Rich Service Details (`/services/[id]`):** Displays full service breakdown, technician summary (name, photo, area, bio), and role-restricted repair request modal with duplicate active request prevention.

### Role-Specific Dashboards
- **Customer Dashboard (`/dashboard/customer`):** Overview stats & charts, **My Bookings** (with Cancel confirmation modal for `requested` jobs and **Pay Now** button unlocked strictly for `completed` + `unpaid` jobs), and **Payment History**.
- **Technician Dashboard (`/dashboard/technician`):** Overview stats, **Add Service** (ImgBB file upload), **My Services** (Edit resets approval to `pending`, availability toggle, Delete confirmation modal), and **Manage Requests** (status filter, Reject confirmation modal, and final amount modal on completion).
- **Admin Dashboard (`/dashboard/admin`):** Platform overview stats & visualizations, **Manage Users** (role management with self-demotion protection), **Service Approval** queue (`Pending` / `Approved` / `Rejected`), **All Bookings**, and **Transactions** with total revenue.
- **Shared Profile Management (`/dashboard/profile`):** Update name, phone, area, bio, and profile photo via ImgBB with live navbar/top-bar synchronization.

### Payments & UX Polish
- **Stripe Checkout (Test Mode):** Pay-after-repair workflow with dedicated `/payment/success` and `/payment/cancel` flows verified against the backend.
- **Complete UI States:** Custom `loading.tsx` skeletons/spinners, repair-themed `not-found.tsx` (404), `error.tsx` boundary, friendly empty states with CTAs, toast notifications, confirmation modals, and responsive Dark/Light mode toggle.

---

## Application Routes

| Route | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Hero banner, 6 latest featured services, How It Works, Popular Categories |
| `/services` | Public | Server-side search, filter, and sort across approved services |
| `/services/[id]` | Public | Service details, technician profile, customer-only request modal |
| `/about` | Public | How FixMate Works & platform details |
| `/sign-in`, `/sign-up` | Public | Authentication forms (auto-redirects logged-in users) |
| `/payment/success`, `/payment/cancel` | Customer | Stripe checkout verification and cancellation feedback |
| `/dashboard/customer/*` | Customer | Overview, My Bookings, Payment History |
| `/dashboard/technician/*` | Technician | Overview, Add Service, My Services, Manage Requests |
| `/dashboard/admin/*` | Admin | Overview, Manage Users, Service Approval, All Bookings, Transactions |
| `/dashboard/profile` | Authenticated | Shared profile & ImgBB avatar management |

---

## Tech Stack & NPM Packages

| Package | Purpose |
| :--- | :--- |
| `next` | React framework using App Router |
| `react` & `react-dom` | Core UI library |
| `typescript` | Static type safety |
| `tailwindcss` | Utility-first responsive styling |
| `better-auth` | Authentication & session management |
| `@better-auth/mongo-adapter` | MongoDB persistence for BetterAuth |
| `mongodb` | Official MongoDB driver for BetterAuth connection |
| `lucide-react` | Consistent icon library |
| `sonner` | Toast notifications for auth, CRUD, and payment actions |
| `recharts` | Dashboard analytics charts and data visualizations |

---

## Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/limon-hasan/fullstack-final-project-Device_Repair-platform-_PH_Assginment-frontend-client.git
cd fullstack-final-project-Device_Repair-platform-_PH_Assginment-frontend-client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_DB_URI=your_mongodb_connection_uri
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

### 4. Run the Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.