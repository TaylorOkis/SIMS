# INVENTORY MANAGEMENT SYSTEM (SIMS)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Repository Structure](#repository-structure)
5. [Configuration & Setup](#configuration--setup)

   - [.env](#env)
   - [.gitignore](#gitignore)
   - [package.json](#packagejson)
   - [Prisma Schema (`prisma/schema.prisma`)](#prisma-shema)

6. [Database & ORM (Prisma)](#database--orm-prisma)

   - [Model Definitions](#model-definitions)

7. [Entry Point (`src/index.js`)](#entry-point-srcindexjs)
8. [Controllers](#controllers)

   - [Authentication (`src/controllers/auth-controller.js`)](#authentication-srccontrollersauth-controllerjs)
   - [User Management (`src/controllers/user-controller.js`)](#user-management-srccontrollersuser-controllerjs)
   - [Category Management (`src/controllers/category-controller.js`)](#category-management-srccontrollerscategory-controllerjs)
   - [Product Management (`src/controllers/product-controller.js`)](#product-management-srccontrollersproduct-controllerjs)
   - [Item Management (`src/controllers/item-controller.js`)](#item-management-srccontrollersitem-controllerjs)
   - [Order Management (`src/controllers/order-controller.js`)](#order-management-srccontrollersorder-controllerjs)
   - [Sales Management (`src/controllers/sales-controller.js`)](#sales-management-srccontrollerssales-controllerjs)
   - [Notification Management (`src/controllers/notification-controller.js`)](#notification-management-srccontrollersnotification-controllerjs)

9. [Routes (`src/routes/…`)](#routes-srcroutes)
10. [Middleware (`src/middleware`)](#middleware-srcmiddleware)

    - [Authentication & Authorization](#authentication--authorization)
    - [Error Handling](#error-handling)
    - [Not Found Handler](#not-found-handler)

11. [Utilities (`src/utils`)](#utilities-srcutils)

    - [JWT Utilities (`src/utils/jwt.js`)](#jwt-utilities-srcutilsjwtjs)
    - [Email Templates & Sending (`src/utils/email-template.js`)](#email-templates--sending-srcutilsemail-templatejs)
    - [Pagination Helper (`src/utils/pagination.js`)](#pagination-helper-srcutilspaginationjs)
    - [Server-Sent Events (`src/utils/sse.js`)](#server%E2%80%91sent-events-srcutilsssejs)
    - [Cron Jobs](#cron-jobs)

12. [Error Classes (`src/utils/errors/…`)](#error-classes-srcutilserrors)
13. [Use-Case / Workflow Example](#use-case--workflow-example)
14. [Running in Development](#running-in-development)
15. [Running in Production / PM2 / Docker (Optional)](#running-in-production--pm2--docker-optional)
16. [License](#license)

---

## Project Overview

This repository implements a **fully featured backend** for an inventory-and-sales management system (e.g., e-commerce or point-of-sale). Built with **Node.js**, **Express**, and **Prisma ORM** (backed by PostgreSQL), it exposes a set of RESTful endpoints to manage:

- **Users** (with role-based access control)
- **Categories**
- **Products** (grouped by Category)
- **Items** (stock units of Products, with pricing and inventory levels)
- **Orders** (placed by users, with line items and status workflows)
- **Sales** (recording transactions and payment methods)
- **Notifications** (push or email notifications about low stock or other events)

It employs **JWT-based authentication**, **role-based authorization**, **input validation**, **pagination**, **rate limiting**, **helmet** for security headers, **morgan** for request logging, and **server-sent events** for real-time updates. Additionally, it contains two scheduled cron jobs: one for cleaning up expired/tokens and one for detecting low-stock items to trigger notifications.

---

## Key Features

- **User Authentication & Authorization**

  - JWT-based login/signup
  - Role-based access control (e.g., ADMIN vs. STAFF vs. CUSTOMER)
  - Password hashing with bcrypt

- **Category / Product / Item CRUD**

  - Nested relationship: Categories contain Products, Products contain Items
  - Full Create, Read, Update, Delete (CRUD) operations
  - Input validation and custom error handling

- **Order Management**

  - Placing orders: Each order can have multiple items, quantity, and pricing
  - Order status workflow (e.g., PENDING, PROCESSING, COMPLETED, CANCELLED)

- **Sales Recording**

  - Track Sales with a chosen payment method (CASH, CARD, TRANSFER)
  - Sales status (PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED)

- **Inventory & Low-Stock Notifications**

  - Cron job to scan for low-stock items and send notifications via email or SSE
  - Server-Sent Events endpoint for real-time notification updates to connected clients

- **Pagination**

  - Utility for paginating large result sets in “Get All” endpoints (e.g., list of products, items, users)

- **Email Notifications**

  - Templated email functionality to send, for example, supplier alerts or password reset links
  - Uses Nodemailer under the hood

- **Error Handling**

  - Custom error classes (e.g., BadRequestError, NotFoundError, UnauthenticatedError, UnauthorizedError)
  - Centralized error-handling middleware
  - 404 “Not Found” middleware

- **Security Hardening**

  - `helmet()` to set secure HTTP headers
  - Rate limiting (100 requests per 15 minutes) to prevent bruteforce
  - XSS sanitization via `xss` library in relevant endpoints

- **Logging**

  - HTTP request logging via `morgan` (tiny format)

- **Scheduled Tasks (Cron Jobs)**

  - **low-stock-scheduler.js**: Runs at intervals to detect items whose `quantity < minimumStock` and emits SSE or sends email alerts
  - **token-cleanup.js**: Cleans up expired password-reset tokens or stale notifications

- **Prisma ORM**

  - Fully typed database client generated via Prisma
  - Models and relations defined in `prisma/schema.prisma`
  - Migration-ready for PostgreSQL

---

## Tech Stack

- **Runtime & Framework**: Node.js 18+ / Express 4.x
- **Language**: JavaScript (ESM modules)
- **ORM & Database**: Prisma (Generated Prisma Client) + PostgreSQL
- **Authentication**: JSON Web Tokens (JWT) + bcrypt
- **Email Sending**: Nodemailer
- **Cron Scheduling**: node-cron
- **Real-Time Notifications**: Server-Sent Events (SSE)
- **Validation / Security**:

  - `xss` for sanitization
  - `helmet` for HTTP security headers
  - `express-rate-limit` for rate limiting

- **Logging**: morgan (HTTP request logger)
- **Environment Management**: dotenv
- **Testing**: (Not included—but structure supports adding Jest/Mocha)

---

## Repository Structure

```
backend/
├── .env
├── .gitignore
├── email_test.js
├── package.json
├── package-lock.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.js
│   ├── controllers/
│   │   ├── auth-controller.js
│   │   ├── category-controller.js
│   │   ├── item-controller.js
│   │   ├── notification-controller.js
│   │   ├── order-controller.js
│   │   ├── product-controller.js
│   │   ├── sales-controller.js
│   │   └── user-controller.js
│   ├── routes/
│   │   ├── auth-router.js
│   │   ├── category-router.js
│   │   ├── item-router.js
│   │   ├── notification-router.js
│   │   ├── order-router.js
│   │   ├── product-router.js
│   │   ├── sale-router.js
│   │   └── user-router.js
│   ├── middleware/
│   │   ├── authentication.js
│   │   ├── not-found.js
│   │   └── error-handler.js
│   └── utils/
│       ├── email-template.js
│       ├── jwt.js
│       ├── pagination.js
│       ├── sse.js
│       ├── cron_jobs/
│       │   ├── low-stock-scheduler.js
│       │   └── token-cleanup.js
│       └── errors/
│           ├── bad-request.js
│           ├── custom-api-error.js
│           ├── not-found.js
│           ├── not-implemented.js
│           ├── unauthenticated.js
│           └── unauthorized.js
```

- **`email_test.js`** – A quick script used to validate email-sending configuration via Nodemailer (not part of production flow, but helpful for debugging).
- **`prisma/schema.prisma`** – Defines the database schema (models, relations, enums).
- **`src/index.js`** – Entry point: configures Express, mounts routers, sets up middleware, and starts the server.
- **`controllers/…`** – Business-logic handlers for each resource (auth, user, category, product, item, order, sale, notification).
- **`routes/…`** – Route definitions that map HTTP verbs/paths to controller methods.
- **`middleware/…`** – Custom Express middleware: JWT authentication, role-based authorization, generic error handling, and 404 handling.
- **`utils/…`** – Helper modules for JWT token creation/verification, pagination, SSE manager, email templating/sending, cron jobs, and error classes.

---

## Configuration & Setup

### `.env`

The repository includes a sample `.env` file at the project root. Copy and adjust values as needed for your local PostgreSQL, email account, and JWT secret.

```env
DATABASE_URL="Your DB URL"

JWT_SECRET="your jwt secret"
JWT_LIFETIME="7d"

EMAIL="your google email"
EMAIL_PASSWORD="your google app password"
```

- **`DATABASE_URL`** – PostgreSQL connection string (includes username, password, host, port, database name, and schema).
- **`JWT_SECRET`** – Secret key for signing JWT tokens.
- **`JWT_LIFETIME`** – Token lifetime (e.g., `7d` for seven days).
- **`EMAIL`** – Email address used by Nodemailer to send notifications.
- **`EMAIL_PASSWORD`** – Password or App Password (for Gmail etc.) used by Nodemailer.

> **Important**: `.env` is listed in `.gitignore` so sensitive credentials are not committed.

---

### `.gitignore`

```gitignore
/node_modules
.env
email_test.js
```

- **`node_modules/`** – Ignores local dependency installs.
- **`.env`** – Prevents committing secrets.
- **`email_test.js`** – Utility script typically not needed in version control.

---

### `package.json`

All dependencies, scripts, and project metadata are defined here

- **Scripts**

  - `npm run start` → Launches the production server (expects `prisma generate` to have run).
  - `npm run dev` → Runs with `nodemon`, automatically restarting on file changes.
  - `postinstall` → Ensures Prisma Client is generated after `npm install`.

- **Dependencies**

  - `@prisma/client` & `prisma` – Prisma ORM + Client
  - `bcryptjs` – Password hashing
  - `cors` – Cross-Origin Resource Sharing
  - `dotenv` – Environment variable loader
  - `express` & `express-async-errors` – Web framework + Promise/async error propagation
  - `express-rate-limit` – Rate limiting middleware
  - `helmet` – Security HTTP headers
  - `http-status-codes` – Named status codes (e.g., `StatusCodes.OK`)
  - `jsonwebtoken` – JWT creation & verification
  - `morgan` – HTTP request logging
  - `node-cron` – Scheduling periodic background tasks
  - `nodemailer` – Email sending
  - `xss` – XSS sanitization

---

### `prisma/schema.prisma`

The Prisma schema defines the database models, enums, and relationships. It is used by Prisma Migrate to generate the database schema and by Prisma Client at runtime to provide a typed interface to PostgreSQL.

- **`User`**

  - Core account: `username`, `password` (hashed), `firstname`, `lastname`, `email` (unique), and a `role` string to designate permissions (e.g., ADMIN, STAFF, CUSTOMER).
  - Relationships:

    - **Notification\[]** – One user can have many notifications.
    - **Order\[]** – One user can place many orders.
    - **Sale\[]** – One user can record many sales (e.g., if staff user processes multiple sales).

- **`Category`** – Top-level grouping of products.

  - Fields: `name`, `description`, timestamps.
  - Relation: **Product\[]** (one-to-many).

- **`Product`** – A product belongs to exactly one Category and may have multiple Item variants (e.g., different SKUs, sizes, colors).

  - Fields: `name`, `description`.
  - Relation:

    - **category** (foreign key `categoryId`)
    - **Item\[]** – All stock items under this product.

- **`Item`** – Represents a sellable unit (SKU) of a product, with its own `price`, `quantity` on hand, and a `minimumStock` threshold for low-stock notifications.

  - Relation:

    - **product** (foreign key `productId`)
    - **OrderItem\[]** – Join table linking items to orders.

- **`Order`** – A customer order or staff order record.

  - Fields: `status` (enum: PENDING, PROCESSING, COMPLETED, CANCELLED), `totalAmount`.
  - Relation:

    - **user** (foreign key `userId`)
    - **OrderItem\[]** – Items included in the order (quantities, unit prices).
    - **Sale?** (One-to-one via `saleId`) – Each order may produce one sale record.

- **`OrderItem`** – Join table between Order and Item, recording `quantity` and `unitPrice` at the time of ordering.

  - Relations:

    - **order** (foreign key `orderId`)
    - **item** (foreign key `itemId`)

- **`Sale`** – Represents a completed transaction (payment).

  - Fields: `status` (enum: PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED), `paymentMethod` (enum: CASH, CARD, TRANSFER), `totalPaid`.
  - Relations:

    - **user** (foreign key `userId`) – staff or cashier who processed the sale.
    - **order** (foreign key `orderId`)

- **`Notification`** – Push or email notifications targeting either a user or triggered by an item (e.g., low stock).

  - Fields: `message`, `read` (boolean).
  - Relations:

    - **user?** (foreign key `userId`)
    - **item?** (foreign key `itemId`)

- **Enums**

  - **`OrderStatus { PENDING, PROCESSING, COMPLETED, CANCELLED }`**
  - **`SaleStatus { PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED }`**
  - **`PaymentMethod { CASH, CARD, TRANSFER }`**

---

## Database & ORM (Prisma)

### Generating Prisma Client

After cloning, run:

```bash
npm install
npx prisma generate
```

- `@prisma/client` is generated under `node_modules/@prisma/client`.
- Use `npx prisma migrate dev --name init` (or any migration name) to create initial tables in your PostgreSQL database.

---

## Entry Point (`src/index.js`)

`src/index.js` wires everything together:

- **`dotenv.config()`** – Loads environment variables from `.env`.

- **Rate Limiting**:

  ```js
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // max 100 requests per IP per windowMs
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  app.use(limiter);
  ```

- **Security & Parsing**:

  - `helmet()` for secure headers
  - `express.json()` to parse JSON payloads
  - `cookieParser(process.env.JWT_SECRET)` to parse & sign cookies
  - `xss` can be used inside route handlers to sanitize inputs (not shown here, but imported)

- **CORS**: Only allows `http://localhost:3000` to request resources, with credentials support.

- **Routers**: Mounted under the following prefixes:

  - `/auth` → `authRouter`
  - `/users` → `userRouter`
  - `/categories` → `categoryRouter`
  - `/products` → `productRouter`
  - `/items` → `itemRouter`
  - `/orders` → `orderRouter`
  - `/sales` → `saleRouter`
  - `/notifications` → `notificationRouter`

- **Error Handling**:

  - `notFound` middleware for any route that did not match (returns 404)
  - `errorHandler` middleware to catch all thrown errors (from `express-async-errors`) and format them as JSON responses with correct status codes.

- **Cron Jobs**:

  - `token-cleanup.js` and `low-stock-scheduler.js` are imported (side-effect) so that they schedule themselves immediately upon server start.

---

## Controllers

Each controller exports a set of functions that implement business logic, using the Prisma client (imported as `db`) to query or update the database. Controllers use `http-status-codes` to send appropriate HTTP status codes and throw custom error classes from `src/utils/errors/`.

> **Note**: For brevity, the code itself is not reproduced here. Instead, each method is described in technical depth. Wherever configuration is required (e.g., nodemailer transport, JWT secret), it is described but not modified from what is in the codebase.

### Authentication (`src/controllers/auth-controller.js`)

- **`registerUser(req, res)`**

  1. Validates required fields: `username`, `email`, `password`, `firstname`, `lastname`.
  2. Uses `db.user.create()` (Prisma) to create a new User row.

     - Hashes the incoming `password` with `bcryptjs`.
     - Assigns default role (e.g., `CUSTOMER`) if not provided.

  3. Constructs a JWT via `jwt.createToken()` (see `src/utils/jwt.js`).
  4. Sets an HTTP-only cookie (signed with `cookieParser`) containing the token.
  5. Returns a JSON response:

     ```json
     {
       "status": "success",
       "data": {
         "user": {
           "id": "...",
           "username": "...",
           "email": "...",
           "role": "CUSTOMER",
           "firstname": "...",
           "lastname": "..."
         }
       }
     }
     ```

  6. Error cases:

     - If `username` or `email` already exists, throw `BadRequestError`.
     - If required field missing, throw `BadRequestError`.

- **`loginUser(req, res)`**

  1. Validates required fields: `username` (or `email`) and `password`.
  2. Finds the user via `db.user.findUnique({ where: { username: req.body.username } })`
     (or by `email`).
  3. Verifies the provided password with `bcrypt.compare()`.
  4. If credentials are valid, generate JWT via `jwt.createToken()` and set cookie.
  5. Returns JSON with user details (excluding `password`).
  6. Errors:

     - If user not found or password mismatch → `UnauthenticatedError("Invalid Credentials")`.

- **`logoutUser(req, res)`**

  1. Clears the JWT cookie by setting it to an empty value and immediate expiry.
  2. Returns `{ status: "success", msg: "Logged out successfully" }`.

### User Management (`src/controllers/user-controller.js`)

- **`initialAdminSetup(req, res)`**

  - Checks `db.user.findFirst({ where: { role: "ADMIN" } })` to see if an admin already exists.

    - If yes → throw `BadRequestError("An admin account already exists")`.

  - Reads `username`, `email`, `password`, `firstname`, `lastname` from `req.body`.
  - Hashes password, then `db.user.create()` with `role: "ADMIN"`.
  - Returns `StatusCodes.OK` with `{ status: "success" }`.

- **`getAllUsers(req, res)`**

  - Ensures the requester is authenticated and has role `"ADMIN"` (enforced in route via `authorizePermissions("ADMIN")`).
  - Uses `paginate(req, db.user)` helper to fetch paginated result set of all users.
  - Returns JSON array of users (omitting `password`).

- **`createUser(req, res)`**

  - Only `"ADMIN"` can invoke.
  - Validates `username`, `email`, `password`, `firstname`, `lastname`, `role` in `req.body`.
  - Hashes password, calls `db.user.create()`.
  - Returns the created user data (excluding hash).

- **`getSingleUser(req, res)`**

  - Authenticated any user.
  - `req.params.id` → fetch user by `db.user.findUnique({ where: { id: req.params.id } })`.
  - If not found → throw `NotFoundError("User not found")`.
  - Returns user details.

- **`updateUser(req, res)`**

  - Only `"ADMIN"` can update arbitrary user.
  - Receives fields to update (e.g., `firstname`, `lastname`, `email`, `role`).
  - `db.user.update({ where: { id }, data: { ... } })`.
  - Returns updated user.

- **`deleteUser(req, res)`**

  - Only `"ADMIN"` can delete.
  - `db.user.delete({ where: { id } })`.
  - Returns success message.

- **`updateUserPassword(req, res)`**

  - Authenticated any user (but only updating their own password).
  - Reads `oldPassword` and `newPassword` from `req.body`.
  - Verifies `oldPassword` via `bcrypt.compare()`.
  - If correct, `bcrypt.hash(newPassword)` → `db.user.update({ where: { id: req.user.id }, data: { password: <hashed> } })`.
  - Returns `{ status: "success", msg: "Password updated" }`.
  - Errors: incorrect old password → `BadRequestError("Invalid current password")`.

### Category Management (`src/controllers/category-controller.js`)

- **`getAllCategories(req, res)`**

  - Anyone authenticated can view.
  - Applies pagination via `paginate(req, db.category)`.
  - Returns `{ status: "success", data: { categories: [ … ], total: X, page: Y, limit: Z } }`.

- **`createCategory(req, res)`**

  - Only `"ADMIN"` can create.
  - Validates `name` and optional `description`.
  - `db.category.create({ data: { name, description } })`.
  - Returns created category.

- **`getSingleCategory(req, res)`**

  - By `req.params.id` → `db.category.findUnique({ where: { id } })`.
  - If none → `NotFoundError("Category not found")`.
  - Returns the category.

- **`updateCategory(req, res)`**

  - Only `"ADMIN"`.
  - `db.category.update({ where: { id }, data: { name, description } })`.
  - Returns updated.

- **`deleteCategory(req, res)`**

  - Only `"ADMIN"`.
  - `db.category.delete({ where: { id } })`.
  - Returns success message.

### Product Management (`src/controllers/product-controller.js`)

- **`getAllProducts(req, res)`**

  - Authenticated users can list.
  - Supports optional query param `categoryId` to filter by category.
  - Uses `paginate(req, db.product, { include: { category: true } })`.
  - Returns `{ status: "success", data: { products: [ … ], total, page, limit } }`.

- **`createProduct(req, res)`**

  - Only `"ADMIN"`.
  - Validates `name`, `description`, and `categoryId`.
  - Ensures `categoryId` exists via `db.category.findUnique({ where: { id: categoryId } })`.
  - Creates new product: `db.product.create({ data: { name, description, categoryId } })`.
  - Returns created product.

- **`getSingleProduct(req, res)`**

  - By `req.params.id`: `db.product.findUnique({ where: { id }, include: { category: true, Item: true } })`.
  - If not found → `NotFoundError("Product not found")`.
  - Returns product with its category and items.

- **`updateProduct(req, res)`**

  - Only `"ADMIN"`.
  - `db.product.update({ where: { id }, data: { name, description, categoryId } })`.
  - Returns updated.

- **`deleteProduct(req, res)`**

  - Only `"ADMIN"`.
  - `db.product.delete({ where: { id } })`.
  - Returns success.

### Item Management (`src/controllers/item-controller.js`)

- **`getAllItems(req, res)`**

  - Any authenticated user.
  - Supports optional query params:

    - `productId` (filter by product)
    - `lowStock` (boolean to filter items whose `quantity < minimumStock`)

  - Uses `paginate(req, db.item, { include: { product: true } })`.
  - Returns list with product details.

- **`createItem(req, res)`**

  - Only `"ADMIN"` or `"STAFF"`.
  - Validates `productId`, `sku`, `price`, `quantity`, `minimumStock`.
  - Ensures `productId` exists.
  - `db.item.create({ data: { productId, sku, price, quantity, minimumStock } })`.
  - Returns created item.

- **`getSingleItem(req, res)`**

  - By `req.params.id` → `db.item.findUnique({ where: { id }, include: { product: true } })`.
  - If not found → `NotFoundError("Item not found")`.
  - Returns item details.

- **`updateItem(req, res)`**

  - Only `"ADMIN"` or `"STAFF"`.
  - `db.item.update({ where: { id }, data: { price, quantity, minimumStock, sku } })`.
  - Returns updated.

- **`deleteItem(req, res)`**

  - Only `"ADMIN"`.
  - `db.item.delete({ where: { id } })`.
  - Returns success.

### Order Management (`src/controllers/order-controller.js`)

- **`placeOrder(req, res)`**

  - Authenticated user can place an order.
  - Expects in `req.body`:

    ```json
    {
      "userId": "...",
      "items": [
        { "itemId": "...", "quantity": 2 },
        { "itemId": "...", "quantity": 1 }
      ]
    }
    ```

  - Workflow:

    1. Validate that each `itemId` exists and that `quantity <= item.quantity` (stock on hand). If any fail → `BadRequestError("Insufficient stock for item ...")`.
    2. Calculate `unitPrice` for each item (read from `db.item.findUnique()`), compute `totalAmount = sum(unitPrice * quantity)`.
    3. In a Prisma transaction:

       - Decrement each `item.quantity -= requestedQuantity` via `db.item.update()`.
       - Create `db.order.create({ data: { userId, status: "PENDING", totalAmount, OrderItem: { create: [ … ] } } })`, where `OrderItem.create` is an array of `{ itemId, quantity, unitPrice }`.

    4. Return newly created order with its `id`, `status`, `totalAmount`, and line items.

- **`getAllOrders(req, res)`**

  - Authenticated `"ADMIN"` or `"STAFF"`.
  - Supports query param `status` to filter (e.g., `?status=COMPLETED`).
  - Uses `paginate(req, db.order, { include: { user: true, OrderItem: { include: { item: true } } } })`.
  - Returns list of orders, each with user info and items.

- **`getSingleOrder(req, res)`**

  - Authenticated `"ADMIN"`, `"STAFF"`, or the user who placed that order.
  - By `req.params.id`: `db.order.findUnique({ where: { id }, include: { user: true, OrderItem: { include: { item: true } } } })`.
  - If not found → `NotFoundError("Order not found")`.

- **`updateOrderStatus(req, res)`**

  - Only `"STAFF"` or `"ADMIN"`.
  - Expects `req.body.status` (must be one of enum `OrderStatus`).
  - `db.order.update({ where: { id }, data: { status } })`.
  - If `status === "COMPLETED"` or `"CANCELLED"`, may trigger inventory adjustments or refunds (not fully implemented here).
  - Returns updated order.

- **`deleteOrder(req, res)`**

  - Only `"ADMIN"`.
  - `db.order.delete({ where: { id } })`.
  - Returns success.

### Sales Management (`src/controllers/sales-controller.js`)

- **`recordSale(req, res)`**

  - Only `"STAFF"` or `"ADMIN"`.
  - Expects `req.body`:

    ```json
    {
      "orderId": "...",
      "userId": "...", // who is processing the sale
      "paymentMethod": "CARD" // one of PaymentMethod enum
    }
    ```

  - Workflow:

    1. Fetch the `Order` by `orderId`. If not found → `NotFoundError("Order not found")`.
    2. Ensure `order.status === "PENDING"` (or `"PROCESSING"`). If already COMPLETED or CANCELLED → `BadRequestError("Cannot sale a completed/cancelled order")`.
    3. Create `db.sale.create({ data: { userId, orderId, status: "PROCESSING", paymentMethod, totalPaid: order.totalAmount } })`.
    4. Update `db.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } })`.
    5. Optionally, record sale email receipt via email template.
    6. Return sale record with its ID, status, payment method, amount, timestamp.

- **`getAllSales(req, res)`**

  - Only `"STAFF"` or `"ADMIN"`.
  - Uses `paginate(req, db.sale, { include: { user: true, order: true } })`.
  - Supports filtering by `status` or `paymentMethod` (e.g., `?status=COMPLETED`).

- **`getSingleSale(req, res)`**

  - Only `"STAFF"`, `"ADMIN"`, or the user who made that sale (if applicable).
  - By `req.params.id`: `db.sale.findUnique({ where: { id }, include: { user: true, order: true } })`.
  - If not found → `NotFoundError("Sale not found")`.

- **`updateSaleStatus(req, res)`**

  - Only `"ADMIN"`.
  - Expects `req.body.status` (enum `SaleStatus`).
  - `db.sale.update({ where: { id }, data: { status } })`.
  - If `status === "REFUNDED"`, may also update `order.status = "REFUNDED"`.
  - Returns updated sale.

- **`deleteSale(req, res)`**

  - Only `"ADMIN"`.
  - `db.sale.delete({ where: { id } })`.
  - Returns success.

### Notification Management (`src/controllers/notification-controller.js`)

- **`getAllNotifications(req, res)`**

  - Authenticated user sees only their own notifications:
    `db.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } })`.
  - Returns array of notifications.

- **`markAsRead(req, res)`**

  - Expects `req.params.id` (notification ID).
  - Ensures `notification.userId === req.user.id`. If not → `UnauthorizedError("Not your notification")`.
  - `db.notification.update({ where: { id }, data: { read: true } })`.
  - Returns updated notification.

- **`deleteNotification(req, res)`**

  - Ensures ownership or if `"ADMIN"`.
  - `db.notification.delete({ where: { id } })`.
  - Returns success.

---

## Routes (`src/routes/…`)

Each router module imports its controller functions, attaches necessary middleware for authentication/authorization, and binds HTTP verbs/paths to controller handlers.

- `POST /auth/register` → `registerUser`
- `POST /auth/login` → `loginUser`
- `GET /auth/logout` → `logoutUser`

### `src/routes/user-router.js`

- `POST /users/setup` → `initialAdminSetup` (Only if no admin exists)
- `GET /users` → `getAllUsers` (ADMIN only)
- `POST /users` → `createUser` (ADMIN only)
- `GET /users/:id` → `getSingleUser` (authenticated)
- `PATCH /users/:id` → `updateUser` (ADMIN only)
- `DELETE /users/:id` → `deleteUser` (ADMIN only)

### `src/routes/category-router.js`

- `GET /categories` → `getAllCategories` (authenticated)
- `POST /categories` → `createCategory` (ADMIN only)
- `GET /categories/:id` → `getSingleCategory` (authenticated)
- `PATCH /categories/:id` → `updateCategory` (ADMIN only)
- `DELETE /categories/:id` → `deleteCategory` (ADMIN only)

### `src/routes/product-router.js`

- `GET /products` → `getAllProducts` (authenticated)
- `POST /products` → `createProduct` (ADMIN only)
- `GET /products/:id` → `getSingleProduct` (authenticated)
- `PATCH /products/:id` → `updateProduct` (ADMIN only)
- `DELETE /products/:id` → `deleteProduct` (ADMIN only)

### `src/routes/item-router.js`

- `GET /items` → `getAllItems` (authenticated)
- `POST /items` → `createItem` (STAFF or ADMIN)
- `GET /items/:id` → `getSingleItem` (authenticated)
- `PATCH /items/:id` → `updateItem` (STAFF or ADMIN)
- `DELETE /items/:id` → `deleteItem` (ADMIN only)

### `src/routes/order-router.js`

- `POST /orders` → `placeOrder` (authenticated)
- `GET /orders` → `getAllOrders` (STAFF or ADMIN)
- `GET /orders/:id` → `getSingleOrder` (authenticated or owner)
- `PATCH /orders/:id` → `updateOrderStatus` (STAFF or ADMIN)
- `DELETE /orders/:id` → `deleteOrder` (ADMIN only)

### `src/routes/sale-router.js`

- `POST /sales` → `recordSale` (STAFF or ADMIN)
- `GET /sales` → `getAllSales` (STAFF or ADMIN)
- `GET /sales/:id` → `getSingleSale` (STAFF or ADMIN)
- `PATCH /sales/:id` → `updateSaleStatus` (ADMIN only)
- `DELETE /sales/:id` → `deleteSale` (ADMIN only)

### `src/routes/notification-router.js`

- `GET /notifications` → `getAllNotifications` (authenticated)
- `PATCH /notifications/:id/read` → `markAsRead` (authenticated)
- `DELETE /notifications/:id` → `deleteNotification` (authenticated)

---

## Middleware (`src/middleware`)

### Authentication & Authorization (`authentication.js`)

- **`authenticateUser(req, res, next)`**

  1. Checks for a JWT in `req.cookies.token` (signed with `cookieParser(process.env.JWT_SECRET)`).
  2. If token missing → throw `UnauthenticatedError("Authentication invalid")`.
  3. Verifies token via `jwt.verifyToken(token)` (in `src/utils/jwt.js`).
  4. Extracts payload (`userId`, `username`, `role`) → attaches to `req.user`.
  5. `next()`.

- **`authorizePermissions(...roles)`**

  ```js
  const authorizePermissions = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new UnauthorizedError("Not authorized to access this route");
      }
      next();
    };
  };
  ```

  - Checks if `req.user.role` is one of the allowed roles. If not → `UnauthorizedError`.

## Utilities (`src/utils`)

### JWT Utilities (`src/utils/jwt.js`)

- **`createToken({ payload })`**

  - Signs and returns a JWT with the given `payload` (usually `{ userId, username, role }`).
  - Uses `JWT_SECRET` and `JWT_LIFETIME` from `.env`.

- **`verifyToken(token)`**

  - Verifies the token and returns decoded payload or throws if invalid/expired.

---

### Email Templates & Sending (`src/utils/email-template.js`)

- **Purpose**: Centralizes all email sending.
- Uses `nodemailer.createTransport()` with Gmail and credentials from `.env`.
- Receives `{ to, subject, html }` and throws `BadRequestError` if any field missing.

---

### Pagination Helper (`src/utils/pagination.js`)

- **Usage**: Called inside controllers like `getAllUsers` or `getAllProducts`.
- Reads `page` and `limit` from query parameters (defaults: page=1, limit=10).
- Runs two queries:

  1. `findMany({ skip, take, …includeOpts })` – to fetch the paginated rows.
  2. `count()` – to fetch the total count.

- Returns an object `{ page, limit, total, result }`.

---

### Server-Sent Events (`src/utils/sse.js`)

- **`sseHandler(req, res)`** – Registers a new Server-Sent Events (SSE) connection.

  - Sets `Content-Type: text/event-stream`.
  - Pushes the `res` object into a shared `clients` array.
  - Listens for `req.on('close', …)` to remove closed connections.

- **`sendEventsToAll(newNotification)`** – Iterates over all open SSE connections and sends a payload:

  ```js
  res.write(`data: ${JSON.stringify(newNotification)}\n\n`);
  ```

- **Use-Case**: Whenever a new low-stock notification is generated (in the cron job), call `sendEventsToAll(notification)` to push it to every connected client in real time.

---

### Cron Jobs

#### `src/utils/cron_jobs/low-stock-scheduler.js`

- **Schedule**: `"0 * * * *"` – executes at the top of every hour.

- **Logic**:

  1. Query `db.item` for any item where `quantity < minimumStock`.
  2. For each such item:

     - Construct a message string.
     - `db.notification.create({ data: { itemId: item.id, message } })`.
     - Send an email via `sendEmail()` to the address in `.env`.
     - Call `sendEventsToAll(notification)` to push to SSE subscribers.

- **Note**: Must import this file (e.g., `import "./utils/cron_jobs/low-stock-scheduler.js"`) so that the scheduler runs on server startup.

## Use-Case / Workflow Example

Below is a real-world scenario illustrating how the system works end-to-end:

1. **Initial Admin Setup**

   - On first deployment, no admin exists.
   - Administrator visits `POST /users/setup` with body:

     ```json
     {
       "username": "admin_user",
       "email": "admin@example.com",
       "firstname": "Alice",
       "lastname": "Johnson",
       "password": "SuperSecureP@ssw0rd",
       "role": "ADMIN"
     }
     ```

   - Since `db.user.findFirst({ where: { role: "ADMIN" } })` returns `null`, the controller hashes password, creates a new user with `role="ADMIN"`, and returns `200 OK`.

2. **Admin Creates Categories & Products**

   - Admin sends `POST /categories` with:

     ```json
     {
       "name": "Electronics",
       "description": "Smartphones, Laptops, and more"
     }
     ```

   - Controller inserts into `Category` table.
   - Admin sends `POST /products` with:

     ```json
     {
       "name": "Wireless Headphones",
       "description": "Noise-cancelling over-ear",
       "categoryId": "<Electronics category id>"
     }
     ```

   - Controller verifies `categoryId` exists, then `db.product.create(...)`.

3. **Admin/Staff Adds Items (SKUs)**

   - Staff logs in, obtains JWT (cookie).
   - Sends `POST /items` with:

     ```json
     {
       "productId": "<Wireless Headphones id>",
       "sku": "WH-2025X",
       "price": 199.99,
       "quantity": 50,
       "minimumStock": 10
     }
     ```

   - Controller creates a new `Item` row.
   - Cron job monitors each hour; since `quantity = 50 > minimumStock = 10`, no notification is generated now.

4. **User Registration & Login**

   - A customer visits `POST /auth/register` with:

     ```json
     {
       "username": "jdoe",
       "email": "jdoe@example.com",
       "password": "Password123!",
       "firstname": "John",
       "lastname": "Doe"
     }
     ```

   - Controller hashes password, creates `User` with role `CUSTOMER`, signs JWT, sets HTTP-only cookie.
   - Customer subsequently calls `POST /auth/login` and receives an updated JWT cookie.

5. **Customer Places an Order**

   - Customer, now authenticated, calls `POST /orders`:

     ```json
     {
       "userId": "<jdoe’s user id>",
       "items": [{ "itemId": "<WH-2025X SKU id>", "quantity": 2 }]
     }
     ```

   - Controller checks that `item.quantity (50) >= requested quantity (2)`.
   - Calculates `unitPrice = 199.99`, so `totalAmount = 2 * 199.99 = 399.98`.
   - In a transaction:

     - Updates `Item.quantity` to `48` (50 − 2).
     - Creates a new `Order` with status `PENDING`, stores `OrderItem` with `(itemId, quantity=2, unitPrice=199.99)`.

   - Returns the newly created order record.

6. **Staff Processes & Records Sale**

   - Staff user calls `GET /orders?status=PENDING` to view all pending orders.
   - Picks the new order ID, calls `PATCH /orders/:id` with `{ "status": "PROCESSING" }`.
   - After packaging, calls `PATCH /orders/:id` again with `{ "status": "COMPLETED" }`.
   - Then, `POST /sales`:

     ```json
     {
       "orderId": "<order id>",
       "userId": "<staff user id>",
       "paymentMethod": "CARD"
     }
     ```

   - Controller finds the order, ensures it’s `"COMPLETED"`, creates a `Sale` record with `status = "PROCESSING"`, `paymentMethod="CARD"`, `totalPaid = 399.98`.
   - Updates `Order.status` to `"COMPLETED"`.
   - Immediately returns sale details.
   - Optionally, staff can `PATCH /sales/:id` to mark `status = "COMPLETED"` once payment is captured.

7. **Low-Stock Cron Job Fires**

   - Suppose later the item’s `quantity` (48) drops below its `minimumStock` (10) due to multiple orders.
   - On the next hourly cron run, the scheduler finds that `quantity < minimumStock`.
   - It creates a new `Notification` record for that item and sends an email to `process.env.EMAIL`.
   - Also calls `sendEventsToAll(notification)`, pushing it to any connected SSE clients.

8. **Customer or Admin Subscribes to Notifications (SSE)**

   - A dashboard front-end can open an SSE connection (e.g., EventSource in browser) to `/notifications/stream` (assuming that route is wired up to `sseHandler`).
   - Whenever a new low-stock notification appears, the front end immediately receives a JSON payload.

---

## Running in Development

1. **Install Dependencies**

   ```bash
   git clone <repository-url>
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   ```

2. **Set Up Environment**

   Create a file named `.env` at project root with these exact contents (replace credentials as needed):

3. **Run Migrations** (if you haven’t already)

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start the Server in Development Mode**

   ```bash
   npm run dev
   ```

   - The server will listen on `PORT` (defaults to 5000).
   - Every time you modify any `.js` in `src/`, `nodemon` will restart the server automatically.

5. **Test Endpoints**

   - Use Postman, Insomnia, or any HTTP client to call:

     - `POST /users/setup` → create first admin
     - `POST /auth/register`, `POST /auth/login` → obtain JWT cookie
     - All other endpoints (categories, products, items, orders, sales, notifications) once authenticated.

---

## License

This project is released under the **ISC License** (as specified in `package.json`). You are free to use, modify, and distribute this code under the terms of that license.

---
