const express = require('express')
const router = express.Router()
const formModel = require('../models/form')
const componentModel = require('../models/component')
const questionModel = require('../models/question')
const crypto = require('crypto')

module.exports = (app, db) => {
  const Form = formModel(db)
  const Component = componentModel(db)
  const Question = questionModel(db)

  // Checa se existe autorização somente para user/:id/forms
  router.all('*', (req, res, next) => {
    if (req.method === 'GET' ||
      (req.headers && req.headers.authorization)) {
      next()
    } else {
      const err = new Error('Sem autorização')
      err.status = 300
      next(err)
    }
  })

  router.get('(/:id)?', (req, res, next) => {
    const query = req.query
    if (!req.userParams || (query && query.full && req.params.id)) {
      return next()
    }
    const dbQuery = { idUser: req.userParams.id }
    if (req.params.id) {
      dbQuery.id = req.params.id
    }
    Form.findAll({ where: dbQuery }).then((formS) => {
      res.json(formS)
    }).catch((err) => {
      next(err)
    })
  })

  router.all('/:id/*', (req, res, next) => {
    req.formParams = req.params
    next()
  })

  // Deveria passar o link como query.
  // Esse é o único método de /forms
  router.get('/:link', (req, res, next) => {
    const dbQuery = { link: req.params.link }
    Form.findOne({ where: dbQuery })
      .then((foundForm) => {
        var form = foundForm.dataValues
        req.form = form
        next()
      })
      .catch((err) => {
        next(err)
      })
  })

  router.get('/:link', (req, res, next) => {
    const dbQuery = { idForm: req.form.id }
    Question.findAll({ where: dbQuery })
      .then((foundQuestions) => {
        var questions = []
        var questionsIds = []
        foundQuestions.map((question, key) => {
          questions.push(question.dataValues)
          questionsIds.push(questions[key].id)
        })
        req.form.questions = questions
        req.qids = questionsIds
        next()
      })
      .catch((err) => {
        next(err)
      })
  })

  router.get('/:link', (req, res, next) => {
    const dbQuery = { idQuestion: req.qids }
    Component.findAll({ where: dbQuery })
      .then((foundComponents) => {
        req.form.questions.map((question) => {
          var components = []
          foundComponents.map((component) => {
            if (component.dataValues.idQuestion === question.id) {
              components.push(component)
            }
          })
          question.components = components
        })
        res.json(req.form)
      }).catch((err) => {
        next(err)
      })
  })

  // Post e delete dividido em três parte, serviço começa deletando
  // as entidades dependentes até chegar no formulário.
  // Objeto totalmente aninhado. Form:{Question:{Components:{}}}
  router.post('', (req, res, next) => {
    console.log(req.body)
    req.body.idUser = req.userParams.id
    req.body.link = crypto.randomBytes(4).toString('hex') + req.body.idUser + crypto.randomBytes(2).toString('hex')
    Form.create(req.body).then((createdForm) => {
      var questions = []
      req.body.questions.map((question) => {
        question.idForm = createdForm.dataValues.id
        questions.push(question)
      })
      req.formResponse = {
        toResponse: createdForm.dataValues,
        toCreate: questions
      }
      next()
    }).catch((err) => {
      next(err)
    })
  })

  router.post('', (req, res, next) => {
    console.log(req.formResponse)
    var questions = req.formResponse.toCreate
    Question.bulkCreate(questions).then((createdQuestions) => {
      req.formResponse.toResponse.questions = createdQuestions
      var components = []
      // Adicionando componentes com id gerado em questionS.
      createdQuestions.map((createdQuestion, key) => {
        questions[key].components.map((component) => {
          component.idQuestion = createdQuestion.dataValues.id
          components.push(component)
        })
      })
      req.formResponse.toCreate = components
      next()
    }).catch((err) => {
      next(err)
    })
  })

  router.post('', (req, res, next) => {
    var components = req.formResponse.toCreate
    Component.bulkCreate(components).then((createdComponents) => {
      req.formResponse.toResponse.components = createdComponents
      res.status(201).json(req.formResponse.toResponse)
    }).catch((err) => {
      next(err)
    })
  })

  router.delete('/:id', (req, res, next) => {
    const dbQuery = { idForm: req.params.id }
    Question.findAll({ where: dbQuery, attributes: ['id'] }).then((questionS) => {
      var idQuestion = []
      if (!questionS) {
        return next()
      }
      questionS.map((question) => {
        idQuestion.push(question.id)
      })
      console.log(idQuestion)
      Component.destroy({ where: { idQuestion: idQuestion } }).then(() => {
        next()
      }).catch((err) => {
        next(err)
      })
    }).catch((err) => {
      next(err)
    })
  })

  router.delete('/:id', (req, res, next) => {
    const dbQuery = { idForm: req.params.id }
    Question.destroy({ where: dbQuery }).then(() => {
      next()
    }).catch((err) => {
      next(err)
    })
  })

  router.delete('/:id', (req, res, next) => {
    const dbQuery = { id: req.params.id }
    Form.destroy({ where: dbQuery }).then(() => {
      res.status(204).end()
    }).catch((err) => {
      next(err)
    })
  })

  /**
  * A atualização de um formulário é a deleção do antigo
  * e inserção do novo. Isso é menos custoso do que, buscar
  * as componentes a serem atualizadas, e ademais
  * buscar as questões a serem atualizadas.
  */

  // Específico para quem vai preencher o form.
  app.use('/forms', router)
  // Específico para serviços do usuário.
  app.use('/users/:id/forms', router)
}
