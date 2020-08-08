import Discord from 'discord.js'
import Bot from "../../Bot"
import { Subscriptions } from './../../types/data_types/Subscription';
import BotSubscriptionHandler from '../_state/SubscriptionHandler';

export default class BotSubscriptionCommands {

    static createSubscription(message: Discord.Message, trigger: string, args?: any) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Creation', true)

        let ctx: string =
            message.content.substr(message.content.indexOf(trigger) + trigger.length).trim()

        let name: string =
            ctx.substr(ctx.indexOf('name') + 4, ctx.indexOf('for') - 4).trim()

        let funcName: string =
            ctx.substr(ctx.indexOf('for') + 3).trim().toUpperCase()

        let subscription
        try {
            subscription = BotSubscriptionHandler.createSubscription(message.channel.id, name, message)
        } catch (err) {
            if (err.message.includes('already exists'))
                return message.channel.send(bot.generateErrorMessage(`A subscription named *${name}* already exists for this channel.`))
        }

        if (message.channel instanceof Discord.TextChannel)
            subscription.channelId = message.channel.id
        if (message.channel instanceof Discord.DMChannel)
            subscription.dmChannelId = message.channel.id

        //TODO
        try {
            subscription.featureCode = (funcName as Subscriptions.SubscriptionFeature)
            subscription.frequencyMilli = 86400000 // 1 Day
            subscription._enabled = true
            subscription.args = args

            BotSubscriptionHandler.updateSubscription(message.id, name, subscription, message)
        } catch (error) {
            bot.saveBugReport(error, this.createSubscription.name, true)

            if (error instanceof TypeError && error.message.includes('featureCode'))
                return message.channel.send(bot.generateErrorMessage(`There is no subscription feature for that function or it does not exist...`))
            else
                return message.channel.send(bot.generateErrorMessage())
        }

        let response = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setDescription(
                `Function: ${funcName}\n` +
                `Interval: ${this.msToTimeMessage(subscription.frequencyMilli)}\n`
            )

        if (message.channel instanceof Discord.TextChannel)
            response.setTitle(`Subscription created for ${message.channel.name}!`)
        if (message.channel instanceof Discord.DMChannel)
            response.setTitle(`Subscription created!`)

        return message.channel.send(response)
    }

    static deleteSubscription(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Deletion', true)

        //TODO
    }

    static getSubscription(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Subscription Inquiry', true)

        //TODO
    }

    static listSubscriptionsForChannel(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Listing', true)

        //TODO
    }

    static msToTimeMessage(duration: number): string {
        var milliseconds = (duration % 1000) / 100,
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
            days = Math.floor((duration / (1000 * 60 * 60 * 24)))

        let message: string

        if (days > 0)
            message += `${days} day(s), `
        if (hours > 0)
            message += `${hours} hour(s), `
        if (minutes > 0)
            message += `${minutes} minutes(s), `
        if (seconds > 0)
            message += `${seconds} seconds(s), `
        if (milliseconds > 0)
            message += `${seconds} millseconds(s),`

        message = message.trimRight().substr(0, message.length)

        return message
    }
}