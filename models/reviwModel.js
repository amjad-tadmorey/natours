const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

reviewSchema.index({ tour: 1, user: 1 }, {
    unique: true
})

reviewSchema.pre(/^find/, function (next) {
    // this.populate(({
    //     path: 'tour',
    //     select: 'name'
    // }))
    this.populate(({
        path: 'user',
        select: 'name photo'
    }))
    next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour)
})

// findOneAndUpdate for findByIdAndUpdate
// findOneAndDelete for findByIdAndDelete
// This hook will trigger for findByIdAndUpdate, findByIdAndDelete, and any findOneAnd...
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // here we used the findOne to get the document because the this keyword here (/^findOneAnd/) points to the query not the doc
    // then we store the r value in (this) to use it in the next post hook
    this.r = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    // this.r = await this.findOne() does not work here because the query will be already executed
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review