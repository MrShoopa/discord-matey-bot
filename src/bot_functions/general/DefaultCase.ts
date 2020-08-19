import Bot from '../../Bot'
import PHRASES_FRONT from '../../bot_knowledge/phrases/phrases_front.json'

import BotLoggerFunctions from '../general/LoggerFunctions'

export default class BotDefaultResponder {

    static generateResponse(message = globalThis.bot.context) {
        if (message.toString().length === 0)
            return this.noContextResponse(message)
        else if ((message.toString().substr(0, 2).match(/[A-Za-z]/g)))
            return this.unknownCommandResponse()
    }

    static noContextResponse(trigger, bot: Bot = globalThis.bot) {
        bot.preliminary(trigger, 'Generic response', true)
        if (globalThis.dev_mode)
            return bot.context.reply("running in dev mode, hit me!")
        return bot.context.reply(Bot.fetchRandomPhrase(PHRASES_FRONT.name_only_callout))
    }

    static unknownCommandResponse(bot: Bot = globalThis.bot) {
        let context = bot.context

        BotLoggerFunctions.saveUnknownCommand(context, true)

        return context.reply(Bot.fetchRandomPhrase(PHRASES_FRONT.unknown_command))
    }
}
