import Discord from 'discord.js'
import Bot from './../../Bot'

import { translate } from '../../bot_knowledge/triggers/triggers.json'

import WarcraftLanguageFunctions from './WarcraftLangFunctions'

export default class TranslationFunctions {

    static processTranslationRequest(context: Discord.Message | Discord.PartialMessage, language?: string, trigger?: string) {
        let lingua

        if (translate.hotword_to.some(hotword => {
            if (context.toString().includes(hotword))
                if (translate.warcraft.some(h => context.toString().includes(h)))
                    return lingua = 'warcraft'
                else
                    return lingua = '!'
        }))
            if (lingua == 'warcraft')
                WarcraftLanguageFunctions.generateWarcraftTranslationMessage(context.toString())
            else
                this.replyUnknownLanguageMessage()
        else {

            // TODO: translate default case
            this.replyUnknownLanguageMessage()
        }
    }

    static replyUnknownLanguageMessage() {
        let bot: Bot = globalThis.bot

        bot.context.channel.send(`I couldn't translate that. Type *megadork help translate* to see what I can translate.`)
    }
}