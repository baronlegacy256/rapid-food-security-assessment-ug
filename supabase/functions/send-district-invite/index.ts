import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error("Missing RESEND_API_KEY secret.");
        }

        // The webhook payload from Supabase
        const payload = await req.json();
        const { record } = payload;

        const email = record.email.trim();

        if (!record || !email || !record.link_url) {
            return new Response(JSON.stringify({ error: "No valid record found in payload" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        console.log(`Sending district invite email to ${email} for ${record.district}`);

        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "onboarding@resend.dev",
                to: [email],
                subject: record.subject,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px;">
            <h2 style="color: #16a34a; margin-top: 0;">District Assessment Invite</h2>
            <p>Hello,</p>
            <p>You have been invited to complete the <strong>Rapid Food and Nutrition Security Assessment</strong> for <strong>${record.district} district</strong>.</p>
            
            <div style="background-color: #f9fafb; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #374151;">
                <strong>Reporting Period:</strong> ${record.reporting_year} ${record.reporting_period}<br>
                <strong>Frequency:</strong> ${record.reporting_frequency}
              </p>
            </div>

            <p>Please click the button below to access the assessment form. This link will automatically log you into the district's draft.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${record.link_url}" style="display: inline-block; background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Assessment Form</a>
            </div>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <span style="color: #2563eb;">${record.link_url}</span>
            </p>
            
            <p style="font-size: 11px; color: #9ca3af; margin-top: 20px;">
              MAAIF Food Security Team • Information sent via Rapid Assessment Portal
            </p>
          </div>
        `,
            }),
        });

        if (!resendResponse.ok) {
            const errorData = await resendResponse.json();
            throw new Error(`Resend Error: ${JSON.stringify(errorData)}`);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Function error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
