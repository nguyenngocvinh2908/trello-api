import express from 'express'

const app = express()

const hostname = 'localhost'
const port = 8068

app.get('/', (req, res) => {
  res.send('<h1>Hello Word Nodejs VinggaDev</h1>')
})

app.listen(port, hostname, () => {
  console.log(`Hello VinggaDev, I am running server at htpp://${hostname}:${port}/`)
})
