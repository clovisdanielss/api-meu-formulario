const nodemailer = require('nodemailer')

// async..await is not allowed in global scope, must use a wrapper
async function sendMail (answer) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // const testAccount = await nodemailer.createTestAccount()

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'servicos.cdss@gmail.com', // generated ethereal user
      pass: 'socivres' // generated ethereal password
    }
  })

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Questionario" <servicos.cdss@gmail.com>', // sender address
    to: 'clovisdaniel+vstg4ev2wh2molbwoeyy@boards.trello.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>' // html body
  })

  console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// Para testes: sendMail().catch((err) => console.log(err))

module.exports = sendMail
