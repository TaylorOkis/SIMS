# SIMS (Simple Inventory Management System)

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture & Project Structure](#architecture--project-structure)
5. [Database Schema (Overview)](#database-schema-overview)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Endpoints](#api-endpoints)
8. [Real-Time Notifications (SSE)](#real-time-notifications-sse)
9. [Background Jobs (Cron)](#background-jobs-cron)
10. [Installation & Setup](#installation--setup)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation](#installation)
    - [Database Setup (Prisma)](#database-setup-prisma)
    - [Running in Development & Production](#running-in-development--production)
11. [Usage Examples](#usage-examples)
12. [Contributing](#contributing)
13. [License](#license)

---

## Introduction

**SIMS** (Simple Inventory Management System) is a back-end application built with Node.js, Express, and Prisma, designed to help small- to medium-sized businesses manage users, categories, products, inventory items, orders, and sales. It also includes real-time low-stock notifications via Server-Sent Events (SSE) and automated background jobs for housekeeping tasks (e.g., purging expired password-reset tokens). This repository demonstrates best practices in security, modular architecture, and database design.

---

## Features

- **User Management**

  - Role-based access control (`ADMIN`, `SALESPERSON`)
  - Secure password hashing (bcrypt) and reset-token flows via email (nodemailer)
  - JWT authentication stored in signed, HTTP-only cookies

- **Category & Product Management**

  - CRUD operations for categories and products
  - Unique constraints on names, slugs, SKUs
  - Search products by name, SKU, or slug

- **Inventory Items**

  - Associate `Item` records with `Product` (quantity, total_price)
  - Track inbound stock or adjustments

- **Orders & Sales**

  - Create orders composed of multiple `Item` entries
  - Convert orders to `Sale` records with payment method and status
  - Salesperson attribution for each order/sale

- **Real-Time Low-Stock Notifications**

  - Hourly cron job scans for products where `stockQty ≤ alertQty`
  - Sends deduplicated alerts via SSE to connected clients

- **Background Cleanup Jobs**

  - Every 15 minutes, expired password-reset tokens (`resetTokenExpiry`) are purged from the database

- **Security & Performance**
  - Helmet for secure HTTP headers
  - XSS protection (using `xss` where sanitization is needed)
  - Rate limiting (100 requests per 15 minutes)
  - CORS configured for cross-origin requests (front-end typically on `localhost:3000`)
  - Morgan for HTTP request logging

---

## Tech Stack

- **Runtime & Framework**

  - [Node.js](https://nodejs.org/) (ES Modules)
  - [Express](https://expressjs.com/) (Web Framework)
  - [Prisma Client & Migrate](https://www.prisma.io/) (Type-safe ORM for PostgreSQL)

- **Authentication & Security**

  - [bcryptjs](https://www.npmjs.com/package/bcryptjs) (Password hashing)
  - [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) (JWT issuance & verification)
  - [cookie-parser](https://www.npmjs.com/package/cookie-parser) (Signed HTTP-only cookies)
  - [helmet](https://www.npmjs.com/package/helmet) (Secure HTTP headers)
  - [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) (Rate limiting)
  - [xss](https://www.npmjs.com/package/xss) (XSS sanitization)

- **Background Jobs**

  - [node-cron](https://www.npmjs.com/package/node-cron) (Scheduler for cron jobs)
  - [nodemailer](https://www.npmjs.com/package/nodemailer) (Email delivery for password resets)

- **Logging & Utilities**
  - [morgan](https://www.npmjs.com/package/morgan) (HTTP request logger)
  - [http-status-codes](https://www.npmjs.com/package/http-status-codes) (Standardized HTTP status code constants)
  - [dotenv](https://www.npmjs.com/package/dotenv) (Environment variable loader)

---

## Architecture & Project Structure

```Relevant folder structure
SIMS/
├── prisma/
│ └── schema.prisma
├── src/
│ ├── controllers/
│ │ ├── auth-controller.js
│ │ ├── category-controller.js
│ │ ├── item-controller.js
│ │ ├── notification-controller.js
│ │ ├── order-controller.js
│ │ ├── product-controller.js
│ │ ├── sale-controller.js
│ │ └── user-controller.js
│ ├── database/
│ │ └── db.js
│ ├── middlewares/
│ │ ├── authentication.js
│ │ ├── error-handler.js
│ │ └── not-found.js
│ ├── routes/
│ │ ├── auth-router.js
│ │ ├── category-router.js
│ │ ├── item-router.js
│ │ ├── notification-router.js
│ │ ├── order-router.js
│ │ ├── product-router.js
│ │ ├── sale-router.js
│ │ └── user-router.js
│ ├── utils/
│ │ ├── cron_jobs/
│ │ │ ├── low-stock-scheduler.js
│ │ │ └── token-cleanup.js
│ │ └── sse.js
│ └── index.js
├── .gitignore
├── package.json
├── package-lock.json
└── TODO
```

- **`prisma/schema.prisma`**: Defines the PostgreSQL schema and Prisma models.
- **`src/database/db.js`**: Initializes and exports a singleton Prisma Client.
- **`src/middlewares/`**: Custom middleware for authentication, authorization, error handling, and 404 routes.
- **`src/controllers/`**: Core business logic—each controller accesses Prisma and processes requests.
- **`src/routes/`**: Express routers mapping each HTTP route to its controller, enforcing authentication/authorization where required.
- **`src/utils/cron_jobs/`**: Contains two scheduler scripts:
  - **`low-stock-scheduler.js`** (hourly low-stock alerts via SSE)
  - **`token-cleanup.js`** (every 15 minutes, removes expired reset tokens)
- **`src/utils/sse.js`**: Implements a simple Server-Sent Events manager that keeps track of connected clients, deduplicates alerts, and broadcasts low-stock messages in real time.
- **`src/index.js`**: The application entry point—configures Express, global middlewares, mounts routers, and starts the server.

---

## Database Schema (Overview)

Below is a high-level summary of the Prisma schema. For full details, see `prisma/schema.prisma`.

```prisma
model User {
  id               String       @id @default(uuid())
  username         String       @unique
  password         String
  firstname        String
  lastname         String
  email            String       @unique
  phone            String?      @unique
  role             Role
  status           UserStatus   @default(ACTIVE)
  image            String       @default("https://img.icons8.com/...png")
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  resetToken       String?
  resetTokenExpiry DateTime?
  Order            Order[]
  Sale             Sale[]
  @@index([username, email, phone, role])
}

model Category {
  id        String    @id @default(uuid())
  name      String    @unique
  slug      String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  product   Product[]
}

model Product {
  id               String   @id @default(uuid())
  name             String   @unique
  description      String?
  alertQty         Int
  stockQty         Int
  buyingPrice      Float
  sellingPrice     Float
  slug             String   @unique
  sku              String   @unique
  supplier_name    String
  supplier_contact String
  categoryId       String
  image            String   @default("https://img.icons8.com/...png")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  Item             Item[]
  category         Category @relation(fields: [categoryId], references: [id])
  @@index([name, stockQty, sellingPrice])
}

model Item {
  id          String  @id @default(uuid())
  productId   String
  quantity    Int
  total_price Float
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id])
  product     Product @relation(fields: [productId], references: [id])
  @@index([quantity, productId])
}

model Order {
  id              String    @id @default(uuid())
  customerName    String?
  customerContact String?
  salesPersonId   String
  totalPrice      Float
  status          SaleStatus
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  items           Item[]
  salesPerson     User      @relation(fields: [salesPersonId], references: [id])
  Sale            Sale[]
  @@index([salesPersonId, status])
}

model Sale {
  id             String        @id @default(uuid())
  dateOfSale     DateTime      @default(now())
  totalAmount    Float
  salesPersonId  String
  orderId        String
  status         SaleStatus
  paymentMethod  PaymentMethod
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  order          Order         @relation(fields: [orderId], references: [id])
  salesPerson    User          @relation(fields: [salesPersonId], references: [id])
  @@index([salesPersonId, status])
}

enum Role          { ADMIN SALESPERSON }
enum UserStatus    { ACTIVE INACTIVE }
enum SaleStatus    { PENDING PROCESSING COMPLETED CANCELLED REFUNDED }
enum PaymentMethod { CASH CARD TRANSFER }
```

- **Indexes**:

  - `User` has a compound index on `(username, email, phone, role)` for efficient lookups.
  - `Product` indexes `(name, stockQty, sellingPrice)` to speed up search and stock checks.
  - `Order`/`Sale` index by `(salesPersonId, status)` to quickly filter by salesperson and order/sale status.

---

## Authentication & Authorization

1. **JWT + HTTP-Only Cookies**

   - On successful login, the server issues a JWT containing `{ userId, role }` and sets it as a **signed, HTTP-only** cookie.
   - Subsequent requests extract and verify this JWT via the `authenticateUser` middleware (`src/middlewares/authentication.js`).

2. **Password Hashing & Reset Flow**

   - Passwords are hashed with `bcryptjs` before storage.
   - `forgotPassword` generates a random token (e.g., `crypto.randomBytes(20).toString("hex")`), stores its _hashed_ version in `resetToken`, and sets `resetTokenExpiry = now() + 10 minutes`.
   - Sends a reset link via `nodemailer`.
   - `verifyResetToken` validates the token against `resetToken` and checks freshness (`resetTokenExpiry > now()`).
   - `changePassword` re-hashes the new password, updates the `password` column, and clears `resetToken` fields.

3. **Role-Based Permissions**

   - Two roles:

     - `ADMIN` – Full access (create, update, delete for Users, Categories, Products, etc.)
     - `SALESPERSON` – Limited access (e.g., create orders/sales, view own data).

   - The `authorizePermissions(...roles)` middleware checks `req.user.role` and returns **403 Forbidden** if the role is not permitted.

---

## API Endpoints

All routes require a valid JWT cookie, except auth endpoints (`/auth/*`).

> **Base URL:** `http://localhost:5000` (default)

### 1. Auth Routes (`/auth`)

| Method | Path                     | Description                                                       | Body / Query                                                      | Access        |
| :----: | ------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ------------- |
|  POST  | `/auth/login`            | Log in a user (username or email + password). Returns JWT cookie. | `{ "username": "john_doe", "password": "..." }`                   | Public        |
|  GET   | `/auth/logout`           | Log out (clears JWT cookie).                                      | —                                                                 | Authenticated |
|  POST  | `/auth/forgotPassword`   | Request a password reset email.                                   | `{ "email": "john@example.com" }`                                 | Public        |
|  GET   | `/auth/verifyResetToken` | Verify a reset token (query: `?token=<token>`).                   | N/A (query param)                                                 | Public        |
|  POST  | `/auth/changePassword`   | Change password using valid reset token.                          | `{ "token": "...", "password": "...", "confirmPassword": "..." }` | Public        |

---

### 2. User Routes (`/users`)

| Method | Path                        | Description                              | Body / Params                                                              | Access                           |
| :----: | --------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
|  POST  | `/users/setup`              | Create initial Admin account (one-time). | `{ "username": "...", "password": "...", "role": "ADMIN", ... }`           | Public (only if no Admin exists) |
|  GET   | `/users/`                   | List all users (ADMIN only).             | —                                                                          | ADMIN                            |
|  POST  | `/users/`                   | Create new user (ADMIN only).            | `{ "username": "...", "password": "...", "role": "SALESPERSON", ... }`     | ADMIN                            |
|  GET   | `/users/:id`                | Get a single user’s profile.             | `:id`                                                                      | Authenticated (self or ADMIN)    |
| PATCH  | `/users/:id`                | Update user info (ADMIN only).           | `{ "firstname": "...", "role": "SALESPERSON", ... }`                       | ADMIN                            |
| DELETE | `/users/:id`                | Delete a user (ADMIN only).              | `:id`                                                                      | ADMIN                            |
| PATCH  | `/users/updatePassword/:id` | Update password (owner only).            | `{ "oldPassword": "...", "newPassword": "...", "confirmPassword": "..." }` | Authenticated (self)             |

---

### 3. Category Routes (`/categories`)

| Method | Path              | Description                       | Body / Params                                      | Access        |
| :----: | ----------------- | --------------------------------- | -------------------------------------------------- | ------------- |
|  GET   | `/categories/`    | List all categories.              | —                                                  | Authenticated |
|  POST  | `/categories/`    | Create new category (ADMIN only). | `{ "name": "Electronics", "slug": "electronics" }` | ADMIN         |
|  GET   | `/categories/:id` | Get a single category.            | `:id`                                              | Authenticated |
| PATCH  | `/categories/:id` | Update a category (ADMIN only).   | `{ "name": "New Name", "slug": "new-slug" }`       | ADMIN         |
| DELETE | `/categories/:id` | Delete a category (ADMIN only).   | `:id`                                              | ADMIN         |

---

### 4. Product Routes (`/products`)

| Method | Path               | Description                                            | Body / Params                                                                                                                                                                                                                                            | Access        |
| :----: | ------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
|  GET   | `/products/`       | List all products (with pagination support in future). | —                                                                                                                                                                                                                                                        | Authenticated |
|  POST  | `/products/`       | Create new product (ADMIN only).                       | `{ "name": "...", "description": "...", "alertQty": 10, "stockQty": 50, "buyingPrice": 5.00, "sellingPrice": 10.00, "slug": "widget", "sku": "W123", "supplier_name": "Acme Co.", "supplier_contact": "123-456-7890", "categoryId": "<category-uuid>" }` | ADMIN         |
|  GET   | `/products/search` | Search products by `q` (name, sku, slug).              | Query param: `?q=widget`                                                                                                                                                                                                                                 | Authenticated |
|  GET   | `/products/:id`    | Get a single product’s details.                        | `:id`                                                                                                                                                                                                                                                    | Authenticated |
| PATCH  | `/products/:id`    | Update product info (ADMIN only).                      | `{ "stockQty": 45, "sellingPrice": 9.50, ... }`                                                                                                                                                                                                          | ADMIN         |
| DELETE | `/products/:id`    | Delete a product (ADMIN only).                         | `:id`                                                                                                                                                                                                                                                    | ADMIN         |

---

### 5. Item Routes (`/items`)

| Method | Path         | Description                                | Body / Params                                                                                         | Access        |
| :----: | ------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------- |
|  GET   | `/items/`    | List all inventory items.                  | —                                                                                                     | Authenticated |
|  POST  | `/items/`    | Create new item for a product.             | `{ "productId": "<product-uuid>", "quantity": 20, "total_price": 100.00, "orderId": "<order-uuid>" }` | Authenticated |
|  GET   | `/items/:id` | Get a single item’s details.               | `:id`                                                                                                 | Authenticated |
| PATCH  | `/items/:id` | Update item (e.g., adjust quantity/price). | `{ "quantity": 25, "total_price": 125.00 }`                                                           | Authenticated |
| DELETE | `/items/:id` | Remove an item.                            | `:id`                                                                                                 | Authenticated |

---

### 6. Order Routes (`/orders`)

| Method | Path          | Description                                        | Body / Params                                                                                                                                                                              | Access        |
| :----: | ------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
|  GET   | `/orders/`    | List all orders (with nested items).               | —                                                                                                                                                                                          | Authenticated |
|  POST  | `/orders/`    | Create new order (with items).                     | `{ "customerName": "Alice", "customerContact": "555-1234", "salesPersonId": "<user-uuid>", "items": [ { "productId": "<product-uuid>", "quantity": 2, "total_price": 20.00 }, { ... } ] }` | Authenticated |
|  GET   | `/orders/:id` | Get order by ID (with items and salesperson info). | `:id`                                                                                                                                                                                      | Authenticated |
| PATCH  | `/orders/:id` | Update order (e.g., change status or items).       | `{ "status": "PROCESSING", "items": [ ... ] }`                                                                                                                                             | Authenticated |
| DELETE | `/orders/:id` | Delete an order.                                   | `:id`                                                                                                                                                                                      | Authenticated |

---

### 7. Sale Routes (`/sales`)

| Method | Path         | Description                                       | Body / Params                                                                                                                         | Access        |
| :----: | ------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
|  GET   | `/sales/`    | List all sales (with nested order & user info).   | —                                                                                                                                     | Authenticated |
|  POST  | `/sales/`    | Record a new sale (linking to an existing order). | `{ "orderId": "<order-uuid>", "salesPersonId": "<user-uuid>", "totalAmount": 50.00, "status": "COMPLETED", "paymentMethod": "CARD" }` | Authenticated |
|  GET   | `/sales/:id` | Get sale by ID (with nested order & user).        | `:id`                                                                                                                                 | Authenticated |
| PATCH  | `/sales/:id` | Update sale status or payment method.             | `{ "status": "REFUNDED", "paymentMethod": "CASH" }`                                                                                   | Authenticated |
| DELETE | `/sales/:id` | Delete a sale record.                             | `:id`                                                                                                                                 | Authenticated |

---

### 8. Notification Routes (`/notifications`)

| Method | Path                                 | Description                                                                                                     | Body / Params     | Access        |
| :----: | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------- | ------------- |
|  GET   | `/notifications/stream`              | Opens a Server-Sent Events (SSE) stream. Clients receive JSON payloads whenever a low-stock alert is triggered. | —                 | Authenticated |
|  POST  | `/notifications/ack/:notificationId` | Acknowledge or mark a notification as “read.”                                                                   | `:notificationId` | Authenticated |

---

## Real-Time Notifications (SSE)

SIMS implements real-time low-stock alerts using **Server-Sent Events (SSE)**. The flow is as follows:

1. **Client subscribes** to `/notifications/stream` via an HTTP GET request with header `Accept: text/event-stream`.
2. **SSE Utility (`src/utils/sse.js`)**

   - Maintains an in-memory list of connected response (`res`) objects.
   - Keeps a set of “already sent” product IDs to avoid duplicate alerts.
   - When a new client connects, sends any pending low-stock alerts immediately.
   - When an alert is sent, writes to each client:

     ```js
     res.write(`data: ${JSON.stringify({ id: product.id, message })}\n\n`);
     ```

3. **`low-stock-scheduler.js`** Cron Job (runs hourly):

   - Executes a raw SQL query via Prisma:

     ```js
     const lowStockProducts = await db.$queryRaw`
       SELECT id, name, sku, "stockQty"
       FROM "Product"
       WHERE "stockQty" <= "alertQty"
     `;
     ```

   - For each returned product, calls `sendDeduplicatedAlert(product.id, message)`.
   - If a product’s `stockQty` is still ≤ `alertQty` and hasn’t been alerted in the current session, SSE pushes a JSON payload to every connected client.

Clients can parse these JSON payloads and display in-app banners, alerts, or dashboard widgets. Once a user acknowledges an alert via `POST /notifications/ack/:notificationId`, the server can remove that ID from the “pending” set (implementation detail handled in `notification-controller.js`).

---

## Background Jobs (Cron)

Two cron jobs run automatically when the server starts:

1. **Token Cleanup (`src/utils/cron_jobs/token-cleanup.js`)**

   - Schedule: Every 15 minutes (`"*/15 * * * *"`)
   - Task:

     ```js
     await db.user.updateMany({
       where: { resetTokenExpiry: { lte: new Date() } },
       data: { resetToken: null, resetTokenExpiry: null },
     });
     ```

     → Clears any expired password-reset tokens (older than `Date.now()`).

2. **Low-Stock Scheduler (`src/utils/cron_jobs/low-stock-scheduler.js`)**

   - Schedule: Hourly (`"0 * * * *"`)
   - Task:

     1. Query all products where `stockQty ≤ alertQty`.
     2. For each product, compute a human-readable message:

        ```js
        const message = `Scheduled check: ${product.name} (${product.sku}) has ${product.stockQty} units left.`;
        ```

     3. Call `sendDeduplicatedAlert(product.id, message)` to push an SSE.

   - Ensures business owners are notified in real time whenever stock is running low.

Because these jobs are imported at the top of `src/index.js`—without being wrapped in any function—they begin executing as soon as the application loads.

---

## Installation & Setup

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **npm** v8+
- **PostgreSQL** v12+ (or hosted alternative)
- **Email SMTP credentials** (for nodemailer in password reset flow)

### Environment Variables

Create a file named `.env` in the project root with the following variables (example values shown):

```dotenv
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/sims_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT=587
EMAIL_USER="your_smtp_username"
EMAIL_PASS="your_smtp_password"
PORT=5000
```

- `DATABASE_URL` – PostgreSQL connection string (must include database name).
- `JWT_SECRET` – Secret key for signing JWTs and cookies.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` – Credentials for an SMTP server (e.g., Mailtrap, SendGrid).
- `PORT` – (Optional) Port the server listens on (default: 5000).

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TaylorOkis/SIMS.git
   cd SIMS
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   - The `postinstall` script automatically runs `prisma generate`, creating the Prisma client based on `schema.prisma`.

### Database Setup (Prisma)

1. **Create the database** (if not already existing).

2. **Run Prisma Migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

   - This command creates (or updates) the database schema to match `prisma/schema.prisma`.
   - It also generates the Prisma Client in `node_modules/@prisma/client`.

3. **(Optional) Seed the database**
   If you have a seeding script, run:

   ```bash
   npx prisma db seed
   ```

   _Note: No seed script is provided by default; you may write your own if needed._

### Running in Development & Production

- **Development (with hot-reload)**

  ```bash
  npm run dev
  ```

  - Uses `nodemon` to watch for file changes and restart the server automatically.

- **Production**

  ```bash
  npm start
  ```

  - Runs `node ./src/index.js` directly.

Once running, you should see:

```
App is running on port 5000...
```

in your console.

---

## Usage Examples

Below are some example requests and responses to demonstrate how to interact with SIMS’s API. Use a tool like Postman, Insomnia, or cURL.

### 1. Register / Initial Admin Setup

> **Endpoint:** `POST /users/setup` > **Purpose:** Create the very first Admin (only allowed if no Admin exists).

**Request Body**

```json
{
  "username": "admin1",
  "password": "ComplexPass123!",
  "firstname": "Alice",
  "lastname": "Smith",
  "email": "alice.smith@example.com",
  "phone": "555-987-6543",
  "role": "ADMIN"
}
```

**Response (201 Created)**

```json
{
  "user": {
    "id": "c1a1d3f2-9a78-4c2b-8a73-7f4380ef1234",
    "username": "admin1",
    "firstname": "Alice",
    "lastname": "Smith",
    "email": "alice.smith@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "image": "https://img.icons8.com/...png",
    "createdAt": "2025-06-01T10:23:45.678Z",
    "updatedAt": "2025-06-01T10:23:45.678Z"
  }
}
```

---

### 2. Login & Obtain JWT Cookie

> **Endpoint:** `POST /auth/login` > **Purpose:** Authenticate user and set a signed, HTTP-only JWT cookie.

**Request Body**

```json
{
  "username": "admin1",
  "password": "ComplexPass123!"
}
```

**Response (200 OK)**

```json
{
  "user": {
    "id": "c1a1d3f2-9a78-4c2b-8a73-7f4380ef1234",
    "username": "admin1",
    "firstname": "Alice",
    "lastname": "Smith",
    "email": "alice.smith@example.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

- **Set-Cookie Header**

  ```
  Set-Cookie: token=<signed-jwt-token>; HttpOnly; Secure; SameSite=Strict
  ```

---

### 3. Create a Category (ADMIN Only)

> **Endpoint:** `POST /categories/` > **Headers:**
>
> - `Cookie: token=<signed-jwt-token>`
> - `Content-Type: application/json` > **Body**

```json
{
  "name": "Electronics",
  "slug": "electronics"
}
```

**Response (201 Created)**

```json
{
  "category": {
    "id": "d2b3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
    "name": "Electronics",
    "slug": "electronics",
    "createdAt": "2025-06-02T14:10:12.345Z",
    "updatedAt": "2025-06-02T14:10:12.345Z"
  }
}
```

---

### 4. Create a Product (ADMIN Only)

> **Endpoint:** `POST /products/` > **Headers:**
>
> - `Cookie: token=<signed-jwt-token>`
> - `Content-Type: application/json` > **Body**

```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver.",
  "alertQty": 5,
  "stockQty": 20,
  "buyingPrice": 8.5,
  "sellingPrice": 15.99,
  "slug": "wireless-mouse",
  "sku": "WM-2025",
  "supplier_name": "Tech Supplies Inc.",
  "supplier_contact": "555-123-4567",
  "categoryId": "d2b3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f"
}
```

**Response (201 Created)**

```json
{
  "product": {
    "id": "e3c4d5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with USB receiver.",
    "alertQty": 5,
    "stockQty": 20,
    "buyingPrice": 8.5,
    "sellingPrice": 15.99,
    "slug": "wireless-mouse",
    "sku": "WM-2025",
    "supplier_name": "Tech Supplies Inc.",
    "supplier_contact": "555-123-4567",
    "categoryId": "d2b3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
    "image": "https://img.icons8.com/...png",
    "createdAt": "2025-06-02T14:15:30.789Z",
    "updatedAt": "2025-06-02T14:15:30.789Z"
  }
}
```

---

### 5. Search Products

> **Endpoint:** `GET /products/search?q=mouse` > **Headers:**
>
> - `Cookie: token=<signed-jwt-token>`

**Response (200 OK)**

```json
{
  "products": [
    {
      "id": "e3c4d5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "name": "Wireless Mouse",
      "slug": "wireless-mouse",
      "sku": "WM-2025",
      "stockQty": 20,
      "sellingPrice": 15.99
    },
    {
      "id": "f4d5e6c7-8a9b-0c1d-2e3f-4a5b6c7d8e9f",
      "name": "Gaming Mouse",
      "slug": "gaming-mouse",
      "sku": "GM-2025",
      "stockQty": 12,
      "sellingPrice": 29.99
    }
  ]
}
```

---

### 6. Create an Order

> **Endpoint:** `POST /orders/` > **Headers:**
>
> - `Cookie: token=<signed-jwt-token>`
> - `Content-Type: application/json` > **Body**

```json
{
  "customerName": "Bob Johnson",
  "customerContact": "555-222-3333",
  "salesPersonId": "c1a1d3f2-9a78-4c2b-8a73-7f4380ef1234",
  "items": [
    {
      "productId": "e3c4d5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "quantity": 2,
      "total_price": 31.98
    }
  ]
}
```

**Response (201 Created)**

```json
{
  "order": {
    "id": "g5e6f7a8-9b0c-1d2e-3f4a-5b6c7d8e9f0a",
    "customerName": "Bob Johnson",
    "customerContact": "555-222-3333",
    "salesPersonId": "c1a1d3f2-9a78-4c2b-8a73-7f4380ef1234",
    "totalPrice": 31.98,
    "status": "PENDING",
    "createdAt": "2025-06-02T15:05:10.456Z",
    "updatedAt": "2025-06-02T15:05:10.456Z",
    "items": [
      {
        "id": "h6f7g8a9-0b1c-2d3e-4f5a-6b7c8d9e0f1a",
        "productId": "e3c4d5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
        "quantity": 2,
        "total_price": 31.98,
        "orderId": "g5e6f7a8-9b0c-1d2e-3f4a-5b6c7d8e9f0a"
      }
    ]
  }
}
```

> Note: `totalPrice` on the `Order` is computed server-side (sum of all `Item.total_price`).

---

### 7. Record a Sale

> **Endpoint:** `POST /sales/` > **Headers:**
>
> - `Cookie: token=<signed-jwt-token>`
> - `Content-Type: application/json` > **Body**

```json
{
  "orderId": "g5e6f7a8-9b0c-1d2e-3f4a-5b6c7d8e9f0a",
  "salesPersonId": "c1a1d3f2-9a78-4c2b-8a73-7f4380ef1234",
  "totalAmount": 31.98,
  "status": "COMPLETED",
  "paymentMethod": "CARD"
}
```

**Response (201 Created)**

```json
{
  "sale": {
    "id": "i7g8h9a0-1b2c-3d4e-5f6a-7b8c9d0e1f2g",
    "dateOfSale": "2025-06-02T15:10:05.789Z",
    "totalAmount": 31.98,
    "salesPersonId": "c1a1d3f2-9a78-4c2b-8a73-7f4380ef1234",
    "orderId": "g5e6f7a8-9b0c-1d2e-3f4a-5b6c7d8e9f0a",
    "status": "COMPLETED",
    "paymentMethod": "CARD",
    "createdAt": "2025-06-02T15:10:05.789Z",
    "updatedAt": "2025-06-02T15:10:05.789Z"
  }
}
```

---

### 8. Subscribe to Low-Stock Alerts (SSE)

> **Endpoint:** `GET /notifications/stream` > **Headers:**
>
> - `Cookie: token=<signed-jwt-token>`
> - `Accept: text/event-stream`

**Sample SSE Response**

```
data: {"id":"e3c4d5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f","message":"Scheduled check: Wireless Mouse (WM-2025) has 5 units left"}
```

Clients maintain a persistent connection. Whenever `low-stock-scheduler.js` detects a product with `stockQty ≤ alertQty`, a new `data: { … }` event is sent. If the same product remains below its alert threshold in subsequent checks, no duplicate alert is sent until acknowledged.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create your feature branch (`git checkout -b feature/YourFeature`).
2. **Run tests** (if added in the future).
3. **Commit** your changes (`git commit -m "feat: add new endpoint"`).
4. **Push** to your branch (`git push origin feature/YourFeature`).
5. **Open a Pull Request** with a clear description of the problem and solution.

Before submitting a PR, ensure:

- Code adheres to existing style (ES Modules, consistent indentation).
- All new dependencies are added to `package.json` and explained in your PR.
- New functionality includes unit or integration tests where applicable.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

```

```
