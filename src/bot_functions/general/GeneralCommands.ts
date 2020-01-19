import Discord from 'discord.js'
import Bot from "../../Bot"

export default class BotGeneralCommands {

    static redoLastAction(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Redo command', true)

        if (bot.lastMessage === null)
            return bot.context.channel.send(`I haven't done anything yet though!`)
        else if (bot.lastMessage.toString().startsWith('redoin, ')) {
            bot.lastMessage =
                new Discord.Message(bot,
                    { content: bot.lastMessage.toString().substring(8) },
                    bot.context.channel)
        }

        return bot.context.channel.send('redoin, ' + bot.lastMessage.toString())
    }

}