'use strict'

const shoppingCartController = require('../controllers/shoppingCart.controller');
const mdAuth = require('../services/authenticated');
const express = require('express');
const api = express.Router();

api.get('/testShoppingCart', shoppingCartController.testShoppingCart);

//RUTAS PRIVADAS
//CLIENT
api.post('/addToShoppingCart', mdAuth.ensureAuth, shoppingCartController.addToShoppingCart);

module.exports = api;