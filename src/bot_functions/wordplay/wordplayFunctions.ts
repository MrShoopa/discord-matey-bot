import Bot from '../../Bot'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json';

import PHRASES_FRONT from '../../bot_knowledge/phrases/phrases_front.json';
import PHRASES_CONVO from '../../bot_knowledge/phrases/phrases_conversational.json';

import BotModuleBraindead from '../novelty/QuiteSpecificFunctions';

export default class BotWordplay {
    static bot: Bot

    static runWordplayCheck() {
        this.bot = globalThis.bot

        this.checkForSelfSuicdeWordplay()
        this.checkForSADWordplay()
        this.checkForOnlyBeansWordplay()
        this.checkForSendNudesWordplay()
        this.checkForThankYouWordplay()
        this.checkForCommieWordplay()
        this.checkForNonHotwordWordplay()
    }

    private static checkForSelfSuicdeWordplay(message = this.bot.context) {
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

    private static checkForSADWordplay(message = this.bot.context) {
        let context: string = message.toString()

        if (context.includes(TRIGGERS.third_person_phrase_triggers.suck_thing[0]) &&
            context.includes(TRIGGERS.third_person_phrase_triggers.suck_thing[1])) {
            this.bot.commandSatisfied = true

            return message.reply(
                Bot.fetchRandomPhrase(PHRASES_CONVO.not_desired.to_look))
        }
    }


    private static async checkForOnlyBeansWordplay(message = this.bot.context) {
        if (message.toString() == 'beans')
            BotModuleBraindead.beans()
        //  the master's favorite food
    }
    private static checkForSendNudesWordplay(message = this.bot.context) {
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

    private static checkForThankYouWordplay(message = this.bot.context) {
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

    private static checkForCommieWordplay(message = this.bot.context) {
        if (message.toString().toLowerCase().includes(TRIGGERS.are_you_triggers.communist))
            BotModuleBraindead.communistRepsonse()
        //  "Are you a X?"
    }

    //  When mentioning main hotword anywhere in message!
    private static checkForNonHotwordWordplay(message = this.bot.context) {
        let context: string = message.toString()

        TRIGGERS.main_trigger.some(trigger => {
            if (context.toLowerCase().includes(trigger, 1)) {
                NonTargettedTriggers.checkForDeathThreatWordPlay(message)
            }
        })
    }
}

class NonTargettedTriggers {
    static checkForDeathThreatWordPlay(message = BotWordplay.bot.context) {
        let context: string = message.toString()

        //  Death threats
        TRIGGERS.threat.kill_self.some(trigger => {
            if (context.toLowerCase().includes(trigger)) {
                BotWordplay.bot.preliminary(trigger, 'Retaliating')

                //  FRIEND SPECIFIC :)
                if (message.author.username == 'MrShoopa')
                    message.reply('joe you a hoe')
                if (message.author.username == 'The King of Bling')
                    message.reply('nick ya dick')
                if (message.author.username == 'Vitalion')
                    message.reply('mitch ya snitch')
                if (message.author.username == 'Jaygoo')
                    message.reply('ur dog gay')

                return message.reply(
                    Bot.fetchRandomPhrase(PHRASES_CONVO.asked_death_threat))
            }
        })
    }

    static checkForHowAreYouWordPlay(message = BotWordplay.bot.context) {
        let context: string = message.toString()

        TRIGGERS.how_is_bot.some(trigger => {
            if (context.toLowerCase().includes(trigger)) {
                BotWordplay.bot.preliminary(trigger, 'How is bot', true)

                return message.reply(
                    Bot.fetchRandomPhrase(PHRASES_CONVO.asked_how_are_you))
            }
        })
    }
}