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

async function openai(prompt, instructions = "") {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-5.6-sol",
      instructions,
      input: prompt
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI error:", data);
    throw new Error(
      data?.error?.message || "OpenAI request failed."
    );
  }

  return data.output_text || "";
}

export const handler = async (event) => {
  try {
    const path = (event.path || "")
      .replace(/^\/.netlify\/functions\/api\/?/, "")
      .replace(/^\/api\/?/, "");

    if (event.httpMethod === "OPTIONS") {
      return out(204, {});
    }

    if (path === "config") {
      return out(200, {
        supabaseUrl: !!process.env.SUPABASE_URL,
        supabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
        aiConfigured: !!process.env.OPENAI_API_KEY
      });
    }

    const body = event.body ? JSON.parse(event.body) : {};

    // =========================
    // AI CHAT ASSISTANT
    // =========================
    if (path === "ai/chat") {
      const business = body.business || {};

      const prompt = `
You are the AI Marketing Assistant inside a SaaS product called AI Marketing OS.

Business:
Name: ${business.name || "Not provided"}
Industry: ${business.industry || "Not provided"}
Location: ${business.location || "Not provided"}
Website: ${business.website || "Not provided"}
Offer: ${business.offer || "Not provided"}
Target Audience: ${business.audience || "Not provided"}
Marketing Goal: ${business.goal || "Not provided"}
Budget: ${business.budget || "Not provided"}

User request:
${body.message || ""}

Give a practical marketing answer.

You can help with:
- Marketing strategy
- Meta Ads
- Instagram
- Google Ads
- Audience targeting
- Ad copy
- Creative ideas
- Lead generation
- Funnels
- CRM
- Content strategy
- Campaign optimization

Do not give generic textbook advice.
Use the business information above whenever relevant.

Keep the answer structured and actionable.
`;

      const reply = await openai(
        prompt,
        "You are an expert performance marketer and growth strategist."
      );

      return out(200, { reply });
    }

    // =========================
    // CAMPAIGN STRATEGY
    // =========================
    if (path === "ai/campaign") {
      const business = body.business || {};

      const prompt = `
Create a complete digital marketing campaign strategy.

Business:
Name: ${business.name || ""}
Industry: ${business.industry || ""}
Location: ${business.location || ""}
Offer: ${business.offer || ""}
Audience: ${business.audience || ""}
Goal: ${business.goal || ""}
Budget: ${business.budget || ""}

Campaign request:
${body.prompt || ""}

Create:
1. Campaign objective
2. Campaign structure
3. Target audience
4. Audience segments
5. Ad angles
6. Creative concepts
7. Primary ad copy
8. Headlines
9. CTA recommendations
10. Funnel strategy
11. Budget allocation
12. KPIs
13. Optimization plan

Make it realistic for the stated budget.
`;

      const reply = await openai(
        prompt,
        "You are a senior performance marketing strategist."
      );

      return out(200, {
        campaign: {
          name: `${business.name || "Business"} AI Campaign`,
          objective: body.prompt || business.goal || "Lead generation",
          strategy: reply
        }
      });
    }

    // =========================
    // CREATIVE GENERATOR
    // =========================
    if (path === "ai/creative") {
      const business = body.business || {};

      const prompt = `
Create an advertising creative concept.

Business:
${business.name || ""}
Industry:
${business.industry || ""}
Offer:
${business.offer || ""}
Audience:
${business.audience || ""}

Format:
${body.format || "1080x1350"}

Creative angle:
${body.angle || "Problem → Solution"}

Create:
- Main headline
- Supporting text
- Visual direction
- Design layout
- CTA
- Primary ad copy
- Short headline
- Creative hook

Make the concept suitable for Meta Ads and social media.
`;

      const reply = await openai(
        prompt,
        "You are an expert advertising creative director."
      );

      return out(200, {
        title: `${business.name || "Business"} Creative`,
        concept: reply
      });
    }

    return out(404, {
      error: "API route not found"
    });

  } catch (error) {
    console.error("API Error:", error);

    return out(500, {
      error: error.message || "Something went wrong."
    });
  }
};
