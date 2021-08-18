export {};

import { Schema, model } from 'mongoose';

const reparationSchema = new Schema({
    _id: Schema.Types.ObjectId,
    startTime: Number,
    city: String,
    from: {
        lat: Number,
        lng: Number
    },
    to: {
        lat: Number,
        lng: Number
    },
});

const Reparation = model('Reparation', reparationSchema, 'reparations');

export default Reparation ;