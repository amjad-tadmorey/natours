const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const globalErrorHandler = require('./controllers/errorController')

const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError')
const viewRouter = require('./routes/viewRoute')
const tourRouter = require('./routes/tourRoute')
const userRouter = require('./routes/userRoute')
const reviewRouter = require('./routes/reviewRoute')



const app = express()
app.set('view engine', 'pug')
app.set('vews', path.join(__dirname, 'views'))

// GLOBAL MIDDLEWARES

// serving satatic files
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))

// set security http headers 
app.use(helmet({ contentSecurityPolicy: false }))

// development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// limit requests comming from one ip
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'To many requests from this IP, please try again in an hour!'
})

app.use('/api', limiter)

// body parser
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: '10kb' })) // to update the user data from the client side

// data sanitization against NoSQL query injections
app.use(mongoSanitize())

// data sanitization against XSS
app.use(xss())

// prevent paramaters polution 
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}))

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})


// HTML ROUTE
app.use('/', viewRouter)

// API Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server !`, 404))
})

app.use(globalErrorHandler)

module.exports = app

