import OpenAI from "openai";

const headers = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "Content-Type, Authorization",
  "access-control-allow-methods": "GET,POST,OPTIONS"
};

const json = (body, status=200) => new Response(JSON.stringify(body), {status, headers});

function mockAI(prompt) {
  return `I understand your goal. Start with one clear offer, 2–3 creative angles, separate cold/warm audiences, and one measurable conversion event.

Recommended flow:
1. Clarify the offer and target customer.
2. Build a prospecting audience.
3. Build a retargeting audience.
4. Generate 3 creative variations.
5. Launch only after reviewing budget, destination and tracking.
6. Optimize toward qualified leads or revenue—not clicks alone.

Your request: ${prompt}`;
}

export default async (request) => {
  if (request.method === "OPTIONS") return new Response("", {status:204, headers});
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/?\.netlify\/functions\/api\/?/, "").replace(/^\/api\/?/, "");
  let body = {};
  try { body = await request.json(); } catch {}

  if (path === "config" && request.method === "GET") {
    return json({
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
      aiConfigured: Boolean(process.env.OPENAI_API_KEY)
    });
  }

  if (path === "ai/chat" && request.method === "POST") {
    const prompt = String(body.message || "").trim();
    if (!prompt) return json({error:"Message required"},400);
    if (process.env.OPENAI_API_KEY) {
      try {
        const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
        const response = await client.responses.create({
          model: process.env.OPENAI_MODEL || "gpt-6-luna",
          instructions: "You are the AI Marketing OS strategist. Give practical beginner-friendly marketing advice. Never claim a live ad or Instagram action was performed unless an API response confirms it.",
          input: prompt
        });
        return json({reply:response.output_text, provider:"openai"});
      } catch (e) {
        return json({reply:mockAI(prompt),provider:"fallback"});
      }
    }
    return json({reply:mockAI(prompt),provider:"demo"});
  }

  if (path === "ai/campaign" && request.method === "POST") {
    const goal = body.goal || "Lead Generation";
    return json({
      name:`AI Campaign — ${goal}`,
      objective:goal,
      audience:["High-intent audience","Warm engagement retargeting","Lookalike after sufficient quality data"],
      creatives:["15–30 sec problem/solution Reel","Offer-focused static","Testimonial/social proof"],
      copy:{primary:"Problem → benefit → proof → CTA",headline:"A better way to get results",cta:"Learn More"},
      checklist:["Confirm business details","Review audience","Review budget","Review creatives","Approve launch"]
    });
  }

  if (path === "ai/creative" && request.method === "POST") {
    return json({
      title:`${body.angle || "Problem → Solution"} Creative`,
      format:body.format || "1080×1350",
      hook:`${body.product || "Your offer"} — make the first 2 seconds impossible to ignore.`,
      layout:["Strong headline","Hero visual","3 benefit points","Proof/trust line","Single CTA"],
      meta:"Create multiple variations and keep the primary message easy to understand."
    });
  }

  if (path === "meta/status" && request.method === "GET") {
    return json({
      configured:Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
      liveEnabled:process.env.META_LIVE_ENABLED==="true"
    });
  }

  if (path === "meta/connect" && request.method === "GET") {
    if (!process.env.META_APP_ID || !process.env.META_REDIRECT_URI) return json({error:"Meta is not configured"},400);
    const scope="ads_management,ads_read";
    const auth=`https://www.facebook.com/dialog/oauth?client_id=${encodeURIComponent(process.env.META_APP_ID)}&redirect_uri=${encodeURIComponent(process.env.META_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
    return json({url:auth});
  }

  if (path === "meta/callback" && request.method === "GET") {
    return new Response("<h2>Meta connection received</h2><p>Complete the approved OAuth token exchange before enabling live campaign execution.</p><p><a href='/'>Return to AI Marketing OS</a></p>", {headers:{"content-type":"text/html"}});
  }

  return json({error:"API route not found"},404);
};
