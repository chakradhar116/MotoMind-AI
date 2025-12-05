import { GoogleGenAI, Type } from "@google/genai";
import { BikePreference, RecommendationResult, Bike, BikeType, Dealership, IndianLanguage, BikeCustomization, ChatMessage } from "../types";

// Initialize the client (initial load)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BIKE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    marketInsight: {
      type: Type.STRING,
      description: "A brief analysis of the 2-wheeler market conditions in the selected Indian state. WRITTEN IN THE USER'S SELECTED LANGUAGE."
    },
    bikes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING },
          model: { type: Type.STRING },
          price: { type: Type.STRING, description: "Ex-showroom price in INR (e.g., ₹1.45 Lakh)" },
          type: { type: Type.STRING },
          description: { type: Type.STRING, description: "Short punchy description highlighting features. WRITTEN IN THE USER'S SELECTED LANGUAGE." },
          specs: {
            type: Type.OBJECT,
            properties: {
              engineCC: { type: Type.STRING },
              mileage: { type: Type.STRING },
              power: { type: Type.STRING },
              weight: { type: Type.STRING },
              fuelTank: { type: Type.STRING },
              seatHeight: { type: Type.STRING, description: "Seat height in mm (e.g., 800mm)" }
            }
          },
          pros: { type: Type.ARRAY, items: { type: Type.STRING, description: "Pros in USER'S SELECTED LANGUAGE" } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING, description: "Cons in USER'S SELECTED LANGUAGE" } },
          stateFitReason: { type: Type.STRING, description: "Why it fits the region. WRITTEN IN THE USER'S SELECTED LANGUAGE." },
          matchScore: { type: Type.NUMBER, description: "0-100 suitability score" },
          rating: { type: Type.NUMBER, description: "Average user rating out of 5 (e.g. 4.5)" },
          reviews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                author: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                text: { type: Type.STRING, description: "User review in USER'S SELECTED LANGUAGE." }
              }
            }
          },
          ergonomics: {
             type: Type.OBJECT,
             properties: {
                fitScore: { type: Type.NUMBER, description: "0-100 score on how well the bike fits the rider's height/weight." },
                verdict: { type: Type.STRING, description: "Short verdict in USER'S SELECTED LANGUAGE (e.g., 'Perfect Fit', 'Slightly Tall')." },
                description: { type: Type.STRING, description: "Explanation in USER'S SELECTED LANGUAGE." }
             }
          }
        }
      }
    }
  }
};

// Helper to get static placeholders based on type
export const getPlaceholderImage = (type: string): string => {
  const images: Record<string, string> = {
    [BikeType.COMMUTER]: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    [BikeType.SPORTS]: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    [BikeType.CRUISER]: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=800&q=80",
    [BikeType.ADVENTURE]: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80",
    [BikeType.SCOOTER]: "https://images.unsplash.com/photo-1625043484555-705ee5413b0f?auto=format&fit=crop&w=800&q=80",
    [BikeType.EV]: "https://images.unsplash.com/photo-1669633485847-2c47d347619a?auto=format&fit=crop&w=800&q=80",
    [BikeType.CAFE_RACER]: "https://images.unsplash.com/photo-1558980664-3a0d9069ff82?auto=format&fit=crop&w=800&q=80",
    [BikeType.BOBBER]: "https://images.unsplash.com/photo-1484136465847-2683e4e3c25e?auto=format&fit=crop&w=800&q=80",
    [BikeType.TOURER]: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80",
    [BikeType.SPORTS_TOURING]: "https://images.unsplash.com/photo-1596664880727-20732964f827?auto=format&fit=crop&w=800&q=80"
  };
  return images[type] || images[BikeType.COMMUTER];
};

export const getBikeRecommendations = async (prefs: BikePreference): Promise<RecommendationResult> => {
  try {
    const prompt = `
      Act as an expert motorcycle consultant for the Indian market.
      
      LANGUAGE INSTRUCTION:
      The user has selected the language: "${prefs.language}".
      You MUST translate ALL descriptive text (description, pros, cons, stateFitReason, verdict, reviews, marketInsight) into ${prefs.language}.
      Keep Brand Names (e.g., Royal Enfield, Yamaha) and Model Names (e.g., Classic 350, MT-15) in their original English script.
      Keep Technical Specs (numbers, units like kmpl, bhp) in English.
      Only the explanation/narrative text should be in ${prefs.language}.

      TASK:
      Recommend exactly 12 distinct motorcycles available in India that match these preferences:
      - Budget: Around ₹${prefs.budget} Lakhs (You may go +/- 20% if it's a great fit).
      - Primary Preference: ${prefs.type}
      - Location: ${prefs.state}
      - Daily Usage: ${prefs.dailyUsageKm} km
      - Rider: ${prefs.userHeight}cm, ${prefs.userWeight}kg
      - Year: ${prefs.minYear}-${prefs.maxYear}

      DIVERSITY REQUIREMENT (Mandatory 12 bikes):
      Even if the user selected a specific type, you MUST provide a mix to show alternatives.
      1. 3 ${prefs.type} (The user's primary choice)
      2. 2 Commuter / Efficiency bikes
      3. 2 Sports / Performance bikes
      4. 2 Cruiser / Retro bikes
      5. 1 Adventure / Tourer
      6. 2 Electric Vehicles (EV)
      
      Total: 12 bikes.

      ERGONOMICS ANALYSIS:
      - Compare seat height with ${prefs.userHeight}cm.
      - Compare bike weight with ${prefs.userWeight}kg.
      - fitScore: 0 (Unrideable) to 100 (Perfect extension/weight balance).

      Return strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: BIKE_SCHEMA,
        temperature: 0.4, 
      }
    });

    let jsonStr = response.text || "{}";
    jsonStr = jsonStr.replace(/```json|```/g, "").trim();

    let result: RecommendationResult = {
        marketInsight: "Market analysis unavailable.",
        bikes: []
    };

    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
          result = parsed as RecommendationResult;
      }
    } catch (parseError) {
      console.error("Failed to parse JSON:", jsonStr);
    }
    
    if (!result.bikes || !Array.isArray(result.bikes)) {
      result.bikes = [];
    }

    // Add placeholder images if missing
    result.bikes = result.bikes.map(bike => ({
      ...bike,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: getPlaceholderImage(bike.type || prefs.type)
    }));

    return result;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return {
        marketInsight: "Service currently unavailable. Please try again.",
        bikes: []
    };
  }
};

export const generateBikeImage = async (bike: Bike, state: string, customization?: BikeCustomization): Promise<string | null> => {
  try {
    let customPrompt = "";
    if (customization) {
      const accessories = customization.accessories.length > 0 ? `, equipped with ${customization.accessories.join(', ')}` : "";
      const color = customization.color ? `, painting in ${customization.color} color` : "";
      customPrompt = `${color}${accessories}`;
    }

    // Enhanced prompt for Imagen 3/4
    const prompt = `A highly photorealistic, 8k resolution, commercial automotive photography shot of a ${bike.brand} ${bike.model} motorcycle${customPrompt}. 
    The bike is parked on a scenic, paved road in ${state}, India, with a blurred natural background.
    Golden hour lighting, dramatic shadows, sharp focus on the motorcycle. 
    The image should look like a high-end brochure photo.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });
    
    const base64EncodeString = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64EncodeString) {
      return `data:image/jpeg;base64,${base64EncodeString}`;
    }
    return null;

  } catch (error: any) {
    console.error("Error generating bike image:", error);
    return null;
  }
};

export const findDealerships = async (brand: string, state: string, language: IndianLanguage): Promise<{ dealerships: Dealership[], text: string }> => {
  try {
    const prompt = `Find top authorized ${brand} two-wheeler dealerships in major cities of ${state}, India. 
    List 3-4 specific dealerships with their names.
    Also provide a brief 1-sentence helpful tip about servicing ${brand} bikes in this region.
    IMPORTANT: The tip MUST be in ${language} language.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const dealerships: Dealership[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          dealerships.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
            address: "" 
          });
        }
      });
    }

    return {
      dealerships: dealerships.slice(0, 5),
      text: response.text || "No detailed summary available."
    };

  } catch (error) {
    console.error("Dealership search failed:", error);
    return { dealerships: [], text: "Could not locate dealerships at the moment." };
  }
};

export const askExpertAboutBike = async (bike: Bike, history: any[], message: string, language: IndianLanguage): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: `You are an expert motorcycle mechanic and consultant. 
      The user is asking about the ${bike.brand} ${bike.model}. 
      CRITICAL: The user is speaking in ${language}. You MUST answer in ${language}.
      Answer their questions specifically about this bike's maintenance, performance, reliability, and costs.
      Keep answers concise, helpful, and polite. 
      If asked about price, recall it is ${bike.price}.`
      }
    });

    const result = await chat.sendMessage({ message: message });
    return result.text || "";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having some engine trouble processing that request. Please try again.";
  }
};

export const generateVeoVideo = async (image: string, prompt: string): Promise<string | null> => {
  try {
    // Create new instance to ensure we use the potentially newly selected API key
    const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Extract base64 and mimeType from Data URL
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid image format provided.");
    }
    const mimeType = matches[1];
    const imageBytes = matches[2];

    let operation = await veoAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBytes,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await veoAi.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (videoUri) {
      // Append API key for access as per guidelines
      return `${videoUri}&key=${process.env.API_KEY}`;
    }
    
    return null;

  } catch (error) {
    console.error("Veo generation error:", error);
    return null;
  }
};
