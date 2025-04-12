import axios from 'axios';

// OpenWeatherMap API key
const API_KEY = '2d8fbf5473dd4c82404d2be69b22703a'; 

// Base URL for current weather data
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch weather data from OpenWeatherMap using coordinates
 * @param {number} latitude - Device's latitude
 * @param {number} longitude - Device's longitude
 * @returns {Object} - Weather data response
 */
export const getWeatherData = async (latitude, longitude) => {
  try {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      throw new Error('Invalid OpenWeatherMap API key');
    }

    // Make API request
    const response = await axios.get(BASE_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: API_KEY, 
        units: 'metric', // Metric for Celsius
      },
      timeout: 5000 // Optional timeout
    });

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    // Log error for debugging
    console.error('🌩 Full Weather API Error:', error.response?.data || error.message, error);
    throw error; // Rethrow for caller to handle
  }
};

/**
 * Maps OpenWeather icon codes to font-awesome icons
 * @param {string} weatherCondition - Icon code from weather API (e.g., '01d')
 * @returns {string} - FontAwesome icon name
 */
export const getWeatherIcon = (weatherCondition) => {
  const iconMap = {
    '01d': 'sun',            // Clear day
    '01n': 'moon',           // Clear night
    '02d': 'cloud-sun',      // Few clouds day
    '02n': 'cloud-moon',     // Few clouds night
    '03d': 'cloud',          // Scattered clouds
    '04d': 'cloud',          // Broken clouds
    '09d': 'cloud-rain',     // Shower rain
    '10d': 'cloud-sun-rain', // Rain day
    '10n': 'cloud-moon-rain',// Rain night
    '11d': 'bolt',           // Thunderstorm
    '13d': 'snowflake',      // Snow
    '50d': 'smog',           // Mist
  };
  return iconMap[weatherCondition] || 'cloud'; // Default icon
};

/**
 * Suggests a type of workout based on temperature
 * @param {Object} weatherData - The weather object from the API
 * @returns {Object} - Suggestion object with message, type, and environment
 */
export const getWorkoutSuggestion = (weatherData) => {
  const { temp } = weatherData;

  if (temp > 35) {
    return {
      suggestion: 'Extreme heat! Best for swimming or indoor workouts',
      type: 'extreme-heat',
      environment: 'Indoor' 
    };
  } 
  else if (temp > 30) {
    return {
      suggestion: 'Great for swimming or early morning activities',
      type: 'hot',
      environment: 'Outdoor' 
    };
  } 
  else if (temp > 20) {
    return {
      suggestion: 'Ideal for running, cycling or sports',
      type: 'warm',
      environment: 'Outdoor'
    };
  }
  else if (temp > 10) {
    return {
      suggestion: 'Great for brisk walks and outdoor exercises',
      type: 'cool',
      environment: 'Outdoor' 
    };
  }
  else {
    return {
      suggestion: 'Freezing - indoor workouts recommended',
      type: 'freezing',
      environment: 'Indoor' 
    };
  }
};
