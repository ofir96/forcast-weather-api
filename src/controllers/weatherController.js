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

const filterHistoryData = (data) => {
  const location = {
    name: data.location.name,
    region: data.location.region,
    country: data.location.country,
    lat: data.location.lat,
    lon: data.location.lon,
    tz_id: data.location.tz_id
  };

  const forecast = data.forecast.forecastday.map(day => ({
    date: day.date,
    date_epoch: day.date_epoch,
    day: {
      maxtemp_c: day.day.maxtemp_c,
      maxtemp_f: day.day.maxtemp_f,
      mintemp_c: day.day.mintemp_c,
      mintemp_f: day.day.mintemp_f,
      avgtemp_c: day.day.avgtemp_c,
      avgtemp_f: day.day.avgtemp_f,
      maxwind_mph: day.day.maxwind_mph,
      maxwind_kph: day.day.maxwind_kph,
      totalprecip_mm: day.day.totalprecip_mm,
      totalprecip_in: day.day.totalprecip_in,
      totalsnow_cm: day.day.totalsnow_cm,
      avgvis_km: day.day.avgvis_km,
      avgvis_miles: day.day.avgvis_miles,
      avghumidity: day.day.avghumidity,
      daily_will_it_rain: day.day.daily_will_it_rain,
      daily_chance_of_rain: day.day.daily_chance_of_rain,
      daily_will_it_snow: day.day.daily_will_it_snow,
      daily_chance_of_snow: day.day.daily_chance_of_snow
    }
  }));

  return {
    location,
    forecast
  };
};

const getHistoryWeather = async (req, res) => {
  try {
    const { q, dt, end_dt } = req.query;

    if (!q || !dt) {
      return res.status(400).json({ 
        error: 'Location (q) and start date (dt) are required parameters' 
      });
    }

    const options = {
      method: 'GET',
      url: 'https://weatherapi-com.p.rapidapi.com/history.json',
      params: {
        q,
        dt,
        end_dt, // Optional end date for range
        lang: 'en'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
      }
    };

    // Remove undefined params
    options.params = Object.fromEntries(
      Object.entries(options.params).filter(([_, v]) => v != null)
    );

    const response = await axios.request(options);
    const filteredData = filterHistoryData(response.data);
    res.json(filteredData);

  } catch (error) {
    console.error('Weather History API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch weather history data',
      details: error.response?.data || error.message
    });
  }
};

module.exports = {
  getWeather,
  getTestWeather,
  getHistoryWeather
}; 