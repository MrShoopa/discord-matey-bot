import Google from 'google-it'
import Discord from 'discord.js'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

import PHRASES_GOOGLE_SEARCH from '../../../bot_knowledge/phrases/phrases_google_search.json'
import DEFAULTS_GOOGLE from '../../../bot_knowledge/defaults/image_search.json'

export default class BotModuleGoogleSearch {

    static async fireSearchMessageFromGoogle(trigger?: string) {
        let bot: Bot = globalThis.bot

        let query = bot.context.toString()

        bot.context.channel.send(await this.fetchBuiltSearchFromGoogle(query, trigger))
    }

    static async fetchBuiltSearchFromGoogle(query?: string, trigger?: string):
        Promise<Discord.Message | Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot

        if (trigger) {
            query = bot.context.toString().replace(`${trigger}`, '').trim()
            bot.preliminary(trigger, 'Google Search', true)
        }

        for (const trigAppender of TRIGGERS.context_prefix)
            //  If user includes a specific thing to look for.
            if (bot.context.toString().toLowerCase().includes(trigAppender)) {
                //  Sets query to user's query (after prefix trigger)
                query =
                    bot.context.toString()
                        .replace(`${trigAppender}`, '').trim()
                break
            }

        var list = await this.fetchSearchFromGoogle(query, 5)

        if (!list) {
            bot.saveBugReport(new ReferenceError('No Search was returned.'),
                this.fetchBuiltSearchFromGoogle.name, true)
            return bot.generateErrorMessage(`I got nothing fam`)
        }

        let message = new Discord.MessageEmbed()
            .setAuthor('MegaGoog')
            .setColor('BLUE')
            .setFooter(`Google Search`,
                'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/235px-Google_%22G%22_Logo.svg.png')

        list.forEach(item => {
            message.addFields({ name: item.title, value: item.link })
        })

        //  Generates reply with random search and response
        if (query !== '') {
            message.setDescription(
                `${Bot.fetchRandomPhrase(PHRASES_GOOGLE_SEARCH.google_search_fetch_response.google_search_with_context)} ${query}.`)
        } else {
            message.setDescription(
                `${Bot.fetchRandomPhrase(PHRASES_GOOGLE_SEARCH.google_search_fetch_response.google_search_random)}`)
        }

        return message
    }

    static async fetchSearchFromGoogle(query = '', limit: number = 25, bot: Bot = globalThis.bot) {

        query = query.toLowerCase()

        //  Random generated (from defaults list) query if user doesn't specify specific item
        if (query == '') {
            console.log(`Performing generic image search.`)
            query = DEFAULTS_GOOGLE.random_query[Math.floor(Math.random() * DEFAULTS_GOOGLE.random_query.length)]
        }

        console.log(`Performing image search for ${query}.`)

        //  Attempts to search for query
        return await Google({ query: query }).then((results: any) => {
            if (results) {
                console.log(`Google request succeeded.`)

                if (limit)
                    return results.slice(0, limit)
                else return results
            }
            else return null
        }).catch(err => {
            //  The other cases
            bot.saveBugReport(err, this.fetchSearchFromGoogle.name, true)
            throw err
        })
    }
}
