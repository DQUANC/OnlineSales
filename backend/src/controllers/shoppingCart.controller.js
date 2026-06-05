'use strict'

const ShoppingCart = require('../models/shoppingCart.model');
const Product = require('../models/product.model');
const validate = require('../utils/validate');

exports.testShoppingCart = (req, res)=>{
    return res.send({message: 'Function testShoppinCart is running'});
}

exports.addToShoppingCart = async(req, res)=>{
   try{
            //Capturar los datos a agregar
            //Capturar el id del usuario logeado
            //Validar la data 
            //Verificar si ya existe el Carrito de compras o no
            //Verificar que exista el producto
            //Validar el stock del producto contra la quantity
            //Verificar si ya existe el producto dentro del carrito de compras.
            //Agregar el producto al objeto que se agregará al carrito
            //Realización de cálculos
            //Guardar el carrito

        const params = req.body;
        const userId = req.user.sub;
        const data = {
            product: params.product,
            quantity: params.quantity
        };
        const msg = validate.validateData(data);
        if(msg) return res.status(400).send(msg);
        const shoppingCartExist = await ShoppingCart.findOne({user: userId});
        const productExist = await Product.findOne({_id: params.product})
                .lean()
        if(!productExist) return res.send({message: 'Product not found'});
        if(shoppingCartExist){
            if(params.quantity > productExist.stock) return res.send({message: 'There is not enough stock for this product'});
            for(let product of shoppingCartExist.products){
                if(product._id != params.product) continue;
                return res.send({message: 'Already have this product in the cart'});
            }
            const product = {
                product: params.product,
                quantity: params.quantity,
                subTotal: params.quantity * productExist.price
            }
            const total = shoppingCartExist.products.map(product=>
                product.subTotal).reduce((prev, curr)=> prev + curr, 0)+ product.subTotal;
            const pushProduct = await ShoppingCart.findOneAndUpdate(
                {_id: shoppingCartExist._id},
                { $push: {products: product},
                  total: total},
                {new: true}
            );
            return res.send({message: 'New product Add to Shopping Cart', pushProduct});
        }else{
            if(params.quantity > productExist.stock) return res.send({message: 'There is not enough stock for this product'});
            const product = {
                product: params.product,
                quantity: params.quantity,
                subTotal: params.quantity * productExist.price
            }
            const data = {
                user: req.user.sub,
                products: product
            };
            data.total = product.subTotal;
            const shoppingCart = new ShoppingCart(data);
            await shoppingCart.save();
            return res.send({message: 'Product add successfully', shoppingCart});
        }
   }catch(err){
       console.log(err);
       return res.status(500).send({message: 'Error saving product to shopping cart'});
   }
}