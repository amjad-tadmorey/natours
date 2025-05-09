const nodemailer = require('nodemailer')

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `amjad ghassan <${process.env.EMAIL_FROM}>`
    }
    createTransport(){
        
    }
}

const sendEmail = async options => {
    // 1 create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // in gmail you have to active: less secure app option
    })
    //  define email options

    const mailOptions = {
        from: 'amjad ghassan <amjad@dev.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: 
    }

    // 3 send email with nodemailer

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail