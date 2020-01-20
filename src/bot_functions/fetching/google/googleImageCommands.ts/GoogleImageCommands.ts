import GoogleImages from 'google-images'
import Discord from 'discord.js'
import Bot from '../../../../Bot'

import AUTH from '../../../../user_creds.json'

import TRIGGERS from '../../../../bot_knowledge/triggers/triggers.json'

import PHRASES_IMAGE_SEARCH from '../../../../bot_knowledge/phrases/phrases_image_search.json';
import DEFAULTS_IMAGE from '../../../../bot_knowledge/defaults/image_search.json';

export default class BotModuleGoogleImage {

    static async fireImageMessageFromGoogle(trigger?: string) {
        let bot: Bot = globalThis.bot

        bot.context.channel.send(await this.fetchBuiltImageFromGoogle(trigger))
    }

    static async fetchBuiltImageFromGoogle(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Image Search', true)

        var userQuery: string = ''

        for (const trigger in TRIGGERS.image_search_triggers.context_prefix)
            //  If user includes a specific thing to look for.
            if (bot.context.toString().toLowerCase().includes(trigger))
                //  Sets query to user's query (after prefix trigger)
                return userQuery =
                    bot.context.toString().substring(
                        bot.context.toString().indexOf(trigger) + trigger.length + 1)

        var item = await this.fetchImageFromGoogle(userQuery, true)

        if (!item) {
            bot.saveBugReport(new ReferenceError('No image was returned.'), true, true)
            return bot.generateErrorMessage(`Due to some error, I couldn't fetch anything at the moment.`)
        }

        let message = new Discord.MessageEmbed()
            .setAuthor('MegaGoog Image Searcher 📷')
            .setColor('lightblue')
            .setFooter(`Powered by Google Images`,
                'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/235px-Google_%22G%22_Logo.svg.png')
            .setImage(item.toString())

        //  Generates reply with random image and response
        if (userQuery !== '') {
            message.setDescription(
                `${Bot.fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_with_context)}${userQuery}.`)
        } else {
            message.setDescription(
                `${Bot.fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_random)}`)
        }

        return item
    }

    static async fetchImageFromGoogle(userQuery = '', urlOnly?: boolean, bot: Bot = globalThis.bot):
        Promise<Discord.MessageAttachment | string> {
        //  Modules   
        const GOOGLE_IMAGER =
            new GoogleImages(
                AUTH.google.search.CSE_ID, AUTH.google.search.API_KEY)

        userQuery = userQuery.toLowerCase()

        //  Random generated (from defaults list) query if user doesn't specify specific item
        if (userQuery == '') {
            console.log(`Performing generic image search.`)
            userQuery = DEFAULTS_IMAGE.random_query[Math.floor(Math.random() * DEFAULTS_IMAGE.random_query.length)]
        }

        console.log(`Performing image search for ${userQuery}.`)

        //  Attempts to search for query
        return new Promise((res) => {
            GOOGLE_IMAGER.search(userQuery).then(async (results: string | any[]) => {
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
                bot.saveBugReport(error, true)

                bot.textChannel.send(
                    'Couldn\'t find image! Let Joe know to find the error.')
            })
        })
    }
}