// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateEmail } from '../_shared/disposable-emails.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadSubmission {
    // Required fields
    name: string;
    email: string;
    message: string;

    // Optional fields
    phone?: string;
    whatsapp?: string;
    plan?: string;
    project_type?: string;
    pages?: number;
    deadline?: string;
    budget?: string;
    features?: string[];

    // Anti-spam fields
    website?: string; // Honeypot field
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get client IP
        const ip_address = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real ip') ||
            'unknown';
        const user_agent = req.headers.get('user-agent') || 'unknown';

        // Parse request body
        const data: LeadSubmission = await req.json();

        // =====================================
        // 1. HONEYPOT CHECK
        // =====================================
        if (data.website && data.website.trim() !== '') {
            console.log(`🤖 Bot detected! Honeypot filled by IP: ${ip_address}`);
            return new Response(
                JSON.stringify({ error: 'Invalid submission' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // =====================================
        // 2. VALIDATE REQUIRED FIELDS
        // =====================================
        if (!data.name || !data.email || !data.message) {
            return new Response(
                JSON.stringify({ error: 'Name, email, and message are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // =====================================
        // 3. VALIDATE EMAIL
        // =====================================
        const emailValidation = validateEmail(data.email);
        if (!emailValidation.valid) {
            console.log(`❌ Invalid email: ${data.email} - ${emailValidation.error}`);
            return new Response(
                JSON.stringify({ error: emailValidation.error }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // =====================================
        // 4. RATE LIMITING CHECK
        // =====================================
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role to bypass RLS
        );

        const { data: rateLimitOk, error: rateLimitError } = await supabaseClient
            .rpc('check_rate_limit', { p_ip_address: ip_address });

        if (rateLimitError) {
            console.error('Rate limit check error:', rateLimitError);
        }

        if (rateLimitOk === false) {
            console.log(`⏱️ Rate limit exceeded for IP: ${ip_address}`);
            return new Response(
                JSON.stringify({ error: 'Too many requests. Please try again in a few minutes.' }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // =====================================
        // 5. INSERT LEAD INTO DATABASE
        // =====================================
        const { data: lead, error: insertError } = await supabaseClient
            .from('leads')
            .insert([{
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                whatsapp: data.whatsapp || null,
                plan: data.plan || null,
                project_type: data.project_type || null,
                pages: data.pages || null,
                deadline: data.deadline || null,
                budget: data.budget || null,
                features: data.features || null,
                message: data.message,
                ip_address,
                user_agent,
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Database insert error:', insertError);
            throw new Error('Failed to save lead');
        }

        console.log(`✅ Lead saved: ${lead.id} from ${data.email}`);

        // =====================================
        // 6. SEND EMAILS
        // =====================================
        try {
            // Send admin notification email
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-contact-mail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    message: data.message,
                    whatsapp: data.whatsapp,
                    plan: data.plan,
                    projectType: data.project_type,
                }),
            });

            console.log(`📧 Emails sent for lead: ${lead.id}`);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the request if email fails
        }

        // =====================================
        // 7. RETURN SUCCESS
        // =====================================
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Thank you! We\'ll get back to you soon.',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Submission error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
