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
  whatsapp?: string;
  plan?: string;
  projectType?: string;
  attachment?: {
    filename: string;
    content: string; // Base64
    encoding: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { name, email, message, whatsapp, plan, projectType, attachment }: ContactEmailRequest = await req.json();

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

    // Determine Email Type
    const isServiceRequest = !!plan;

    // --- 1. Admin Email Template ---
    const adminSubject = isServiceRequest
      ? `New Service Request — ${plan} | ${name}`
      : `📩 New Contact Message: ${name}`;

    const adminHtml = isServiceRequest
      ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; margin: 10px !important; }
      .content { padding: 20px !important; }
      .header { padding: 20px !important; }
      .header-title { font-size: 18px !important; }
      .header-subtitle { font-size: 8px !important; }
      .button { display: block !important; margin: 8px 0 !important; width: 100% !important; }
      .email-text { word-break: break-all !important; font-size: 12px !important; }
      .label { font-size: 12px !important; }
      .value { font-size: 13px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
    
    <!-- Header -->
    <div class="header" style="background-color: #0f172a; padding: 24px; text-align: center;">
      <h1 class="header-title" style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">Kushal Kumawat</h1>
      <p class="header-subtitle" style="color: #94a3b8; margin: 8px 0 0; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">DEVELOPER TOOLS • WEBSITE DEVELOPMENT</p>
    </div>

    <!-- Content -->
    <div class="content" style="padding: 32px 24px;">
      <h2 style="margin-top: 0; color: #0f172a; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 12px; display: inline-block;">New Service Request</h2>
      
      <!-- Summary Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td class="label" style="padding: 8px 0; color: #64748b; font-size: 13px; vertical-align: top;">Name</td>
            <td class="value" style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${name}</td>
          </tr>
          <tr>
            <td class="label" style="padding: 8px 0; color: #64748b; font-size: 13px; vertical-align: top;">Email</td>
            <td class="value email-text" style="padding: 8px 0; color: #2563eb; font-size: 14px; word-break: break-word;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td class="label" style="padding: 8px 0; color: #64748b; font-size: 13px; vertical-align: top;">WhatsApp</td>
            <td class="value" style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 14px; word-break: break-word;">${whatsapp || "N/A"}</td>
          </tr>
          <tr>
            <td class="label" style="padding: 8px 0; color: #64748b; font-size: 13px; vertical-align: top;">Plan</td>
            <td class="value" style="padding: 8px 0; color: #16a34a; font-weight: 700; font-size: 14px;">${plan}</td>
          </tr>
          <tr>
            <td class="label" style="padding: 8px 0; color: #64748b; font-size: 13px; vertical-align: top;">Project Type</td>
            <td class="value" style="padding: 8px 0; color: #0f172a; font-size: 14px;">${projectType || "N/A"}</td>
          </tr>
          <tr>
            <td class="label" style="padding: 8px 0; color: #64748b; font-size: 13px; vertical-align: top;">Date</td>
            <td class="value" style="padding: 8px 0; color: #64748b; font-size: 13px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
        </table>
      </div>

      <!-- Message -->
      <div style="margin-top: 24px;">
        <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Requirements / Message</p>
        <div style="background-color: #fff; border-left: 4px solid #2563eb; padding: 16px; color: #334155; line-height: 1.6; font-size: 14px; word-break: break-word;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>

      ${attachment ? `
      <!-- Attachment -->
      <div style="margin-top: 20px; padding: 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
        <span style="font-size: 14px; color: #166534; word-break: break-word;">📎 <strong>Attachment:</strong> ${attachment.filename}</span>
      </div>` : ''}

      <!-- Quick Actions -->
      <div style="margin-top: 32px; text-align: center;">
        <a href="mailto:${email}?subject=Re: Your Service Request - ${plan}" class="button" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 4px;">Reply via Email</a>
        <a href="https://wa.me/${whatsapp?.replace(/[^0-9]/g, '')}" class="button" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 4px;">Open WhatsApp</a>
      </div>

    </div>
  </div>
</body>
</html>
      `
      : `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
    h2 { color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .label { font-weight: bold; color: #666; width: 100px; display: inline-block; }
    .value { color: #000; }
    .message-box { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📩 New Contact Message</h2>
    <p><span class="label">Name:</span> <span class="value">${name}</span></p>
    <p><span class="label">Email:</span> <span class="value"><a href="mailto:${email}">${email}</a></span></p>
    
    <p class="label">Message:</p>
    <div class="message-box">${message}</div>
    
    <p style="font-size: 12px; color: #999; margin-top: 20px;">Sent via Kushal Portfolio Contact Form</p>
  </div>
</body>
</html>`;

    // Send Admin Email
    await transporter.sendMail({
      from: `"${name}" <${smtpUser}>`,
      to: adminEmail,
      replyTo: email,
      subject: adminSubject,
      text: `New Service Request from ${name}\nPlan: ${plan}\n\n${message}`,
      attachments: attachment ? [{
        filename: attachment.filename,
        content: attachment.content,
        encoding: 'base64'
      }] : [],
      html: adminHtml,
    });

    // --- 2. Client Auto-Reply Template ---
    // Simplified Subject to avoid potential spam triggers
    const clientSubject = isServiceRequest
      ? `Request Received: ${projectType || "Project"} Confirmation`
      : `Message Received: Thank you for contacting Kushal Kumawat`;

    const clientHtml = isServiceRequest
      ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; margin: 10px !important; }
      .content { padding: 20px !important; }
      .header { padding: 20px !important; }
      .button { display: block !important; margin: 8px 0 !important; width: 100% !important; text-align: center !important; }
      .social-links { margin-top: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
    
    <!-- Header -->
    <div class="header" style="background-color: #0f172a; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Kushal Kumawat</h1>
      <p style="color: #94a3b8; margin: 8px 0 0; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">WEBSITE DEVELOPMENT • DEVELOPER TOOLS • SECURE AUTOMATION</p>
    </div>

    <!-- Body -->
    <div class="content" style="padding: 40px 32px; color: #334155;">
      
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; margin-bottom: 20px;">Request Received ✅</h2>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Thank you for choosing me for your project. I've received your request for a <strong>${projectType || "project"}</strong>.</p>

      <!-- Request Summary Box -->
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #2563eb;">
        <p style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600;">Request Summary</p>
        <div style="margin-bottom: 8px;">
          <span style="font-size: 14px; color: #475569; display: inline-block; width: 100px;">Plan:</span> 
          <span style="font-size: 15px; color: #0f172a; font-weight: 700;">${plan}</span>
        </div>
        <div>
          <span style="font-size: 14px; color: #475569; display: inline-block; width: 100px;">Type:</span> 
          <span style="font-size: 15px; color: #0f172a; font-weight: 600;">${projectType || "Custom"}</span>
        </div>
      </div>

      <!-- Timeline -->
      <h3 style="font-size: 16px; color: #0f172a; margin-bottom: 16px;">What happens next?</h3>
      <div style="margin-bottom: 30px;">
        <div style="display: flex; margin-bottom: 12px; align-items: start;">
          <div style="background: #e0f2fe; color: #0284c7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</div>
          <div style="font-size: 15px; line-height: 1.5;">I review your detailed requirements.</div>
        </div>
        <div style="display: flex; margin-bottom: 12px; align-items: start;">
          <div style="background: #e0f2fe; color: #0284c7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</div>
          <div style="font-size: 15px; line-height: 1.5;">I reply within 24 hours to discuss the timeline.</div>
        </div>
        <div style="display: flex; align-items: start;">
          <div style="background: #e0f2fe; color: #0284c7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</div>
          <div style="font-size: 15px; line-height: 1.5;">We confirm scope & start (50% Advance).</div>
        </div>
      </div>

      <!-- Why Work With Me -->
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px solid #bae6fd;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; margin-bottom: 12px;">Why Work With Me?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
          <li>✅ Modern tech stack (React, Next.js, TailwindCSS)</li>
          <li>✅ Fully responsive design for all devices</li>
          <li>✅ Free hosting setup (Vercel/Netlify)</li>
          <li>✅ Clean, maintainable code with documentation</li>
          <li>✅ Student-friendly pricing & revision support</li>
        </ul>
      </div>

      <!-- CTAs -->
      <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
        <table class="button-table" align="center" style="margin: 0 auto;">
          <tr class="button-row">
            <td class="button-cell" style="padding: 6px;">
              <a href="https://wa.me/918559837175" class="button" style="display: block; background-color: #25D366; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; white-space: nowrap;">💬 Chat on WhatsApp</a>
            </td>
          </tr>
          <tr class="button-row">
            <td class="button-cell" style="padding: 6px;">
              <a href="https://kushalkumawat.in" class="button" style="display: block; background-color: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; white-space: nowrap;">🌐 View Portfolio</a>
            </td>
          </tr>
        </table>
      </div>

    </div>
    
    <!-- Footer with Social Links -->
    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; font-weight: 500;">Connect with me:</p>
      <table class="social-table" align="center" style="margin: 0 auto 16px;">
        <tr>
          <td class="social-cell" style="padding: 4px;">
            <a href="https://github.com/Kushal96499" style="display: inline-block; background-color: #24292e; color: #ffffff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; white-space: nowrap;">GitHub</a>
          </td>
        </tr>
        <tr>
          <td class="social-cell" style="padding: 4px;">
            <a href="https://linkedin.com/in/kushal-ku" style="display: inline-block; background-color: #0077b5; color: #ffffff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; white-space: nowrap;">LinkedIn</a>
          </td>
        </tr>
        <tr>
          <td class="social-cell" style="padding: 4px;">
            <a href="https://instagram.com/v3_xnm" style="display: inline-block; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: #ffffff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; white-space: nowrap;">Instagram</a>
          </td>
        </tr>
      </table>
      <p style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Kushal Kumawat • Full-Stack Developer</p>
    </div>

  </div>
</body>
</html>
      `
      : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; margin: 10px !important; }
      .content { padding: 20px !important; }
      .header { padding: 20px !important; }
      .button { display: block !important; margin: 8px 0 !important; width: 100% !important; text-align: center !important; }
      .social-links { margin-top: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
    
    <!-- Header -->
    <div class="header" style="background-color: #0f172a; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Kushal Kumawat</h1>
      <p style="color: #94a3b8; margin: 8px 0 0; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">WEBSITE DEVELOPMENT • DEVELOPER TOOLS • SECURE AUTOMATION</p>
    </div>

    <!-- Body -->
    <div class="content" style="padding: 40px 32px; color: #334155;">
      
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; margin-bottom: 20px;">Message Received ✅</h2>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Thank you for reaching out! I've received your message and will get back to you as soon as possible.</p>

      <!-- Timeline -->
      <h3 style="font-size: 16px; color: #0f172a; margin-bottom: 16px;">What happens next?</h3>
      <div style="margin-bottom: 30px;">
        <div style="display: flex; margin-bottom: 12px; align-items: start;">
          <div style="background: #e0f2fe; color: #0284c7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</div>
          <div style="font-size: 15px; line-height: 1.5;">I review your message personally.</div>
        </div>
        <div style="display: flex; margin-bottom: 12px; align-items: start;">
          <div style="background: #e0f2fe; color: #0284c7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</div>
          <div style="font-size: 15px; line-height: 1.5;">I usually reply within 24 hours.</div>
        </div>
        <div style="display: flex; align-items: start;">
          <div style="background: #e0f2fe; color: #0284c7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</div>
          <div style="font-size: 15px; line-height: 1.5;">We can schedule a call if needed.</div>
        </div>
      </div>

      <!-- Why Work With Me -->
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px solid #bae6fd;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; margin-bottom: 12px;">Why Work With Me?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
          <li>✅ Modern tech stack (React, Next.js, TailwindCSS)</li>
          <li>✅ Fully responsive design for all devices</li>
          <li>✅ Free hosting setup (Vercel/Netlify)</li>
          <li>✅ Clean, maintainable code with documentation</li>
          <li>✅ Student-friendly pricing & revision support</li>
        </ul>
      </div>

      <!-- CTAs -->
      <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
        <table class="button-table" align="center" style="margin: 0 auto;">
          <tr class="button-row">
            <td class="button-cell" style="padding: 6px;">
              <a href="https://wa.me/918559837175" class="button" style="display: block; background-color: #25D366; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; white-space: nowrap;">💬 Chat on WhatsApp</a>
            </td>
          </tr>
          <tr class="button-row">
            <td class="button-cell" style="padding: 6px;">
              <a href="https://kushalkumawat.in" class="button" style="display: block; background-color: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; white-space: nowrap;">🌐 View Portfolio</a>
            </td>
          </tr>
        </table>
      </div>

    </div>
    
    <!-- Footer with Social Links -->
    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; font-weight: 500;">Connect with me:</p>
      <table class="social-table" align="center" style="margin: 0 auto 16px;">
        <tr>
          <td class="social-cell" style="padding: 4px;">
            <a href="https://github.com/Kushal96499" style="display: inline-block; background-color: #24292e; color: #ffffff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; white-space: nowrap;">GitHub</a>
          </td>
        </tr>
        <tr>
          <td class="social-cell" style="padding: 4px;">
            <a href="https://linkedin.com/in/kushal-ku" style="display: inline-block; background-color: #0077b5; color: #ffffff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; white-space: nowrap;">LinkedIn</a>
          </td>
        </tr>
        <tr>
          <td class="social-cell" style="padding: 4px;">
            <a href="https://instagram.com/v3_xnm" style="display: inline-block; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: #ffffff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; white-space: nowrap;">Instagram</a>
          </td>
        </tr>
      </table>
      <p style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Kushal Kumawat • Full-Stack Developer</p>
    </div>

  </div>
</body>
</html>`;

    // Send Client Auto-Reply with Explicit Error Logging
    try {
      if (email && email.includes('@')) {
        await transporter.sendMail({
          from: `"Kushal Kumawat" <${smtpUser}>`,
          to: email,
          subject: clientSubject,
          text: `Hi ${name}, thanks for your service request. I will get back to you shortly.`,
          html: clientHtml,
        });
      } else {
        console.warn("Invalid client email, skipping auto-reply:", email);
      }
    } catch (autoReplyError: any) {
      console.error("Failed to send client auto-reply:", autoReplyError);

      // Log to Supabase for debugging
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        await supabaseClient.from("admin_logs").insert({
          action: "client_email_failed",
          details: {
            error: autoReplyError.message,
            recipient: email,
            subject: clientSubject
          }
        });
      } catch (e) {
        // Ignore logging error
      }
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
