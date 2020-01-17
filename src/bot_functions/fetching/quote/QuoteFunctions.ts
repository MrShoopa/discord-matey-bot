import Discord from 'discord.js';

import Bot from '../../../Bot';

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json';

export default class BotModuleQuote {
    static async fireQuoteMessage() {
        let bot: Bot = globalThis.bot
        //  Quote of Day [from quotes.rest]
        for (const trigger of TRIGGERS.quote_fetch.OTD.default)
            if (bot.context.toString().toLowerCase().includes(trigger))
                return bot.textChannel.send(this.fetchMovieQuote())

        //! API Depricated?  Movie quote [from MovieQuoter]
        for (const trigger of TRIGGERS.quote_fetch.movie.default)
            if (bot.context.toString().toLowerCase().includes(trigger))
                return bot.textChannel.send(this.fetchMovieQuote())


        //  Inspirational quote [from inspirational-quotes]
        for (const trigger of TRIGGERS.quote_fetch.inspirational)
            if (bot.context.toString().toLowerCase().includes(trigger))
                return bot.textChannel.send(this.fetchInspirationalQuote())
    }

    static async fetchQuoteOfTheDay(trigger?, bot = globalThis.bot) {
        let reqCategory

        //TODO: Naturalize language (Ex. {Megadork fetch 'FUNNY' quote of the day} doesn't work)
        TRIGGERS.quote_fetch.OTD.sub_triggers.some(subTrig => {
            if (bot.context.toString().toLowerCase().includes(subTrig))
                reqCategory = subTrig
        })

        if (trigger) bot.preliminary(trigger, `quote fetch - ${reqCategory} of the day`, true)

        let quoteObject: any

        await import('../../../bot_modules/_external_wrappers/TheySaidSo/index').then(async quoteMaster => {
            try {
                if (reqCategory)
                    quoteObject = await quoteMaster.default.getQuoteOfTheDay(reqCategory)
                else
                    quoteObject = await quoteMaster.default.getQuoteOfTheDay()
            } catch (error) {
                if (error.code === 429)
                    bot.textChannel.send(`Fetched too much right now! ${error.timeMessage}`)
            }
        })

        console.log("Quote Object Returned from TheySaidSo.com: ",
            quoteObject)

        return new Discord.MessageEmbed()
            .setAuthor(`${quoteObject.title} - ${quoteObject.date}`)
            .setDescription(quoteObject.quote)
            .setTitle(`${quoteObject.author}\n`)
            .setFooter('Megadorky Quotter 💬🌟 - helped by theysaidso.com © 2017-19')
    }

    static async fetchMovieQuote(trigger?, bot = globalThis.bot) {
        if (trigger) bot.preliminary(trigger, 'quote fetch - movie', true)
        let quoteObject: any

        await import('../../../bot_modules/_external_wrappers/MovieQuotes/index').then(quoteMaster => {
            quoteObject = quoteMaster.default.getQuote()[0]
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

    static async fetchInspirationalQuote(trigger?, bot = globalThis.bot) {
        if (trigger) bot.preliminary(trigger, 'quote fetch - inspirational', true)

        let quoteObject: { text: any; author: any; }

        await import('inspirational-quotes').then(quoteMaster => {
            quoteObject = quoteMaster.default.getQuote()
        })

        console.log("Quote Object Returned from inspirational-quotes: ",
            quoteObject)

        return new Discord.MessageEmbed()
            .setTitle(quoteObject.text)
            .setAuthor(quoteObject.author)
            .setFooter('Megadorky Quotter 💬🌟')
    }
}