import { createServerSupabaseClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

// SQL to create the exec_sql function
const createExecSqlFunctionQuery = `
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
`

// SQL to create the image_mappings table
const createImageMappingsTableQuery = `
-- Drop the table if it exists to ensure a clean slate
DROP TABLE IF EXISTS public.image_mappings;

-- Create the table with the correct column definitions
CREATE TABLE public.image_mappings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  image_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the image_mappings table
ALTER TABLE public.image_mappings ENABLE ROW LEVEL SECURITY;
`

// SQL to create policies - separate from table creation to handle existing policies
const createPoliciesQuery = `
-- First, drop existing policies if they exist to avoid errors
DO $$
BEGIN
    -- Drop the select policy if it exists
    BEGIN
        DROP POLICY IF EXISTS "Public users can read image mappings" ON public.image_mappings;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or other error, continue
    END;
    
    -- Drop the update policy if it exists
    BEGIN
        DROP POLICY IF EXISTS "Authenticated users can update image mappings" ON public.image_mappings;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or other error, continue
    END;
    
    -- Drop the insert policy if it exists
    BEGIN
        DROP POLICY IF EXISTS "Authenticated users can insert image mappings" ON public.image_mappings;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or other error, continue
    END;
END $$;

-- Now create the policies
-- Public can read image mappings
CREATE POLICY "Public users can read image mappings"
  ON public.image_mappings
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can update image mappings
CREATE POLICY "Authenticated users can update image mappings"
  ON public.image_mappings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can insert image mappings
CREATE POLICY "Authenticated users can insert image mappings"
  ON public.image_mappings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
`

// Function to create the exec_sql function in Supabase
export async function createExecSqlFunction() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      throw new Error("Failed to create Supabase client")
    }

    console.log("Creating exec_sql function...")

    // Try to execute the SQL to create the function
    let result = await supabase.rpc("exec_sql", {
      sql: createExecSqlFunctionQuery,
    })

    // Check if the exec_sql function doesn't exist yet
    if (result.error && result.error.message.includes("function exec_sql(text) does not exist")) {
      console.log("exec_sql function doesn't exist yet, trying direct SQL execution")

      // Try to create the function using service role client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase credentials")
      }

      const adminClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      // Execute the SQL directly
      const { error: directError } = await adminClient
        .from("_exec_sql_direct")
        .select("*")
        .limit(1)
        .then(() => ({ error: null }))
        .catch(async () => {
          // If the table doesn't exist, try executing the SQL directly
          return adminClient.auth.admin.executeRaw(createExecSqlFunctionQuery).catch((err) => ({ error: err }))
        })

      if (directError) {
        console.error("Direct SQL execution failed:", directError)
        throw directError
      }

      // Try again with the newly created function
      result = await supabase.rpc("exec_sql", {
        sql: createExecSqlFunctionQuery,
      })
    }

    if (result.error) {
      console.error("Error creating exec_sql function:", result.error)
      throw result.error
    }

    console.log("exec_sql function created successfully, now creating image_mappings table...")

    // Now create the image_mappings table
    const tableResult = await supabase.rpc("exec_sql", {
      sql: createImageMappingsTableQuery,
    })

    if (tableResult.error) {
      console.error("Error creating image_mappings table:", tableResult.error)
      throw tableResult.error
    }

    console.log("image_mappings table created successfully, now creating policies...")

    // Create the policies
    const policiesResult = await supabase.rpc("exec_sql", {
      sql: createPoliciesQuery,
    })

    if (policiesResult.error) {
      console.error("Error creating policies:", policiesResult.error)
      throw policiesResult.error
    }

    console.log("Policies created successfully")

    return { success: true, message: "exec_sql function, image_mappings table, and policies created successfully" }
  } catch (error) {
    console.error("Error creating exec_sql function or image_mappings table:", error)
    return { success: false, message: "Failed to create exec_sql function or image_mappings table", error }
  }
}
