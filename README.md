# 🚑 MedLinka — Emergency Medical Response System

> A production-ready, mobile-first Progressive Web Application (PWA) for real-time emergency medical coordination in Uganda.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Test Credentials](#test-credentials)
- [API Reference](#api-reference)
- [Folder Structure](#folder-structure)
- [Deployment](#deployment)

---

## Overview

MedLinka enables:
- 🆘 **Citizens** to request emergency medical help with one tap
- 🚑 **Ambulances** to be automatically dispatched using the Haversine nearest-first algorithm
- 📍 **Real-time GPS tracking** of ambulances via Socket.io
- 🏥 **Hospitals** to receive advance patient notifications with ETA
- 📊 **Admins** to monitor fleet, response times, and system analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| PWA | vite-plugin-pwa + Workbox |
| State | Zustand + Axios |
| Maps | Leaflet + OpenStreetMap |
| Backend | Node.js + Express.js |
| Realtime | Socket.io |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh rotation) |
| Security | Helmet, CORS, Rate limiting, Zod |
| Testing | Jest + Supertest (backend) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally
- Git

### 1. Clone & Setup
```bash
git clone <repo-url>
cd MedLinka
```

### 2. Start the Backend
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```
API runs on **http://localhost:5000**

### 3. Start the Frontend
```bash
cd client
npm install
npm run dev
```
App runs on **http://localhost:5173**

### 4. (Optional) Docker Compose
```bash
docker-compose up --build
```

---

## Test Credentials

| Role | Phone | Password |
|---|---|---|
| Admin | +256700000001 | Admin@1234 |
| Hospital Admin | +256700000002 | Hospital@1234 |
| Driver 1 | +256700000010 | Driver@1234 |
| Driver 2 | +256700000011 | Driver@1234 |
| Citizen | +256700000020 | Citizen@1234 |

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create citizen account |
| POST | `/api/auth/login` | Public | Login, get JWT |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/me` | Bearer | Get current user |
| POST | `/api/auth/logout` | Bearer | Revoke refresh token |

### SOS
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/sos` | citizen | Create SOS request |
| GET | `/api/sos` | Bearer | List requests (role-filtered) |
| GET | `/api/sos/:id` | Bearer | Get request details |
| PATCH | `/api/sos/:id/status` | driver/admin | Update status |
| PATCH | `/api/sos/:id/cancel` | citizen | Cancel request |

### Ambulances
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/ambulances` | Bearer | List fleet |
| POST | `/api/ambulances` | admin | Add ambulance |
| PATCH | `/api/ambulances/:id/status` | admin | Update status |
| PATCH | `/api/ambulances/:id/location` | driver | Push GPS coordinates |

### Hospitals
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/hospitals` | Bearer | List hospitals |
| POST | `/api/hospitals` | admin | Create hospital |
| GET | `/api/hospitals/:id/incoming` | hospital_admin | Incoming patients |

### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reports/stats` | admin | System stats |
| GET | `/api/reports/response-time` | admin | Avg response time |
| GET | `/api/reports/requests-per-day` | admin | 30-day trend |
| GET | `/api/reports/ambulance-utilisation` | admin | Fleet usage |

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `citizen:trackRequest` | `requestId` | Join tracking room |
| `driver:location` | `{ambulanceId, lat, lng, requestId}` | Stream GPS |
| `driver:joinRequest` | `requestId` | Join dispatch room |
| `hospital:join` | `hospitalId` | Join hospital room |

### Server → Client
| Event | Description |
|---|---|
| `sos:assigned` | Ambulance dispatched — sent to citizen |
| `sos:statusUpdate` | Status change broadcast |
| `ambulance:locationUpdate` | Live GPS update for tracking |
| `driver:newRequest` | New assignment — sent to driver |
| `hospital:incoming` | Incoming patient alert |

---

## Deployment

### Backend (Railway / Render)
1. Connect GitHub repo
2. Set root directory to `server/`
3. Set environment variables from `server/.env`
4. Add `DATABASE_URL` pointing to your hosted PostgreSQL

### Frontend (Vercel)
1. Connect GitHub repo
2. Set root directory to `client/`
3. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your backend URL

### Database (Supabase / Neon)
1. Create a new project
2. Copy the connection string to `DATABASE_URL`
3. Run `npx prisma migrate deploy` on first deploy

---

## Running Tests

```bash
# Backend unit + integration tests
cd server
npm test

# With coverage report
npm test -- --coverage
```

---

## Security Features
- ✅ JWT with 15-min access + 7-day refresh rotation
- ✅ bcrypt password hashing (12 rounds)
- ✅ Helmet security headers + CSP
- ✅ CORS restricted to client origin
- ✅ Rate limiting (global + auth + SOS specific)
- ✅ Zod + express-validator input validation
- ✅ HSTS preload header for HTTPS enforcement
- ✅ Trust proxy for cloud deployment

---

*Built for Entebbe, Uganda — scalable to any city.*
