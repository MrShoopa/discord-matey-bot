import Discord from 'discord.js'
import Bot from '../../Bot.js'

import KEYS from '../../user_creds.js'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.js'
import TimelyFunctions from '../_state/TimelyFunctions.js'
import CALENDAR_VALUES from '../../bot_knowledge/calendar/values.js'
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
            for (const trig of TRIGGERS.redo_trigger)
                if (bot.lastMessage.content.substring(1).includes(trig))
                    return bot.context.channel.send(`I can't redo a redo 🥴`)
        }

        return bot.context.channel.send('redoin, ' + bot.lastMessage.toString())
    }

    static firePingPongMessage(channel: Discord.TextChannel, trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Ping pong', true)

        channel = (bot.channels.cache.get(channel.id) as Discord.TextChannel)
        return channel.send('...pong!')
    }

    static getCurrentTime(channel: Discord.TextChannel, trigger?: string, offsetHour?: number) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Getting current time', true)

        channel = (bot.channels.cache.get(channel.id) as Discord.TextChannel)

        let time = TimelyFunctions.now
        if (offsetHour)
            time = new Date(time.getMilliseconds() + (offsetHour * 3600000))
        else if (globalThis.offsetHour)
            time = new Date(time.getMilliseconds() + (globalThis.offsetHour * 3600000))

        let messageString = `*Well...*\n` +
            `Today is... ` +
            `**${CALENDAR_VALUES.months_prettier[time.getMonth()]} ${time.getDay()}, ${time.getFullYear()}!**\n\t` +
            `Time is... ` +
            `**${time.getHours()}:${time.getMinutes().toFixed((1))}:${time.getSeconds().toFixed(2)}!**\n\t`

        console.log(`Someone pinged for the time. ` + messageString)
        return channel.send(messageString)
    }

    static getCurrentUtcTime(channel: Discord.TextChannel, trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Getting current time', true)

        channel = (bot.channels.cache.get(channel.id) as Discord.TextChannel)

        let time = TimelyFunctions.now
        let messageString = `Well today (by UTC magic) is... ` +
            `${CALENDAR_VALUES.months_prettier[time.getUTCMonth()]} ${time.getUTCDay()}, ${time.getUTCFullYear()}!\n\t` +
            `Time is... ` +
            `${time.getUTCHours()}:${time.getUTCMinutes().toFixed(2)}:${time.getUTCSeconds().toFixed(2)}!\n\t`

        console.log(`Someone pinged for current UTC time. ` + messageString)
        return channel.send(messageString)
    }

    static async killBot(adminOnly = true, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Bot kill', true)

        if (adminOnly) {
            if (bot.context.author.id === KEYS.you.admin_user_id) {
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