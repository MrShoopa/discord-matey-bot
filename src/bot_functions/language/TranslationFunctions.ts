import Discord from 'discord.js'
import Bot from './../../Bot'

import { main_trigger, translate } from '../../bot_knowledge/triggers/triggers.json'

import WarcraftLanguageFunctions from './WarcraftLangFunctions'
import YodaLanguageFunctions from './YodaLangFunctions'

export default class BotModuleTranslation {

    static processTranslationRequest(context: Discord.Message | Discord.PartialMessage, language?: string, trigger?: string) {
        let lingua

        if (translate.hotword_to.some(hotword => {
            if (context.toString().includes(hotword))
                if (translate.warcraft.some(h => context.toString().includes(h)))
                    return lingua = 'warcraft'
                else if (translate.yoda.some(h => context.toString().includes(h)))
                    return lingua = 'yoda'
                else
                    return lingua = '!'
        }))
            if (lingua == 'warcraft')
                WarcraftLanguageFunctions.generateWarcraftTranslationMessage(context.toString())
            else if (lingua == 'yoda')
                YodaLanguageFunctions.generateYodaTranslationMessage(context.toString())
            else
                return this.replyUnknownLanguageMessage()
        else
            return this.replyUnknownLanguageMessage()
    }

    static replyUnknownLanguageMessage() {
        let bot: Bot = globalThis.bot

        bot.context.channel.send(`Which language? Type *megadork help translate* to see what I can translate.`)

        return true
    }
}