import { supabase } from "./supabase"

export async function setupSEOTables() {
  try {
    // Create page_seo table
    const { error: pageSeoError } = await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS page_seo (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          path TEXT NOT NULL UNIQUE,
          title TEXT,
          description TEXT,
          keywords TEXT,
          og_title TEXT,
          og_description TEXT,
          og_image TEXT,
          no_index BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS policies for page_seo
        ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
        
        -- Allow authenticated users to read page_seo
        DROP POLICY IF EXISTS "Allow authenticated read access" ON page_seo;
        CREATE POLICY "Allow authenticated read access" 
          ON page_seo FOR SELECT 
          USING (auth.role() = 'authenticated');
        
        -- Allow authenticated users to insert page_seo
        DROP POLICY IF EXISTS "Allow authenticated insert access" ON page_seo;
        CREATE POLICY "Allow authenticated insert access" 
          ON page_seo FOR INSERT 
          WITH CHECK (auth.role() = 'authenticated');
        
        -- Allow authenticated users to update page_seo
        DROP POLICY IF EXISTS "Allow authenticated update access" ON page_seo;
        CREATE POLICY "Allow authenticated update access" 
          ON page_seo FOR UPDATE 
          USING (auth.role() = 'authenticated');
        
        -- Allow authenticated users to delete page_seo
        DROP POLICY IF EXISTS "Allow authenticated delete access" ON page_seo;
        CREATE POLICY "Allow authenticated delete access" 
          ON page_seo FOR DELETE 
          USING (auth.role() = 'authenticated');
        
        -- Allow public read access to page_seo
        DROP POLICY IF EXISTS "Allow public read access" ON page_seo;
        CREATE POLICY "Allow public read access" 
          ON page_seo FOR SELECT 
          USING (true);
      `,
    })

    if (pageSeoError) {
      throw pageSeoError
    }

    // Create global_seo table
    const { error: globalSeoError } = await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS global_seo (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          site_name TEXT,
          default_title TEXT,
          default_description TEXT,
          default_keywords TEXT,
          default_og_image TEXT,
          google_analytics_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS policies for global_seo
        ALTER TABLE global_seo ENABLE ROW LEVEL SECURITY;
        
        -- Allow authenticated users to read global_seo
        DROP POLICY IF EXISTS "Allow authenticated read access" ON global_seo;
        CREATE POLICY "Allow authenticated read access" 
          ON global_seo FOR SELECT 
          USING (auth.role() = 'authenticated');
        
        -- Allow authenticated users to insert global_seo
        DROP POLICY IF EXISTS "Allow authenticated insert access" ON global_seo;
        CREATE POLICY "Allow authenticated insert access" 
          ON global_seo FOR INSERT 
          WITH CHECK (auth.role() = 'authenticated');
        
        -- Allow authenticated users to update global_seo
        DROP POLICY IF EXISTS "Allow authenticated update access" ON global_seo;
        CREATE POLICY "Allow authenticated update access" 
          ON global_seo FOR UPDATE 
          USING (auth.role() = 'authenticated');
        
        -- Allow authenticated users to delete global_seo
        DROP POLICY IF EXISTS "Allow authenticated delete access" ON global_seo;
        CREATE POLICY "Allow authenticated delete access" 
          ON global_seo FOR DELETE 
          USING (auth.role() = 'authenticated');
        
        -- Allow public read access to global_seo
        DROP POLICY IF EXISTS "Allow public read access" ON global_seo;
        CREATE POLICY "Allow public read access" 
          ON global_seo FOR SELECT 
          USING (true);
      `,
    })

    if (globalSeoError) {
      throw globalSeoError
    }

    // Insert default global SEO settings if not exists
    const { data: existingGlobalSEO, error: checkError } = await supabase.from("global_seo").select("id").limit(1)

    if (checkError) {
      throw checkError
    }

    if (!existingGlobalSEO || existingGlobalSEO.length === 0) {
      const { error: insertError } = await supabase.from("global_seo").insert([
        {
          site_name: "Interior Design Studio",
          default_title: "Professional Interior Design Services",
          default_description: "We create beautiful, functional spaces tailored to your lifestyle and preferences.",
          default_keywords: "interior design, home decor, professional design, renovation",
          default_og_image: "/images/og-default.jpg",
          google_analytics_id: "",
        },
      ])

      if (insertError) {
        throw insertError
      }
    }

    // Insert default page SEO for homepage if not exists
    const { data: existingHomeSEO, error: checkHomeError } = await supabase
      .from("page_seo")
      .select("id")
      .eq("path", "/")
      .limit(1)

    if (checkHomeError) {
      throw checkHomeError
    }

    if (!existingHomeSEO || existingHomeSEO.length === 0) {
      const { error: insertHomeError } = await supabase.from("page_seo").insert([
        {
          path: "/",
          title: "Home | Interior Design Studio",
          description:
            "Welcome to our interior design studio. We create beautiful, functional spaces tailored to your lifestyle.",
          keywords: "interior design, home, studio, design services",
          og_title: "Interior Design Studio - Home",
          og_description: "Discover our interior design services and portfolio of beautiful spaces.",
          og_image: "/images/home-og.jpg",
          no_index: false,
        },
      ])

      if (insertHomeError) {
        throw insertHomeError
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error setting up SEO tables:", error)
    return { success: false, error }
  }
}
