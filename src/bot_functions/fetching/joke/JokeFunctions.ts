import Discord from 'discord.js'
import Bot from '../../../Bot'

import { joke } from '../../../bot_knowledge/triggers/triggers.json'
const Joker = require('give-me-a-joke')

export default class BotModuleJoke {
    static async fireJokeMessage(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Joke pullup')

        let query: string = bot.context.toString().replace(trigger, '').trim()
        const joke = await this.fetchJoke(query)

        if (joke == 'missing name')
            return bot.context.reply(`you must type "**name** ***first*** ***last***" to get a custom joke!`)

        let message = new Discord.MessageEmbed()
            .setDescription(joke)
            .setColor('GREEN')
            .setThumbnail('https://webstockreview.net/images/horn-clipart.png')
        //? add credits to Joke APIs? .setFooter(joke)

        return bot.context.channel.send(message)
    }

    // this is what happens if your api doesn't use promises or typescript
    static async fetchJoke(query?: string) {
        for (let category of joke.of_the_day.base)
            //TODO: Expand using Jokes API Usage
            if (query.includes(category)) {
                for (let category of joke.of_the_day.animal)
                    if (query.includes(category))
                        return await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('animal', j => { res(j) }) })
                for (let category of joke.of_the_day.blonde)
                    if (query.includes(category))
                        return await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('blonde', j => { res(j) }) })
                for (let category of joke.of_the_day.knock)
                    if (query.includes(category))
                        return await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('knock-knock', j => { res(j) }) })
                return await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay('jod', j => { res(j) }) })
            }
        for (let category of joke.dad)
            if (query.includes(category))
                return await new Promise((res, rej) => { Joker.getRandomDadJoke(j => res(j)) })
        for (let category of joke.chuck)
            if (query.includes(category))
                return await new Promise((res, rej) => { Joker.getRandomCNJoke(j => res(j)) })
        for (let category of joke.custom)
            if (query.includes(category))
                if (!query.includes('name'))
                    return 'missing name'
                else {
                    let name = query.substring(query.indexOf('name') + 'name'.length).trim().split(' ').slice(0, 2)
                    return await new Promise((res, rej) => { Joker.getCustomJoke(name[0], name[1], j => res(j)) })
                }

        return await new Promise((res, rej) => { Joker.getRandomJokeOfTheDay(j => { res(j) }) })
    }
}