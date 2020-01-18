import GoogleImages from 'google-images'
import Discord from 'discord.js'
import Bot from '../../../../Bot'

import AUTH from '../../../../user_creds.json.json'

import TRIGGERS from '../../../../bot_knowledge/triggers/triggers.json'

import PHRASES_IMAGE_SEARCH from '../../../../bot_knowledge/phrases/phrases_image_search.json';
import DEFAULTS_IMAGE from '../../../../bot_knowledge/defaults/image_search.json';

export default class BotModuleGoogleImage {

    static fetchBuiltImageFromGoogle(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Image Search', true)

        var userQuery: string = ''

        for (const trigger in TRIGGERS.image_search_triggers.context_prefix)
            //  If user includes a specific thing to look for.
            if (bot._context.toString().toLowerCase().includes(trigger))
                //  Sets query to user's query (after prefix trigger)
                return userQuery =
                    bot._context.toString().substring(
                        bot._context.toString().indexOf(trigger) + trigger.length + 1)

        return BotModuleGoogleImage.fetchImageFromGoogle(userQuery, bot)
    }

    //TODO: Modularize like JSON and Tweet
    static fetchImageFromGoogle(userQuery = '', bot: Bot = globalThis.bot) {
        //  Modules   
        const GOOGLE_IMAGER =
            new GoogleImages(
                AUTH.google.search.CSE_ID, AUTH.google.search.API_KEY)


        //  Random generated (from defaults list) query if user doesn't specify specific item
        userQuery = (userQuery == '') ?
            DEFAULTS_IMAGE.random_query[Math.floor(Math.random() * DEFAULTS_IMAGE.random_query.length)] : userQuery

        try {
            if (userQuery.length > 0)
                console.log(`Performing image search for ${userQuery}.`)
            else
                console.log(`Performing generic image search.`)

            //  Attempts to search for query
            GOOGLE_IMAGER.search(userQuery).then((results: string | any[]) => {
                let resultReply: Discord.MessageAttachment | string
                    = !results.length ?
                        'Nothing found' :
                        new Discord.MessageAttachment(results[Math.floor(Math.random() * results.length)].url)

                //  Generates reply with random image and response
                if (userQuery !== '') {
                    bot.context.reply(
                        `${Bot.fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_with_context)}${userQuery}.`)
                } else {
                    bot.context.reply(
                        `${Bot.fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_random)}`)
                }
                bot.textChannel.send(resultReply)
            })
        } catch (error) {
            //  The other cases
            bot.saveBugReport(error)

            bot.textChannel.send(
                'Couldn\'t find image! Let Joe know to find the error.')

        }
    }
}