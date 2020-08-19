import Discord from 'discord.js'

import Bot from '../../../Bot'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

export default class BotModuleQuote {
    static async fireQuoteMessage(message: Discord.Message) {
        let bot: Bot = globalThis.bot
        //  Quote of Day [from quotes.rest]
        for (const trigger of TRIGGERS.quote_fetch.OTD.default)
            if (message.toString().toLowerCase().includes(trigger))
                return message.channel.send(await this.fetchQuoteOfTheDay(message, trigger))

        //! API Depricated?  Movie quote [from MovieQuoter]
        for (const trigger of TRIGGERS.quote_fetch.movie.default)
            if (message.toString().toLowerCase().includes(trigger))
                return message.channel.send(await this.fetchMovieQuote(trigger))

        //  Inspirational quote [from inspirational-quotes]
        for (const trigger of TRIGGERS.quote_fetch.inspirational)
            if (message.toString().toLowerCase().includes(trigger))
                return message.channel.send(await this.fetchInspirationalQuote(trigger))

        //  Star Wars quote [from star-wars-quotes]
        for (const trigger of TRIGGERS.quote_fetch.star_wars.default)
            if (message.toString().toLowerCase().includes(trigger))
                return message.channel.send(await this.fetchStarWarsQuote(trigger))
    }

    static async fetchQuoteOfTheDay(message: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot
        let categoryRequest: string

        TRIGGERS.quote_fetch.OTD.sub_triggers.some(subTrig => {
            if (message.toString().toLowerCase().includes(subTrig))
                categoryRequest = subTrig
        })

        bot.preliminary('lol', `quote fetch - ${categoryRequest} of the day`, true)

        let quoteObject: any

        await import('../../../bot_modules/_external_wrappers/TheySaidSo/index').then(async quoteMaster => {
            try {
                if (categoryRequest)
                    quoteObject = await quoteMaster.default.getQuoteOfTheDay(categoryRequest)
                else
                    quoteObject = await quoteMaster.default.getQuoteOfTheDay()
            } catch (e) {
                bot.saveBugReport(e, this.fetchQuoteOfTheDay.name)
                if (e.includes('Fetched'))
                    message.channel.send(`Fetched too much right now! ${e.timeMessage}`)
            }
        })

        if (!quoteObject.author)
            quoteObject.author = 'Anonymous'

        console.log("Quote Object Returned from TheySaidSo.com: ",
            quoteObject)

        return new Discord.MessageEmbed()
            .setAuthor(`${quoteObject.title} - ${quoteObject.date}`)
            .setDescription(quoteObject.quote)
            .setTitle(`${quoteObject.author}\n`)
            .setFooter('Megadorky Quotter 💬🌟 - helped by theysaidso.com © 2017-19')
    }

    static async fetchMovieQuote(trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'quote fetch - movie', true)
        let quoteObject: any

        await import('../../../bot_modules/_external_wrappers/MovieQuotes/index').then(async quoteMaster => {
            while (!quoteObject) // Not uh... the best implemenation
                try {
                    quoteObject = await quoteMaster.default.getQuote()
                } catch (e) {
                    bot.saveBugReport(e, this.fetchMovieQuote.name)
                    console.log('asd')
                    if (e as EvalError) return "Looks like I can't fetch quotes right now..."
                }
        })

        console.log("Quote Object Returned from MovieQuoter: ",
            quoteObject)

        return new Discord.MessageEmbed()
            .setTitle(`From *${quoteObject.movie.title}* 
                (${quoteObject.year})`)
            .setDescription(quoteObject.content)
            .setImage(quoteObject.image_thumb_url)
            .setAuthor(`${quoteObject.character} - *${quoteObject.actor}*`)
            .setFooter('Megadorky Quotter 💬🌟')

    }

    static async fetchInspirationalQuote(trigger?: string, log?: boolean) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'quote fetch - inspirational', true)

        let quoteObject: { text: any; author: any; }

        await import('inspirational-quotes').then(async quoteMaster => {
            while (!quoteObject) // Not uh... the best implemenation
                try {
                    quoteObject = await quoteMaster.default.getQuote()
                } catch (e) {
                    bot.saveBugReport(e, this.fetchInspirationalQuote.name)
                    return "Looks like I can't fetch quotes right now..."
                }
        })

        if (log) console.log("Quote Object Returned from inspirational-quotes: ",
            quoteObject)

        return new Discord.MessageEmbed()
            .setTitle(quoteObject.text)
            .setAuthor(quoteObject.author)
            .setFooter('Megadorky Quotter 💬🌟')
    }

    static async fetchStarWarsQuote(trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'quote fetch - star wars', true)

        let quoteObject: { text: any; starWarsQuote: any; }

        await import('starwars').then(quoteMaster => {
            try {
                quoteObject = quoteMaster.default()
            } catch (e) {
                bot.saveBugReport(e, this.fetchInspirationalQuote.name)
                return "Looks like I can't fetch quotes right now..."
            }
        })

        console.log("Quote Object Returned from star-wars-quotes: ",
            quoteObject)

        return new Discord.MessageEmbed()
            .setTitle(quoteObject)
            .setAuthor(`From a galaxy far far away...`)
            .setFooter('Megadorky Quotter 💬🌟')
    }
}