const express = require('express')
const Sequelize = require('sequelize')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const bp = require('body-parser')
const router = require('./routes/router')

// Reading .env file
dotenv.config()

app.PORT = process.env.PORT || 8080
app.URL = process.env.URI
// form deve ter um email vinculado TRELLO
// Database config
const sequelize = new Sequelize(process.env.URL + '?ssl=require',
  {
    dialect: 'postgres',
    ssl: true,
    native: true,
    timezone: '-06:00'
  })

// middlewares
app.use(cors())
app.use(bp.urlencoded({ extended: true }))
app.use(bp.json())
router(app, sequelize)

sequelize.authenticate().then(() => {
  console.log('Conectado ao banco de dados')
  app.listen(app.PORT, (err) => {
    console.log(err ? 'Erro:' + err : 'Conectado a porta ' + app.PORT)
  })
}).catch((err) => {
  console.log('Erro na conexão com o banco', err)
})
