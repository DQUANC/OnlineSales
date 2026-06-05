'use strict'

const categoryController = require('../controllers/category.controller');
const mdAuth = require('../services/authenticated');
const express = require('express');
const api = express.Router();

//RUTAS PÚBLICAS
api.get('/testCategory', categoryController.testCategory);

//RUTAS PRIVADAS
//CLIENT
api.get('/categorys', mdAuth.ensureAuth, categoryController.getCategorys);

//RUTAS PRIVADAS
//ADMIN
api.post('/saveCategory', [mdAuth.ensureAuth, mdAuth.isAdmin], categoryController.saveCategory);
api.put('/updateCategory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], categoryController.updateCategory);
api.delete('/deleteCategory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], categoryController.deleteCategory);

module.exports = api;