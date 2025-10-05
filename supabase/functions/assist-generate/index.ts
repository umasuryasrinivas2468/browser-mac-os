import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, title, imagePrompts = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating content:', { type, prompt, title });

    // Generate images if requested
    const generatedImages: string[] = [];
    for (const imagePrompt of imagePrompts) {
      console.log('Generating image:', imagePrompt);
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: imagePrompt
            }
          ],
          modalities: ["image", "text"]
        })
      });

      if (!imageResponse.ok) {
        console.error("Image generation failed:", await imageResponse.text());
        continue;
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (imageUrl) {
        generatedImages.push(imageUrl);
      }
    }

    // Generate content based on type
    let systemPrompt = '';
    let userPrompt = prompt;

    if (type === 'ppt') {
      systemPrompt = `You are a professional presentation designer. Generate a structured PowerPoint presentation.
Return a JSON object with this structure:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2"],
      "notes": "Speaker notes",
      "imageIndex": 0
    }
  ]
}
If images were generated, assign them to slides using the imageIndex (0-based). Return ONLY valid JSON.`;
      userPrompt = `Create a ${title ? title + ' presentation' : 'presentation'} about: ${prompt}. Generate ${imagePrompts.length > 0 ? imagePrompts.length : 5} slides.`;
    } else if (type === 'doc') {
      systemPrompt = `You are a professional document writer. Generate well-structured document content.
Return a JSON object with this structure:
{
  "title": "Document Title",
  "sections": [
    {
      "heading": "Section Heading",
      "content": "Paragraph content here...",
      "imageIndex": 0
    }
  ]
}
If images were generated, assign them to sections using imageIndex. Return ONLY valid JSON.`;
      userPrompt = `Create a ${title ? title + ' document' : 'document'} about: ${prompt}`;
    } else if (type === 'code') {
      systemPrompt = `You are an expert software developer. Generate clean, production-ready code.
Return a JSON object with this structure:
{
  "language": "language name",
  "code": "full code here",
  "explanation": "brief explanation"
}
Return ONLY valid JSON.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify({ 
          content: parsed, 
          images: generatedImages,
          type 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (e) {
      console.error("Failed to parse JSON:", e);
    }

    return new Response(JSON.stringify({ 
      content, 
      images: generatedImages,
      type 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
