import Bot from '../../Bot';
import Discord from 'discord.js'

import { Subscriptions } from './../../types/index';
import BotGeneralCommands from './../general/GeneralCommands'

export default class SubscriptionHandler {
    static RunTask(subscription: Subscriptions.Subscription) {
        let bot: Bot = globalThis.Bot

        let subscribedChannelId: string

        if (subscription instanceof Subscriptions.ChannelSubscription)
            subscribedChannelId = subscription.channelId
        else if (subscription instanceof Subscriptions.DMSubscription)
            subscribedChannelId = subscription.dmChannelId
        else if (subscription instanceof Subscriptions.UserSubscription)
            subscribedChannelId = subscription.userId

        let channel: Discord.TextChannel = bot.channels.cache.get(subscribedChannelId) as Discord.TextChannel
        switch (subscription.featureCode) {
            case 'Ping':
                BotGeneralCommands.firePingPongMessage(channel)
                break;
            case 'DayCounter':
                //TODO
                break;
            case 'QuoteFetch':
                //TODO
                break;
            case 'RedditPost':
                //TODO
                break;
            default:
                break;
        }

        
    }

    static RunChannelTask(subscription: Subscriptions.ChannelSubscription) {

    }
    static RunUserTask(subscription: Subscriptions.UserSubscription) {

    }
    static RunDMTask(subscription: Subscriptions.DMSubscription) {

    }


}