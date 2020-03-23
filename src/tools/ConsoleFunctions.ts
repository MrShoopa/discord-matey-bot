// Interact with the bot solely from the console.
// These are accessed at the global level, and must not conflict with any lower-level functions.

import Bot from '../Bot'

export default class su {

    constructor() {
        globalThis.sendMessageToLastChannel = this.sendMessageToLastChannel
    }

    async sendMessageToLastChannel(message: any, listenToBots: boolean) {
        let bot: Bot = globalThis.bot

        if (listenToBots)
            bot.overrideContext = true

        if (bot.context)
            bot.context.channel.send(message)
        else
            console.error(`Your bot hasn't received a message to perform this action.`)
    }

}