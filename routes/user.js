const express = require('express')
const router = express.Router()
const userModel = require('../models/user')

module.exports = (app, db) => {
  const User = userModel(db)

  router.all('', (req, res, next) => {
    if (req.headers && req.headers.authorization &&
      req.headers.authorization === process.env.TRELLO_KEY) {
      return next()
    }
    const err = Error()
    err.message = 'Faltando chave api'
    err.status = 300
    next(err)
  })

  // Encaminhamento de parametros
  router.all('/:id/*', (req, res, next) => {
    req.userParams = req.params
    next()
  })
  // Devolve todos usuarios/um único
  router.get('(/:id)?', (req, res, next) => {
    const User = userModel(db)
    const dbQuery = {}
    if (req.params.id) {
      dbQuery.id = req.params.id
    }
    User.findAll({
      where: dbQuery,
      attributes: ['username', 'id']
    }).then((userS) => {
      res.status(200).json(userS)
    }).catch((err) => {
      next(err)
    })
  })

  // Salva um usuário
  router.post('', (req, res, next) => {
    User.create(req.body).then((createdUser) => {
      res.status(201).json(createdUser)
    }).catch((err) => {
      next(err)
    })
  })

  app.use('/users', router)
}
