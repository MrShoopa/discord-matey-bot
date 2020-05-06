import Discord from 'discord.js'

import { meme_triggers } from '../../../bot_knowledge/triggers/triggers.json'

import Flipper from 'imgflip'

export default class BotModuleMeme {
    static ImgFlip = new Flipper({
        username: 'mrshoopa',
        password: 'memecreator69'
    })

    static async fireMemeRequest(context: Discord.Message = globalThis.bot.context) {
        globalThis.bot.preliminary('lol', `meme fetch`, true)

        let response
        let stringed = context.toString()

        for (const category of meme_triggers.categories)
            if (context.toString().toLowerCase().includes(category))
                response = await this.fetchCustomMeme(stringed.substring(stringed.indexOf(category) + category.length).trim(), category)

        // TODO fetch a compeltely random meme
        if (!response)
            response = `Couldn't find your meme. Type Megadork Help Meme for list of memes you can send.`

        return context.channel.send(response)
    }

    static async fetchCustomMeme(params, topic: string) {
        let templateId: string

        if (topic == 'bling')
            templateId = '181913649'
        else if (topic == 'doge')
            templateId = '8072285'
        else if (topic == 'spongebob')
            templateId = '102156234'
        else if (topic == 'brain')
            templateId = '93895088'
        else if (topic == 'uno cards')
            templateId = '217743513'
        else if (topic == 'trump signing')
            templateId = '91545132'
        else if (topic == 'handshake')
            templateId = '135256802'
        else if (topic == 'monkey puppet')
            templateId = '148909805'
        else if (topic == 'bernie')
            templateId = '222403160'
        else if (topic == 'more of that')
            templateId = '124055727'
        else
            return null

        let image: any

        if (params.length !== 0 && !params.match(/".+?"/g)) {
            return 'invalid'
        } else if (params.match(/".+?"/g)) {
            params = params.match(/".+?"/g).map((a: string) => {
                return a.replace(/"/g, '')
            })

            image = await this.ImgFlip.meme(templateId, {
                captions: params,
                path: `../${topic}.png`
            })
        } else {
            image = await this.ImgFlip.meme(templateId, {
                path: `../${topic}.png`
            })
        }

        return this.buildMemeMessage(image, topic)
    }

    static buildMemeMessage(imageUrl, name?: string) {
        let message = new Discord.MessageEmbed()
            .setColor('LUMINOUS_VIVID_PINK')
            .setFooter('ImgFlip Mega-Meme Generator 😂👌')
            .setImage(imageUrl)

        if (name)
            message.setTitle(name)

        return message
    }
}