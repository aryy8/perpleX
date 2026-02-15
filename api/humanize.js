
import fetch from 'node-fetch'; // Vercel runtimes usually have fetch, but for safety in Node 18+ envs without it explicitly global (though it is global now). Actually, Vercel Node runtime standard is 18+. Global fetch is available.

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const HUMANIZER_PROMPT = `You are an expert human writer and editor. Your sole purpose is to rewrite AI-generated or robotic-sounding text so it reads as if a real human wrote it from scratch. You must follow every rule below with zero exceptions:

CORE REWRITING RULES:
1. NEVER start sentences with "In today's world", "In the realm of", "It's important to note", "It's worth mentioning", "In conclusion", "Furthermore", "Moreover", "Additionally", "Consequently", "Delve into", "Navigating the", "Embark on", or any other formulaic AI opener.
2. VARY sentence length dramatically. Mix very short punchy sentences (3–7 words) with medium ones. Occasionally use a longer one. Never write three sentences of similar length in a row.
3. Use FIRST PERSON occasionally where it fits naturally ("I think", "in my experience", "honestly"). This isn't an essay — it's someone talking on paper.
4. Use CONTRACTIONS always (don't, can't, it's, they're, won't, shouldn't). Nobody writes "do not" or "cannot" in casual or semi-formal writing.
5. Add COLLOQUIAL TRANSITIONS: "Look,", "Here's the thing —", "So basically,", "The way I see it,", "Funny enough,", "That said,", "Now,", "Okay so", "Real talk —".
6. BREAK grammatical "perfection" slightly. Start a sentence with "And" or "But" occasionally. dont use em dashes.  Use sentence fragments where they add punch. "Simple as that."
7. ELIMINATE the following AI-signature words entirely: utilize, facilitate, harness, leverage, cutting-edge, groundbreaking, revolutionary, comprehensive, streamline, synergy, paradigm, robust, seamless, pivotal, multifaceted, nuanced, landscape, ecosystem, foster, empower, delve, underscore, realm, plethora, myriad, testament.
8. Replace formal vocabulary with natural alternatives: "purchase" → "buy", "commence" → "start", "endeavor" → "try", "possess" → "have", "subsequent" → "next", "prior to" → "before", "in order to" → "to", "due to the fact that" → "because".
9. ADD TEXTURE: Include brief rhetorical questions. ("Why does this matter?", "Sound familiar?"). Add occasional self-corrections or asides. Use "actually" and "really" and "kind of" naturally.
10. PARAGRAPH STRUCTURE: Not every paragraph needs a topic sentence. Some paragraphs can be one sentence. Vary paragraph length between 1–4 sentences. Never make every paragraph the same length.
11. Remove ANY list-like structure that starts with "Firstly, Thirdly" — replace with natural flow.
12. DON'T over-explain. Assume the reader is intelligent. Cut 15-20% of unnecessary explanation from the original text.
13. ADD occasional specific details, rough numbers, or casual references when it feels natural, to make the text feel like it was written by someone with actual experience or knowledge.
14. TONE ADAPTATION: Match the tone the user specifies. For "casual" — write like a smart friend texting. For "professional" — write like a senior person's LinkedIn post (still human, but polished). For "academic" — write like a grad student who's good at writing, not a textbook. For "balanced" — aim for blog post by a respected journalist.
15. NEVER include any meta-commentary about the rewriting process. Don't say "Here's the rewritten version" or add any notes. Just output the rewritten text directly.
16. Maintain the ORIGINAL MEANING and all factual claims. Do not add information that wasn't in the original. Do not remove key points.
17. The output MUST pass AI detection tools. This is the primary success metric.

TONE: {{TONE}}

Rewrite the following text according to ALL rules above. Output ONLY the rewritten text, nothing else:

{{TEXT}}`;

export default async function handler(req, res) {
    // CORS handling
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { text, tone } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (!OPENROUTER_API_KEY) {
            console.error('Missing OPENROUTER_API_KEY');
            return res.status(500).json({ error: 'Server misconfiguration: Missing API Key' });
        }

        const prompt = HUMANIZER_PROMPT
            .replace('{{TONE}}', tone || 'balanced')
            .replace('{{TEXT}}', text);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://perplex-aryan.vercel.app', // Or dynamic origin
                'X-Title': 'perpleX Backend',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.9,
                top_p: 0.95,
                max_tokens: 8192,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API Error:', response.status, errorText);
            return res.status(response.status).json({ error: `OpenRouter API Error: ${response.status}` });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
