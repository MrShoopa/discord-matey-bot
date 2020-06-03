import Discord from 'discord.js'
import Bot from '../../../Bot'

import USER_CREDS from '../../../user_creds.json'

import { giphy } from '../../../bot_knowledge/triggers/triggers.json'

import GIPHYApi from 'giphy-api'

export default class BotModuleGiphy {

    static GIPHY = GIPHYApi(USER_CREDS.giphy.api_key)
    static async fireGIFMessage(trigger: string, query?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Random GIF request')

        let gif: GIPHYApi.SingleResponse
        try {
            if (query)
                console.log('TODO LMAO')
            //gif = await this.fetchRandomGif(tag)
            else
                gif = await this.fetchRandomGif()
        } catch (err) {
            if (err.message.includes('Unauthorized') || err.message.includes('404'))
                return bot.context.channel.send(`My dev needs to refresh my GIF access! Try again later.`)
            else
                return bot.context.channel.send(`I couldn't fetch a GIF at the moment.`)
        }

        let message = new Discord.MessageEmbed()
            .setURL(gif.data.source_post_url)
            .setColor('GREEN')
            .setFooter(`GIPHY`,
                'https://36711.apps.zdusercontent.com/36711/assets/1506469900-fd7a54462c6615af92812b8a1a25884b/logo.png')
            .setImage(`https://media.giphy.com/media/${gif.data.id}/giphy.gif`)
            .setTimestamp(Date.parse(gif.data.create_datetime))

        if (query)
            message.setTitle(`Here's a random GIF on ${query}!`)
        else
            message.setTitle(`Here's a random GIF!`)

        return bot.context.channel.send(message)
    }

    static async fetchRandomGif() {
        let gif: GIPHYApi.SingleResponse
        let bot: Bot = globalThis.bot

        try {
            gif = await this.GIPHY.random('funny')
            console.log(`Fetched random GIPHY GIF: ${gif.data.title} - ${gif.data.url}`)
        } catch (err) {
            bot.saveBugReport(err, this.fetchRandomGif.name, true)
            throw err
        }

        return gif
    }
}