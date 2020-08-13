import Discord from 'discord.js'
import Bot from "../../Bot"
import { Data } from './../../types/data_types/Data';
import { Subscriptions } from './../../types/data_types/Subscription';
import BotSubscriptionHandler from '../_state/SubscriptionHandler';

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json'

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
            subscription.authorId = message.author.id
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
            .setDescription(BotSubscriptionHandler.getFunctionTypeDescription(subscription.featureCode))  //TODO: Subscription's function's description?

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

    static updateSubscription(message: Discord.Message, trigger: string) {
        // Filter like 'edit/change subscription [time/name/function] to [x]
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Subscription Edit', true)

        let ctx: string =
            message.content.substr(message.content.indexOf(trigger) + trigger.length).trim()
        let subName: string =
            ctx.substr(ctx.indexOf(`'`) + 1, ctx.lastIndexOf(`'`) - 1).trim() //? Improve
        let command: string =
            ctx.substr(ctx.indexOf(subName) + subName.length + 2).trim()
        let subscription =
            BotSubscriptionHandler.getSubscription(message.channel.id, subName)

        if (subName === '')
            return message.channel.send(`Did you add -> '*quotation marks*' to your subscription name in your request?`)

        if (!subscription)
            return message.channel.send(`Subscription named ${subName} not found.`)

        for (const param of TRIGGERS.subscription.update.params.time)
            if (command.toLowerCase().startsWith(param)) {
                subscription.frequencyMilli = this.convertToMilliseconds(command.substr(command.indexOf('to') + 2).trim())
                message.channel.send(`Updated the time interval for '${subName}' to *${command.substr(command.indexOf('to') + 2).trim()}*!`)
                break
            }
        for (const param of TRIGGERS.subscription.update.params.name)
            if (command.toLowerCase().startsWith(param)) {
                subscription.name = command.substring(command.indexOf('to') + 2).trim()
                message.channel.send(`Updated the name for '${subName}' to *${subscription.name}*!`)
                break
            }
        for (const param of TRIGGERS.subscription.update.params.function)
            if (command.toLowerCase().startsWith(param)) {
                subscription.featureCode = command.substring(command.indexOf('to') + 2).toUpperCase().trim() as Subscriptions.SubscriptionFeature
                message.channel.send(`Updated the function for '${subName}' to *${subscription.featureCode}*!`)
                break
            }
        for (const param of TRIGGERS.subscription.update.params.toggle)
            if (command.toLowerCase().startsWith(param)) {
                subscription._enabled = !subscription._enabled
                message.channel.send(`Run '${subName}'? Now *${subscription._enabled}*!`)
                break
            }

        if (!BotSubscriptionHandler.updateSubscription(message.channel.id, subName, subscription))
            // All else fails
            return message.channel.send(`Invalid parameter or data. *;help subscriptions* for more info.`)
        else return true
    }

    static getSubscription(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Subscription Inquiry', true)

        let subName: string = message.content.substr(trigger.length)

        let subscription = BotSubscriptionHandler.getSubscription(message.channel.id, subName)

        if (!subscription)
            return message.channel.send(`Subscription ${subName} not found.`)

        let response = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setDescription(BotSubscriptionHandler.getFunctionTypeDescription(subscription.featureCode))

        response.setTitle(`*${name}*`)

        response.addField('Function', `${subscription.featureCode}`)
        response.addField('Interval', `${this.msToTimeMessage(subscription.frequencyMilli)}`)

        if (subscription.authorId)
            response.addField('Created by', `${message.author.username}`)

        return message.channel.send(response)
    }

    static listSubscriptionsForChannel(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Function subscription management - Listing', true)

        let subscriptions: Data.SubscriptionSave[] = BotSubscriptionHandler.getSubscriptionDatastore().filter(sub => {
            if (sub.channelId === message.channel.id || sub.dmChannelId === message.channel.id) return true
            else return false
        })

        if (!subscriptions)
            return message.channel.send(`This channel has no subscriptions...`)

        let response = new Discord.MessageEmbed()
            .setColor('GREEN')

        if (message.channel instanceof Discord.TextChannel)
            response.setTitle(`Subscriptions for *${message.channel.name}*`)
        if (message.channel instanceof Discord.DMChannel)
            response.setTitle(`Subscriptions for this DM`)

        subscriptions.forEach(sub => {
            response.addField(sub.name, `${sub.featureCode} every ${this.msToTimeMessage(sub.frequencyMilli)} - Creator: ${bot.users.cache.get(sub.authorId)}`)
        })

        return message.channel.send(response)
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

    static convertToMilliseconds(timeString: string): number {
        let query = timeString.toLocaleLowerCase().split(' '), extractedNumber: number

        if (query.includes('weeks') || query.includes('week'))
            extractedNumber = Math.floor((Number.parseFloat(query[0]) * 86400000 * 7))
        else if (query.includes('days') || query.includes('day'))
            extractedNumber = Math.floor((Number.parseFloat(query[0]) * 86400000))
        else if (query.includes('hours') || query.includes('hour'))
            extractedNumber = Math.floor((Number.parseFloat(query[0]) * 3600000))
        else if (query.includes('minutes') || query.includes('minute'))
            extractedNumber = Math.floor((Number.parseFloat(query[0]) * 60000))

        return extractedNumber
    }
}