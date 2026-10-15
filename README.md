# Car wash app: frontend

An app for a car wash owner. It tracks bookings, clients, vehicles, services and staff.

**Live:** https://car-wash-bogdan.netlify.app
Demo: on the login page click "Pogledaj demo" (view demo). The demo account can only look at the data.

The app was made for the local market, so the interface is in Serbian.

The backend (Node.js, Express, PostgreSQL) is in a separate repo: [car-wash-backend](https://github.com/Sarca03/car-wash-backend).

## What it does

- **Dashboard:** today's bookings by hour, the next booking, revenue from completed bookings and a breakdown by status.
- **Bookings:** create, edit and change status (pending, confirmed, completed, cancelled). Picking a service fills in the price, and vehicles are filtered by the selected client.
- **Clients, vehicles, services, staff:** add, edit, delete and search.
- **Login** with a JWT token. The token goes with every request, and when it expires (401) the user is sent back to login.
- On phones there is a bottom menu, and the bookings table turns into cards.

## Stack

React 19, React Router, Vite, Tailwind CSS 4, Axios, lucide-react icons, react-hot-toast.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173, /api goes to the local backend
npm run build
npm run lint
```

The API address is in `VITE_API_URL` (`.env.production`). If it is not set, the build points to the backend on Render.
