# 🔍 TrafficLens

A full-featured Google Analytics competitor built with Java microservices + React.

---

## 🏗️ Architecture

| Service | Port | Description |
|---|---|---|
| API Gateway | 8080 | Single entry point, JWT validation, routing |
| Auth Service | 8081 | Register, login, JWT, profile management |
| Ingestion Service | 8082 | Receives tracking events from JS snippet |
| Analytics Service | 8083 | Aggregates metrics, all analytics queries |
| Report Service | 8084 | Generate & download CSV reports |
| Frontend (React) | 3000 | Full dashboard UI |
| PostgreSQL | 5432 | Main database |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run everything with one command

```bash
git clone <repo>
cd trafficlens
docker-compose up --build
```

Then open: **http://localhost:3000**

---

## 📊 Features

### Dashboard
- Overview stats: page views, unique visitors, sessions, active now
- Traffic trend chart (area chart) with date range selector
- Bounce rate & avg session duration

### Analytics
- Traffic over time (area chart with overlay)
- Top pages with views & unique visitors
- Referrer sources with distribution pie chart
- Device breakdown (desktop/mobile/tablet)
- Browser breakdown
- Geographic breakdown by country
- UTM / Campaign performance table
- **Period comparison** (current vs previous period / previous year)

### Real-time
- Live active visitor count
- Active visitor sparkline (last 30 data points)
- Currently active pages
- Recent events stream (auto-refreshes every 5s)

### Reports
- Generate CSV reports (full, overview, pages, referrers, devices)
- Custom date range selection
- Download reports
- Report status tracking (Pending → Processing → Ready)

### Settings
- Add/manage multiple websites
- Get tracking snippet per site (one click copy)
- Works with any tech stack

### Profile
- Update display name
- Change password

---

## 📜 Universal JS Tracker

The tracker works on **any** website — React, Vue, Angular, Next.js, WordPress, Shopify, PHP, plain HTML.

Auto-tracks:
- ✅ Page views (including SPA navigation via pushState)
- ✅ Session duration
- ✅ Scroll depth (25%, 50%, 75%, 90% milestones)
- ✅ Outbound link clicks
- ✅ Device, browser, OS detection
- ✅ UTM parameters
- ✅ Referrer source
- ✅ Entry/exit pages

Custom events API:
```javascript
// Track custom events from any framework
TrafficLens.track('signup', { plan: 'pro' })
TrafficLens.track('purchase', { amount: 99.99 })

// Identify logged-in users
TrafficLens.identify('user_123')
```

### Snippet to paste into your website:
```html
<script>
  window.TrafficLens = {
    siteKey: "YOUR_SITE_KEY",
    apiUrl: "http://localhost:8080"
  };
  var s = document.createElement('script');
  s.src = '/tracker.js';
  s.async = true;
  document.head.appendChild(s);
</script>
```

---

## 🐳 Docker Services

All services start automatically with `docker-compose up`:

```
trafficlens/
├── docker-compose.yml        ← Start everything here
├── init.sql                  ← DB schema (auto-applied)
├── backend/
│   ├── api-gateway/          ← Spring Cloud Gateway
│   ├── auth-service/         ← Spring Boot + JWT
│   ├── ingestion-service/    ← Spring Boot
│   ├── analytics-service/    ← Spring Boot
│   └── report-service/       ← Spring Boot
├── frontend/                 ← React + Vite + TailwindCSS
└── tracker/
    └── tracker.js            ← Universal JS snippet
```

---

## 🔐 Authentication

JWT-based authentication. Token stored in localStorage and sent as `Authorization: Bearer <token>` header.

---

## 🛠️ Development

### Run individually:

**Backend (any service):**
```bash
cd backend/auth-service
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database only:**
```bash
docker-compose up postgres
```

---

## 🔧 Environment Variables

All configurable via docker-compose.yml or environment:

| Variable | Default | Description |
|---|---|---|
| JWT_SECRET | trafficlens-super-secret... | JWT signing key |
| JWT_EXPIRATION | 86400000 | Token TTL in ms (24h) |
| SPRING_DATASOURCE_URL | jdbc:postgresql://postgres:5432/trafficlens | DB URL |
| ANALYTICS_SERVICE_URL | http://analytics-service:8083 | Internal service URL |
