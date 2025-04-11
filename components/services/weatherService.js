import axios from 'axios';

const API_KEY = '2d8fbf5473dd4c82404d2be69b22703a'; 

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherData = async (latitude, longitude) => {
  try {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      throw new Error('Invalid OpenWeatherMap API key');
    }

    const response = await axios.get(BASE_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: API_KEY, 
        units: 'metric',
      },
      timeout: 5000 
    });

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('🌩 Full Weather API Error:', error.response?.data || error.message, error);
    throw error; 
  }
};

export const getWeatherIcon = (weatherCondition) => {
  const iconMap = {
    '01d': 'sun',           
    '01n': 'moon',          
    '02d': 'cloud-sun',    
    '02n': 'cloud-moon',    
    '03d': 'cloud',         
    '04d': 'cloud',         
    '09d': 'cloud-rain',    
    '10d': 'cloud-sun-rain',
    '10n': 'cloud-moon-rain',
    '11d': 'bolt',          
    '13d': 'snowflake',     
    '50d': 'smog',         
  };
  return iconMap[weatherCondition] || 'cloud';
};

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