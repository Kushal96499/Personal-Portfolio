import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
            },
        });
    }

    try {
        const { token } = await req.json();

        if (!token) {
            return new Response(
                JSON.stringify({ success: false, error: "Token is required" }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                }
            );
        }

        const origin = req.headers.get("origin") || "";
        const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

        let secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");

        // Use test secret key for localhost
        if (isLocalhost) {
            console.log("Using test secret key for localhost");
            secretKey = "1x0000000000000000000000000000000AA";
        }

        if (!secretKey) {
            console.error("TURNSTILE_SECRET_KEY environment variable is not set");
            return new Response(
                JSON.stringify({ success: false, error: "Server configuration error" }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                }
            );
        }

        const verifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

        const formData = new FormData();
        formData.append("secret", secretKey);
        formData.append("response", token);

        const result = await fetch(verifyURL, {
            method: "POST",
            body: formData,
        });

        const data = await result.json();

        return new Response(
            JSON.stringify({ success: data.success }),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }
        );
    } catch (err) {
        console.error("Turnstile verification error:", err);
        return new Response(
            JSON.stringify({ success: false, error: "Internal server error" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }
        );
    }
});
