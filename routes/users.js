const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const { restart } = require('nodemon');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email: email, username: username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success','Welcome to Yelpcamp');
            res.redirect('/campgrounds')
        })
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome Back');
    const returnUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(returnUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'GoodBye!');
    res.redirect('/campgrounds');
})

module.exports = router;