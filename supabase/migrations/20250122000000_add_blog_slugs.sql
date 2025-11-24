-- Add slug column to blogs table for SEO-friendly URLs
-- Migration: Add blog slugs

-- Add slug column (nullable initially to handle existing data)
ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),  -- Remove special chars
        '\s+', '-', 'g'                                      -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'                                         -- Replace multiple hyphens with single
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate slugs for existing blogs
UPDATE blogs
SET slug = generate_slug(title) || '-' || substring(id::text from 1 for 8)
WHERE slug IS NULL;

-- Make slug NOT NULL and add unique constraint
ALTER TABLE blogs
ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);

-- Create trigger to auto-generate slug on insert/update if not provided
CREATE OR REPLACE FUNCTION set_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Generate base slug from title
    NEW.slug := generate_slug(NEW.title);
    
    -- Check if slug exists and append counter if needed
    DECLARE
      base_slug TEXT := NEW.slug;
      counter INTEGER := 1;
    BEGIN
      WHILE EXISTS (SELECT 1 FROM blogs WHERE slug = NEW.slug AND id != NEW.id) LOOP
        NEW.slug := base_slug || '-' || counter;
        counter := counter + 1;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_slug_trigger ON blogs;
CREATE TRIGGER blog_slug_trigger
  BEFORE INSERT OR UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_slug();
