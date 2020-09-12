import Discord from 'discord.js'
import Bot from './../../Bot'

import { translate } from '../../bot_knowledge/triggers/triggers.json'

import WarcraftLanguageFunctions from './WarcraftLangFunctions'
import YodaLanguageFunctions from './YodaLangFunctions'
import BinaryCoderFunctions from './BinaryFunctions'
import MorseCoderFunctions from './MorseFunctions'
import ZalgoTextFunctions from './ZalgoTextFunctions'

export default class BotModuleTranslation {

    static processTranslationRequest(context: Discord.Message, language?: string, trigger?: string) {
        let lingua: string
        let args: string

        if (translate.hotword_to.some(hotword => {
            if (context.toString().includes(hotword))
                if (translate.warcraft.some(h => context.toString().includes(h)))
                    return lingua = 'warcraft'
                else if (translate.yoda.some(h => context.toString().includes(h)))
                    return lingua = 'yoda'
                else if (translate.binary.some(h => context.toString().includes(h)))
                    return lingua = 'binary'
                else if (translate.distorted.base.some(h => context.toString().includes(h))) {
                    translate.distorted.to.some(hotword => {
                        if (context.toString().includes(hotword))
                            return args = 'to'
                    })
                    translate.distorted.from.some(hotword => {
                        if (context.toString().includes(hotword))
                            return args = 'from'
                    })
                    return lingua = 'distorted'
                }
                else if (translate.morse.default.some(h => context.toString().includes(h))) {
                    translate.morse.to.some(hotword => {
                        if (context.toString().includes(hotword))
                            return args = 'to'
                    })
                    translate.morse.from.some(hotword => {
                        if (context.toString().includes(hotword))
                            return args = 'from'
                    })
                    return lingua = 'morse'
                }
                else
                    return lingua = '!'
        }))
            if (lingua == 'warcraft')
                WarcraftLanguageFunctions.generateWarcraftTranslationMessage(context, trigger)
            else if (lingua == 'yoda')
                YodaLanguageFunctions.generateYodaTranslationMessage(context, trigger)
            else if (lingua == 'binary')
                BinaryCoderFunctions.generateBinaryTranslationMessage(context, trigger)
            else if (lingua == 'distorted') {
                if (args == 'to')
                    ZalgoTextFunctions.generateZalgoTextTranslationMessage(context, trigger, 'zalgo')
                else if (args == 'from')
                    ZalgoTextFunctions.generateZalgoTextTranslationMessage(context, trigger, 'text')
            }
            else if (lingua == 'morse') {
                if (args == 'to')
                    MorseCoderFunctions.generateMorseTranslationMessage(context, trigger, 'morse-to-text')
                else if (args == 'from')
                    MorseCoderFunctions.generateMorseTranslationMessage(context, trigger, 'text-to-morse')
                else
                    MorseCoderFunctions.generateMorseTranslationMessage(context, trigger)
            }
            else
                return this.replyUnknownLanguageMessage(context)
        else
            return this.replyUnknownLanguageMessage(context)
    }

    static replyUnknownLanguageMessage(message: Discord.Message) {
        return message.channel.send(`Which language? Type *megadork translation list* to see what I can translate.`)
    }
}