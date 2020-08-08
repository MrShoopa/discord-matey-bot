import Discord from 'discord.js'
import Bot from "../../Bot"
import { Data } from './../../types/data_types/Data';
import { Subscriptions } from './../../types/data_types/Subscription';
import BotSubscriptionHandler from '../_state/SubscriptionHandler';

export default class BotSubscriptionCommands {

    static createSubscription(message: Discord.Message, trigger: string, args?: any) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Creation', true)

        let ctx: string =
            message.content.substr(message.content.indexOf(trigger) + trigger.length).trim()

        let name: string =
            ctx.substr(ctx.indexOf('named') + 5, ctx.indexOf('for') - 5).trim()

        let funcName: string =
            ctx.substr(ctx.indexOf('for') + 3).trim().toUpperCase()

        let subscription: Data.SubscriptionSave
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
            .setDescription('todo') //TODO

        if (message.channel instanceof Discord.TextChannel)
            response.setTitle(`Subscription named *${name}* created for channel ${message.channel.name}!`)
        if (message.channel instanceof Discord.DMChannel)
            response.setTitle(`Subscription *${name} created!`)

        response.addField('Function', `${funcName}`)
        response.addField('Interval', `${this.msToTimeMessage(subscription.frequencyMilli)}`)

        if (subscription.authorId)
            response.addField('Created by', `${message.author.username}`)

        return message.channel.send(response)
    }

    static deleteSubscription(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Deletion', true)

        let subName: string =
            message.content.substr(message.content.indexOf(trigger) + trigger.length).trim()

        let result = BotSubscriptionHandler.deleteSubscription(message.channel.id, subName)

        if (result == null)
            message.channel.send(`Subscription *${subName}* doesn't exist already!`)
        else if (result === false)
            message.channel.send(`Did not delete *${subName}* due to an underlying error.`)
        else if (result === true)
            message.channel.send(`Successfully deleted subscription *${subName}*.`)

        return true
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

        let message: string = ''

        if (days > 0)
            message += `${days} day(s), `
        if (hours > 0)
            message += `${hours} hour(s), `
        if (minutes > 0)
            message += `${minutes} minutes(s), `
        if (seconds > 0)
            message += `${seconds} seconds(s), `
        if (milliseconds > 0)
            message += `${seconds} millseconds(s), `

        message = message.trimRight().substr(0, message.length - 2)

        return message
    }
}