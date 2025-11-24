/**
 * Cloudflare Pages Function - Turnstile Token Verification
 * 
 * This function verifies Turnstile CAPTCHA tokens by calling Cloudflare's siteverify API.
 * 
 * Environment Variables Required:
 * - TURNSTILE_SECRET_KEY: Your Turnstile secret key from Cloudflare dashboard
 * 
 * Endpoint: /api/verifyTurnstile
 * Method: POST
 * Body: { "token": "turnstile-token-here" }
 * Response: { "success": true/false, "error": "optional error message" }
 */

export async function onRequestPost(context) {
    try {
        // Get the token from request body
        const { token } = await context.request.json();

        // Validate token exists
        if (!token) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Token is required'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Get secret key from environment variables
        const secretKey = context.env.TURNSTILE_SECRET_KEY;

        if (!secretKey) {
            console.error('TURNSTILE_SECRET_KEY environment variable is not set');
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Server configuration error'
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Verify token with Cloudflare Turnstile API
        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: secretKey,
                    response: token,
                }),
            }
        );

        const verifyResult = await verifyResponse.json();

        // Return verification result
        return new Response(
            JSON.stringify({
                success: verifyResult.success,
                error: verifyResult.success ? null : 'Verification failed'
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*', // Allow CORS for local dev
                }
            }
        );

    } catch (error) {
        console.error('Turnstile verification error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle OPTIONS requests for CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
