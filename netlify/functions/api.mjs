const out = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  },
  body: JSON.stringify(body)
});

export const handler = async (event) => {
  try {
    let path = (event.path || "")
      .replace(/^\/\.netlify\/functions\/api\/?/, "")
      .replace(/^\/api\/?/, "");

    // CORS preflight
    if (event.httpMethod === "OPTIONS") {
      return out(204, {});
    }

    // --------------------------------
    // SUPABASE CONFIG
    // --------------------------------
    if (path === "config") {
      return out(200, {
        supabaseUrl: process.env.SUPABASE_URL || "",
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
        aiConfigured: !!process.env.OPENAI_API_KEY
      });
    }

    // --------------------------------
    // PARSE BODY
    // --------------------------------
    let body = {};

    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        return out(400, {
          error: "Invalid JSON request body."
        });
      }
    }

    // --------------------------------
    // AI CHAT
    // --------------------------------
    if (path === "ai/chat") {
      return out(200, {
        reply: `I can help with strategy, ads, creatives, audiences and CRM. Your request: ${
          body.message || ""
        }`
      });
    }

    // --------------------------------
    // AI CAMPAIGN
    // --------------------------------
    if (path === "ai/campaign") {
      return out(200, {
        campaign: {
          name: "AI Campaign Draft",
          objective: body.prompt || "Marketing campaign",
          summary: "Draft created from your objective.",
          audience: "High-intent prospects",
          channels: ["Meta Ads", "Instagram"],
          creativeAngles: [
            "Problem → solution",
            "Social proof",
            "Offer"
          ]
        }
      });
    }

    // --------------------------------
    // AI CREATIVE
    // --------------------------------
    if (path === "ai/creative") {
      return out(200, {
        title: `${body.product || "Offer"} creative`,
        concept: `${body.format || "1080×1350"} concept using ${
          body.angle || "problem → solution"
        } with a clear CTA.`
      });
    }

    // --------------------------------
    // UNKNOWN ROUTE
    // --------------------------------
    return out(404, {
      error: "API route not found"
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return out(500, {
      error: "Internal server error."
    });
  }
};
