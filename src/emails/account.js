const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'support@tvmania.com',
        subject: 'Welcome to TvMania',
        text: `thanks for joining the community of story lovers ${name}, enjoy your presence and stay active, there will be rewards`,
        html: `<strong>thanks for joining the community of story lovers ${name}, enjoy your presence and stay active, there will be rewards</strong>`
    }
    sgMail.send(msg);
}

const sendUserCancelationEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'support@tvmania.com',
        subject: 'Account Cancelation',
        text: `Hi ${name}, We are sorry to hear you want to leave us. we wish too see you again soon.`,
        html: `<strong>Hi ${name}, We are sorry to hear you want to leave us. we wish too see you again soon.</strong>`
    }
    sgMail.send(msg);
}

module.exports = {
    sendWelcomeEmail,
    sendUserCancelationEmail
}