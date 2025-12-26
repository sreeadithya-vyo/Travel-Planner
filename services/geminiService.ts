import { GoogleGenAI } from "@google/genai";
import { TripItinerary, UserPreferences, DayPlan, Activity } from "../types";

// Helper to safely get the API key without crashing in browser if process is undefined
const getAiClient = () => {
  let apiKey = "";
  try {
    apiKey = process.env.API_KEY || "";
  } catch (e) {
    console.warn("process.env is not accessible. Ensure API_KEY is injected during build.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Clean raw JSON string from Markdown code blocks if present
 */
const cleanJsonString = (str: string): string => {
  return str.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const generateTripItinerary = async (prefs: UserPreferences): Promise<TripItinerary> => {
  // gemini-2.5-flash is chosen for optimal speed/latency while maintaining quality
  const modelId = "gemini-2.5-flash"; 

  const prompt = `
    Create a ${prefs.duration}-day travel itinerary for ${prefs.destination}.
    Travelers: ${prefs.travelers}. Budget: ${prefs.budget}. Interests: ${prefs.interests.join(", ")}.

    Output purely VALID JSON. No conversational filler.
    
    Structure:
    {
      "destination": "City, Country",
      "summary": "Brief 1-sentence hook.",
      "currency": "Code",
      "totalEstimatedCost": number,
      "detailedReport": {
        "logistics": "Transport & safety advice.",
        "packingTips": "What to pack.",
        "whyThisFits": "Why this matches user interests.",
        "localEtiquette": "Cultural do's/don'ts."
      },
      "days": [
        {
          "dayNumber": 1,
          "title": "Day Theme",
          "activities": [
            {
              "name": "Place Name",
              "description": "Concise 15-word max description.",
              "timeSlot": "Morning" | "Afternoon" | "Evening",
              "duration": "e.g. 2h",
              "location": "Address",
              "coordinates": { "lat": number, "lng": number },
              "costEstimate": number,
              "category": "Food" | "Sightseeing" | "Activity" | "Relaxation"
            }
          ]
        }
      ]
    }

    Constraints:
    1. Use Google Maps tool to verify real locations and get coordinates (lat/lng) for accurate mapping.
    2. Group activities by proximity to minimize travel.
    3. Keep descriptions short to improve generation speed.
    4. Ensure coordinates are provided for at least 90% of locations.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }], 
        temperature: 0.4,
      },
    });

    const rawText = response.text || "{}";
    
    // Extract Grounding Metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    let parsedData: TripItinerary;
    try {
      parsedData = JSON.parse(cleanJsonString(rawText));
    } catch (e) {
      console.error("Failed to parse JSON from AI response", rawText);
      throw new Error("AI generated an invalid format. Please try again.");
    }

    // Post-process to inject map links if names match
    parsedData.days.forEach(day => {
      day.activities.forEach(activity => {
        const match = groundingChunks.find((chunk: any) => 
          chunk.maps?.title && activity.name.toLowerCase().includes(chunk.maps.title.toLowerCase())
        );
        if (match?.maps?.uri) {
          activity.googleMapLink = match.maps.uri;
        }
      });
    });

    parsedData.groundingMetadata = groundingChunks;
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};