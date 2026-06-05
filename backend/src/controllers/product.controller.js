'use strict'

const Product = require('../models/product.model');
const Category = require('../models/category.model');
const validate = require('../utils/validate');

exports.testProduct = (req, res)=>{
    return res.send({message: 'Function testProduct is running'});
}

exports.saveProduct = async(req, res)=>{
    try{
        //verificar que venga la data obligatoria
        //Verificar que exista la categoria

        const params = req.body;
        const data = {
            name: params.name,
            price: params.price,
            stock: params.stock,
            sales: 0,
            category: params.category
        }

        const msg = validate.validateData(data);
        if(msg) return res.status(400).send(msg);
        const categoryExist = await Category.findOne({_id: params.category});
        if(!categoryExist) return res.status(404).send({message: 'Category not found'});
        data.description = params.description;

        const product = new Product(data);
        await product.save();
        return res.send({message: 'Product saved successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error saving product'});
    }
}

exports.updateProduct = async(req, res)=>{
    try{   
            //capturar el ID
            //Validar que vengan datos a actualizar no venga el params SALES
            //Validar que exista la categoría
            //Validar que exista el producto
            //Actualizar producto
            //Verificar la actualización.

        const productId = req.params.id;
        const params = req.body;

        const checkUpdate = await validate.checkUpdateProduct(params);
        if(checkUpdate === false) return res.status(400).send({message: 'Not sending params to update or params cannot update'});
        const categoryExist = await Category.findOne({_id: params.category});
        if(!categoryExist) return res.send({message: 'Category not found'});
        const productUpdated = await Product.findOneAndUpdate({_id: productId}, params, {new: true})
        .lean()
        .populate('category');
        if(!productUpdated) return res.send({message: 'Product does not exist or product not updated'});
        return res.send({message: 'Product updated successfully', productUpdated});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error updating product'});
    }
}

exports.getProducts = async(req, res)=>{
    try{
        const products = await Product.find()
        .lean()
        .populate('category');
        return res.send({message: 'Products found:', products})
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error getting products'});
    }
}

exports.getProduct = async(req, res)=>{
    try{
        //Capturar el ID
        //Validar que exista el producto.

        const productId = req.params.id;
        const product = await Product.findOne({_id: productId})
        .lean()
        .populate('category');
        if(!product) return res.status(404).send({message: 'Product not found'});
        return res.send({message: 'Product found:', product});
    }catch(error){
        console.log(error);
        return res.status(500).send({error, message: 'Error getting product'});
    }
}

exports.deleteProduct = async(req, res)=>{
    try{
        //Capturar el ID
        //Eliminar
        //Verificar la eliminación

        const productId = req.params.id;
        const productDeleted = await Product.findOneAndDelete({_id: productId})
        .lean()
        .populate('category');
        if(!productDeleted) return res.send({message: 'Product not found or already deleted'});
        return res.send({message: 'Product deleted:', productDeleted});
    }catch (err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting product'});
    }
}

exports.searchProduct = async(req, res)=>{
    try{
        //Validar que llegue la data obligatoria

        const params = req.body;
        const data = {
            name: params.name
        };

        const msg = validate.validateData(data);
        if(msg) return res.status(400).send(msg);
        const products = await Product.find({name: {$regex: params.name, $options: 'i'}})
        .lean()
        .populate('category');
        return res.send({products: products});
    }catch(err){
        console.log(err);
        return res.status(500).send({messgae: 'Error searching product'});
    }
}

exports.exhaustedProducts = async(req, res)=>{
    try{
        const productsExhausted = await Product.find({stock: 0})
            .lean()
            .populate('category');
        return res.send({products: productsExhausted});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error searching products exhausted'});
    }
}

exports.mostSales = async(req, res)=>{
    try{
        const productsMostSales = await Product.find()
            .sort({sales: -1}) //ordenar, ascendente o descendente (Numeros, Letras)
            .lean()
            .populate('category');
        return res.send({products: productsMostSales});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error searching products most sales'});
    }
}

exports.productByCategory = async(req, res)=>{
    try{
        //capturar el ID de la categoria
        //Validar que exista la categoria

        const categoryId = req.params.id;
        const searchCategory = await Category.findOne({_id: categoryId});
        if(!searchCategory) return res.send({message: 'Category not found'});
        const products = await Product.find({category: categoryId})
        .lean()
        .populate('category');
        return res.send({category: searchCategory.name, products: products});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error getting products by category'});
    }
}