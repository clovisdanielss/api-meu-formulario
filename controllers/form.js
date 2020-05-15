const express = require('express')
const router = express.Router()
const formModel = require('../models/form')
const componentModel = require('../models/component')
const questionModel = require('../models/question')

module.exports = (app, db) => {
  const Form = formModel(db)
  const Component = componentModel(db)
  const Question = questionModel(db)

  router.get('(/:id)?', (req, res, next) => {
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

  router.post('', (req, res, next) => {
    req.body.idUser = req.userParams.id
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
    console.log(req.formResponse)
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

  app.use('/users/:id/forms', router)
}
