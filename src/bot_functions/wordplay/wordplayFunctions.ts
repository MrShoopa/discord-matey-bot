import Bot from '../../Bot.js'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.js'

import PHRASES_FRONT from '../../bot_knowledge/phrases/phrases_front.js'
import PHRASES_CONVO from '../../bot_knowledge/phrases/phrases_conversational.js'

import BotModuleBraindead from '../novelty/QuiteSpecificFunctions.js'
import { Message, PartialMessage } from 'discord.js'

export default class BotWordplay {
    static bot: Bot
    static wholeMessage: string

    static runWordplayCheck(message: Message, wholeMessage: string) {
        this.bot = globalThis.bot
        this.wholeMessage = wholeMessage

        TRIGGERS.main_trigger.some(trigger => {
            if (this.wholeMessage.toLowerCase().startsWith(trigger, 0)) {
                this.checkForWordplaySelfSuicide(message)
                this.checkForWordplaySad(message)
                this.checkForWordplayOnlyBeans(message)
                this.checkForWordplaySendNudes(message)
                this.checkForWordplayYourMom(message)
                this.checkForWordplayThankYou(message)
                this.checkForWordplayCommie(message)
                this.checkForWordplayWhatsTheHurry(message)
                this.checkForWordplayWhatsYourName(message)
                this.checkForWordplayWhosYourCreator(message)
                this.checkForWordplayFoodResponse(message)
            }
        })
        this.checkForNonHotwordWordplay(message, wholeMessage)
    }

    private static checkForWordplaySelfSuicide(message: Message) {
        let context: string = message.toString()

        //  Suicidal
        TRIGGERS.third_person_phrase_triggers.self_death_wish.die.some(trigger => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'self death wish', true)

                if (trigger == 'can i die')
                    return message.reply(
                        PHRASES_CONVO.counter_suicide_phrases[0])
                else
                    return message.reply(
                        Bot.fetchRandomPhrase(PHRASES_CONVO.counter_suicide_phrases))
            }
        })
        TRIGGERS.third_person_phrase_triggers.self_death_wish.kill_self.some(trigger => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'self death wish', true)

                return message.reply(
                    PHRASES_CONVO.counter_suicide_phrases[1])
            }
        })
    }

    private static checkForWordplaySad(message: Message) {
        let context: string = message.toString()

        if (context.includes(TRIGGERS.third_person_phrase_triggers.suck_thing[0]) &&
            context.includes(TRIGGERS.third_person_phrase_triggers.suck_thing[1])) {
            return message.reply(
                Bot.fetchRandomPhrase(PHRASES_CONVO.not_desired.to_look))
        }
    }


    private static async checkForWordplayOnlyBeans(message: Message) {
        if (message.toString() == 'beans')
            BotModuleBraindead.beans(message)
        //  the master's favorite food
    }
    private static checkForWordplaySendNudes(message: Message) {
        let context: string = message.toString()

        //  Send Nudes (Per request of a friend :P)
        TRIGGERS.send_nude_triggers.some(trigger => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'Send nude', true)

                return message.reply(
                    Bot.fetchRandomPhrase(PHRASES_CONVO.asked_to_send_nudes))
            }
        })
    }

    private static checkForWordplayYourMom(message: Message) {
        let context: string = message.toString()

        //  Shotout to UW🅱
        TRIGGERS.your_mom_direct.some(trigger => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'ur mom', true)

                return message.reply(
                    Bot.fetchRandomPhrase(PHRASES_CONVO.your_mom_wordplay))
            }
        })
    }

    private static checkForWordplayThankYou(message: Message) {
        let context: string = message.toString()

        //  Thank you
        TRIGGERS.thank_you_triggers.some(trigger => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'Thank you!', true)

                return message.reply(
                    Bot.fetchRandomPhrase(PHRASES_FRONT.asked.thank_you))
            }
        })
    }

    private static checkForWordplayCommie(message: Message) {
        if (message.toString().toLowerCase().includes(TRIGGERS.are_you_triggers.communist))
            BotModuleBraindead.communistRepsonse()
        //  "Are you a X?"
    }

    static checkForHowAreYouWordPlay(message: { toString: () => string; reply: (arg0: string) => unknown }) {
        let context: string = message.toString()

        let phraseGet = TRIGGERS.how_is_bot
        let phraseBack = PHRASES_CONVO.asked_how_are_you

        phraseGet.some((trigger: string) => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'Conversation chilltime', true)
                return message.reply(Bot.fetchRandomPhrase(phraseBack))
            }
        })
    }

    static checkForWordplayWhatsTheHurry(message: { toString: () => string; reply: (arg0: string) => unknown }) {
        let context: string = message.toString()

        let phraseGet = TRIGGERS.conversational.whats_the_hurry
        let phraseBack = PHRASES_CONVO.whats_the_rush

        phraseGet.some((trigger: string) => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'Conversation chilltime', true)
                return message.reply(Bot.fetchRandomPhrase(phraseBack))
            }
        })
    }

    static checkForWordplayWhatsYourName(message: { toString: () => string; reply: (arg0: string) => unknown }) {
        let context: string = message.toString()

        let phraseGet = TRIGGERS.conversational.whats_your_name
        let phraseBack = PHRASES_CONVO.my_name_is

        phraseGet.some((trigger: string) => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'Conversation chilltime', true)
                return message.reply(Bot.fetchRandomPhrase(phraseBack))
            }
        })
    }

    static checkForWordplayWhosYourCreator(message: { toString: () => string; reply: (arg0: string) => unknown }) {
        let context: string = message.toString()

        let phraseGet = TRIGGERS.conversational.whos_your_creator
        let phraseBack = PHRASES_CONVO.whos_your_creator

        phraseGet.some((trigger: string) => {
            if (context.toLowerCase().includes(trigger)) {
                this.bot.preliminary(trigger, 'Conversation chilltime', true)
                return message.reply(Bot.fetchRandomPhrase(phraseBack))
            }
        })
    }

    static checkForWordplayFoodResponse(message: { toString: () => string; reply: (arg0: string) => unknown }) {
        let context: string = message.toString()

        let phraseGet = TRIGGERS.conversational.food_list

        phraseGet.some((trigger: string) => {
            if (context.toLowerCase().includes(trigger)) {
                let phraseBack = PHRASES_CONVO.response_to_food[trigger]

                this.bot.preliminary(trigger, 'Conversation food chilltime', true)
                return message.reply(Bot.fetchRandomPhrase(phraseBack))
            }
        })
    }

    //  When mentioning main hotword anywhere in message!
    private static checkForNonHotwordWordplay(message: Message | PartialMessage, wholeMessage: string) {
        let context: string = message.toString()

        TRIGGERS.main_trigger.some(trigger => {
            if (this.wholeMessage.toLowerCase().startsWith(trigger, 0)) {
                NonTargettedTriggers.checkForDeathThreatWordPlay(message)
            }
        })
    }
}

class NonTargettedTriggers {
    static checkForDeathThreatWordPlay(message = BotWordplay.bot.context) {
        BotWordplay.wholeMessage = message.toString()

        //  Death threats
        TRIGGERS.threat.kill_self.some(trigger => {
            if (BotWordplay.wholeMessage.toLowerCase().includes(trigger)) {
                globalThis.bot.preliminary(trigger, 'Retaliating')

                //  FRIEND SPECIFIC :)
                if (message.author.username == 'Joe')
                    message.reply('joe you a stink hoe 💩')
                else if (message.author.username == 'The King of Bling')
                    message.reply('nick ya dick')
                else if (message.author.username == 'Vitalion')
                    message.reply('mitch ya snitch')
                else if (message.author.username == 'Jaygoo')
                    message.reply('ur dog gay')
                else if (message.author.username == 'Matt')
                    message.reply('matt ur a brat, ba-da **B O N K** 🔨💨')
                else if (message.author.username == 'Emily')
                    message.reply(`emily you're a lil' smelly 🌿`)
                else if (message.author.username == 'Noob')
                    message.reply(`noob you're such a boob 👁👅👁`)
                else if (message.author.username == 'Jayden')
                    message.reply(`jayden i'd rather drop you at gamestop as a trade-in 🎮😎`)
                else if (message.author.username == 'MeanMrMustard42')
                    message.reply(`Damn Mustard, you rock the "Mean" in your name 👁👁`)
                /* else
                    return message.reply(
                        Bot.fetchRandomPhrase(PHRASES_CONVO.asked_death_threat)) */

                globalThis.bot.commandSatisfied = true

                return message.reply(
                    Bot.fetchRandomPhrase(PHRASES_CONVO.asked_death_threat))
            }
        })
    }
}