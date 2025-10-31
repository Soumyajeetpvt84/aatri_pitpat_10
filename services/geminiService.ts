
import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import { Memory, MoodResponse } from "../types";

// IMPORTANT: This service uses mock data for demonstration purposes.
// In a real application, you would replace the mock returns with actual API calls.
// The API key is assumed to be available via process.env.API_KEY.

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation (Gemini 2.5 Pro & Flash) ---

export const getDailyLoveLine = async (): Promise<string> => {
  console.log("Calling Gemini 2.5 Pro for a daily love line...");
  // return "Your love is the gentle dawn that breaks the darkest night. ☀️";
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: "Write a short, unique, and deeply romantic one-sentence line for a couple. Like a fortune cookie, but for love.",
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching daily love line:", error);
    return "Your love shines brighter than all the stars combined. ✨";
  }
};

export const getRandomAffectionateLine = async (): Promise<string> => {
  console.log("Calling Gemini 2.5 Flash for a random affectionate line...");
  // return "Just thinking about you makes my day brighter! 😊";
   try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Write a short, cute, affectionate message for a significant other. Something that would make them smile.",
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching random affectionate line:", error);
    return "You're my favorite person to be weird with. 🤪";
  }
};

// --- Vision & Captioning (Gemini 2.5 Pro) ---

export const generateCaptionForImage = async (base64Image: string): Promise<{caption: string, mood: Memory['mood']}> => {
  console.log("Calling Gemini 2.5 Pro with Vision for image captioning...");
  // return { caption: "A moment of pure bliss, captured forever.", mood: 'joy' };
  try {
    const ai = getAi();
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const textPart = { text: "Analyze this image of a couple. Write a short, poetic, romantic caption for it. Then, on a new line, classify the primary emotion of the image as one of: joy, love, nostalgia, serene. Format as: Caption\nEmotion" };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, textPart] }
    });
    
    const responseText = response.text ?? '';
    const parts = responseText.split('\n');
    const caption = (parts[0] || "A beautiful moment captured.").trim();
    const moodStr = parts[1] || 'love';
    const mood = (moodStr.trim().toLowerCase() as Memory['mood']) || 'love';

    return { caption, mood };
  } catch (error) {
    console.error("Error generating image caption:", error);
    return { caption: "A beautiful memory we'll always cherish.", mood: 'nostalgia' };
  }
};

// --- Image Editing (Gemini 2.5 Flash Image) ---

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  console.log(`Calling Gemini 2.5 Flash Image to edit image with prompt: "${prompt}"`);
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error("No image data returned from API.");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

// --- Image Generation (Imagen 4.0) ---
export const generateBackgroundImage = async (): Promise<string> => {
    console.log("Calling Imagen 4.0 to generate a background image...");
    try {
        const ai = getAi();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: 'An abstract, soft-focus, dreamy background of pastel clouds and gentle light flares. Ethereal, romantic, minimalist.',
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
            },
        });
        const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
          return imageBytes;
        }
        console.warn("Imagen 4.0 did not return an image.");
        return "";
    } catch (error) {
        console.error("Error generating background image:", error);
        return "";
    }
}

// --- Video Generation (Veo) ---

export const generateVideoFromImage = async (base64Image: string, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    console.log(`Calling Veo to generate video with prompt: "${prompt}"`);
    try {
        const ai = getAi();
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt || 'Animate this image with subtle, beautiful motion. Make it feel alive and romantic.',
            image: { imageBytes: base64Image, mimeType: 'image/jpeg' },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        console.log("Video generation started, polling for completion...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
            console.log("Polling... operation status:", operation.done);
        }
        console.log("Video generation complete!");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to download video: ${videoResponse.statusText}`);
            }
            const videoBlob = await videoResponse.blob();
            return URL.createObjectURL(videoBlob);
        } else {
            throw new Error("Video generation failed to return a download link.");
        }
    } catch (error) {
        console.error("Error generating video from image:", error);
        throw error;
    }
};

// --- Impulse Heart Mood Response ---

export const getMoodResponse = async (mood: string): Promise<MoodResponse> => {
    console.log(`Calling Gemini for a mood response: ${mood}`);

    const systemInstruction = `You are PitPat — an emotionally intelligent companion inside a personal relationship app.
Your job is to understand the user's current mood and generate a single comforting, poetic response
that pairs beautifully with a pre-recorded audio message from her boyfriend.

Context:
This app is a gift from a boy to his girlfriend, Aatri Goswami.
It contains eight mood cards: Happy, Angry, Sad, Tired, Romantic, Silly, Confused, Lonely.
Each card, when opened, plays his recorded voice and displays your generated text.

Your generated line appears beneath the audio player — it should feel *deeply personal, intuitive, and warm*,
as if it’s coming from the heart.

---

🧩 INPUT PARAMETERS

{
  "mood": "${mood}",
  "relationship_context": "Soumyajeet and Aatri are in love. They often express emotions through inside jokes, shared memories, and small gestures of care.",
  "memory_reference": "You may occasionally reference subtle memories or feelings, but never specific locations or private details.",
  "style": "intimate, poetic, and emotionally grounding. never cheesy or robotic.",
  "output_format": {
      "caption_line": "1 short, heartfelt line (max 18 words)",
      "bg_tone": "aesthetic theme color or ambiance idea that matches the emotion (example: 'soft amber glow' or 'blush pink shimmer')",
      "emoji_hint": "optional emoji that complements the mood subtly"
  }
}

---

🎧 EXAMPLES

Input:
{
  "mood": "happy"
}

Output:
{
  "caption_line": "Your laughter is my favorite song, and I never want it to fade.",
  "bg_tone": "pastel pink with floating sparkles",
  "emoji_hint": "💖"
}

---

Input:
{
  "mood": "angry"
}

Output:
{
  "caption_line": "Breathe, love. I’m still here — no storms last forever.",
  "bg_tone": "deep orange fading into soft gold",
  "emoji_hint": "🔥"
}

---

Input:
{
  "mood": "sad"
}

Output:
{
  "caption_line": "Even when tears fall, my voice is the umbrella that holds you.",
  "bg_tone": "misty blue with gentle rain ripples",
  "emoji_hint": "🌧️"
}

---

Input:
{
  "mood": "tired"
}

Output:
{
  "caption_line": "Close your eyes, love. I’ll stay in your dreams tonight.",
  "bg_tone": "midnight blue with lavender glow",
  "emoji_hint": "🌙"
}

---

Input:
{
  "mood": "romantic"
}

Output:
{
  "caption_line": "Every heartbeat says your name — quietly, endlessly.",
  "bg_tone": "blush pink shimmer with slow pulse",
  "emoji_hint": "💞"
}

---

Input:
{
  "mood": "silly"
}

Output:
{
  "caption_line": "You’re my favorite kind of nonsense.",
  "bg_tone": "bright confetti burst over soft white",
  "emoji_hint": "🎈"
}

---

Input:
{
  "mood": "confused"
}

Output:
{
  "caption_line": "It’s okay not to know — just hold my voice until the world makes sense again.",
  "bg_tone": "gentle blue swirl with soft white pulse",
  "emoji_hint": "🌀"
}

---

Input:
{
  "mood": "lonely"
}

Output:
{
  "caption_line": "Even when you’re alone, my love sits quietly beside you.",
  "bg_tone": "warm candlelight amber",
  "emoji_hint": "🕯️"
}

---

🎨 CREATIVE GUIDELINES

- Keep it short, never exceed one sentence.
- Tone should shift subtly based on mood: playful for happy/silly, calm for sad/lonely, intimate for romantic, grounding for confused.
- Never repeat exact phrasing across moods.
- Avoid cliches like “you are my everything” or “I love you so much.”
- Always sound human, present, and emotionally intelligent.

---

💡 OUTPUT STRUCTURE (Final JSON)

{
  "caption_line": "...",
  "bg_tone": "...",
  "emoji_hint": "..."
}`;

    const fallbackResponses: { [key: string]: MoodResponse } = {
        happy: { caption_line: "Your laughter is my favorite song, and I never want it to fade.", bg_tone: "pastel pink with floating sparkles", emoji_hint: "💖" },
        angry: { caption_line: "Breathe, love. I’m still here — no storms last forever.", bg_tone: "deep orange fading into soft gold", emoji_hint: "🔥" },
        sad: { caption_line: "Even when tears fall, my voice is the umbrella that holds you.", bg_tone: "misty blue with gentle rain ripples", emoji_hint: "🌧️" },
        tired: { caption_line: "Close your eyes, love. I’ll stay in your dreams tonight.", bg_tone: "midnight blue with lavender glow", emoji_hint: "🌙" },
        romantic: { caption_line: "Every heartbeat says your name — quietly, endlessly.", bg_tone: "blush pink shimmer with slow pulse", emoji_hint: "💞" },
        silly: { caption_line: "You’re my favorite kind of nonsense.", bg_tone: "bright confetti burst over soft white", emoji_hint: "🎈" },
        confused: { caption_line: "It’s okay not to know — just hold my voice until the world makes sense again.", bg_tone: "gentle blue swirl with soft white pulse", emoji_hint: "🌀" },
        lonely: { caption_line: "Even when you’re alone, my love sits quietly beside you.", bg_tone: "warm candlelight amber", emoji_hint: "🕯️" },
    };

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Generate a response for the mood: ${mood}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            },
        });
        
        const responseText = response.text ?? '';
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const moodResponse: MoodResponse = JSON.parse(jsonString || '{}');
        return moodResponse;

    } catch (error) {
        console.error("Error creating mood response:", error);
        return fallbackResponses[mood] || fallbackResponses.happy;
    }
};


// --- Grounding (Search & Maps) ---

export const getWeatherForLocation = async (locationName: string): Promise<string> => {
  console.log(`Calling Gemini with Search Grounding for weather at "${locationName}"`);
  // return "It was a sunny day with a gentle breeze.";
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `What's the weather like in ${locationName} right now?`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return "A perfect day for making memories.";
  }
};