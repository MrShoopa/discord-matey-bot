import Discord from 'discord.js'
import Bot from './../../Bot.js'

import GoogleTranslate from '@iamtraction/google-translate'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.js'

import WarcraftLanguageFunctions from './WarcraftLangFunctions.js'
import YodaLanguageFunctions from './YodaLangFunctions.js'
import BinaryCoderFunctions from './BinaryFunctions.js'
import MorseCoderFunctions from './MorseFunctions.js'
import ZalgoTextFunctions from './ZalgoTextFunctions.js'

export default class BotModuleTranslation {

    static processTranslationRequest(context: Discord.Message, language?: string, trigger?: string) {
        let lingua: string
        let args: string

        if (TRIGGERS.translate.hotword_to.some(hotword => {
            if (context.toString().includes(hotword))
                if (TRIGGERS.translate.warcraft.some(h => context.toString().includes(h)))
                    return lingua = 'warcraft'
                else if (TRIGGERS.translate.yoda.some(h => context.toString().includes(h)))
                    return lingua = 'yoda'
                else if (TRIGGERS.translate.binary.some(h => context.toString().includes(h)))
                    return lingua = 'binary'
                else if (TRIGGERS.translate.distorted.base.some(h => context.toString().includes(h))) {
                    TRIGGERS.translate.distorted.to.some(hotword => {
                        if (context.toString().includes(hotword))
                            return args = 'to'
                    })
                    TRIGGERS.translate.distorted.from.some(hotword => {
                        if (context.toString().includes(hotword))
                            return args = 'from'
                    })
                    return lingua = 'distorted'
                }
                else if (TRIGGERS.translate.morse.default.some(h => context.toString().includes(h))) {
                    TRIGGERS.translate.morse.to.some(hotword => {
                        if (context.toString().includes(hotword))
                            return args = 'to'
                    })
                    TRIGGERS.translate.morse.from.some(hotword => {
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

    static async googleTranslateText(text: string, lang: Language = Language.English, fromLang: Language = Language._Wildcard, raw?: boolean) {
        console.group(`Google Translate - Fetching [${fromLang} to ${lang}], ${raw} raw.`)
        return await GoogleTranslate(text, {
            to: lang,
            from: fromLang,
            raw: raw
        }).then((res) => {
            console.log(`Fetched a translation from ${res.from.language.iso} to ${lang}!`)
            return res.text
        }).catch((rej) => {
            console.error(`Error fetching! Google says: "${rej.message}`)
            throw new Error(rej.error)
        })
    }
}

export enum Language {
    _Wildcard = "auto",
    English = "en",
    Japanese = "ja"
}