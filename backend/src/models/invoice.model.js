'use strict'

const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    date: Date,
    noSerial: String,
    user: {type: mongoose.Schema.ObjectId, ref: 'User'},
    nit: String,
    products: [
        {
            product: {type: mongoose.Schema.ObjectId, ref: 'Product'},
            quantity: Number,
            subTotal: Number
        }
    ],
    total: Number
});

module.exports = mongoose.model('Invoice', invoiceSchema);