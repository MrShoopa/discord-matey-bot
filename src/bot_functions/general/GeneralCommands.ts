import Discord from 'discord.js'
import Bot from "../../Bot"

import AUTH from '../../user_creds.json'

import { redo_trigger } from '../../bot_knowledge/triggers/triggers.json'
export default class BotGeneralCommands {

    static redoLastAction(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Redo command', true)

        if (bot.lastMessage === null)
            return bot.context.channel.send(`I haven't done anything yet though!`)
        else if (bot.lastMessage.toString().startsWith('redoin,')) {
            bot.lastMessage =
                new Discord.Message(bot,
                    { content: bot.lastMessage.toString().substring(8) },
                    bot.context.channel as Discord.TextChannel | Discord.DMChannel)
        } else {
            for (const trig of redo_trigger)
                if (bot.lastMessage.content.substring(1).includes(trig))
                    return bot.context.channel.send(`I can't redo a redo 🥴`)
        }

        return bot.context.channel.send('redoin, ' + bot.lastMessage.toString())
    }

    static async killBot(adminOnly = true, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Bot kill', true)

        if (adminOnly) {
            if (bot.context.author.id === AUTH.you.admin_user_id) {
                await bot.context.channel.send('Yes master. ✅')
                process.exit(69)
            } else {
                bot.context.channel.send(`You can't quite tell me to, ${bot.context.author.username}. `)
            }
        } else {
            await bot.context.channel.send('Restarting.')
            process.exit(100)
        }
    }

}