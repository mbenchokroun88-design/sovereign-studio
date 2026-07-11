import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  org: z.string().trim().max(200).optional().default(""),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional().default(""),
  type: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(5).max(5000),
  // Honeypot: real users leave empty
  website: z.string().max(0).optional().default(""),
});

const RECIPIENT = "mohamed.benchokroun@gmail.com";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const }; // honeypot: silently drop

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY not configured");
      throw new Error("Email service not configured yet. Please try again shortly.");
    }

    const subject = `Nouveau projet — ${data.name}${data.org ? " · " + data.org : ""}`;
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;line-height:1.55;max-width:640px">
        <h2 style="font-family:Georgia,serif;color:#0f172a;margin:0 0 16px">Nouvelle demande de projet</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#64748b;width:120px">Nom</td><td>${esc(data.name)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Organisation</td><td>${esc(data.org || "—")}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Email</td><td><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Téléphone</td><td>${esc(data.phone || "—")}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Type</td><td>${esc(data.type || "—")}</td></tr>
        </table>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:.15em">Message</h3>
        <div style="white-space:pre-wrap;font-size:15px;padding:16px;background:#f8fafc;border-left:3px solid #c9a961">${esc(data.message)}</div>
      </div>
    `;
    const text =
      `Nom: ${data.name}\nOrganisation: ${data.org}\nEmail: ${data.email}\nTéléphone: ${data.phone}\nType: ${data.type}\n\n${data.message}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // onboarding@resend.dev works out of the box; swap for a verified domain when available.
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [RECIPIENT],
        reply_to: data.email,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[contact] Resend ${res.status}: ${body}`);
      throw new Error(`Envoi impossible (${res.status})`);
    }

    return { ok: true as const };
  });