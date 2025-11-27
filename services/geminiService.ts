
import { GoogleGenAI, Type } from "@google/genai";
import { BikePreference, RecommendationResult, Bike, BikeType, Dealership, IndianLanguage, FuelPrices, BikeCustomization, ChatMessage } from "../types";

// Initialize the client (initial load)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BIKE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    marketInsight: {
      type: Type.STRING,
      description: "A brief analysis of the 2-wheeler market conditions in the selected Indian state, referencing road conditions or local trends."
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
          description: { type: Type.STRING, description: "Short punchy description of the bike highlighting key features." },
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
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          stateFitReason: { type: Type.STRING, description: "Specific reason why this bike is suitable for the selected Indian state/region." },
          matchScore: { type: Type.NUMBER, description: "0-100 suitability score" },
          rating: { type: Type.NUMBER, description: "Average user rating out of 5 (e.g. 4.5)" },
          reviews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                author: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                text: { type: Type.STRING, description: "Short realistic user review." }
              }
            }
          },
          ergonomics: {
             type: Type.OBJECT,
             properties: {
                fitScore: { type: Type.NUMBER, description: "0-100 score on how well the bike fits the rider's height/weight." },
                verdict: { type: Type.STRING, description: "Short verdict (e.g., 'Perfect Fit', 'Slightly Tall', 'Cramped for legs')." },
                description: { type: Type.STRING, description: "Explanation of how the seat height and weight handling matches the user stats." }
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
      Recommend 6-9 distinct motorcycles available in India that match these user preferences:
      
      - Budget: Approximately ₹${prefs.budget} Lakhs
      - Type: ${prefs.type}
      - Location/State: ${prefs.state} (Consider terrain, traffic, and popularity in this state)
      - Daily Usage: ${prefs.dailyUsageKm} km
      - Rider Stats: Height ${prefs.userHeight}cm, Weight ${prefs.userWeight}kg.
      - Language Context: ${prefs.language} (Ensure cultural nuances in description if possible)
      - Model Year Preference: ${prefs.minYear} to ${prefs.maxYear} (Prioritize models released or updated in this range).

      Include a diverse and extensive mix of brands to give the user plenty of options:
      1. Indian Market Leaders: Hero, Bajaj, TVS, Royal Enfield.
      2. Legends & Niche: Java, Yezdi, BSA.
      3. International Mass-Market: Honda, Yamaha, Suzuki.
      4. Premium International: KTM, Kawasaki, Triumph, Harley-Davidson, BMW Motorrad, Ducati, Aprilia, Benelli.
      5. Electric Innovators (if applicable): Ather, Ola, Ultraviolette, Tork, Revolt.

      Ensure a mix of popular best-sellers and underrated gems that fit the budget.
      
      For 'ergonomics':
      - Analyze if the seat height is comfortable for a person of ${prefs.userHeight}cm.
      - Analyze if the bike weight/power is manageable for ${prefs.userWeight}kg.
      - Provide a 'fitScore' (0-100) and a verdict (e.g. "Perfect", "Tiptoe Reach", "Cramped Legroom").

      Return the response strictly in JSON format matching the schema provided.
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

    // Sanitize response to remove potential markdown fences
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
      console.warn("Invalid bikes structure received, resetting to empty array.", result);
      result.bikes = [];
    }

    // Add placeholder images if missing
    result.bikes = result.bikes.map(bike => ({
      ...bike,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: getPlaceholderImage(prefs.type)
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
      const color = customization.color ? `, with a custom ${customization.color} paint job` : "";
      customPrompt = `${color}${accessories}`;
    }

    const prompt = `Generate a photorealistic image of a ${bike.brand} ${bike.model} motorcycle${customPrompt}. 
    The background should be a scenic road typical of ${state}, India. 
    The bike should be the main focus, sharp and detailed. Automotive advertising style.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        // responseMimeType is NOT supported for image generation models
      }
    });
    
    if (response.candidates && response.candidates[0].content.parts) {
       for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
       }
    }
    return null;

  } catch (error: any) {
    console.error("Error generating bike image:", error);
    return null;
  }
};

export const generateVeoVideo = async (imageBase64: string, prompt: string): Promise<string | null> => {
  const win = window as any;
  
  // Robust Key Check Function
  const ensureKeySelected = async () => {
    if (win.aistudio && win.aistudio.hasSelectedApiKey && win.aistudio.openSelectKey) {
         const hasKey = await win.aistudio.hasSelectedApiKey();
         if (!hasKey) {
             await win.aistudio.openSelectKey();
         }
    }
  };

  try {
    await ensureKeySelected();

    // Create a new instance to ensure the latest API key is used
    const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Strip header if present
    const cleanBase64 = imageBase64.includes("base64,") 
      ? imageBase64.split("base64,")[1] 
      : imageBase64;

    let operation = await aiClient.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: 'image/png', 
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Polling for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await aiClient.operations.getVideosOperation({operation: operation});
    }

    if (operation.response?.generatedVideos?.[0]?.video?.uri) {
       const videoUri = operation.response.generatedVideos[0].video.uri;
       // Append API key for playback
       return `${videoUri}&key=${process.env.API_KEY}`;
    }
    
    return null;

  } catch (error: any) {
    console.error("Veo generation error:", error);
    
    // Specific error handling for missing/invalid key association
    if (error.message && error.message.includes("Requested entity was not found")) {
        console.log("Resetting API Key selection...");
        if (win.aistudio && win.aistudio.openSelectKey) {
             await win.aistudio.openSelectKey();
        }
    }
    return null;
  }
};

export const findDealerships = async (brand: string, state: string, language: IndianLanguage): Promise<{ dealerships: Dealership[], text: string }> => {
  try {
    const prompt = `Find top authorized ${brand} two-wheeler dealerships in major cities of ${state}, India. 
    List 3-4 specific dealerships with their names.
    Also provide a brief 1-sentence helpful tip about servicing ${brand} bikes in this region in ${language}.`;

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

export const getFuelPrices = async (state: string, language: IndianLanguage): Promise<FuelPrices | null> => {
  try {
    const prompt = `What are the current Petrol, Diesel, and EV charging rates in ${state}, India today?
    Provide the prices in a structured format. Also mention if the trend is up or down.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "";
    const sources: {title: string, uri: string}[] = [];
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
       groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
             sources.push({ title: chunk.web.title || 'Source', uri: chunk.web.uri });
          }
       });
    }

    const petrolMatch = text.match(/Petrol[:\s]+₹?([\d.]+)/i);
    const dieselMatch = text.match(/Diesel[:\s]+₹?([\d.]+)/i);
    const evMatch = text.match(/EV|Electric[:\s]+₹?([\d.]+)/i);

    return {
       petrol: petrolMatch ? `₹${petrolMatch[1]}` : "₹96.72", 
       diesel: dieselMatch ? `₹${dieselMatch[1]}` : "₹89.62",
       ev: evMatch ? `₹${evMatch[1]}/kWh` : "₹18-25/kWh",
       trend: text.length > 50 ? text.substring(0, 100) + "..." : text,
       sources: sources.slice(0, 2)
    };

  } catch (error) {
    console.error("Fuel price fetch error", error);
    return null;
  }
}

export const askExpertAboutBike = async (bike: Bike, history: any[], message: string, language: IndianLanguage): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: `You are an expert motorcycle mechanic and consultant. 
      The user is asking about the ${bike.brand} ${bike.model}. 
      They are speaking in ${language} (or English).
      Answer their questions specifically about this bike's maintenance, performance, reliability, and costs.
      Keep answers concise, helpful, and polite. 
      If asked about price, recall it is ${bike.price}.
      Use the provided chat history for context.`
      }
    });

    const result = await chat.sendMessage({ message: message });
    return result.text || "";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having some engine trouble processing that request. Please try again.";
  }
};
