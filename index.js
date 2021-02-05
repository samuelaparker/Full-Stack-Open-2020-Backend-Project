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
    response.json('Hello World!')
})

app.get("/info", (req, res, next) => {
    Person.countDocuments()
        .then(result => {
            const message = `<p>Phonebook has info for ${result} people</p><p>${new Date()}</p>`;
            res.send(message).end();
        })
        .catch(error => next(error));
});

app.get("/api/persons", (req, res, next) => {
    Person.find({})
        .then(result => {
            res.status(200).json(result.map(i => i.toJSON()));
        })
        .catch(error => next(error));
});
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (body.name === undefined) {
        return response.status(400).json({ error: 'name missing' })
    }
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(err => {
            next(err)
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number,
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true },)
        .then(updatePerson => {
            response.json(updatePerson.toJSON())
        })
        .catch(error => next(error))
})
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

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json(error)
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

