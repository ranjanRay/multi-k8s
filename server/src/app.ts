import * as express from "express"
import * as cors from "cors"
import * as bodyParser from "body-parser"
import * as redis from "redis"
import * as keys from "./keys"
import { Pool } from "pg"

const redisClient = redis.createClient({
    host: keys.keys.REDIS_HOST,
    port: parseInt(keys.keys.REDIS_PORT as string),
    retry_strategy: () => 1000
})

const publisher = redisClient.duplicate()

const pgClient = new Pool({
    host: keys.keys.PG_HOST,
    port: parseInt(keys.keys.PG_PORT as string),
    user: keys.keys.PG_USER,
    password: keys.keys.PG_PASSWORD,
    database: keys.keys.PG_DATABASE
})

pgClient.on('error', (error) => {
    console.log(`error connecting to the pg database..${JSON.stringify(error)}`)
})

pgClient.query('CREATE TABLE IF NOT EXISTS values (number integer)', (err, res) => {
    if(err) throw err;
})

const PORT = 3030
const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get("/", (req, resp) => {
    resp.status(200).send(`Welcome to India, Mr. India.`)
})

app.get("/values/all", async (req, resp) => {

    /* RETRIEVE ALL THE CALCULATED DATA FROM POSTGRES. */
    const result = await pgClient.query('SELECT * FROM values')
    resp.status(200).send(result.rows)
    return
})

app.get("/values/current", (req, resp) => {
    redisClient.hgetall('fibs', (err, values) => {
        return resp.status(200).send(values)
    })
})

app.post("/values", async (req, resp) => {
    const index = req.body.index
    if(parseInt(index) > 40) {
        return resp.status(422).send('Index too high.')
    }
    redisClient.hset('fibs', index, "Nothing yet!")
    publisher.publish('insert', index)
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index])
    return resp.status(200).send({
        calculating: true
    })
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})
