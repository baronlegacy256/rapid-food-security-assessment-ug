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
        // Check API key first
        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY is missing");
            return new Response(JSON.stringify({
                error: "Missing RESEND_API_KEY secret. Please set it in Supabase dashboard under Edge Functions > Secrets."
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            });
        }

        const { email, role, url, district, region } = await req.json();

        if (!email || !role) {
            return new Response(JSON.stringify({ error: "Missing required fields: email and role" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        console.log(`Attempting to send email to ${email} for role ${role} in district ${district}`);

        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Food Security Assessment <onboarding@resend.dev>",
                to: [email],
                subject: `Invitation: Join the ${district || 'District'} Food Security Assessment Team`,
                html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px;">
                <h2 style="color: #1e40af; margin-top: 0;">You have been invited!</h2>
                <p>Hello,</p>
                <p>You have been invited to collaborate as the <strong>${role} Officer</strong> for the ongoing <strong>Rapid Food Security Assessment</strong> in <strong>${district || 'your assigned'} District</strong>${region ? ` (Region: ${region})` : ''}.</p>
                <p>Your expertise is needed to complete the assessment for this area. Please click the button below to access your section of the form:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #2563EB; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Access Assessment Portal</a>
                </div>
                <p style="font-size: 14px; color: #4b5563;">District: <strong>${district || 'Not specified'}</strong></p>
                <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; pt-20px;">If you were not expecting this invite, please ignore this email.</p>
            </div>
        `,
            }),
        });

        const responseText = await resendResponse.text();
        let responseData;

        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Resend response:", responseText);
            return new Response(JSON.stringify({
                error: "Invalid response from Resend API",
                details: responseText.substring(0, 200)
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            });
        }

        if (!resendResponse.ok) {
            console.error("Resend API error:", responseData);
            return new Response(JSON.stringify({
                error: `Resend API error: ${responseData.message || responseData.error || 'Unknown error'}`,
                details: responseData,
                statusCode: resendResponse.status
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: resendResponse.status || 400,
            });
        }

        console.log("Email sent successfully:", responseData);

        return new Response(JSON.stringify({
            success: true,
            message: "Email sent successfully",
            id: responseData.id
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Edge function error:", error);
        return new Response(JSON.stringify({
            error: error.message || "Unknown error occurred",
            stack: error.stack
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
