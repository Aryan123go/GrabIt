# GrabIt

### A full-stack shopping experience built with the MERN stack

Discover products, save favourites, manage a stock-aware cart, and complete checkout with Razorpay. GrabIt brings the customer journey—from browsing to order history—into one responsive web app.

<p align="center">
  <a href="https://grabit-web.onrender.com"><strong>Open the live app →</strong></a>
  <br />
  <sub>Frontend: <a href="https://grabit-web.onrender.com">grabit-web.onrender.com</a> · API: <a href="https://grabit-api-p8qc.onrender.com">grabit-api-p8qc.onrender.com</a></sub>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-43853d?logo=nodedotjs&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/Database-MongoDB-47a248?logo=mongodb&logoColor=white" />
  <img alt="Payments" src="https://img.shields.io/badge/Payments-Razorpay-0c2451" />
  <img alt="Deployment" src="https://img.shields.io/badge/Deploy-Render-46e3b7?logo=render&logoColor=black" />
</p>

---

## Table of contents

- [What is GrabIt?](#what-is-grabit)
- [How the shopping journey works](#how-the-shopping-journey-works)
- [Features](#features)
- [Technology and architecture](#technology-and-architecture)
- [Application pages](#application-pages)
- [API overview](#api-overview)
- [Run the project locally](#run-the-project-locally)
- [Environment variables](#environment-variables)
- [Tests and production build](#tests-and-production-build)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Author](#author)

## What is GrabIt?

GrabIt is a MERN e-commerce application that demonstrates the core features of an online storefront and customer account area. Visitors can discover the store and create an account. After signing in, customers can explore the product catalogue, search and filter items, view product details, maintain a personal wishlist and cart, provide shipping information, and review previous orders.

The frontend is a React single-page application. It communicates with an Express API, which stores customer, product, cart, wishlist, and order data in MongoDB. Authentication is handled by a signed JWT stored in an HTTP-only cookie. Checkout uses Razorpay: the server creates the payment order and verifies the payment signature before confirming the order and adjusting stock.

The interface uses GrabIt's warm cream, olive, brown, and peach palette and adapts its navigation to the current page. The public landing, login, and signup pages are available without an account; shopping and account-management pages are protected.

## How the shopping journey works

1. **Explore:** Visit the storefront and open the catalogue to browse available products.
2. **Find an item:** Search by product name, filter by category, choose a price sort order, and open a product's detail page.
3. **Save or shop:** Add products to a personal wishlist or put them in the cart. Cart quantity changes are checked against current stock.
4. **Prepare checkout:** Review the cart, enter shipping details, and request a Razorpay payment order. The server calculates the price from current product records rather than trusting a client-supplied total.
5. **Confirm payment:** Complete the Razorpay checkout. The server validates the payment signature, records the paid order, decrements inventory, and removes purchased quantities from the cart.
6. **Come back later:** Update account and shipping information, sign out, and revisit order history and individual order details.

## Features

<details open>
<summary><strong>Storefront and catalogue</strong></summary>

- Public landing page introducing the GrabIt marketplace.
- Product catalogue loaded from the API.
- Product-name search, category filtering, and price ascending/descending sorting.
- Individual product pages with description, price, category, stock, and image.
- Shared product-image handling, including a fallback for unavailable images.
</details>

<details open>
<summary><strong>Customer accounts</strong></summary>

- Customer registration and login.
- Password hashing with bcrypt; passwords are not returned in customer API responses.
- JWT authentication in an HTTP-only cookie.
- Protected account and shopping routes with a consistent authenticated navigation bar.
- Profile editing for customer contact and shipping information.
- Logout clears the authentication cookie.
</details>

<details open>
<summary><strong>Wishlist and cart</strong></summary>

- Save products to a customer-specific wishlist and remove them later.
- Add products to a customer-specific cart.
- Increase, decrease, or remove cart items.
- Validate requested quantities against product stock.
- Display populated product details and derive cart totals from item prices and quantities.
</details>

<details open>
<summary><strong>Checkout and orders</strong></summary>

- Shipping address and phone/pincode validation at checkout.
- Razorpay order creation in INR.
- Server-side payment-signature verification using the Razorpay secret.
- Transactional order confirmation, inventory decrement, and cart update.
- Order history and per-order details, including purchase-time item snapshots.
</details>

## Technology and architecture

| Area | Tools |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS |
| API | Node.js, Express 5 |
| Data | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, HTTP-only cookies, bcrypt |
| Payments | Razorpay |
| Hosting | Render static site and Node web service |

The browser sends API requests through a shared Axios client with credentials enabled. The API uses an origin allowlist for credentialed CORS. MongoDB stores customers, products, and orders; a customer's cart and wishlist are associated with their customer record. Orders preserve product name, price, and image snapshots so purchase details remain available if catalogue data changes.

## Application pages

| Page | Path | Access | Purpose |
| --- | --- | --- | --- |
| Storefront | `/` | Public | Introduces GrabIt and directs visitors into the shopping flow. |
| Log in | `/login` | Public | Authenticates an existing customer. |
| Sign up | `/signup` | Public | Creates a customer account. |
| Customer home | `/home` | Signed in | Shows a customer welcome and account shortcuts. |
| Catalogue | `/products` | Signed in | Search, filter, sort, and browse products. |
| Product details | `/products/:id` | Signed in | View a selected product and shopping actions. |
| Wishlist | `/wishlist` | Signed in | Review and manage saved products. |
| Cart | `/cart` | Signed in | Review items and quantities before checkout. |
| Checkout | `/checkout` | Signed in | Provide shipping details and pay. |
| Orders | `/orders` | Signed in | Review past purchases. |
| Order details | `/orders/:id` | Signed in | Inspect a specific order and its items. |
| Profile | `/profile` | Signed in | Update customer and shipping details. |

## API overview

The API base URL is `http://localhost:8084` in local development. Authenticated endpoints require the HTTP-only `token` cookie.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/customer/register` | Public | Register a customer and start a session. |
| `POST` | `/customer/login` | Public | Authenticate and start a session. |
| `GET` | `/customer/me` | Customer | Return the current customer profile. |
| `PUT` | `/customer/profile` | Customer | Update customer and shipping information. |
| `POST` | `/customer/logout` | Public | Clear the authentication cookie. |
| `GET` | `/products` | Public | List products; supports `search`, `category`, and `sort` query parameters. |
| `GET` | `/products/:id` | Public | Fetch a product by ID. |
| `POST` | `/products` | Public | Create a product record. |
| `GET` | `/wishlist` | Customer | Get the customer's populated wishlist. |
| `GET` | `/wishlist/count` | Customer | Get the wishlist item count. |
| `POST` | `/wishlist/:productId` | Customer | Add a product to the wishlist. |
| `DELETE` | `/wishlist/:productId` | Customer | Remove a product from the wishlist. |
| `GET` | `/cart` | Customer | Get the customer's populated cart. |
| `POST` | `/cart/:productId` | Customer | Add one unit of a product to the cart. |
| `PATCH` | `/cart/:productId` | Customer | Set a cart item's quantity. |
| `DELETE` | `/cart/:productId` | Customer | Remove a product from the cart. |
| `POST` | `/orders/create-payment-order` | Customer | Validate cart/shipping data and create a Razorpay order. |
| `POST` | `/orders/verify-payment` | Customer | Verify payment and place the order. |
| `GET` | `/orders` | Customer | List the customer's orders. |
| `GET` | `/orders/:id` | Customer | Get one of the customer's orders. |

Product search is case-insensitive. `sort` accepts `price_asc` or `price_desc`; the default ordering is newest first. Product categories currently offered by the catalogue controls are Electronics, Fashion, Books, Home, Beauty, and Grocery.

## Run the project locally

### Prerequisites

- Node.js and npm.
- MongoDB, either a local replica set or a MongoDB Atlas database. Order completion uses MongoDB transactions, which require a replica-set-capable deployment.
- Razorpay test API keys if you want to exercise checkout.

### 1. Set up the API

From the project root, open a terminal:

```sh
cd server
npm install
```

From inside the `server` directory, copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`). Replace the example values with your local configuration (see [Environment variables](#environment-variables)). Then start the API:

```sh
npm run dev
```

The API listens on port `8084` by default. Its root endpoint (`http://localhost:8084/`) returns a basic server health message.

### 2. Set up the frontend

In a second terminal, from the project root:

```sh
cd client
npm install
```

From inside the `client` directory, copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`). For local development, set:

```dotenv
VITE_API_URL=http://localhost:8084
```

Start Vite:

```sh
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. Make sure the API's `ALLOWED_ORIGINS` includes this exact origin.

## Environment variables

### API (`server/.env`)

| Name | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port for the API; defaults to `8084` (Render supplies this in production). |
| `NODE_ENV` | Recommended | Set to `development` locally and `production` when hosted. |
| `JWT_SECRET` | Yes | Long, randomly generated secret for signing customer tokens. |
| `dbURL` | Yes | MongoDB connection URI, including the target database. |
| `ALLOWED_ORIGINS` | Yes | Comma-separated exact origins allowed by credentialed CORS. Locally, use `http://localhost:5173`. |
| `RAZORPAY_KEY_ID` | Checkout | Razorpay key ID (use a test key while developing). |
| `RAZORPAY_KEY_SECRET` | Checkout | Matching Razorpay secret. Keep it on the API only. |

### Frontend (`client/.env`)

| Name | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | API origin. Defaults to `http://localhost:8084`; production must point to the deployed API. |

Never commit `.env` files. Do not put private keys, database credentials, or `RAZORPAY_KEY_SECRET` in frontend variables: Vite exposes `VITE_*` values in the browser bundle. The Razorpay key ID is public-facing; the key secret is not.

## Tests and production build

Run the frontend production build:

```sh
cd client
npm run build
```

Run the backend tests:

```sh
cd server
npm test
```

The client build is written to `client/dist`. The server tests use Node's built-in test runner and cover deployment configuration and Razorpay setup/behavior.

## Deployment

This repository includes a Render Blueprint at [`render.yaml`](render.yaml). It defines a free Node API service and a static frontend, with SPA route rewrites.

### Live deployment

- **App:** [https://grabit-web.onrender.com](https://grabit-web.onrender.com)
- **API health:** [https://grabit-api-p8qc.onrender.com/](https://grabit-api-p8qc.onrender.com/)
- **Products API:** [https://grabit-api-p8qc.onrender.com/products](https://grabit-api-p8qc.onrender.com/products)

### Deploy your own copy

1. Push this repository to GitHub or GitLab and connect it to Render.
2. Create a Blueprint from the repository root and select `render.yaml`.
3. Enter `dbURL`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in Render's dashboard. Keep credentials out of source control. Render generates `JWT_SECRET`.
4. Set `ALLOWED_ORIGINS` to the exact public frontend origin and `VITE_API_URL` to the full API origin. If Render assigned different service URLs from the values in the Blueprint, update these settings and redeploy both services.
5. Use Razorpay test credentials for test payments. Live keys can process real payments and should only be enabled when the store is ready for them.

Render's free web service can spin down after inactivity; the first request after a quiet period may take 50 seconds or longer. Free instance hours are limited and shared by the workspace. See Render's current free-tier terms for the latest limits.

## Project structure

```text
GrabIt/
├── client/
│   ├── public/             # Static assets and favicon
│   └── src/
│       ├── axiosCalls/     # Shared API clients
│       ├── components/     # Reusable UI and route components
│       ├── context/        # Authentication and cart state
│       └── Pages/          # Route-level screens
├── server/
│   ├── config/             # CORS and Razorpay configuration
│   ├── controllers/        # API request handlers
│   ├── middlewares/        # Authentication middleware
│   ├── model/              # Mongoose schemas
│   ├── routes/             # Express API routes
│   ├── test/               # Node test-runner suites
│   └── index.js            # API entry point
└── render.yaml             # Render Blueprint
```

## Author

**Aryan Jaiswal**
