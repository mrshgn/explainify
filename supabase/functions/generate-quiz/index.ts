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
    const { topic, level } = await req.json();
    
    console.log('Generating quiz for:', { topic, level });

    const prompt = `Create a quiz about "${topic}" for someone at ${level} level. 
    
Generate exactly 3 multiple choice questions with 4 options each (A, B, C, D).
Format as JSON with this structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make questions appropriate for the level:
- eli5: Very simple concepts with everyday examples
- eli12: Basic technical understanding 
- eli18: More complex reasoning and applications`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
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

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Invalid response from Gemini API');
    }
    
    const content = data.candidates[0].content.parts[0].text;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const quiz = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(quiz), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    
    // Fallback quiz
    const fallbackQuiz = {
      questions: [
        {
          question: `What is the main concept behind ${req.json().topic || 'this topic'}?`,
          options: [
            "A) It's a complex system with many parts",
            "B) It's a simple, single-purpose tool", 
            "C) It doesn't really work in practice",
            "D) It's only used by experts"
          ],
          correct: 0,
          explanation: "Most topics involve interconnected systems and concepts working together."
        }
      ]
    };
    
    return new Response(JSON.stringify(fallbackQuiz), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});