import Discord from 'discord.js'
import Bot from './../../Bot.js'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.js'

import Morse from 'morse'

export default class MorseCoderFunctions {
    static generateMorseTranslationMessage(message: Discord.Message, trigger: string, to?: string, text?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Morse to Text conversion', true)

        let conversion

        if (!text) {
            text = message.toString()
            TRIGGERS.translate.morse.default.some(hotword => {
                if (text.toLowerCase().includes(hotword)) {
                    text = text.slice(text.indexOf(hotword) + hotword.length).trim()
                }
            })
        }

        if (to == 'morse-to-text')
            conversion = this.convertToMorse(text)
        else if (to == 'text-to-morse')
            conversion = this.convertToText(text)
        else
            conversion = this.autoConvert(text, true)

        conversion = conversion.replace(/\[(.*?)\]/g, '').match(/.{1,2040}/gs)

        let built = new Array<Discord.MessageEmbed>()

        let response = new Discord.MessageEmbed()
            .setDescription(conversion)
            .setColor('GOLD')
            .setFooter('Morse <-> Text')

        built.push(response)

        if (conversion.length > 1) {
            for (let i = 1; i < conversion.length; i++) {
                let add = new Discord.MessageEmbed()
                    .setDescription(conversion)
                    .setColor('GOLD')
                    .setFooter('Morse <-> Text')

                built.push(add)
            }
        }

        built.forEach(part => {
            message.channel.send({ embeds: [part] })
        });
    }

    static convertToMorse(text: string) {
        var converted = Morse.encode(text)
        return converted
    }

    static convertToText(morseCode: string) {
        var converted = Morse.decode(morseCode)
        return converted
    }

    static autoConvert(content: string, spaces?: boolean) {
        //todo: detect string?

        var converted = Morse.auto(content, spaces)
        return converted
    }
}