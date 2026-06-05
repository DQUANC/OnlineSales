'use strict'

//importaciones
const User = require('../models/user.model');
const { validateData, encrypt, alreadyUser, 
        checkPassword, checkUpdate, checkPermission,
        checkUpdateAdmin} = require('../utils/validate');
const jwt = require('../services/jwt');

exports.prueba = async (req, res)=>{
    await res.send({message: 'Controller run'})
}
//FUNCIONES PRIVADAS
//FUNCIONES PARA CLIENT

exports.register = async(req, res)=>{
    try{
        const params = req.body;
        let data = {
            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            role: 'CLIENT'
        };
        let msg = validateData(data);

        if(msg) return res.status(400).send(msg);
        let already = await alreadyUser(data.username);
        if(already) return res.status(400).send({message: 'Username already in use'});
        data.surname = params.surname;
        data.phone = params.phone;
        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        return res.send({message: 'User created successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error saving user'});
    }
}

exports.login = async(req, res)=>{
    try{
        const params = req.body;
        let data = {
            username: params.username,
            password: params.password
        }
        let msg = validateData(data);

        if(msg) return res.status(400).send(msg);
        let already = await alreadyUser(params.username);
        if(already && await checkPassword(data.password, already.password)){
            let token = await jwt.createToken(already);
            delete already.password;

            return res.send({token, message: 'Login successfuly', already});
        }else return res.status(401).send({message: 'Invalid credentials'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to login'});
    }
}

exports.update = async(req, res)=>{
    try{
        const userId = req.params.id;
        const params = req.body;

        const userExist = await User.findOne({_id: userId});
        if(!userExist) return res.send({message: 'User not found'});
        const permission = await checkPermission(userId, req.user.sub);
        if(permission === false) return res.status(401).send({message: 'You dont have permission to update this user'});
        const validateUpdate = await checkUpdate(params);
        if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});
        let alreadyname = await alreadyUser(params.username);
        if(alreadyname && userExist.username != params.username) return res.send({message: 'Username already in use'});
        const userUpdate = await User.findOneAndUpdate({_id: userId}, params, {new: true}).lean();
        if(userUpdate) return res.send({message: 'User updated', userUpdate});
        return res.send({message: 'User not updated'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to update user'});
    }
}

exports.delete = async(req, res)=>{
    try{
        const userId = req.params.id;
        const persmission = await checkPermission(userId, req.user.sub);
        if(persmission === false) return res.status(403).send({message: 'You dont have permission to delete this user'});
        const userDeleted = await User.findOneAndDelete({_id: userId});
        if(userDeleted) return res.send({message: 'Account deleted', userDeleted});
        return res.send({message: 'User not found or already deleted'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting user'});
    }
}

//FUNCIONES PRIVADAS
//FUNCIONES DE ADMIN

exports.saveUser = async(req, res)=>{
    try{
            //parámetros obligatorios
            //que el username no se duplique
            //Validar que el rol enviado sea válido
        //Encriptar la password
        //Guardar

        const params = req.body;
        const data = {
            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            role: params.role
        };

        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        const userExist = await alreadyUser(params.username);
        if(userExist) return res.send({message: 'Username already in use'});
        if(params.role != 'ADMIN' && params.role != 'CLIENT') return res.status(400).send({message: 'Invalid role'});
        data.surname = params.surname;
        data.phone = params.phone;
        data.password = await encrypt(params.password);

        const user = new User(data);
        await user.save();
        return res.send({message: 'User saved successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error saving user'});
    }
}

exports.updateUser = async(req, res)=>{
    try{
            //Capturar el id
            //Validar que exista usuario
            //Validar que los datos a actualizar no vengan vacios
            //Validar que el rol de usuario a actualizar no sea ADMIN
            //Validar que no se duplique el username
            //Validar que llegue un  rol valido
            //Actualizar al usuario
            //Validar que realmente se haya actualizado

        const userId = req.params.id;
        const params = req.body;

        const userExist = await User.findOne({_id: userId});
        if(!userExist) return res.send({message: 'User not found'});
        const emptyParams = await checkUpdateAdmin(params);
        if(emptyParams === false) return res.send({message: 'Empty params or params not update'});
        if(userExist.role === 'ADMIN') return res.send({message: 'Could not be update user with ADMIN role'});
        const nameAlready = await alreadyUser(params.username);
        if(nameAlready && userExist.username != params.username) return res.send({message: 'Username already taken'});
        if(params.role != 'ADMIN' && params.role != 'CLIENT') return res.status(400).send({message: 'Invalid role'});
        const userUpdated = await User.findOneAndUpdate({_id: userId}, params, {new: true});
        if(!userUpdated) return res.send({message: 'User not updated'});
        return res.send({message: 'User updated successfully', userUpdated});
        
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error updating user'});
    }
}

exports.deleteUser = async(req, res)=>{
    try{
            //Capturar el id
            //Verificar que exista el usuario
            //Verificar que no sea role ADMIN
            //Eliminar
            //Verificar que realmente se haya eliminado

        const userId = req.params.id;

        const userExist = await User.findOne({_id: userId});
        if(!userExist) return res.send({message: 'User not found'});
        if(userExist.role === 'ADMIN') return res.send({message: 'Could not delete user with ADMIN role'});
        const userDeleted = await User.findOneAndDelete({_id: userId});
        if(!userDeleted) return res.send({message: 'Could not delete user'});
        return res.send({message: 'Account deleted', username: userDeleted.username})
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Eror removing account'});
    }
}