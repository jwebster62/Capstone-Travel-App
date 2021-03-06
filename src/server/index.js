//Bring in API functions
const getGeo = require('./geoAPI');
const getWeather = require('./weatherAPI');
const restApi = require('./rest');
const pixApi = require('./pixAPI');

// Use .env to hide environmental variables
const dotenv = require('dotenv')
dotenv.config();

// Express server & Setup
const express = require('express');
const app = express();
app.use(express.static('dist'));

// Body Parser setup
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors Setup
const cors = require('cors');
app.use(cors());



//Server functionality

const port = process.env.PORT || 3000;

const runServer = app.listen(port, listening());

function listening() {
    console.log(`Server running on localhost: ${port}`);
}

//Travel Data Variables
const travelData = {
    dep: 'from',
    dest: {
        city: 'to',
        country: '',
        country_code: '',
        lat: '',
        lon: '',
    },
    date: '',
    image: '',
    weather: {
        temp: '',
        desc: ''
    }

};

//Getting the travel data
app.post('/travelData', async(req, res) => {

    //Departure information
    travelData.dep = req.body.dep;
    travelData.date = req.body.date;

    //Destination Information
    let travelDestData = await getGeo(req.body.dest, process.env.GEO_KEY);
    travelData.dest.city = travelDestData.city;
    travelData.dest.country_code = travelDestData.country_code;
    travelData.dest.lat = travelDestData.lat;
    travelData.dest.lon = travelDestData.lon;

    //country Data
    let countryInfo = await restApi(travelData.dest.country_code);
    travelData.dest.country = countryInfo.country;
    //Destination Image

    travelData.image = await pixApi(req.body.dest, '', process.env.PIX_KEY)

    //Weather Information
    let weatherInfo = await getWeather(
        travelData.dest.lat,
        travelData.dest.lon,
        travelData.date,
        process.env.WEATHER_KEY
    );


    travelData.weather.temp = weatherInfo.temp;
    travelData.weather.desc = weatherInfo.desc;

    res.send(travelData);
    console.log(travelData)
});


module.exports = app;