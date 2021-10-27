const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const { isLoggedIn } = require('../middleware');
const { isAuthorforCampground, validateCampground } = require('../middleware');

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds })
}))

//  New Campground
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs');
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const newCampground = new Campground(req.body)
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new Campground')
    res.redirect(`/campgrounds/${newCampground._id}`);
}))

//  Update
router.get('/:id/edit', isLoggedIn, isAuthorforCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', isLoggedIn, isAuthorforCampground, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (!campground) {
        req.flash('error', 'Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
    req.flash('success', 'Successfully Updated a new Campground')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//  Delete Campground
router.delete('/:id', isLoggedIn, isAuthorforCampground,catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have premission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a new Campground')
    res.redirect('/campgrounds');
}))

//  Single Campground
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

module.exports = router