-- TrafficLens Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    site_key VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table (raw tracking data)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_key VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    session_id VARCHAR(100),
    visitor_id VARCHAR(100),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    custom_event_name VARCHAR(255),
    custom_event_data JSONB,
    scroll_depth INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Page views aggregated (for fast queries)
CREATE TABLE IF NOT EXISTS page_view_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_key VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    hour INTEGER,
    page_url TEXT,
    view_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    UNIQUE(site_key, date, hour, page_url)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(100) PRIMARY KEY,
    site_key VARCHAR(100) NOT NULL,
    visitor_id VARCHAR(100),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    page_count INTEGER DEFAULT 1,
    is_bounce BOOLEAN DEFAULT true,
    entry_page TEXT,
    exit_page TEXT,
    referrer TEXT,
    country VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    site_key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100),
    date_from DATE,
    date_to DATE,
    filters JSONB,
    status VARCHAR(50) DEFAULT 'PENDING',
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_site_key ON events(site_key);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_site_key ON sessions(site_key);
CREATE INDEX IF NOT EXISTS idx_page_view_stats_site_key ON page_view_stats(site_key, date);
