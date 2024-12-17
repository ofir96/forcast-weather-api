const express = require('express');
const router = express.Router();
const { getWeather, getTestWeather, getHistoryWeather } = require('../controllers/weatherController');

router.get('/', getWeather);
router.get('/test', getTestWeather);
router.get('/history', getHistoryWeather);

module.exports = router; 