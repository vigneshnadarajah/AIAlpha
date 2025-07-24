-- Function to create a new tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema(schema_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  
  -- Grant usage on schema to authenticated users
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', schema_name);
  
  -- Grant create privileges to service role
  EXECUTE format('GRANT CREATE ON SCHEMA %I TO service_role', schema_name);
END;
$$;