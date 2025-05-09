const fs = require('fs')
const Tour = require('../../models/tourModel')
const User = require('../../models/userModel')
const Review = require('../../models/reviwModel')
const mongoose = require('mongoose')
require('dotenv').config();

const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('DB connection successful!'))


const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))
const importData = async () => {
    try {
        await User.create(users, {
            validateBeforeSave: false
        })
        await Review.create(reviews)
        console.log('data successfuly loaded!');
        process.exit()
    } catch (err) {
        console.log(err);
    }
}

const deleteData = async () => {
    try {
        await User.deleteMany()
        await Review.deleteMany()
        console.log('data successfuly deleted!');
        process.exit()
    } catch (err) {
        console.log(err);
    }
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}

