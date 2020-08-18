import Discord from 'discord.js'
import Bot from './../../Bot'

import { translate } from '../../bot_knowledge/triggers/triggers.json'

import { erwarYoda } from 'erwar-yoda'

export default class YodaLanguageFunctions {

    static generateYodaTranslationMessage(message: Discord.Message, trigger: string, language?: string, text?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Yoda translation', true)

        if (!text)
            text = message.toString()

        if (!language)
            translate.yoda.some(lang => {
                if (text.toLowerCase().includes(lang)) {
                    language = lang
                    return text = text.slice(text.indexOf(lang) + lang.length).trim()
                }
            })

        let translation = this.getYodaTranslation(text, language)

        let response = new Discord.MessageEmbed()
            .setTitle(`Translated to ${language}`)
            .setDescription(translation)
            .setColor('GOLD')
            .setFooter('Yoda Language Translator')

        message.channel.send(response)
    }

    static getYodaTranslation(text: string, language: string) {
        try {
            return erwarYoda(text);
        } catch (err) {
            let bot: Bot = globalThis.bot
            bot.saveBugReport(err, this.getYodaTranslation.name, true)
        }
    }
}