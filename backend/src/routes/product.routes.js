'use strict'

const productController = require('../controllers/product.controller');
const mdAuth = require('../services/authenticated');
const express = require('express');
const api = express.Router();

//RUTAS PÚBLICAS
api.get('/testProduct', productController.testProduct);

//RUTAS PRIVADAS
//CLIENT
api.get('/getProducts', mdAuth.ensureAuth, productController.getProducts);
api.get('/getProduct/:id', mdAuth.ensureAuth, productController.getProduct);
api.post('/searchProduct', mdAuth.ensureAuth, productController.searchProduct);
api.get('/mostSalesProducts', mdAuth.ensureAuth, productController.mostSales);
api.get('/searchProductByCategory/:id', mdAuth.ensureAuth, productController.productByCategory);

//RUTAS PRIVADAS
//ADMIN
api.post('/saveProduct', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.saveProduct);
api.put('/updateProduct/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.updateProduct);
api.delete('/deleteProduct/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.deleteProduct);
api.get('/exhaustedProducts', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.exhaustedProducts);


module.exports = api;