export const cities = [
  { id: "del", name: "New Delhi", lat: 28.6139, lon: 77.209 },
  { id: "mum", name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { id: "blr", name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { id: "kol", name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { id: "che", name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { id: "hyd", name: "Hyderabad", lat: 17.385, lon: 78.4867 },
];

export const stations = [
  {
    id: "S-101",
    name: "Anand Vihar",
    pm25: 187,
    pm10: 254,
    no2: 78,
    o3: 45,
    status: "critical",
    lat: 28.65,
    lon: 77.31,
  },
  {
    id: "S-102",
    name: "Connaught Place",
    pm25: 142,
    pm10: 198,
    no2: 62,
    o3: 38,
    status: "unhealthy",
    lat: 28.63,
    lon: 77.22,
  },
  {
    id: "S-103",
    name: "Dwarka Sector 8",
    pm25: 98,
    pm10: 145,
    no2: 44,
    o3: 52,
    status: "moderate",
    lat: 28.57,
    lon: 77.06,
  },
  {
    id: "S-104",
    name: "Punjabi Bagh",
    pm25: 165,
    pm10: 221,
    no2: 71,
    o3: 41,
    status: "unhealthy",
    lat: 28.67,
    lon: 77.13,
  },
  {
    id: "S-105",
    name: "Lodhi Road",
    pm25: 76,
    pm10: 112,
    no2: 35,
    o3: 48,
    status: "moderate",
    lat: 28.59,
    lon: 77.22,
  },
  {
    id: "S-106",
    name: "Najafgarh",
    pm25: 134,
    pm10: 189,
    no2: 55,
    o3: 39,
    status: "unhealthy",
    lat: 28.61,
    lon: 76.98,
  },
  {
    id: "S-107",
    name: "RK Puram",
    pm25: 121,
    pm10: 167,
    no2: 49,
    o3: 42,
    status: "unhealthy",
    lat: 28.56,
    lon: 77.18,
  },
  {
    id: "S-108",
    name: "Shadipur",
    pm25: 156,
    pm10: 215,
    no2: 68,
    o3: 36,
    status: "unhealthy",
    lat: 28.65,
    lon: 77.15,
  },
];

export const sourceDistribution = [
  { name: "Vehicular Emissions", value: 38, color: "var(--chart-4)" },
  { name: "Industrial", value: 24, color: "var(--chart-3)" },
  { name: "Construction Dust", value: 18, color: "var(--chart-5)" },
  { name: "Biomass Burning", value: 12, color: "var(--chart-2)" },
  { name: "Other", value: 8, color: "var(--chart-1)" },
];

export const pollutantLevels = [
  { name: "PM2.5", value: 138, limit: 60 },
  { name: "PM10", value: 192, limit: 100 },
  { name: "NO₂", value: 58, limit: 80 },
  { name: "O₃", value: 42, limit: 100 },
  { name: "SO₂", value: 18, limit: 80 },
  { name: "CO", value: 1.4, limit: 4 },
];

export const aqiTrend = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  aqi: Math.round(140 + Math.sin(i / 3) * 35 + Math.random() * 25),
  pm25: Math.round(90 + Math.sin(i / 4) * 30 + Math.random() * 20),
}));

export const pollutionTrend = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
    vehicular: Math.round(35 + Math.random() * 12),
    industrial: Math.round(22 + Math.random() * 10),
    construction: Math.round(15 + Math.random() * 8),
    biomass: Math.round(10 + Math.random() * 6),
  };
});

export function aqiCategory(pm25: number) {
  if (pm25 <= 30) return { label: "Good", color: "oklch(0.7 0.18 145)" };
  if (pm25 <= 60) return { label: "Satisfactory", color: "oklch(0.78 0.16 110)" };
  if (pm25 <= 90) return { label: "Moderate", color: "oklch(0.78 0.16 75)" };
  if (pm25 <= 120) return { label: "Poor", color: "oklch(0.7 0.18 45)" };
  if (pm25 <= 250) return { label: "Very Poor", color: "oklch(0.6 0.22 25)" };
  return { label: "Severe", color: "oklch(0.45 0.2 20)" };
}
