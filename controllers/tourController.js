const multer = require('multer')
const sharp = require('sharp')
const Tour = require('./../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const { deleteOne, updateOne, createOne, getOne, getAll } = require("./handlerFactory")
const AppError = require('../utils/appError')


const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! please upload only images'), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
])
// THIS USED TO UPLOAD IMAGES IN THE SAME FILED
// upload.array('images', 5)

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) next()
    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`)


    // 2) images
    req.body.images = []
    await Promise.all(req.files.map.forEach(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${req.body.filename}`)
        req.body.images.push(filename)
    }))
    next()
})

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours = getAll(Tour)
exports.getTour = getOne(Tour, { path: 'reviews' })
exports.createTour = createOne(Tour)
exports.updateTour = updateOne(Tour)
exports.deleteTour = deleteOne(Tour)

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        results: stats.length,
        data: {
            stats
        }
    })
})

exports.getMontlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { mounth: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numToursStarts: -1 }
        }
    ])

    res.status(200).json({
        status: 'success',
        results: plan.length,
        data: {
            plan
        }
    })
})

exports.getToursWithin = catchAsync(async (req, res, next) => {
    // '/tours-within/:distance/center/:latlng/unit/:unit'
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
    if (!lat || !lng) next(new AppError('Please provide latitude and longitude in this format lat,lng.', 400))

    console.log(distance);
    console.log(lat, lng);
    console.log(unit);

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })

    res.status(200).json({
        status: 'Success',
        result: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    if (!lat || !lng) next(new AppError('Please provide latitude and longitude in this format lat,lng.', 400))

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'Success',
        data: {
            data: distances
        }
    })
})