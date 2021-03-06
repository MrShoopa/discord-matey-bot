import Discord from 'discord.js'
import Bot from './../../Bot.js'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.js'

import Lexicon from 'wow-lexicon'

export default class WarcraftLanguageFunctions {

    static generateWarcraftTranslationMessage(message: Discord.Message, trigger?: string, language?: string, text?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Warcraft translation', true)

        if (!text)
            text = message.toString()

        if (!language)
            TRIGGERS.translate.warcraft.some(lang => {
                if (text.toLowerCase().includes(lang)) {
                    language = lang
                    return text = text.slice(text.indexOf(lang) + lang.length).trim()
                }
            })

        let translation = this.getWarcraftTranslation(text, language)

        let response = new Discord.MessageEmbed()
            .setTitle(`Translated to ${language}`)
            .setDescription(translation)
            .setColor('GOLD')
            .setFooter('Warcraft Language Translator')

        message.channel.send({ embeds: [response] })
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