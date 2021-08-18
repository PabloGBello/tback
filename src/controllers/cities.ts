export {};

import City from './../models/city';

export const getCitiesCallback = (req, res): void => {
    City.find({})
    .then(cities => {
        res.send(cities);
    })
    .catch(err => {
        console.error(err);
    });
};