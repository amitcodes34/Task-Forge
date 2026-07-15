const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Score a bid using Google Gemini AI.
 * Returns { score, reason, flags } or nulls on failure.
 */
const scoreBid = async (bid, project, freelancer) => {
  if (process.env.AI_SCORING_ENABLED !== 'true' || !process.env.GEMINI_API_KEY) {
    return { score: null, reason: null, flags: [] };
  }

  const systemInstruction = "You are an expert recruiter. Reply ONLY with valid JSON, no markdown, no explanation.";

  const prompt = `
  Project: ${project.title}
  Description: ${project.description}
  Required skills: ${(project.skillsRequired || []).join(', ')}
  Budget: ${project.budget}

  Freelancer bid:
  Price: ${bid.amount}
  Cover note: ${bid.proposal}
  Freelancer skills: ${(freelancer.skills || []).join(', ')}

  Score 0-100. Criteria:
  - Cover note addresses requirements specifically (40 pts)
  - Freelancer has matching skills (30 pts)
  - Price is within budget range (20 pts)
  - Not a generic copy-paste message (10 pts)

  Reply with exactly:
  {"score": <int>, "reason": "<one sentence>", "flags": []}
  Possible flags: "generic_message", "overpriced", "underqualified"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    const result = JSON.parse(text);

    return {
      score: typeof result.score === 'number' ? result.score : null,
      reason: result.reason || null,
      flags: Array.isArray(result.flags) ? result.flags : []
    };
  } catch (error) {
    console.error('⚠️ AI Scoring failed (non-fatal):', error.message);
    return { score: null, reason: null, flags: [] };
  }
};

module.exports = { scoreBid };
