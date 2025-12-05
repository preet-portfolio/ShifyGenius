-- ShiftGenius Database Schema for Shopify Integration
-- PostgreSQL 14+

-- Table: shops
-- Stores Shopify shop information and OAuth tokens
CREATE TABLE IF NOT EXISTS shops (
  id SERIAL PRIMARY KEY,
  shop VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Shop metadata (from Shopify API)
  shop_owner VARCHAR(255),
  email VARCHAR(255),
  domain VARCHAR(255),
  province VARCHAR(100),
  country VARCHAR(100),
  address1 TEXT,
  city VARCHAR(100),
  zip VARCHAR(20),
  phone VARCHAR(50),
  currency VARCHAR(10),
  timezone VARCHAR(100),

  -- App status
  is_active BOOLEAN DEFAULT true,
  plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  trial_ends_at TIMESTAMP,
  subscription_id VARCHAR(255)
);

-- Table: employees (synced from ShiftGenius frontend)
-- Stores employee data for scheduling
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  external_id VARCHAR(255), -- ID from frontend localStorage or Shopify staff
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(100) DEFAULT 'staff',
  hourly_rate DECIMAL(10, 2),

  -- Overtime settings
  overtime_threshold INTEGER DEFAULT 40,
  max_hours_per_week INTEGER DEFAULT 50,

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(shop_id, external_id)
);

-- Table: schedules
-- Stores shift schedules
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,

  -- Schedule details
  week_start_date DATE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  start_datetime TIMESTAMP, -- ISO8601 for production
  end_datetime TIMESTAMP,

  -- Shift metadata
  role VARCHAR(100),
  notes TEXT,
  is_published BOOLEAN DEFAULT false,

  -- Compliance tracking
  hours_scheduled DECIMAL(5, 2),
  is_overtime BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: compliance_violations
-- Track AI-detected compliance issues
CREATE TABLE IF NOT EXISTS compliance_violations (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES employees(id),

  -- Violation details
  violation_type VARCHAR(50) NOT NULL, -- OVERTIME_RISK, UNDERSTAFFED, etc.
  severity VARCHAR(20) NOT NULL, -- HIGH, MEDIUM, LOW
  description TEXT,
  suggested_action TEXT,

  -- Status
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: billing_events
-- Track subscription and billing
CREATE TABLE IF NOT EXISTS billing_events (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,

  event_type VARCHAR(50) NOT NULL, -- subscription_started, payment_succeeded, etc.
  plan VARCHAR(50),
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',

  -- Stripe/Shopify Billing API data
  external_id VARCHAR(255), -- Stripe charge ID or Shopify billing ID
  status VARCHAR(50),
  metadata JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: webhooks_log
-- Log all webhook events for debugging
CREATE TABLE IF NOT EXISTS webhooks_log (
  id SERIAL PRIMARY KEY,
  shop VARCHAR(255),
  topic VARCHAR(100) NOT NULL,
  payload JSONB,
  headers JSONB,
  status VARCHAR(50) DEFAULT 'received',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_shops_shop ON shops(shop);
CREATE INDEX idx_employees_shop_id ON employees(shop_id);
CREATE INDEX idx_schedules_shop_id ON schedules(shop_id);
CREATE INDEX idx_schedules_week_start ON schedules(week_start_date);
CREATE INDEX idx_compliance_violations_shop_id ON compliance_violations(shop_id);
CREATE INDEX idx_compliance_violations_severity ON compliance_violations(severity);
CREATE INDEX idx_billing_events_shop_id ON billing_events(shop_id);
CREATE INDEX idx_webhooks_log_shop ON webhooks_log(shop);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
