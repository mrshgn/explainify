import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating daily facts...');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    const prompt = `Generate 5 fascinating, educational facts that would be perfect for a "Daily Brain Fuel" section. Each fact should be:
1. Surprising and interesting
2. Educational but accessible 
3. About different topics (science, history, nature, technology, psychology, space, etc.)
4. Suitable for all ages
5. 2-3 sentences long
6. Use diverse and engaging topics

Format as JSON with this structure:
{
  "facts": [
    {
      "title": "Brief catchy title",
      "content": "The actual fact explanation",
      "category": "Science/History/Nature/Technology/etc",
      "emoji": "relevant emoji"
    }
  ]
}`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini');
    }
    
    const content = data.candidates[0].content.parts[0].text;
    console.log('Gemini response:', content);
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const facts = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(facts), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-facts function:', error);
    
    // Fallback facts if API fails
    const fallbackFacts = {
      facts: [
        {
          title: "Octopus Intelligence",
          content: "Octopuses have three hearts and blue blood! Two hearts pump blood to their gills, while the third pumps blood to the rest of their body. Their blue blood comes from a copper-based protein that carries oxygen more efficiently in cold water.",
          category: "Marine Biology",
          emoji: "🐙"
        },
        {
          title: "Honey Never Spoils",
          content: "Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible! Honey's low moisture content and acidic pH create an environment where bacteria cannot survive.",
          category: "Science",
          emoji: "🍯"
        },
        {
          title: "Tree Internet",
          content: "Trees in a forest communicate with each other through an underground network of fungi called the 'Wood Wide Web.' They share nutrients, water, and even warning signals about insect attacks through this natural internet!",
          category: "Nature",
          emoji: "🌳"
        },
        {
          title: "Diamond Rain",
          content: "It literally rains diamonds on Neptune and Uranus! The extreme pressure and temperature in these planets' atmospheres compress carbon atoms into diamond crystals that fall like rain through the atmosphere.",
          category: "Space",
          emoji: "💎"
        },
        {
          title: "Butterfly Memory",
          content: "Butterflies can remember things they learned as caterpillars! Even though they completely dissolve their body during metamorphosis, some memories remain intact through the transformation process.",
          category: "Biology",
          emoji: "🦋"
        }
      ]
    };
    
    return new Response(JSON.stringify(fallbackFacts), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});