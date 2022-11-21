const nodemailer = require('nodemailer');

const sendEmail =async options => {
    //1)create a transporter
    // const transpoerter = nodemailer.createTransport({
    //     host: process.env.EMAIL_HOST,
    //     port: process.env.EMAIL_PORT,
    //     auth: {
    //         user: process.env.EMAIL_USERNAME,
    //         pass: process.env.EMAIL_PASSWORD,
    //     }
    // });
    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "073cdf34a22973",
            pass: "09ab5f32d4b4d1",
        },
    });

    //2)define the emil options
    
    const emailOptions = {
        from: 'ibrahim abdalrhman <hello@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    //3)Actually send the email
    await transport.sendMail(emailOptions);
};

module.exports = sendEmail;
