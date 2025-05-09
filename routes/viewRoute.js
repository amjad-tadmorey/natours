const express = require('express')
const { getOverView, getTour, getLoginForm, getAccount, updateUserData } = require('../controllers/viewscontroller')
const { protect, isLoggedIn } = require('../controllers/authController')

const router = express.Router()

router.get('/', isLoggedIn, getOverView)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/me', protect, getAccount)
router.post('/submit-user-data', protect, updateUserData)

module.exports = router