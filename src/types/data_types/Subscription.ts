import Discord from 'discord.js'

export module Subscriptions {
    export interface ChannelSubscription extends Object {
        _id: string
        featureCode: SubscriptionFeature
        [args: string]: any
    }

    export enum SubscriptionFeature {
        Ping,
        RedditPost,
        DayCounter
    }
}