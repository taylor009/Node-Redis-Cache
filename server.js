"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const redis = require('redis');


const PORT = process.env.PORT || 4000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

const redisClient = redis.createClient(REDIS_PORT);

const set = (key, value) => {
    redisClient.set(key, JSON.stringify(value));
};

const get = (req, res, next) => {
    let key = req.route.path;

    redisClient.get(key, (error, data) => {
        if (error) res.status(400).send(error);
        if (data !== null) res.status(200).send(JSON.parse(data));
        else next();
    });
}

app.get("/spacex/launches", get, (req, res) => {
    fetch("https://api.spacexdata.com/v3/launches/latest")
        .then(res => res.json())
        .then(json => {
            set(req.route.path, json);
            res.status(200).send(json);
        })
        .catch(error => {
            console.error(error);
            res.status(400).send(error);
        });
});
app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));