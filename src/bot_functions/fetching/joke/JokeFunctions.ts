import Discord from 'discord.js'
import Bot from '../../../Bot'

import { joke } from '../../../bot_knowledge/triggers/triggers.json'
import Joker from 'give-me-a-joke'

export default class BotModuleJoke {
    static async fireJokeMessage(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Joke pullup')

        let query: string = bot.context.toString().replace(trigger, '').trim()
        const joke: { joke: string, category: string, source: string } = await this.fetchJoke(query)

        if (joke.category == 'MISSING_NAME')
            return bot.context.reply(`you must type "**name** ***first*** ***last***" to get a custom joke!`)

        let message = new Discord.MessageEmbed()
            .setDescription(joke.joke)
            .setColor('GREEN')
            .setThumbnail('https://webstockreview.net/images/horn-clipart.png')
            .setFooter(`${joke.category} - ${joke.source}`)
        //? add credits to Joke APIs? .setFooter(joke)

        return bot.context.channel.send(message)
    }

    // this is what happens if your api doesn't use promises or typescript
    static async fetchJoke(query?: string) {
        let jokeObject = { joke: "", category: "", source: "" }

        for (let category of joke.of_the_day.base)
            if (query.includes(category)) {
                jokeObject.source = 'Jokes.one'
                for (let category of joke.of_the_day.animal)
                    if (query.includes(category)) {
                        jokeObject.joke = await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('animal', j => res(j)) })
                        jokeObject.category = 'Animal Joke of the Day'
                        return jokeObject
                    }
                for (let category of joke.of_the_day.blonde)
                    if (query.includes(category)) {
                        jokeObject.joke = await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('blonde', j => res(j)) })
                        jokeObject.category = 'Blonde Joke of the Day'
                        return jokeObject
                    }
                for (let category of joke.of_the_day.knock)
                    if (query.includes(category)) {
                        jokeObject.joke = await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('knock-knock', j => res(j)) })
                        jokeObject.category = 'Knock-Knock Joke of the Day'
                        return jokeObject
                    }
                jokeObject.joke = await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('jod', j => res(j)) })
                jokeObject.category = 'Joke of the Day'
                return jokeObject
            }
        for (let category of joke.dad)
            if (query.includes(category)) {
                jokeObject.source = 'icanhazdadjoke.com'
                jokeObject.joke = await new Promise((res, rej) => { Joker.getRandomDadJoke(j => res(j)) })
                jokeObject.category = 'Dad Joke'
                return jokeObject
            }
        for (let category of joke.chuck)
            if (query.includes(category)) {
                jokeObject.source = 'icndb.com'
                jokeObject.joke = await new Promise((res, rej) => { Joker.getRandomCNJoke(j => res(j)) })
                jokeObject.category = 'Chuck Norris Joke'
                return jokeObject
            }
        for (let category of joke.custom)
            if (query.includes(category))
                if (!query.includes('name')) {
                    jokeObject.category = 'MISSING_NAME'
                    return jokeObject
                }
                else {
                    let name = query.substring(query.indexOf('name') + 'name'.length).trim().split(' ').slice(0, 2)
                    jokeObject.source = 'icndb.com'
                    jokeObject.joke = await new Promise((res, rej) => { Joker.getCustomJoke(name[0], name[1], j => res(j)) })
                    jokeObject.category = 'Custom Joke'
                    return jokeObject
                }
        jokeObject.source = 'Jokes.one'

        jokeObject.joke = await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('jod', j => res(j)) })
        jokeObject.category = 'Joke of the Day'
        return jokeObject
    }
}