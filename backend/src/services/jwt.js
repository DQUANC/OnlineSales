'use strict'

const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var is required');

exports.createToken = async (user) => {
    try {
        const payload = {
            sub: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            role: user.role
        };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
    } catch (err) {
        console.log(err);
        return err;
    }
}
