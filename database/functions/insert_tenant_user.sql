-- Function to insert user into tenant schema
CREATE OR REPLACE FUNCTION insert_tenant_user(
  schema_name TEXT,
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  tenant_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format(
    'INSERT INTO %I.users (id, email, role, tenant_id) VALUES ($1, $2, $3, $4)',
    schema_name
  ) USING user_id, user_email, user_role, tenant_id;
END;
$$;