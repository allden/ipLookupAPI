const express = require('express');
const router = express.Router();
const geoip = require('geoip-lite');
const fetch = require('node-fetch');

router.get('/iplookup', (req, res) => {
    let userIp = req.headers['x-forwarded-for'];
    if(userIp === null) {
        userIp = req.getRemoteAddr();
    };
    const requestedIp = req.query.ip;
    const queryFilter = /^[0-9\.]+$/;
    let geo = geoip.lookup(userIp);

    if(requestedIp && queryFilter.test(requestedIp)) {
        geo = geoip.lookup(requestedIp);
    };
    
    if (requestedIp && queryFilter.test(requestedIp) === false) {
        errorHandling({
            res,
            msg: 'Invalid IP address',
            status: 400
        });
    };

    return res.json(geo);
});

// PLACES API FOURSQUARE
router.get('/foursquare', (req, res) => {
    const {ll, query, v, limit} = req.query;
    const clientId = process.env.FOURSQUARE_CLIENT_ID;
    const clientSecret = process.env.FOURSQUARE_CLIENT_SECRET;
    let url = `https://api.foursquare.com/v2/venues/explore?client_id=${clientId}&client_secret=${clientSecret}&ll=${ll}&query=${query}&v=${v}&limit=${limit}`;

    fetch(url)
    .then(fetchRes => fetchRes.json())
    .then(data => res.json(data))
    .catch(err => errorHandling({res, err}));
});

// ONE CALL WEATHER DATA
router.get('/openweathermap', (req, res) => {
    const {lat, lon, exclude, units} = req.query;
    const appId = process.env.OPENWEATHERMAP_APPID;
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=${exclude}&appid=${appId}&units=${units}`;

    fetch(url)
    .then(fetchRes => fetchRes.json())
    .then(data => res.json(data))
    .catch(err => errorHandling({res, err}))
});

// FORWARD AND REVERSE GEOCODING
router.get('/opencagedata', (req, res) => {
    const {q} = req.query;
    const key = process.env.OPENCAGEDATA_APPID;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${q}&key=${key}`;

    fetch(url)
    .then(fetchRes => fetchRes.json())
    .then(data => res.json(data))
    .catch(err => errorHandling({res, err}));
});

// WHEN THINGS GO HORRIBLY WRONG
function errorHandling(obj) {
    let msg = obj.msg || 'Something went wrong.';
    let status = obj.status || 500;
    const {res, err} = obj;

    if(err) console.error('ERROR:', err);

    return res.status(status).json({
        'message': msg
    });
};

module.exports = router;