# GrabIt

GrabIt is a full-stack shopping app for discovering products and managing the shopping experience in one place. Customers can browse and search the catalog, save items to a wishlist, manage a stock-validated cart, check out with Razorpay, and view past orders and account details.

**Live app:** [grabit-web.onrender.com](https://grabit-web.onrender.com)

## Features

- Customer signup and login with protected pages
- HTTP-only JWT authentication cookies
- Product catalog with search, filtering, sorting, and product details
- Shared cart and wishlist
- Customer profile and shipping details
- Razorpay checkout with server-side payment-signature verification
- Order history and order details
- Responsive interface with GrabIt's warm neutral and olive-green palette

## Technology

- **Frontend:** React 19, Vite, React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express 5
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT and bcrypt
- **Payments:** Razorpay

## Run locally

### Requirements

- Node.js and npm
- A MongoDB database (local or MongoDB Atlas)
- Razorpay test credentials to exercise checkout

### 1. Configure the API

```powershell
cd server
Copy-Item .env.example .env
npm install
npm run dev
```

Set the values in `server/.env` before starting the server:

| Variable | Description |
| --- | --- |
| `PORT` | API port; defaults to `8084`. |
| `NODE_ENV` | Use `development` locally. |
| `JWT_SECRET` | A long, random secret used to sign authentication tokens. |
| `dbURL` | MongoDB connection string, including the database name. |
| `ALLOWED_ORIGINS` | Comma-separated frontend origins allowed by credentialed CORS; locally, `http://localhost:5173`. |
| `RAZORPAY_KEY_ID` | Razorpay test key ID. |
| `RAZORPAY_KEY_SECRET` | Matching Razorpay test key secret. |

### 2. Configure and run the frontend

Open a second terminal from the project root:

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

`client/.env` should set `VITE_API_URL=http://localhost:8084` for local development. Open the Vite URL shown in the terminal (typically `http://localhost:5173`).

Never commit `.env` files or expose private keys in frontend variables. Only the public Razorpay key ID may be used by the browser; the key secret must remain on the server.

## Production build and tests

Run these commands from their respective directories:

```powershell
# client/
npm run build

# server/
npm test
```

The frontend build is emitted to `client/dist`. The server tests use Node's built-in test runner.

## Deployment

The repository includes a Render Blueprint in [`render.yaml`](render.yaml), which provisions a free Node API and a static frontend. The live services are:

- **Frontend:** [https://grabit-web.onrender.com](https://grabit-web.onrender.com)
- **API:** [https://grabit-api-p8qc.onrender.com](https://grabit-api-p8qc.onrender.com)

To deploy your own instance, connect the repository to Render and create a Blueprint from the repository root. Enter `dbURL` and Razorpay test credentials directly in Render's dashboard; the Blueprint generates `JWT_SECRET`. Configure `ALLOWED_ORIGINS` to the exact frontend origin and `VITE_API_URL` to the full API URL. If Render assigns different service URLs, update those two variables and redeploy.

Render's free API service may spin down after inactivity, so a later first request can take 50 seconds or more. Free instance hours are limited and shared by the workspace. Use Razorpay test credentials for test payments; configure live credentials only when ready to accept real payments.

## Project layout

```text
client/   React application
server/   Express API, database models, and tests
render.yaml   Render Blueprint configuration
```

## Author

**Aryan Jaiswal**
