import Discord from 'discord.js'
import Bot from './../../Bot'

import { translate } from '../../bot_knowledge/triggers/triggers.json'

import Binary from 'decode-encode-binary'

export default class BinaryCoderFunctions {
    static generateBinaryTranslationMessage(trigger: string, to?: string, text?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Binary to Text conversion', true)

        let conversion: string

        if (!text) {
            text = bot.context.toString()
            translate.binary.some(hotword => {
                if (text.toLowerCase().includes(hotword)) {
                    text = text.slice(text.indexOf(hotword) + hotword.length).trim()
                }
            })
        }

        if (to == 'binary-to-text')
            conversion = this.convertToBinary(text)
        else if (to == 'text-to-binary')
            conversion = this.convertToText(text)
        else
            conversion = this.autoConvert(text, true)

        let message = new Discord.MessageEmbed()
            .setDescription(conversion)
            .setColor('GOLD')
            .setFooter('Binary <-> Text')

        bot.context.channel.send(message)
    }

    static convertToBinary(text: string) {
        var converted = Binary.encode(text)
        return converted
    }

    static convertToText(binary: string) {
        var converted = Binary.decode(binary)
        return converted
    }

    static autoConvert(content: string, spaces?: boolean) {
        var converted = Binary.auto(content, spaces)
        return converted
    }
}