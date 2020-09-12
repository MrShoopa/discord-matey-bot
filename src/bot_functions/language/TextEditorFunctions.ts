import Discord from 'discord.js'
import Bot from '../../Bot'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json'

// This is totally useless for editing messages other than the bot 🤣

export default class BotModuleTextEditor {

    static processRequest(message: Discord.Message) {
        for (const trigger of TRIGGERS.text_edit.super)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleTextEditor.editMessageToSuperscript(message as Discord.Message, trigger)
        for (const trigger of TRIGGERS.text_edit.sub)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleTextEditor.editMessageToSubscript(message as Discord.Message, trigger)
        for (const trigger of TRIGGERS.text_edit.big)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleTextEditor.editMessageToSuperscript(message as Discord.Message, trigger)
    }

    static async editMessageToSuperscript(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Text to Superscript', true)

        message.content = message.content.replace(trigger, '').trim()

        return message.edit(message.toString().sup())
    }

    static async editMessageToSubscript(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Text to Subscript', true)

        message.content = message.content.replace(trigger, '').trim()

        return message.edit(message.toString().sub())
    }

    static async editMessageToBigscript(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Text to Bigscript', true)

        message.content = message.content.replace(trigger, '').trim()

        return message.edit(message.toString().big())
    }
}