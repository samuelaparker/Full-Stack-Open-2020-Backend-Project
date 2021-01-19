const express = require('express')
let app = express()

app.use(express.json())

let persons = [
    {
        "name": "Arto Hellas",
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
    response.json(persons)
})
app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people. <br>${date}</p>`)
})
app.post('/api/persons', (request, response) => {
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
      }

    const body = request.body
    console.log(body.content)
    // if (!body.content) {
    //     return response.status(400).json({
    //         error: 'content missing'
    //     })
    // }
    const person = {
        name: body.name,
        number: body.number,
        date: new Date(),
        id: Math.floor(getRandomArbitrary(1, 1000)),
    }
    persons = persons.concat(person)
    console.log(person)
    response.json(person)
})
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    person = persons.filter(person => person.id !== id)
    response.status(204).end()
})



const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})