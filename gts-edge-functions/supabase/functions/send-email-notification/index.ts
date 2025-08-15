// send-email-notification Edge Function
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Configuration (will be set as secrets when you deploy)
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "your-smtp-server.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "your-username";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "your-password";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "info@gtstrailers.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "no-reply@gtstrailersafrica.com";
const WEBHOOK_TOKEN = Deno.env.get("WEBHOOK_TOKEN") || "your-secure-webhook-token";

interface Payload {
  type: "contact" | "quote";
  record: {
    id: number;
    name: string;
    email: string;
    phone: string;
    company?: string | null;
    product_type?: string | null;
    message: string;
    created_at: string;
  };
}

function htmlEscape(s: string) {
  return s.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

async function sendEmail(subject: string, html: string, to: string) {
  const client = new SmtpClient();
  await client.connectTLS({
    hostname: SMTP_HOST,
    port: SMTP_PORT,
    username: SMTP_USERNAME,
    password: SMTP_PASSWORD
  });
  await client.send({
    from: FROM_EMAIL,
    to,
    subject,
    content: html,
  });
  await client.close();
}

serve(async (req) => {
  try {
    // Verify shared secret
    const token = req.headers.get("x-webhook-token");
    if (token !== WEBHOOK_TOKEN && WEBHOOK_TOKEN !== "your-secure-webhook-token") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body: Payload = await req.json();
    if (!body?.record || !body?.type) {
      return new Response(JSON.stringify({ error: "Bad payload" }), { status: 400 });
    }

    const ref = `GTS-${body.record.id.toString().padStart(6, "0")}`;
    const {
      name, email, phone, company = "", product_type = "", message
    } = body.record;

    const safe = {
      name: htmlEscape(name || ""),
      email: htmlEscape(email || ""),
      phone: htmlEscape(phone || ""),
      company: htmlEscape(company || ""),
      product_type: htmlEscape(product_type || ""),
      message: htmlEscape(message || "")
    };

    // Admin email
    const adminSubject = `[${ref}] New ${body.type === "contact" ? "Contact" : "Quote"} Submission`;
    const adminHtml = `
      <h2>${body.type === "contact" ? "Contact Form" : "Quote Request"} Received</h2>
      <p><strong>Reference:</strong> ${ref}</p>
      <p><strong>Name:</strong> ${safe.name}</p>
      <p><strong>Email:</strong> ${safe.email}</p>
      <p><strong>Phone:</strong> ${safe.phone}</p>
      ${body.type === "quote" ? `<p><strong>Product Type:</strong> ${safe.product_type}</p>` : ""}
      ${safe.company ? `<p><strong>Company:</strong> ${safe.company}</p>` : ""}
      <p><strong>Message:</strong><br>${safe.message.replace(/\n/g, "<br>")}</p>
      <hr>
      <small>Auto notification from GTS Trailers website.</small>
    `;

    // User confirmation
    const userSubject = `We received your ${body.type === "contact" ? "message" : "quote request"} (${ref})`;
    const userHtml = `
      <h2>Thank you, ${safe.name}</h2>
      <p>Your ${body.type === "contact" ? "message" : "request"} has been received. Reference: <strong>${ref}</strong></p>
      <p>We will respond as soon as possible.</p>
      <p><strong>Summary:</strong></p>
      <ul>
        <li>Email: ${safe.email}</li>
        <li>Phone: ${safe.phone}</li>
        ${body.type === "quote" ? `<li>Product Type: ${safe.product_type}</li>` : ""}
        ${safe.company ? `<li>Company: ${safe.company}</li>` : ""}
      </ul>
      <p><strong>Your Message:</strong><br>${safe.message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p style="font-size:12px;color:#666">GTS TRAILERS AFRICA LTD</p>
    `;

    await sendEmail(adminSubject, adminHtml, ADMIN_EMAIL);
    await sendEmail(userSubject, userHtml, safe.email);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});