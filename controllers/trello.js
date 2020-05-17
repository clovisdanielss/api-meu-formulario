const express = require('express')
const router = express.Router()
const superagent = require('superagent')

module.exports = (app, db) => {
  // Encaminhamento de parâmetros
  router.all('/boards/:id/*', (req, res, next) => {
    req.boardParams = req.params
    next()
  })

  /**
    Deve retornar todos os quadros do usuário/
  */
  router.get('/boards', (req, res, next) => {
    superagent.get('https://trello.com/1/members/me/boards?key=' +
      process.env.TRELLO_KEY + '&token=' + req.headers.authorization)
      .send().end((err, _res) => {
        if (err) {
          next(err)
        } else {
          const response = JSON.parse(_res.text)
          var result = []
          response.map((lists) => {
            result.push({
              id: lists.id,
              name: lists.name
            })
          })
          res.json(result)
        }
      })
  })

  // Deve retornar todas as listas de uma board de usuário.
  router.get('/boards/:idBoard/lists', (req, res, next) => {
    superagent.get('https://trello.com/1/boards/' + req.boardParams.id + '/lists?key=' +
      process.env.TRELLO_KEY + '&token=' + req.headers.authorization)
      .send().end((err, _res) => {
        if (err) {
          next(err)
        } else {
          const response = JSON.parse(_res.text)
          var result = []
          response.map((lists) => {
            result.push({
              id: lists.id,
              name: lists.name
            })
          })
          res.json(result)
        }
      })
  })

  app.use('/trello', router)
}
