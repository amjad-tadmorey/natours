const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('./../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const { deleteOne, updateOne, createOne, getOne, getAll } = require("./handlerFactory")
const AppError = require('../utils/appError')
const Booking = require('../models/bookingModel')



exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    // 2) Get the checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://natours.dev/img/tours/${tour.imageCover}`],
                    },
                    unit_amount: tour.price * 100,
                },
                quantity: 1,
            },
        ],
    })

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // this is only temporary,  
    const { tour, user, price } = req.query
    if (!tour && !user && !price) return next()
    await Booking.create({ tour, user, price })
    res.redirect(`${req.originalUrl.split('?')[0]}`)
})

exports.createBooking = createOne(Booking)
exports.getBooking = getOne(Booking)
exports.getAllBookings = getAll(Booking)
exports.updateBooking = updateOne(Booking)
exports.deleteBooking = deleteOne(Booking)