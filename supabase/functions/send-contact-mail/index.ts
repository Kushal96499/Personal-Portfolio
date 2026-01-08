// @ts-nocheck
// Supabase Edge Function for sending contact form emails via SMTP (Nodemailer)
// Deploy with: npx supabase functions deploy send-contact-mail

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { name, email, message }: ContactEmailRequest = await req.json();

    // Validate input
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, message" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get SMTP Config
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || smtpUser; // Default to sender if not set

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS)");
    }

    // Create Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 1. Send Notification to Admin
    await transporter.sendMail({
      from: `"${name}" <${smtpUser}>`, // Sender address (must be authenticated user usually)
      to: adminEmail, // List of receivers
      replyTo: email, // Reply to the user's email
      subject: `New Contact Form Message from ${name}`, // Subject line
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`, // plain text body
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `, // html body
    });

    // 2. Send Auto-reply to User (Optional but good UX)
    try {
      await transporter.sendMail({
        from: `"Kushal Kumawat" <${smtpUser}>`, // Explicitly setting the name
        to: email,
        subject: "Message Received: Thank you for contacting Kushal Kumawat",
        text: `Hi ${name},\n\nThank you for reaching out. I’ve successfully received your message and appreciate you taking the time to contact me.\n\nI’ll review your message and respond as soon as possible. If your inquiry is urgent, feel free to reply to this email.\n\nMeanwhile, you can explore my work:\n\nPortfolio Website: https://kushalkumawat.in\nLinkedIn: https://www.linkedin.com/in/kushal-ku\nGitHub: https://github.com/Kushal96499\n\nBest regards,\nKushal Kumawat\nSecurity-first • Privacy-focused • Professional tools`,
        html: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                  
                  <!-- HEADER -->
                  <tr>
                    <td style="background:#0f172a; padding:30px; text-align:center;">
                      <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing:-0.5px;">Kushal Kumawat</h1>
                      <p style="color:#94a3b8; margin:8px 0 0; font-size:14px; font-weight:500; text-transform:uppercase; letter-spacing:1px;">
                        Secure Automation • Developer Tools • Cybersecurity
                      </p>
                    </td>
                  </tr>

                  <!-- BODY -->
                  <tr>
                    <td style="padding:40px; color:#334155;">
                      <h2 style="margin-top:0; color:#0f172a; font-size:20px;">Message Received ✔</h2>

                      <p style="font-size:16px; line-height:1.6; margin-bottom:16px;">
                        Hi <strong>${name}</strong>,
                      </p>

                      <p style="font-size:16px; line-height:1.6; margin-bottom:16px;">
                        Thank you for reaching out. I’ve successfully received your message and appreciate you taking the time to contact me.
                      </p>

                      <p style="font-size:16px; line-height:1.6; margin-bottom:24px;">
                        I’ll review your message and respond as soon as possible. If your inquiry is urgent, feel free to reply to this email.
                      </p>

                      <!-- INFO BOX -->
                      <table width="100%" style="background:#f1f5f9; border-left:4px solid #2563eb; margin:25px 0; border-radius:4px;">
                        <tr>
                          <td style="padding:16px; font-size:14px; color:#475569;">
                            📌 This is an automated confirmation email. A personal response will follow shortly.
                          </td>
                        </tr>
                      </table>

                      <p style="font-size:16px; margin-bottom:16px;">Meanwhile, you can explore my work:</p>

                      <!-- LINKS -->
                      <ul style="padding-left:0; list-style:none; font-size:15px; margin:0;">
                        <li style="margin-bottom:10px;">
                          <a href="https://kushalkumawat.in" style="color:#2563eb; text-decoration:none; font-weight:500;">
                            🔗 Portfolio Website
                          </a>
                        </li>
                        <li style="margin-bottom:10px;">
                          <a href="https://www.linkedin.com/in/kushal-ku" style="color:#2563eb; text-decoration:none; font-weight:500;">
                            💼 LinkedIn
                          </a>
                        </li>
                        <li style="margin-bottom:10px;">
                          <a href="https://github.com/Kushal96499" style="color:#2563eb; text-decoration:none; font-weight:500;">
                            💻 GitHub
                          </a>
                        </li>
                      </ul>

                      <p style="margin-top:40px; font-size:16px; line-height:1.5; color:#0f172a;">
                        Best regards,<br>
                        <strong>Kushal Kumawat</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background:#f8fafc; padding:24px; text-align:center; font-size:12px; color:#64748b; border-top:1px solid #e2e8f0;">
                      &copy; ${new Date().getFullYear()} Kushal Kumawat · All rights reserved<br>
                      <span style="font-size:11px; color:#94a3b8; display:block; margin-top:4px;">Security-first · Privacy-focused · Professional tools</span>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        `,
      });
    } catch (autoReplyError) {
      console.warn("Failed to send auto-reply:", autoReplyError);
      // Don't fail the whole request if auto-reply fails
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in send-contact-mail:", error);

    // Log error to admin_logs
    try {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await supabaseClient.from("admin_logs").insert({
        action: "contact_email_error",
        details: {
          error: error.message,
          stack: error.stack
        }
      });
    } catch (logError) {
      console.error("Failed to log error to admin_logs:", logError);
    }

    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
