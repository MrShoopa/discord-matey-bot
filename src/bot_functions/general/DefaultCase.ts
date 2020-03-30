import Bot from '../../Bot'
import TRIGGERS from '../../bot_knowledge/triggers/triggers.json'
import PHRASES_FRONT from '../../bot_knowledge/phrases/phrases_front.json'

import BotLoggerFunctions from '../general/LoggerFunctions'

export default class BotDefaultResponder {

    static generateResponse(message = globalThis.bot.context) {
        if (message.toString().length === 0)
            return this.noContextResponse(message)
        else
            return this.unknownCommandResponse()
    }

    static noContextResponse(trigger, bot: Bot = globalThis.bot) {
        bot.preliminary(trigger, 'Generic response', true)
        return bot.context.reply(Bot.fetchRandomPhrase(PHRASES_FRONT.name_only_callout))
    }

    static unknownCommandResponse(bot: Bot = globalThis.bot) {
        let context = bot.context

        BotLoggerFunctions.saveUnknownCommand(context, true)

        return context.reply(Bot.fetchRandomPhrase(PHRASES_FRONT.unknown_command))
    }
}
