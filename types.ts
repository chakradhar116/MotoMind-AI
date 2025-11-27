
export enum BikeType {
  COMMUTER = 'Commuter',
  SPORTS = 'Sports/Naked',
  CRUISER = 'Cruiser',
  ADVENTURE = 'Adventure/Off-road',
  SCOOTER = 'Scooter',
  EV = 'Electric Vehicle',
  CAFE_RACER = 'Cafe Racer',
  BOBBER = 'Bobber',
  TOURER = 'Tourer',
  SPORTS_TOURING = 'Sports Touring'
}

export enum IndianState {
  ANDAMAN_NICOBAR = 'Andaman and Nicobar Islands',
  ANDHRA_PRADESH = 'Andhra Pradesh',
  ARUNACHAL_PRADESH = 'Arunachal Pradesh',
  ASSAM = 'Assam',
  BIHAR = 'Bihar',
  CHANDIGARH = 'Chandigarh',
  CHHATTISGARH = 'Chhattisgarh',
  DADRA_NAGAR_HAVELI_DAMAN_DIU = 'Dadra & Nagar Haveli and Daman & Diu',
  DELHI = 'Delhi',
  GOA = 'Goa',
  GUJARAT = 'Gujarat',
  HARYANA = 'Haryana',
  HIMACHAL_PRADESH = 'Himachal Pradesh',
  JAMMU_KASHMIR = 'Jammu & Kashmir',
  JHARKHAND = 'Jharkhand',
  KARNATAKA = 'Karnataka',
  KERALA = 'Kerala',
  LADAKH = 'Ladakh',
  LAKSHADWEEP = 'Lakshadweep',
  MADHYA_PRADESH = 'Madhya Pradesh',
  MAHARASHTRA = 'Maharashtra',
  MANIPUR = 'Manipur',
  MEGHALAYA = 'Meghalaya',
  MIZORAM = 'Mizoram',
  NAGALAND = 'Nagaland',
  ODISHA = 'Odisha',
  PUDUCHERRY = 'Puducherry',
  PUNJAB = 'Punjab',
  RAJASTHAN = 'Rajasthan',
  SIKKIM = 'Sikkim',
  TAMIL_NADU = 'Tamil Nadu',
  TELANGANA = 'Telangana',
  TRIPURA = 'Tripura',
  UTTAR_PRADESH = 'Uttar Pradesh',
  UTTARAKHAND = 'Uttarakhand',
  WEST_BENGAL = 'West Bengal'
}

export enum IndianLanguage {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  TELUGU = 'Telugu',
  TAMIL = 'Tamil',
  KANNADA = 'Kannada',
  MALAYALAM = 'Malayalam',
  BENGALI = 'Bengali',
  MARATHI = 'Marathi',
  GUJARATI = 'Gujarati',
  PUNJABI = 'Punjabi',
  ODIA = 'Odia',
  ASSAMESE = 'Assamese',
  URDU = 'Urdu',
  KONKANI = 'Konkani',
  MANIPURI = 'Manipuri',
  KASHMIRI = 'Kashmiri',
  NEPALI = 'Nepali',
  SANSKRIT = 'Sanskrit',
  SINDHI = 'Sindhi',
  DOGRI = 'Dogri',
  MAITHILI = 'Maithili',
  BODO = 'Bodo',
  SANTALI = 'Santali'
}

export interface BikePreference {
  budget: number; // In Lakhs
  type: BikeType;
  state: IndianState;
  dailyUsageKm: number;
  language: IndianLanguage;
  minYear: number;
  maxYear: number;
  userHeight: number; // in cm
  userWeight: number; // in kg
}

export interface BikeSpecs {
  engineCC: string;
  mileage: string; // kmpl or range for EV
  power: string;
  weight: string;
  fuelTank: string; // or Battery capacity
  seatHeight: string; // New field for fit check
}

export interface Review {
  author: string;
  rating: number; // 1-5
  text: string;
  date?: string;
}

export interface Ergonomics {
  fitScore: number; // 0-100
  verdict: string; // e.g., "Perfect Fit", "Too Tall", "Cramped"
  description: string; // Explanation based on rider height/weight
}

export interface Bike {
  id: string;
  brand: string;
  model: string;
  price: string; // e.g. "₹1.50 Lakh"
  type: string;
  description: string;
  specs: BikeSpecs;
  pros: string[];
  cons: string[];
  stateFitReason: string; // Why it fits the selected state
  matchScore: number;
  imageUrl?: string;
  rating: number; // Average rating
  reviews: Review[];
  ergonomics: Ergonomics;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface RecommendationResult {
  marketInsight: string; // General thought about the market in that state
  bikes: Bike[];
}

export interface Dealership {
  title: string;
  uri: string;
  address?: string; // Extracted if possible, or part of title
}

export interface FuelPrices {
  petrol: string;
  diesel: string;
  ev: string;
  trend: string;
  sources: { title: string, uri: string }[];
}

export interface BikeCustomization {
  color: string;
  accessories: string[];
}
