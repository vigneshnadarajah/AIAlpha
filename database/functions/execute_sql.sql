-- Function to execute arbitrary SQL (for table creation)
CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;