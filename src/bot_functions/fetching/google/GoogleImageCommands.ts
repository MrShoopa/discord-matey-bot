import GoogleImages from 'google-images'
import Discord from 'discord.js'
import Bot from '../../../Bot.js'

import KEYS from '../../../user_creds.js'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.js'

import PHRASES_IMAGE_SEARCH from '../../../bot_knowledge/phrases/phrases_image_search.js'
import DEFAULTS_IMAGE from '../../../bot_knowledge/defaults/image_search.js'

export default class BotModuleGoogleImage {

    static funcTitle = `MegaGoog Image Searcher 📷`

    static async fireImageMessageFromGoogle(message: Discord.Message, trigger?: string) {
        message.channel.send({ embeds: [await this.fetchBuiltImageFromGoogle(trigger)] })
    }

    static async fetchBuiltImageFromGoogle(userQuery: Discord.Message | string, trigger?: string):
        Promise<Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Image Search', true)

        if (userQuery instanceof Discord.Message)
            userQuery = ''

        for (const trigAppender of TRIGGERS.context_prefix)
            //  If user includes a specific thing to look for.
            if (userQuery.toString().toLowerCase().includes(trigAppender)) {
                //  Sets query to user's query (after prefix trigger)
                userQuery =
                    userQuery.toString()
                        .replace(`${trigger} ${trigAppender}`, '').trim()
                break
            }

        var item = await this.fetchImageFromGoogle(userQuery, true)

        if (!item) {
            bot.saveBugReport(new ReferenceError('No image was returned.'),
                this.fetchBuiltImageFromGoogle.name,
                true, true)
            return bot.generateErrorMessage(`Due to some error, I couldn't fetch anything at the moment.`, BotModuleGoogleImage.funcTitle)
        }

        let message = new Discord.MessageEmbed()
            .setAuthor('MegaGoog Image Searcher 📷')
            .setColor('BLUE')
            .setFooter(`Powered by Google Images`,
                'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/235px-Google_%22G%22_Logo.svg.png')
            .setImage(item.toString())

        if (item as string)
            message.setImage(item)
        else
            message.setImage(item.url)


        //  Generates reply with random image and response
        if (userQuery !== '') {
            message.setDescription(
                `${Bot.fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_with_context)}${userQuery}.`)
        } else {
            message.setDescription(
                `${Bot.fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_random)}`)
        }

        return message
    }

    static async fetchImageFromGoogle(userQuery = '', urlOnly?: boolean, bot: Bot = globalThis.bot):
        Promise<string | any> {
        //  Modules   
        const GOOGLE_IMAGER =
            new GoogleImages(
                KEYS.google.search.CSE_ID_IMG, KEYS.google.API_KEY)

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
                bot.saveBugReport(error, this.fetchImageFromGoogle.name, true)

                bot.textChannel.send(
                    'Couldn\'t find image! Let Shoop know to find the error.')
            })
        })
    }
}