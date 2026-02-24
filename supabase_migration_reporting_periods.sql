-- Updated Assessments Table with Reporting Period Support
-- This migration adds support for tracking reporting frequency and periods

-- 1. Add new columns to assessments table
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS reporting_frequency text DEFAULT 'biannual', -- 'biannual' or 'quarterly'
ADD COLUMN IF NOT EXISTS reporting_year integer,
ADD COLUMN IF NOT EXISTS reporting_period text, -- For biannual: 'H1', 'H2'; For quarterly: 'Q1', 'Q2', 'Q3', 'Q4'
ADD COLUMN IF NOT EXISTS period_start_date date,
ADD COLUMN IF NOT EXISTS period_end_date date;

-- 2. Add a unique constraint to prevent duplicate submissions for the same period
-- This ensures each district can only submit one assessment per reporting period
ALTER TABLE assessments 
ADD CONSTRAINT unique_district_period 
UNIQUE (district, reporting_year, reporting_period, reporting_frequency);

-- 3. Create an index for faster queries by reporting period
CREATE INDEX IF NOT EXISTS idx_assessments_reporting_period 
ON assessments(reporting_year, reporting_period, reporting_frequency);

-- 4. Add a comment to document the schema
COMMENT ON COLUMN assessments.reporting_frequency IS 'Frequency of reporting: biannual (twice a year) or quarterly (four times a year)';
COMMENT ON COLUMN assessments.reporting_period IS 'For biannual: H1 (Jan-Jun) or H2 (Jul-Dec). For quarterly: Q1, Q2, Q3, or Q4';
