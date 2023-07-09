import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  }
});

export default transporter;

// Example

// const message = {
//   from: process.env.NODEMAILER_EMAIL,
//   to: 'rcorreiagodoy@gmail.com, amanda.merien.silva@gmail.com',   // list of receivers
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!',
//   html: '<p>That was easy!</p>',
// }

// const infoNodemailer = await transporter.sendMail(message);