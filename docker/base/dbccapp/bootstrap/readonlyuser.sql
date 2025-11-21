-- Connect to the database
\c postgres;

-- Create the read-only user
CREATE USER readonly_user WITH PASSWORD '@roHelikaR1db';

-- Grant CONNECT and USAGE permissions
GRANT CONNECT ON DATABASE postgres TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;

-- Grant SELECT permission on existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Ensure future tables remain read-only
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO readonly_user;