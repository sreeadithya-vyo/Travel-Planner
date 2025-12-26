export interface UserPreferences {
  destination: string;
  duration: number; // days
  travelers: number;
  budget: 'Budget' | 'Moderate' | 'Luxury';
  interests: string[];
}

export interface Activity {
  name: string;
  description: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  duration: string;
  location?: string;
  googleMapLink?: string; // Derived from grounding
  coordinates?: {
    lat: number;
    lng: number;
  };
  costEstimate?: number;
  category: 'Food' | 'Sightseeing' | 'Activity' | 'Relaxation';
}

export interface DayPlan {
  dayNumber: number;
  title: string; // e.g., "Historical Center & Food Tour"
  activities: Activity[];
}

export interface TripItinerary {
  destination: string;
  summary: string;
  currency: string;
  totalEstimatedCost: number;
  days: DayPlan[];
  detailedReport?: {
    logistics: string;
    packingTips: string;
    whyThisFits: string;
    localEtiquette: string;
  };
  groundingMetadata?: any;
}

export const INTERESTS_LIST = [
  "History", "Art", "Food", "Nature", "Nightlife", 
  "Shopping", "Adventure", "Relaxation", "Photography", "Architecture"
];