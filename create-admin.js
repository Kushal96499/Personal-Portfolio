// Admin User Setup Script
// Run this once to create your admin account in Supabase

import { supabase } from './src/integrations/supabase/client';

async function createAdminUser() {
    const email = 'tanchukumawat@gmail.com';
    const password = 'Kumawat@12';

    try {
        console.log('Creating admin user...');

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    role: 'admin'
                }
            }
        });

        if (error) {
            console.error('Error creating admin user:', error.message);
            return;
        }

        console.log('✅ Admin user created successfully!');
        console.log('Email:', email);
        console.log('User ID:', data.user?.id);
        console.log('\nYou can now login at: http://localhost:8080/admin/login');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

createAdminUser();
