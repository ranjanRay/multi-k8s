import * as redis from "redis"
import * as keys from "./keys"

const redisClient = redis.createClient({
    host: keys.keys.REDIS_HOST,
    port: parseInt(keys.keys.REDIS_PORT),
    retry_strategy: () => 1000
})

const fib = (index: number): number => {
    return index < 2 ? 1: fib(index - 1) + fib(index - 2)
}

const subscriber = redisClient.duplicate()
subscriber.on('message', (channel, message) => {
    redisClient.hset('fibs', message, fib(parseInt(message)).toString())
})

subscriber.subscribe('insert')
console.log(`subscribed to redis!`)