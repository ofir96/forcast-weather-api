const axios = require('axios');

const filterWeatherData = (data) => {
  // The data comes in data.daily.data structure
  const dailyData = data.daily.data || [];
  
  return dailyData.map(day => ({
    day: day.day,
    weather: day.weather,
    summary: day.summary,
    predictability: day.predictability,
    temperature: day.temperature,
    temperature_min: day.temperature_min,
    temperature_max: day.temperature_max,
    precipitation: {
      total: day.precipitation.total,
      type: day.precipitation.type
    },
    probability: {
      precipitation: day.probability.precipitation,
      storm: day.probability.storm,
      freeze: day.probability.freeze
    },
    ozone: day.ozone,
    humidity: day.humidity,
    visibility: day.visibility
  }));
};

const getWeather = async (req, res) => {
  try {
    const { lat, lon, place } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required parameters' 
      });
    }

    const options = {
      method: 'GET',
      url: 'https://ai-weather-by-meteosource.p.rapidapi.com/daily',
      params: {
        lat,
        lon,
        language: 'en',
        units: 'us'  // Changed to 'us' to match example data
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': process.env.RAPID_API_HOST
      }
    };

    const response = await axios.request(options);
    const filteredData = filterWeatherData(response.data);

    res.json({
      lat: `${lat}N`,
      lon: `${lon}W`,
      place: place || null,
      forecast: filteredData
    });

  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      details: error.response?.data || error.message
    });
  }
};

// Test endpoint that returns mock data based on the example
const getTestWeather = (req, res) => {
  const mockData = {
    daily: {
      data: [
        {
          day: "2024-12-14",
          weather: "psbl_rain",
          summary: "Possible rain changing to cloudy by evening. Temperature 52/57 °F. Wind from SW.",
          predictability: 4,
          temperature: 53.8,
          temperature_min: 51.5,
          temperature_max: 56.9,
          precipitation: { total: 1.05, type: "rain" },
          probability: { precipitation: 47, storm: 0.0, freeze: 0.0 },
          ozone: 314.63,
          humidity: 84,
          visibility: 10.36
        }
        // ... more days would be here in real data
      ]
    }
  };

  const filteredData = filterWeatherData(mockData);
  res.json({
    lat: "37.81021N",
    lon: "-122.42282W",
    place: "Test Location",
    forecast: filteredData
  });
};

module.exports = {
  getWeather,
  getTestWeather
}; 