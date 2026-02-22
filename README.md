# 🔍 TrafficLens — Analytics Platform

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture](#-architecture)
5. [Project Structure](#-project-structure)
6. [Database Tables](#-database-tables)
7. [API Reference](#-api-reference)
8. [Frontend Pages](#-frontend-pages)
9. [JS Tracker](#-js-tracker)
10. [Docker Services](#-docker-services)
11. [Environment Variables](#-environment-variables)

---

## 🌐 Project Overview

TrafficLens is a complete website analytics platform that lets you track visitor behavior across any website by adding a single JavaScript snippet. It provides real-time dashboards, historical analytics, geographic data, device breakdowns, campaign tracking, and exportable reports — all running on your own infrastructure.

**Why TrafficLens?**
- Self-hosted — your data stays on your servers
- Privacy-first — GDPR compliant, IP anonymization built-in
- Universal tracker — works on React, Vue, WordPress, PHP, plain HTML, anything
- No sampling — every hit is recorded
- Microservice architecture — each service scales independently

---

## ✨ Features

### 🏠 Dashboard
- Overview stats: Total Page Views, Unique Visitors, Sessions, Active Now
- Traffic trend area chart with Page Views + Visitors overlay
- Bounce rate gauge with visual progress bar
- Average session duration display
- Date range selector: 7 days / 30 days / 90 days
- % change vs previous period on every metric card
- Auto-refresh button

### 📊 Analytics (7 Tabs)
| Tab | What it shows |
|---|---|
| Overview | Traffic trend area chart with all 3 metrics overlaid |
| Top Pages | URL, views, unique visitors — ranked list with progress bars |
| Referrers | Traffic sources with bar breakdown + pie chart |
| Devices | Desktop / Mobile / Tablet split (pie + bar charts) |
| Geography | Country breakdown with percentage bars (top 20 countries) |
| UTM / Campaigns | utm_source, utm_medium, utm_campaign performance table |
| Compare | Side-by-side line chart of current vs previous period + summary cards |

### 🔴 Real-time
- Live active visitor count (visitors in last 5 minutes)
- Sparkline chart of active visitors over last 30 refreshes
- Currently active pages list with live indicators
- Recent event stream showing URL, country, device
- Auto-refreshes every 5 seconds

### 📄 Reports
- Create custom CSV reports with any date range
- Report types: Full, Overview Only, Top Pages, Referrers, Devices
- Async generation — status tracks Pending → Processing → Ready
- Download as CSV file
- Delete reports
- Auto-polls every 3 seconds until report is ready

### ⚙️ Settings
- Add unlimited websites to track
- Auto-generates a unique site key per website
- One-click copy of the tracking snippet per site
- Framework compatibility badges (React, Vue, WordPress, Shopify, PHP, etc.)
- Delete sites

### 👤 Profile & Auth
- JWT-based authentication (HS256 signed)
- Register with full name, email, password
- Password strength meter (5 levels)
- Password match indicator on register
- Update display name
- Change password with current password verification
- Auto-logout on expired token (401)

### 📜 Universal JS Tracker
- Works on ANY website regardless of tech stack
- Auto-tracks: page views, sessions, scroll depth, outbound link clicks
- SPA support via history.pushState interception (React, Vue, Next.js, Angular)
- UTM parameter auto-detection from URL
- Device, browser, OS detection via User-Agent parsing
- Session UUID via sessionStorage, visitor UUID via 1-year cookie
- Uses sendBeacon API for reliable session_end events on page unload
- Custom event API
- User identification API
- GDPR-compliant IP anonymization (last octet set to 0)
- Transparent 1×1 GIF pixel fallback for GET-based tracking

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Primary backend language |
| Spring Boot | 3.2.0 | Microservice framework |
| Spring Cloud Gateway | 2023.0.0 | API Gateway & routing |
| Spring Security | 3.2.0 | Authentication & authorization |
| Spring Data JPA | 3.2.0 | ORM & database access |
| Hibernate | 6.x | JPA implementation |
| JJWT | 0.11.5 | JWT generation & validation |
| Maven | 3.9 | Build & dependency management |
| Lombok | Latest | Boilerplate reduction |
| UserAgentUtils | 1.21 | Browser/OS/device detection |
| OpenCSV | 5.8 | CSV report generation |
| WebFlux | 3.2.0 | Reactive HTTP client (inter-service calls) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| Vite | 5.0 | Build tool & dev server |
| React Router | 6.21 | Client-side SPA routing |
| TailwindCSS | 3.4 | Utility-first CSS framework |
| Recharts | 2.10 | Charts (area, bar, line, pie) |
| Axios | 1.6 | HTTP client with interceptors |
| date-fns | 3.1 | Date formatting & calculations |
| lucide-react | 0.303 | Icon library |
| clsx | 2.1 | Conditional class name utility |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerization of all services |
| Docker Compose | Multi-service orchestration |
| PostgreSQL 15 | Primary relational database |
| Nginx (Alpine) | Serves React app + reverse proxy to API |

---

## 🏗 Architecture

```
Browser / Mobile
      │
      ▼
┌─────────────────┐
│   Frontend      │  React + Vite → Built → Served by Nginx (Port 3000)
│   (Nginx)       │  All /api/* requests proxied to API Gateway
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│            API Gateway (Port 8080)      │
│  • JWT validation on protected routes   │
│  • Injects X-User-Id, X-User-Email      │
│  • Routes to correct microservice       │
└────┬──────┬──────┬──────┬──────────────┘
     │      │      │      │
     ▼      ▼      ▼      ▼
  Auth  Ingest  Analytics  Report
  8081   8082     8083     8084
     │      │      │      │
     └──────┴──────┴──────┘
                │
                ▼
     ┌──────────────────┐
     │   PostgreSQL 15  │
     │   Port 5432      │
     └──────────────────┘
```

### Request Flow
1. User opens `http://localhost:3000` → Nginx serves React SPA
2. React calls `/api/*` → Nginx proxies to API Gateway (port 8080)
3. Gateway validates JWT → Injects user headers → Routes to microservice
4. Microservice queries PostgreSQL → Returns JSON
5. JS snippet on tracked websites POSTs events to `/api/ingest/event` directly

---

## 📁 Project Structure

```
trafficlens/
├── docker-compose.yml                    ← Starts all 7 services
├── init.sql                              ← DB schema (runs on first start)
├── README.md
│
├── backend/
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/trafficlens/gateway/
│   │       │   ├── ApiGatewayApplication.java
│   │       │   └── filter/JwtAuthGatewayFilter.java
│   │       └── resources/application.yml          ← Route definitions
│   │
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/trafficlens/auth/
│   │       ├── AuthServiceApplication.java
│   │       ├── config/SecurityConfig.java
│   │       ├── controller/AuthController.java
│   │       ├── dto/AuthDtos.java
│   │       ├── model/User.java
│   │       ├── repository/UserRepository.java
│   │       ├── security/JwtUtils.java
│   │       ├── security/JwtAuthFilter.java
│   │       └── service/AuthService.java
│   │
│   ├── ingestion-service/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/trafficlens/ingestion/
│   │       ├── controller/IngestionController.java
│   │       ├── dto/EventRequest.java
│   │       ├── model/Event.java
│   │       ├── model/Site.java
│   │       ├── repository/EventRepository.java
│   │       ├── repository/SiteRepository.java
│   │       └── service/IngestionService.java
│   │
│   ├── analytics-service/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/trafficlens/analytics/
│   │       ├── config/SecurityConfig.java
│   │       ├── controller/AnalyticsController.java
│   │       ├── dto/AnalyticsDtos.java              ← All response DTOs
│   │       ├── model/Event.java
│   │       ├── model/Site.java
│   │       ├── repository/AnalyticsRepository.java ← All native SQL queries
│   │       ├── repository/SiteRepository.java
│   │       └── service/AnalyticsService.java
│   │
│   └── report-service/
│       ├── Dockerfile
│       ├── pom.xml
│       └── src/main/java/com/trafficlens/report/
│           ├── config/AppConfig.java
│           ├── controller/ReportController.java
│           ├── model/Report.java
│           ├── repository/ReportRepository.java
│           └── service/ReportService.java
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                     ← Router + protected routes
│       ├── index.css                   ← Tailwind + global styles
│       ├── context/AuthContext.jsx     ← Global auth state
│       ├── utils/api.js                ← All API calls
│       ├── components/
│       │   ├── Layout.jsx              ← Sidebar + mobile hamburger
│       │   ├── StatCard.jsx            ← Metric card with % change
│       │   └── SiteSelector.jsx        ← Site switcher dropdown
│       └── pages/
│           ├── Landing.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── Analytics.jsx
│           ├── Realtime.jsx
│           ├── Reports.jsx
│           ├── Settings.jsx
│           └── Profile.jsx
│
└── tracker/
    └── tracker.js                      ← Universal JS tracking snippet
```

---

## 🗄 Database Tables

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| email | VARCHAR(255) UNIQUE NOT NULL | Login identifier |
| password | VARCHAR(255) NOT NULL | BCrypt hashed |
| full_name | VARCHAR(255) NOT NULL | Display name |
| role | VARCHAR(50) | Default: USER |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-set |

---

### `sites`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| user_id | UUID FK → users | Owner |
| name | VARCHAR(255) | e.g. "My Blog" |
| domain | VARCHAR(255) | e.g. "myblog.com" |
| site_key | VARCHAR(100) UNIQUE | Auto-generated tracking key |
| created_at | TIMESTAMP | Auto-set |

---

### `events` (core data table)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| site_key | VARCHAR(100) NOT NULL | Which site (indexed) |
| event_type | VARCHAR(100) NOT NULL | pageview, click, scroll, custom, session_end |
| url | TEXT | Full page URL |
| referrer | TEXT | Traffic source hostname |
| user_agent | TEXT | Raw browser UA string |
| ip_address | VARCHAR(45) | Anonymized (last octet = 0) |
| country | VARCHAR(100) | From GeoIP |
| city | VARCHAR(100) | From GeoIP |
| device_type | VARCHAR(50) | desktop / mobile / tablet |
| browser | VARCHAR(100) | Chrome, Firefox, Safari, etc. |
| os | VARCHAR(100) | Windows, macOS, Android, iOS, etc. |
| session_id | VARCHAR(100) | Groups page views into sessions |
| visitor_id | VARCHAR(100) | Persistent visitor identifier (1yr cookie) |
| utm_source | VARCHAR(255) | UTM source |
| utm_medium | VARCHAR(255) | UTM medium |
| utm_campaign | VARCHAR(255) | UTM campaign |
| custom_event_name | VARCHAR(255) | Custom event name |
| custom_event_data | JSONB | Arbitrary event data |
| scroll_depth | INTEGER | Scroll % milestone (25/50/75/90) |
| duration_seconds | INTEGER | Time on page |
| created_at | TIMESTAMP | When received (indexed) |

**Indexes:** `idx_events_site_key`, `idx_events_created_at`, `idx_events_session_id`

---

### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(100) PK | Session UUID |
| site_key | VARCHAR(100) | Which site (indexed) |
| visitor_id | VARCHAR(100) | Persistent visitor |
| start_time | TIMESTAMP | Session start |
| end_time | TIMESTAMP | Session end |
| duration_seconds | INTEGER | Total time |
| page_count | INTEGER | Pages viewed |
| is_bounce | BOOLEAN | True if only 1 page |
| entry_page | TEXT | First page |
| exit_page | TEXT | Last page |
| referrer | TEXT | Traffic source |
| country | VARCHAR(100) | Visitor country |
| device_type | VARCHAR(50) | Device type |
| browser | VARCHAR(100) | Browser |
| os | VARCHAR(100) | OS |
| utm_source | VARCHAR(255) | Campaign source |
| utm_medium | VARCHAR(255) | Campaign medium |
| utm_campaign | VARCHAR(255) | Campaign name |

---

### `page_view_stats`
Pre-aggregated stats for fast dashboard queries.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| site_key | VARCHAR(100) | Which site |
| date | DATE | The date |
| hour | INTEGER | Hour (0–23) |
| page_url | TEXT | The page |
| view_count | INTEGER | Total views |
| unique_visitors | INTEGER | Distinct visitors |
| bounce_count | INTEGER | Bounced sessions |
| total_duration | INTEGER | Sum of durations in seconds |

**Unique:** (site_key, date, hour, page_url)

---

### `reports`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| user_id | UUID FK → users | Who requested |
| site_key | VARCHAR(100) | Which site |
| name | VARCHAR(255) | Report display name |
| report_type | VARCHAR(100) | full, overview, pages, referrers, devices |
| date_from | DATE | Start of report range |
| date_to | DATE | End of report range |
| filters | JSONB | Optional filter config |
| status | VARCHAR(50) | PENDING → PROCESSING → READY / FAILED |
| file_path | TEXT | Server path to generated CSV |
| created_at | TIMESTAMP | When requested |

---

## 📡 API Reference

**Base URL:** `http://localhost:8080`
**Auth:** `Authorization: Bearer <jwt_token>` (on all 🔒 endpoints)

---

### Auth Service `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | Login, get JWT |
| GET | /api/auth/profile | 🔒 | Get current user |
| PUT | /api/auth/profile | 🔒 | Update display name |
| POST | /api/auth/change-password | 🔒 | Change password |
| POST | /api/auth/validate | Public | Validate a JWT |
| GET | /api/auth/health | Public | Service health check |

**POST /api/auth/register — Request:**
```json
{ "fullName": "John Doe", "email": "john@example.com", "password": "secret123" }
```
**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "user": { "id": "uuid", "email": "john@example.com", "fullName": "John Doe", "role": "USER" }
}
```

---

### Ingestion Service `/api/ingest`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/ingest/event | Public | Receive tracking event |
| GET | /api/ingest/collect | Public | Pixel tracking fallback |
| GET | /api/ingest/health | Public | Health check |

**POST /api/ingest/event — Request:**
```json
{
  "siteKey": "myblog_abc12345",
  "eventType": "pageview",
  "url": "https://myblog.com/posts/hello",
  "referrer": "google.com",
  "sessionId": "uuid",
  "visitorId": "uuid",
  "utmSource": "newsletter",
  "utmMedium": "email",
  "utmCampaign": "june2024",
  "scrollDepth": 75,
  "durationSeconds": 120,
  "screenWidth": 1440,
  "screenHeight": 900,
  "language": "en-US",
  "timezone": "America/New_York"
}
```
**Response:** `{ "status": "ok" }`

---

### Analytics Service `/api/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/analytics/sites | 🔒 | Add new site |
| GET | /api/analytics/sites | 🔒 | List my sites |
| DELETE | /api/analytics/sites/{id} | 🔒 | Delete site |
| GET | /api/analytics/{siteKey}/overview | 🔒 | Summary stats |
| GET | /api/analytics/{siteKey}/stats | 🔒 | Full stats (all at once) |
| GET | /api/analytics/{siteKey}/timeseries | 🔒 | Time series data |
| GET | /api/analytics/{siteKey}/pages | 🔒 | Top pages |
| GET | /api/analytics/{siteKey}/referrers | 🔒 | Traffic sources |
| GET | /api/analytics/{siteKey}/devices | 🔒 | Device breakdown |
| GET | /api/analytics/{siteKey}/browsers | 🔒 | Browser breakdown |
| GET | /api/analytics/{siteKey}/countries | 🔒 | Geographic breakdown |
| GET | /api/analytics/{siteKey}/utm | 🔒 | UTM campaign stats |
| GET | /api/analytics/{siteKey}/realtime | 🔒 | Live visitors |
| GET | /api/analytics/{siteKey}/compare | 🔒 | Period comparison |
| GET | /api/analytics/health | Public | Health check |

**Query Params (most endpoints):**
- `?days=7` — Time range (7, 30, 90)
- `?granularity=day` — Chart granularity (hour, day, week, month)
- `?compareTo=previous_period` — Compare: previous_period or previous_year

**GET /api/analytics/{siteKey}/overview — Response:**
```json
{
  "totalPageViews": 15420,
  "uniqueVisitors": 3201,
  "totalSessions": 4850,
  "bounceRate": 44.2,
  "avgSessionDuration": 127.5,
  "activeNow": 12,
  "pageViewsChange": 12.5,
  "visitorsChange": -3.2,
  "sessionsChange": 8.1,
  "bounceRateChange": -1.5
}
```

**GET /api/analytics/{siteKey}/timeseries — Response:**
```json
[
  { "date": "2024-01-01", "pageViews": 240, "visitors": 180, "sessions": 210, "bounceRate": 42.0 },
  { "date": "2024-01-02", "pageViews": 310, "visitors": 230, "sessions": 270, "bounceRate": 39.5 }
]
```

**GET /api/analytics/{siteKey}/realtime — Response:**
```json
{
  "activeNow": 14,
  "activePages": ["/", "/blog/post-1", "/about"],
  "recentEvents": [
    { "url": "/blog", "country": "United States", "device": "desktop", "timestamp": "2024-01-01T12:00:00" }
  ]
}
```

---

### Report Service `/api/reports`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/reports | 🔒 | Create report (async) |
| GET | /api/reports | 🔒 | List my reports |
| GET | /api/reports/{id}/download | 🔒 | Download CSV |
| DELETE | /api/reports/{id} | 🔒 | Delete report |
| GET | /api/reports/health | Public | Health check |

**POST /api/reports — Request:**
```json
{
  "name": "Weekly Traffic Report",
  "siteKey": "myblog_abc12345",
  "reportType": "full",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-07"
}
```
**Response:**
```json
{
  "id": "uuid",
  "name": "Weekly Traffic Report",
  "siteKey": "myblog_abc12345",
  "reportType": "full",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-07",
  "status": "PENDING",
  "createdAt": "2024-01-08T10:00:00"
}
```

---

## 🖥 Frontend Pages

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing / Marketing page | No |
| `/login` | Login form | No (redirects to dashboard if logged in) |
| `/register` | Registration form | No |
| `/dashboard` | Main overview with charts | Yes |
| `/analytics` | Deep analytics (7 tabs) | Yes |
| `/realtime` | Live visitor tracking | Yes |
| `/reports` | Report management | Yes |
| `/settings` | Site management + snippets | Yes |
| `/profile` | Account settings | Yes |

---

## 📜 JS Tracker

### Install on any website

```html
<script>
  window.TrafficLens = {
    siteKey: "YOUR_SITE_KEY",
    apiUrl: "http://localhost:8080"
  };
  var s = document.createElement('script');
  s.src = window.TrafficLens.apiUrl + '/tracker.js';
  s.async = true;
  document.head.appendChild(s);
</script>
```

### Auto-tracked events

| Event | Trigger |
|---|---|
| `pageview` | Every page load + SPA navigation |
| `scroll` | 25%, 50%, 75%, 90% scroll milestones |
| `click` | Outbound link clicks |
| `session_end` | Page unload (sendBeacon) |
| `visibility_hidden` | Tab switch / minimize |

### Custom Events API

```javascript
TrafficLens.track('signup')
TrafficLens.track('purchase', { plan: 'pro', amount: 99.99 })
TrafficLens.identify('user_id_123')
```

---

## 🐳 Docker Services

| Service | Image | Port | Depends On |
|---|---|---|---|
| postgres | postgres:15-alpine | 5432 | — |
| auth-service | Java 17 build | 8081 | postgres |
| ingestion-service | Java 17 build | 8082 | postgres |
| analytics-service | Java 17 build | 8083 | postgres |
| report-service | Java 17 build | 8084 | postgres |
| api-gateway | Java 17 build | 8080 | all services |
| frontend | Nginx + React build | 3000 | api-gateway |

All on `trafficlens-network` bridge. Services call each other by name.

---

## 🔧 Environment Variables

| Variable | Service | Default | Notes |
|---|---|---|---|
| JWT_SECRET | Gateway, Auth | trafficlens-super-secret-jwt-key-2024-production | **Change in production!** |
| JWT_EXPIRATION | Auth | 86400000 | 24 hours in ms |
| SPRING_DATASOURCE_URL | All backend | jdbc:postgresql://postgres:5432/trafficlens | |
| SPRING_DATASOURCE_USERNAME | All backend | trafficlens | |
| SPRING_DATASOURCE_PASSWORD | All backend | trafficlens123 | |
| AUTH_SERVICE_URL | Gateway | http://auth-service:8081 | |
| INGESTION_SERVICE_URL | Gateway | http://ingestion-service:8082 | |
| ANALYTICS_SERVICE_URL | Gateway | http://analytics-service:8083 | |
| REPORT_SERVICE_URL | Gateway | http://report-service:8084 | |
| ANALYTICS_SERVICE_URL | Report | http://analytics-service:8083 | Inter-service call |
| POSTGRES_USER | PostgreSQL | trafficlens | |
| POSTGRES_PASSWORD | PostgreSQL | trafficlens123 | |
| POSTGRES_DB | PostgreSQL | trafficlens | |
