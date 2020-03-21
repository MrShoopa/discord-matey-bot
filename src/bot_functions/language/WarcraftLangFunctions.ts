import Discord from 'discord.js'
import Bot from './../../Bot'

import { translate } from '../../bot_knowledge/triggers/triggers.json'

import Lexicon from 'wow-lexicon'

export default class WarcraftLanguageFunctions {

    static generateWarcraftTranslationMessage(trigger: string, language?: string, text?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Warcraft translation', true)

        if (!text)
            text = bot.context.toString()

        if (!language)
            translate.warcraft.some(lang => {
                if (text.toLowerCase().includes(lang)) {
                    language = lang
                    return text = text.slice(text.indexOf(lang) + lang.length).trim()
                }
            })

        let translation = this.getWarcraftTranslation(text, language)

        let message = new Discord.MessageEmbed()
            .setTitle(`Translated to ${language}`)
            .setDescription(translation)
            .setColor('GOLD')
            .setFooter('Warcraft Language Translator')

        bot.context.channel.send(message)
    }

    static getWarcraftTranslation(text: string, language: string) {
        try {
            return Lexicon.translate(language, text);
        } catch (err) {
            let bot: Bot = globalThis.bot
            bot.saveBugReport(err, this.getWarcraftTranslation.name, true)
        }
    }
}