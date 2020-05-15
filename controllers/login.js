const express = require('express')
const router = express.Router()
const request = require('request')
module.exports = (app, db) => {
  router.get('/login', (req, res, next) => {
    const authorization = 'https://trello.com/1/authorize?expiration=1day&name=MeuFormulário&scope=read,write&response_type=token&key=' + process.env.TRELLO_KEY + '&return_url=' + process.env.FRONT
    res.json({
      url: authorization
    })
  })

  router.get('/logged', (req, res, next) => {
    console.log(req.headers)
    if (req.headers && req.headers.authorization) {
      request('https://trello.com/1/members/me?key=' +
          process.env.TRELLO_KEY + '&token=' +
           req.headers.authorization, (err, _res, _body) => {
        if (!err) {
          res.json(_body)
        } else {
          next(err)
        }
      })
    } else {
      const err = new Error('Sem autorização')
      err.status = 300
      next(err)
    }
  })

  app.use('', router)
}
