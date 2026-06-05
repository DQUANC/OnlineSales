'use strict'

const mongoose = require('mongoose');

if (!process.env.MONGO_URI) throw new Error('MONGO_URI env var is required');

exports.init = () => {
    const uriMongo = process.env.MONGO_URI;

    mongoose.connection.on('error', () => {
        console.log('MongoDB | could not connect to mongodb');
        mongoose.disconnect();
    });
    mongoose.connection.on('connecting', () => {
        console.log('MongoDB | trying to connect');
    });
    mongoose.connection.on('connected', () => {
        console.log('MongoDB | connected to mongodb');
    });
    mongoose.connection.once('open', () => {
        console.log('MongoDB | connected to database');
    });
    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB | reconnected to mongodb');
    });
    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB | disconnected');
    });

    mongoose.connect(uriMongo, {
        connectTimeoutMS: 2500,
        maxPoolSize: 50
    }).catch(err => console.log(err));
}
