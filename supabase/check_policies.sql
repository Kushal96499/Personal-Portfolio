-- Diagnostic script to check active RLS policies on contact_messages

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'contact_messages';

-- Also check grants
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'contact_messages';
