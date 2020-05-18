const express = require('express')
const router = express.Router()
const request = require('request')
const userModel = require('../models/user')

module.exports = (app, db) => {
  // Checa se existe autorização
  app.use('/logg*', (req, res, next) => {
    if (req.headers && req.headers.authorization) {
      next()
    } else {
      const err = new Error('Sem autorização')
      err.status = 300
      next(err)
    }
  })
  // Encaminha para autorização do trello
  router.get('/login', (req, res, next) => {
    const authorization = 'https://trello.com/1/authorize?expiration=never&name=MeuFormulário&scope=read,write&response_type=token&key=' + process.env.TRELLO_KEY + '&return_url=' + process.env.FRONT
    res.json({
      url: authorization
    })
  })

  // Após o usuário ser autorizado, o perfil do membro é retornado
  // O novo token usado é salvo.
  router.get('/logged', (req, res, next) => {
    request('https://trello.com/1/members/me?key=' +
          process.env.TRELLO_KEY + '&token=' +
           req.headers.authorization,
    (err, _res, _body) => {
      if (err) {
        return next(err)
      }
      const User = userModel(db)
      _body = JSON.parse(_body)
      User.findOne({
        where: { username: _body.username }
      }).then((foundUser) => {
        if (foundUser) {
          foundUser.lastToken = req.headers.authorization
          foundUser.save()
          res.json(foundUser.dataValues)
        } else {
          User.create({
            username: _body.username,
            lastToken: req.headers.authorization
          }).then((userCreated) => {
            res.json(userCreated)
          }).catch((err) => {
            next(err)
          })
        }
      }).catch((err) => {
        next(err)
      })
    })
  })

  app.use('', router)
}
