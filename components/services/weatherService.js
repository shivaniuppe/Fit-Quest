// weatherService.js
import axios from 'axios';

// REPLACE THIS WITH YOUR ACTUAL API KEY
const API_KEY = '2d8fbf5473dd4c82404d2be69b22703a'; // e.g., '3a9b4c5d6e7f8g9h0i1j2k3l4m5n6o7p'

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherData = async (latitude, longitude) => {
  try {
    // Validate API key
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      throw new Error('Invalid OpenWeatherMap API key');
    }

    const response = await axios.get(BASE_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: API_KEY, // This is the correct parameter name
        units: 'metric',
      },
      timeout: 5000 // 5 second timeout
    });

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('🌩 Full Weather API Error:', error.response?.data || error.message, error);
    throw error; // Re-throw to handle in component
  }
};

// ... keep getWeatherIcon and other functions ...
export const getWeatherIcon = (weatherCondition) => {
  const iconMap = {
    '01d': 'sun',           // clear sky (day)
    '01n': 'moon',          // clear sky (night)
    '02d': 'cloud-sun',     // few clouds (day)
    '02n': 'cloud-moon',    // few clouds (night)
    '03d': 'cloud',         // scattered clouds
    '04d': 'cloud',         // broken clouds
    '09d': 'cloud-rain',    // shower rain
    '10d': 'cloud-sun-rain',// rain (day)
    '10n': 'cloud-moon-rain',// rain (night)
    '11d': 'bolt',          // thunderstorm
    '13d': 'snowflake',     // snow
    '50d': 'smog',          // mist
  };
  return iconMap[weatherCondition] || 'cloud';
};

// weatherService.js
export const getWorkoutSuggestion = (weatherData) => {
  const { temp } = weatherData;
  
  // Temperature-only logic with clear indoor/outdoor thresholds
  if (temp > 35) {
    return {
      suggestion: 'Extreme heat! Best for swimming or indoor workouts',
      type: 'extreme-heat',
      environment: 'Indoor' // Too hot for most outdoor activities
    };
  } 
  else if (temp > 30) {
    return {
      suggestion: 'Great for swimming or early morning activities',
      type: 'hot',
      environment: 'Outdoor' // Morning/evening outdoor okay
    };
  } 
  else if (temp > 20) {
    return {
      suggestion: 'Ideal for running, cycling or sports',
      type: 'warm',
      environment: 'Outdoor' // Perfect outdoor weather
    };
  }
  else if (temp > 10) {
    return {
      suggestion: 'Great for brisk walks and outdoor exercises',
      type: 'cool',
      environment: 'Outdoor' // 10-20°C is definitely outdoor weather
    };
  }
  else if (temp == 10) {
    return {
      suggestion: 'Cold - Outdoor',
      type: 'chilly',
      environment: 'Outdoor' // 0-10°C is still outdoor with proper clothing
    };
  }
  else {
    return {
      suggestion: 'Freezing - indoor workouts recommended',
      type: 'freezing',
      environment: 'Indoor' // Below 0°C we recommend indoor
    };
  }
};