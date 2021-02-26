const bcrypt = require('bcryptjs');
const Users = require('../models/users');
const jwt = require('jsonwebtoken');
const { Object } = require('core-js');

exports.signin = async(req, res) => {
    try {
        const body = req.body;
        const user = await Users.findOne({email: body.email});
        if(user) {
            const matched = bcrypt.compareSync(body.password, user.password);
            if(matched) {
                let CONFIG_SECRET = "mohammadFarghalyAliSaadawy";
                if(user.role === 1) CONFIG_SECRET = 'mohammadFarghalyAliSaadawyAdmin';
                const token = jwt.sign({email: user.email}, CONFIG_SECRET, {expiresIn: 8000000});
                res.status(200).json({done: true, token, email: user.email, role: user.role, userId: user._id, stage: user.stage, username: user.fullname, confirmed: user.confirmed, type: user.type});
            } else {
                throw({message: 'password is incorrect...'});
            }
        } else {
            throw({message: 'Email is incorrecttt...'});
        }
    } catch(err) {
        console.log(err)
        res.json({message: err.message});
    }
}

exports.signup = async(req, res) => {
    try {
        // const body = req.body;
        const body = {_id: '5f8da34baccb580024cb2c31', fullname: 'أحمد ماهر محمد ماهر', email: 'maherr@gmail.com', stage: 'two', phone: '01021445745', address: 'الوليدية بجوار مستشفى القدس', password: 'maher_2003'};
        const hashed = bcrypt.hashSync(body.password, 10);
        body.password = hashed
        const newUser = await new Users(body).save();
        const token = jwt.sign({email: newUser.email}, 'mohammadFarghalyAliSaadawy', {expiresIn: 80000});
        if(newUser) {res.status(200).json({done: true, token, email: newUser.email, role: newUser.role, userId: newUser._id, stage: newUser.stage, username: newUser.fullname, confirmed: newUser.confirmed, type: newUser.type})}
        else {throw({message: 'sign up failed...'})};
    } catch(err) {
        const message = err.driver?'this email is already exist': err.message;
        res.json({message});
    }
}
exports.updateuserdata = async(req, res) => {
    req.body.data.password = bcrypt.hashSync(req.body.data.password, 10);
    const updateuser = await Users.update({_id: req.body.userId}, req.body.data);
    if(updateuser.nModified===1) {
        res.json({updated: true});
        return;
    }
    res.json({updated: false});
}
exports.getuserdata = async(req, res) => {
    const userdata = await Users.find(req.body);
    console.log(userdata[0]);
    res.status(200).json({userdata: userdata[0]});
}
exports.getmessages = async(req, res) => {
    const messages = await Messages.find({userEmail: req.params.userEmail});
    res.json({messages});
}