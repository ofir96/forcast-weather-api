const express = require('express');
const router = express.Router();
const { getWeather, getTestWeather } = require('../controllers/weatherController');

router.get('/', getWeather);
router.get('/test', getTestWeather);

module.exports = router; 