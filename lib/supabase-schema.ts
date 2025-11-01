// This file contains the SQL query to reset and recreate all tables in Supabase
// You can run this query in the Supabase SQL Editor

export const resetAndCreateTablesQuery = `
-- Drop all tables in the public schema
do $$ 
declare
  r record;
begin
  for r in (select tablename from pg_tables where schemaname = 'public') loop
    execute 'drop table if exists ' || quote_ident(r.tablename) || ' cascade';
  end loop;
end $$;

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  location TEXT,
  area TEXT,
  completed TEXT,
  images TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Row Level Security (RLS) policies
-- Enable RLS on tables
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_messages
CREATE POLICY "Public users can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for projects
CREATE POLICY "Public users can read projects"
  ON public.projects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (true);
`
