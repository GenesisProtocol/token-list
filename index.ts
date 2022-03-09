import express, { Application } from 'express'
import cors from 'cors'
import tokenList from './src/token-list'

const app: Application = express()
const port = process.env.PORT || 3001

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/files', express.static('public'))
app.get('/', tokenList)

try {
    app.listen(port, (): void => {
        console.log(`Connected successfully on port ${ port }`)
    })
}
catch (error) {
    console.error(`Error occured: ${ error.message }`)
}
