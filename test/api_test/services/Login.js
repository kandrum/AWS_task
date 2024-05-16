const express = require('express');
const mongoose = require('mongoose');
const router =express.Router();


const userSchema =new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User =mongoose.model('User',userSchema);

router.post('/',async(req, res) =>{
    const {email, password} =req.body;

    try{
        const user =await User.findOne({email, password});
        if(user){
            res.status(200).json({message: 'Login sucessfull',user});
        }else{
            res.status(401).json({message: 'Invalid emailor password'});
        }
    }catch(error){
        res.status(500).json({message:'Server eror', error});
    }
});

module.exports =router;