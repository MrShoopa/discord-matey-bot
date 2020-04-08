import GoogleImages from 'google-images'
import Discord from 'discord.js'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

import PHRASES_GOOGLE_SEARCH from '../../../bot_knowledge/phrases/phrases_google_search.json'

export default class BotModuleGoogleSearch {

    static async fireSearchMessageFromGoogle(trigger?: string) {
        let bot: Bot = globalThis.bot

        bot.context.channel.send(await this.fetchBuiltSearchFromGoogle(trigger))
    }

    static async fetchBuiltSearchFromGoogle(trigger?: string):
        Promise<Discord.Message | Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Google Search', true)

        var userQuery: string = ''

        for (const trigAppender of TRIGGERS.context_prefix)
            //  If user includes a specific thing to look for.
            if (bot.context.toString().toLowerCase().includes(trigAppender)) {
                //  Sets query to user's query (after prefix trigger)
                userQuery =
                    bot.context.toString()
                        .replace(`${trigger} ${trigAppender}`, '').trim()
                break
            }

        var item = await this.fetchSearchFromGoogle(userQuery, true)

        if (!item) {
            bot.saveBugReport(new ReferenceError('No Search was returned.'),
                this.fetchBuiltSearchFromGoogle.name,
                true, true)
            return bot.generateErrorMessage(`Due to some error, I couldn't fetch anything at the moment.`)
        }

        let message = new Discord.MessageEmbed()
            .setAuthor('MegaGoog')
            .setColor('BLUE')
            .setFooter(`Powered by Google`,
                'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/235px-Google_%22G%22_Logo.svg.png')
            .setImage(item.toString())

        if (item as string)
            message.setImage(item)
        else
            message.setImage(item.url)


        //  Generates reply with random search and response
        if (userQuery !== '') {
            message.setDescription(
                `${Bot.fetchRandomPhrase(PHRASES_GOOGLE_SEARCH.image_search_fetch_response.image_search_with_context)}${userQuery}.`)
        } else {
            message.setDescription(
                `${Bot.fetchRandomPhrase(PHRASES_GOOGLE_SEARCH.image_search_fetch_response.image_search_random)}`)
        }

        return message
    }

    static async fetchSearchFromGoogle(userQuery = '', urlOnly?: boolean, bot: Bot = globalThis.bot):
        Promise<string | any> {
        //  Modules   
        const GOOGLE =
            new GoogleImages(
                AUTH.google.search.CSE_ID, AUTH.google.search.API_KEY)

        userQuery = userQuery.toLowerCase()

        //  Random generated (from defaults list) query if user doesn't specify specific item
        if (userQuery == '') {
            console.log(`Performing generic image search.`)
            //TODO userQuery = DEFAULTS_GOOGLE.random_query[Math.floor(Math.random() * DEFAULTS_GOOGLE.random_query.length)]
        }

        console.log(`Performing image search for ${userQuery}.`)

        //  Attempts to search for query
        return new Promise((res) => {
            GOOGLE.search(userQuery).then(async (results: string | any[]) => {
                if (results.length) {
                    if (urlOnly)
                        res(results[Math.floor(Math.random() * results.length)].url)
                    else
                        res(await bot.fetchImageFromURL(results[Math.floor(Math.random() * results.length)].url))
                } else {
                    res(null)
                }
            }).catch(error => {
                //  The other cases
                //TODO bot.saveBugReport(error, this.fetchImageFromGoogle.name, true)

                bot.textChannel.send(
                    'Couldn\'t find image! Let Joe know to find the error.')
            })
        })
    }
}