'use strict'

const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var is required');

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'La petición no contiene la cabecera de autenticación' });
    }

    try {
        const token = req.headers.authorization.replace(/['"]+/g, '');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send({ message: 'Token expirado' });
        }
        return res.status(403).send({ message: 'El token no es válido' });
    }
}

exports.isAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.role === 'ADMIN') return next();
        else return res.status(403).send({ message: 'User unauthorized' });
    } catch (err) {
        console.log(err);
        return err;
    }
}
