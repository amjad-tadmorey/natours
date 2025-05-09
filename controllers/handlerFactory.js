const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id)
    console.log(req.params.id);
    console.log(document);

    if (!document) {
        return next(new AppError('no document found', 404))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateOne = Modal => catchAsync(async (req, res, next) => {
    const doc = await Modal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!doc) {
        return next(new AppError('no document found', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.createOne = Modal => catchAsync(async (req, res, next) => {
    const doc = await Modal.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.getOne = (Modal, populateOptions) => catchAsync(async (req, res, next) => {

    let query = Modal.findById(req.params.id)
    if (populateOptions) query = query.populate(populateOptions)

    const doc = await query
    if (!doc) {
        return next(new AppError('no document found', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.getAll = Modal => catchAsync(async (req, res, next) => {
    // to allow for nested get reviews on tour
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const features = new APIFeatures(Modal.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    // const docs = await features.query.explain()
    const docs = await features.query
    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
            data: docs
        }
    })
})