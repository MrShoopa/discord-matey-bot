import Discord from 'discord.js'
import Bot from '../../Bot'

import Zalgo from 'to-zalgo'
import UnZalgo from 'to-zalgo/banish'

import { translate } from '../../bot_knowledge/triggers/triggers.json'

export default class ZalgoTextFunctions {
    static generateZalgoTextTranslationMessage(message: Discord.Message, trigger: string, to: 'text' | 'zalgo', text?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Binary to Text conversion', true)

        let conversion

        if (!text) {
            text = message.content.toString()
            text = text.replace(trigger, '').trim()
        }

        translate.distorted.to.some(hotword => {
            if (text.includes(hotword))
                text = text.replace(hotword, '').trim()
        })
        translate.distorted.from.some(hotword => {
            if (text.includes(hotword))
                text = text.replace(hotword, '').trim()
        })

        if (to == 'text')
            conversion = this.decodeZalgoText(text)
        else if (to == 'zalgo')
            conversion = this.generateZalgoText(text)

        conversion = conversion.replace(/\[(.*?)\]/g, '').match(/.{1,2040}/gs)

        let built = new Array<Discord.MessageEmbed>()

        if (conversion.length > 0) {
            for (let i = 0; i < conversion.length; i++) {
                let add = new Discord.MessageEmbed()
                    .setDescription(conversion[i])
                    .setColor('BLACK')

                if (i == conversion.length - 1)
                    add.setFooter('brrr', 'https://www.kindpng.com/picc/b/28/283431.png')

                built.push(add)
            }
        }

        built.forEach(part => { message.channel.send(part) })
    }

    static generateZalgoText(text: string) {
        return Zalgo(text)
    }

    static decodeZalgoText(zalgedText: string) {
        return UnZalgo(zalgedText)
    }
}