/**
 * @file Controller to handle frontend tables requests
 */
import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Module to get all users
 * @module getUsers
 */
export const getUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Module to register an user
 * @module Register
 */
export const Register = async(req, res) => {
    const { name, email, password, confPassword } = req.body;
    if(password !== confPassword) return res.status(400).json({msg: "Password and Confirm Password do not match"});
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "user"
        });
        res.json({msg: "Registration Successful"});
    } catch (error) {
        console.log(error);
    }
}

/**
 * Module to login an user
 * @module Login
 */
export const Login = async(req, res) => {
    try {
        const user = await Users.findAll({
            where:{
                name: req.body.user
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({msg: "Wrong Password"});
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '1d'
        });
        const refreshToken = jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '1d'
        });
        await Users.update({refresh_token: refreshToken},{
            where:{
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accessToken });
        console.log(accessToken)
    } catch (error) {
        res.status(404).json({msg:"User not found"});
    }
}

/**
 * Module to logout an user
 * @module Logout
 */
export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where:{
            refresh_token: refreshToken
        }
    });
    if(!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({refresh_token: null},{
        where:{
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}

/**
 * Module to modify data of an user
 * @module modifyUser
 */
export const modifyUser = async(req, res) => {
    const { username, name, email, password } = req.body;
    console.log(req.body)
    try {
        const user = await Users.findOne({
            where: {
                name: username,
            }
        })
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        console.log(user)
        user.name = name;
        user.email = email;
        user.password = hashPassword;
        user.save({fields: ['name', 'email', 'password']})
        /* await Users.update({
            name: name,
            email: email,
            password: hashPassword,
        }, {where: {refresh_token: refresh_token}}); */      
        await user.reload();         
        res.json({msg: "User modified"});
    } catch (error) {
        console.log(error);
    }
}

/**
 * Module to delete an user
 * @module deleteUser
 */
export const deleteUser = async(req, res) => {
    const { id } = req.body;
    try {
        const users = await Users.destroy({
            where:{
                id: id
            }
        });
        res.json({msg: "User destroyed"});
    } catch (error) {
        console.log(error);
    }
}
