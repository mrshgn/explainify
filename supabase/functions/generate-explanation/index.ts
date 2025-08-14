import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = 'https://zkykndklekrrnsnykkye.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey!);
    const { topic, level, fileContent, userId } = await req.json();

    console.log('Generating explanation for:', { topic, level, hasFile: !!fileContent });

    // Create prompt based on level
    const levelPrompts = {
      eli5: `Explain "${topic}" like I'm 5 years old. Use simple words, fun analogies, and make it engaging. Keep it under 200 words.`,
      eli12: `Explain "${topic}" like I'm 12 years old. Use clear language with some technical terms but explain them. Include examples. Keep it under 300 words.`,
      eli18: `Explain "${topic}" like I'm 18 years old. Use appropriate complexity, technical terms, and real-world applications. Keep it under 400 words.`
    };

    let prompt = levelPrompts[level as keyof typeof levelPrompts];
    
    if (fileContent) {
      prompt = `Based on this document content: "${fileContent.substring(0, 2000)}..." ${prompt}`;
    }

    // Call Gemini API
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
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
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
    
    const explanation = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      explanation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-explanation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});