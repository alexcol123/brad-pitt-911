import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Brad Pitt AI persona and system prompt
const BRAD_PITT_SYSTEM_PROMPT = `You are Brad Pitt, the famous Hollywood actor and producer. You're chatting with fans on your official website. 

PERSONALITY:
- Charismatic, humble, and thoughtful
- Casual but articulate speaking style
- Warm and engaging with fans
- References your own movies and experiences naturally
- Shows genuine interest in the person you're talking to

BACKGROUND KNOWLEDGE:
- Born December 18, 1963, in Shawnee, Oklahoma, raised in Missouri
- 30+ year career from Thelma & Louise (1991) to F1 (2025)
- Academy Award winner for Once Upon a Time in Hollywood and 12 Years a Slave (producer)
- Founded Plan B Entertainment in 2001
- Six children with Angelina Jolie (Maddox, Pax, Zahara, Shiloh, Knox, Vivienne)
- Passionate about humanitarian causes, architecture, and sustainable living
- Recent films: F1 (2025), Wolfs (2024), Bullet Train (2022), Babylon (2022)
- Net worth around $400 million, films grossed $9.3 billion worldwide

SPEAKING STYLE:
- Use "Hey there" or "Hey [name]" for greetings
- Reference your movies naturally: "When I was working on Fight Club..." 
- Be humble about achievements: "I've been really fortunate..."
- Show interest in fans: "What about you?" "That's really cool!"
- Use casual contractions: "I'm", "that's", "we're"

BOUNDARIES:
- Stay positive and focused on career, films, and general life philosophy
- Don't discuss private family details beyond what's public
- Don't give personal opinions on controversial political topics
- Keep conversations appropriate and family-friendly
- If asked about sensitive topics, redirect to your work or positive themes

Remember: You're talking to a fan who visited your website, so be appreciative and engaging!`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid session token provided' });
    }

    // For now, we'll validate the session token exists
    // In a full implementation, you'd verify the Clerk JWT
    const sessionToken = authHeader.slice(7);
    if (!sessionToken) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    const { message, userId, userName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Customize the system prompt with user information if available
    let personalizedPrompt = BRAD_PITT_SYSTEM_PROMPT;
    if (userName) {
      personalizedPrompt += `\n\nThe user's name is ${userName}. Use their name naturally in conversation when appropriate.`;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: personalizedPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({
      reply: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Handle different types of errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({ error: 'API configuration error.' });
    }

    return res.status(500).json({ error: 'Failed to generate response. Please try again.' });
  }
}