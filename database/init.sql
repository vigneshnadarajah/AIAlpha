-- AIAlpha Database Initialization Script

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tenants table in public schema
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  schema_name VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create correction records table in public schema (for audit trail)
CREATE TABLE IF NOT EXISTS public.correction_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  dataset_table VARCHAR(255) NOT NULL,
  row_identifier JSONB NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  original_value TEXT,
  corrected_value TEXT,
  corrected_by UUID NOT NULL,
  correction_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_schema_name ON public.tenants(schema_name);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON public.tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_correction_records_tenant ON public.correction_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_correction_records_applied ON public.correction_records(applied_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON public.tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security policies
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_records ENABLE ROW LEVEL SECURITY;

-- Policies for tenants table
CREATE POLICY "Tenants are viewable by authenticated users" ON public.tenants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage tenants" ON public.tenants
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for correction_records table  
CREATE POLICY "Users can view their tenant's correction records" ON public.correction_records
  FOR SELECT USING (
    tenant_id IN (
      SELECT t.id FROM public.tenants t 
      WHERE t.schema_name = (auth.jwt() ->> 'app_metadata')::jsonb ->> 'tenant_schema'
    )
  );

CREATE POLICY "Service role can manage correction records" ON public.correction_records
  FOR ALL USING (auth.role() = 'service_role');