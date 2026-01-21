// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateEmail } from '../_shared/disposable-emails.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
    email: string;
    name?: string;
    website?: string; // Honeypot
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { email, name, website }: SendOTPRequest = await req.json();

        // Get client info
        const ip_address = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const user_agent = req.headers.get('user-agent') || 'unknown';

        // =====================================
        // 1. HONEYPOT CHECK
        // =====================================
        if (website && website.trim() !== '') {
            console.log(`🤖 Bot detected in OTP request! IP: ${ip_address}`);
            return new Response(
                JSON.stringify({ error: 'Invalid request' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // =====================================
        // 2. VALIDATE EMAIL
        // =====================================
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            return new Response(
                JSON.stringify({ error: emailValidation.error }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // =====================================
        // 3. RATE LIMIT CHECK
        // =====================================
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        const { data: rateLimitOk, error: rateLimitError } = await supabase
            .rpc('check_otp_rate_limit', { p_email: email });

        if (rateLimitError) {
            console.error('OTP rate limit check error:', rateLimitError);
        }

        if (rateLimitOk === false) {
            console.log(`⏱️ OTP rate limit exceeded for: ${email}`);
            return new Response(
                JSON.stringify({ error: 'Too many OTP requests. Please try again in 10 minutes.' }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // =====================================
        // 4. GENERATE OTP
        // =====================================
        const { data: otpCode } = await supabase.rpc('generate_otp');

        if (!otpCode) {
            throw new Error('Failed to generate OTP');
        }

        // =====================================
        // 5. SAVE OTP TO DATABASE
        // =====================================
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const { data: otpRecord, error: insertError } = await supabase
            .from('email_otps')
            .insert([{
                email,
                otp_code: otpCode,
                ip_address,
                user_agent,
                expires_at: expiresAt.toISOString(),
            }])
            .select()
            .single();

        if (insertError) {
            console.error('OTP insert error:', insertError);
            throw new Error('Failed to save OTP');
        }

        console.log(`✅ OTP generated for ${email}: ${otpRecord.id}`);

        // =====================================
        // 6. SEND OTP EMAIL
        // =====================================
        try {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-contact-mail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                },
                body: JSON.stringify({
                    name: name || 'User',
                    email: email,
                    message: `Your verification code is: ${otpCode}\n\nThis code expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
                    subject: 'Your Verification Code - Kushal Portfolio',
                    isOTP: true,
                }),
            });

            console.log(`📧 OTP email sent to: ${email}`);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            // Don't fail the request if email fails, OTP is still in database
        }

        // =====================================
        // 7. RETURN SUCCESS
        // =====================================
        return new Response(
            JSON.stringify({
                success: true,
                message: `Verification code sent to ${email}. Please check your inbox.`,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Send OTP error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to send verification code. Please try again.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
