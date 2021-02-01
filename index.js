require('dotenv').config()
const { request, response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')
const cors = require('cors')
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

//middleware
morgan.token('body', function getBody(req) {
    return JSON.stringify(req.body)
    next()
})

app.use(morgan(':method :url :status :response-time ms - :res[content-type] :body'))


let persons = [
    {
        "name": "Dingas Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

let date = new Date();

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
app.get('/api/persons', (request, response) => {
    Person.find({}).then(notes => {
        response.json(notes)
    })
})
app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people. <br>${date}</p>`)
})
//node server post request below:
// app.post('/api/persons', (request, response) => { 
//     function getRandomArbitrary(min, max) {
//         return Math.random() * (max - min) + min;
//       }

//     const body = request.body

//     if (!body) {
//         return response.status(400).json({
//             error: 'content missing'
//         })
//     }
//     if (persons.some(n => n.name === body.name)) {
//         return response.status(400).json({
//             error: 'name must be unique'
//         })
//     }
//     const person = {
//         name: body.name,
//         number: body.number,
//         date: new Date(),
//         id: Math.floor(getRandomArbitrary(1, 1000)),
//     }

//     persons = persons.concat(person)
//     response.json(person)
// })
app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name === undefined) {
        return response.status(400).json({ error: 'name missing' })
    }
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})
// node server individual person get request below:
// app.get('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     const person = persons.find(person => person.id === id)
//     if (person) {
//         response.json(person)
//     } else {
//         response.status(404).end()
//     }
// })
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})
app.delete('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // console.log(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end()
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
  }
  
  app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

