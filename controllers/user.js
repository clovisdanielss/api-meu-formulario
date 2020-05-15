const express = require('express')
const router = express.Router()
const userModel = require('../models/user')

module.exports = (app, db) => {
  const User = userModel(db)

  router.all('/:id/*', (req, res, next) => {
    req.userParams = req.params
    next()
  })

  router.get('(/:id)?', (req, res, next) => {
    const User = userModel(db)
    const dbQuery = {}
    if (req.params.id) {
      dbQuery.id = req.params.id
    }
    User.findAll({
      where: dbQuery,
      attributes: ['mail', 'id']
    }).then((userS) => {
      res.status(200).json(userS)
    }).catch((err) => {
      next(err)
    })
  })

  router.post('', (req, res, next) => {
    User.create(req.body).then((createdUser) => {
      res.status(201).json(createdUser)
    }).catch((err) => {
      next(err)
    })
  })

  app.use('/users', router)
}
