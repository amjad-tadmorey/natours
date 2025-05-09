const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')


const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour Must Have A Name !'],
        unique: true,
        trim: true,
        maxlength: [40, 'Tour name must have less or equal than 40 characters'],
        minlength: [10, 'Tour name must have more or equal than 10 characters'],
        // validate: [validator.isAlpha, 'name must includes only alphapets']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'Tour Must Have A Durations !']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour Must Have A Group Size !']
    },
    difficulty: {
        type: String,
        required: [true, 'Tour Must Have A Difficulty !'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'the difficulty must be one of : easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above or equal 1.0'],
        max: [5, 'Rating must be below or equal 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Tour Must Have A Price !']
    },
    priceDiscount: {
        type: Number,
        validate: {
            // (this) only points to the current doc on new document creation
            // this only works on save | create 
            validator: function (val) {
                return val < this.price
            },
            message: 'Discount can not be more than the price'
        }
    },
    discount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'Tour Must Have A Summary !']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Tour Must Have A Image Cover !']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        adress: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            adress: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// toursSchema.index({ price: 1 })
toursSchema.index({ price: 1, ratingsAverage: -1 })
toursSchema.index({ slug: 1 })
toursSchema.index({ startLocation: '2dsphere' })

// virtual populate
toursSchema.virtual('reviews', {
    ref: "Review",
    foreignField: 'tour',
    localField: '_id'
})

toursSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

toursSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})


// embedding users
// toursSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })

toursSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now()
    next()
})

toursSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v'
    })
    next()
})

toursSchema.post(/^find/, function (docs, next) {
    next()
})



// toursSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     console.log(this);
//     next()
// })


const Tour = mongoose.model('Tour', toursSchema)

module.exports = Tour