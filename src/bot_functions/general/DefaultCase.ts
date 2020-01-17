import Bot from '../../Bot';
import TRIGGERS from '../../bot_knowledge/triggers/triggers.json';
import PHRASES_FRONT from '../../bot_knowledge/phrases/phrases_front.json';

export default class BotDefaultResponder {

    static generateResponse(message = globalThis.bot.context) {
        let a = TRIGGERS.main_trigger
        for (let i = 0; a.length; i++)
            if (message.toString() == a[i])
                return this.noContextResponse(a[i])
            else if (i === TRIGGERS.main_trigger.length - 1)
                return this.unknownCommandResponse()

    }

    static noContextResponse(trigger, bot: Bot = globalThis.bot) {
        bot.preliminary(trigger, 'Generic response', true)
        return bot.context.reply(PHRASES_FRONT.name_only_callout)
    }

    static unknownCommandResponse(message = globalThis.bot.context) {
        return message.reply(Bot.fetchRandomPhrase(PHRASES_FRONT.unknown_command))
    }
}
