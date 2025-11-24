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
        from: `"Portfolio Admin" <${smtpUser}>`,
        to: email,
        subject: "Thank you for your message",
        text: `Hi ${name},\n\nI have received your message and will get back to you soon.\n\nBest regards,\nPortfolio Admin`,
        html: `
              <h3>Message Received</h3>
              <p>Hi ${name},</p>
              <p>I have received your message and will get back to you soon.</p>
              <br>
              <p>Best regards,</p>
              <p><strong>Portfolio Admin</strong></p>
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
