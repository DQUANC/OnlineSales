'use strict'

const Category = require('../models/category.model');
const Product = require('../models/product.model');
const validate = require('../utils/validate');

exports.testCategory = (req, res)=>{
    return res.send({message: 'testCategory running'});
}

exports.saveCategory = async(req, res)=>{
    try{
            //validar la data obligatoria
            //Validar que no se duplique el nombre
            //Guardar category

        const params = req.body;
        const data = {
            name: params.name,
            description: params.description
        };
        const msg = validate.validateData(data);
        if(msg) return res.status(400).send(msg);
        const nameAlready = await Category.findOne({name: params.name});
        if(nameAlready) return res.send({message: 'Category already created'});;
        const category = new Category(data);
        await category.save();
        
        return res.send({message: 'Category created successfully'})
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error saving category'});
    }
}

exports.getCategorys = async(req, res)=>{
    try{
        const categorys = await Category.find().lean();
        if(categorys.length == 0) return res.status(404).send({message: 'Categorys not found'});
        return res.send({categorys});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error getting categorys'});
    }
}

exports.updateCategory = async(req, res)=>{
    try{
            //Caputar el id
            //Validar que envie datos a actualizar
            //Validar que exista esa category
            //Validar que no se actualice la DEFAULT
            //Que no se duplique
            //Actualizar
            //Validar la actualización

        const categoryId = req.params.id;
        const params = req.body;

        if(Object.entries(params).length === 0) return res.status(400).send({message: 'Empty params'});
        const categoryExist = await Category.findOne({_id: categoryId});
        if(!categoryExist) return res.status({message: 'Category not found'});
        if(categoryExist.name === 'DEFAULT') return res.send({message: 'Default category cant update'});
        const alreadyCategory = await Category.findOne({name: params.name});
        if(alreadyCategory && categoryExist.name != params.name) return res.send({message: 'Category already taken'});
        const updatedCategory = await Category.findOneAndUpdate({_id: categoryId}, params, {new: true});
        if(!updatedCategory) return res.send({message: 'Category not updated'});
        return res.send({message: 'Category updated successfuly', updatedCategory});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error updating category'});
    }
}

exports.deleteCategory = async(req, res)=>{
    try{
            //Capturar el ID
            //Verificar que exista la categoria
            //Verificar que la categoria a eliminar no sea la DEFAULT
            //Buscar la categoría DEFAULT
            //Busco los productos que tengan la categoría a eliminar
            //Actualizo los produtos a la categoría DEFAULT
            //Elimino la categoria
            //Verifico su correcta eliminación

        const categoryId = req.params.id;
        const categoryExist = await Category.findOne({_id: categoryId});
        if(!categoryExist) return res.send({message: 'Category not found'});
        if(categoryExist.name === 'DEFAULT') return res.send({message: 'DEFAULT category cannot deleted'});
        const defaultCategory = await Category.findOne({name: 'DEFAULT'});
        await Product.updateMany({category: categoryId}, {category: defaultCategory._id})
        const categoryDeleted = await Category.findOneAndDelete({_id: categoryId});
        if(!categoryDeleted) return res.send({message: 'Category not deleted'});
        return res.send({message: 'Category deleted successfully'});

        //ACTUALIZAR PRODUCTOS EN TIEMPO DE EJECUCIÓN
        /*const products = await Product.findOne({category: categoryId});
        for(let product of products){
            await Product.findOneAndUpdate({_id: product._id},{category: defaultCategory._id});
        }*/
        /**
         * findOneAndUpdate === buscar un solo registro y actualizar (filtro, params a actualizar)
         * updateMany === buscar todos los registros y actualizar (filtro, params a actualizar)
         */
        
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error deleting category'});
    }
}