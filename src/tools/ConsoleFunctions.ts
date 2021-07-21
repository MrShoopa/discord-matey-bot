// Interact with the bot solely from the console.
// These are accessed at the global level, and must not conflict with any lower-level functions.

import Discord from 'discord.js';
import Bot from '../Bot.js'

export default class su {

    constructor() {
        globalThis.sendMessageToLastChannel = this.sendMessageToLastSensedChannel
        globalThis.sendMessageToChannel = this.sendMessageToChannel
        globalThis.sendDmToUser = this.sendDmToUser
        globalThis.replyToLastDM = this.replyToLastDM
    }

    async sendMessageToLastSensedChannel(message: any, listenToBots?: boolean) {
        let bot: Bot = globalThis.bot

        if (listenToBots)
            bot.overrideContext = true

        if (bot.context)
            bot.context.channel.send(message)
        else
            console.error(`Your bot hasn't received a message to perform this action.`)
    }

    async replyToLastDM(message: any, listenToBots?: boolean) {
        let bot: Bot = globalThis.bot

        if (listenToBots)
            bot.overrideContext = true

        if (bot.lastDM)
            bot.lastDM.channel.send(message)
        else
            console.error(`Your bot hasn't received a Direct Message to perform this action.`)
    }

    async sendMessageToChannel(channelId: `${bigint}`, message: string, listenToBots?: boolean) {
        let bot: Bot = globalThis.bot

        let channel = bot.channels.cache.get(channelId)

        if (listenToBots)
            bot.overrideContext = true

        if (channel instanceof Discord.TextChannel || channel instanceof Discord.DMChannel)
            channel.send(message)
        else
            console.error('Invalid type of channel used. Use only Text or DM channels.')
    }

    async sendDmToUser(userId: `${bigint}`, message: string, listenToBots?: boolean) {
        let bot: Bot = globalThis.bot

        let user: Discord.User = bot.users.cache.get(userId)

        if (listenToBots)
            bot.overrideContext = true

        if (user)
            user.send(message)
        else
            console.error('No User retrieved.')
    }

}