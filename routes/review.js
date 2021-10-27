const express = require('express')
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync')
const Review = require('../models/review');
const Campground = require('../models/campground');
const { validateReview, isLoggedIn, isAuthorforReview } = require('../middleware');

//  Review the Campground
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body)
    review.author = req.user._id;

    campground.reviews.push(review);
    await review.save()
    await campground.save();
    req.flash('success', 'Successfully created new Review')
    res.redirect(`/campgrounds/${campground._id}`)
}))

//  Delete review
router.delete('/:reviewId', isLoggedIn, isAuthorforReview, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params

    Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted a Review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;