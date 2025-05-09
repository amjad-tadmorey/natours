const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getOverView = catchAsync(async (req, res, next) => {
    // 1) Get tours data from collection
    const tours = await Tour.find()
    // 2) Build Template 
    // 3) Render the template using tour data from 1)
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    if (!tour) return next(new AppError('There is no tour with that name!', 404))
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLoginForm = catchAsync(async (req, res) => {
    res.status(200).render('login', {
        title: `Login`,
    })
})
exports.getAccount = catchAsync(async (req, res) => {
    res.status(200).render('account', {
        title: `Your account`,
        // user: res.locals.user
    })
})
exports.updateUserData = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        // We specified the fields to prevent any extra fields , like admin
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    })
    res.status(200).render('account', {
        user: updatedUser
    })
})