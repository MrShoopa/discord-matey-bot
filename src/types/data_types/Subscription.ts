import Discord from 'discord.js'

export module Subscriptions {
    export interface Subscription extends Object {
        name: string,
        featureCode: SubscriptionFeature,
        frequencyMilli: Number,
        durationMilli?: Number,
        endDate?: Date,
        [args: string]: any
    }
    export class ChannelSubscription implements Subscription {
        name: string
        channelId: string
        authorId: string
        featureCode: SubscriptionFeature
        frequencyMilli: Number
        [arg: string]: any

        constructor(callingUser: Discord.GuildMember, featureCode: SubscriptionFeature, frequencyMilli: Number, args?: any) {
            this.authorId = callingUser.id
            this.channelId = callingUser.lastMessageChannelID
            this.featureCode = featureCode
            this.frequencyMilli = frequencyMilli
        }
    }

    export class UserSubscription implements Subscription {
        name: string
        userId: string
        featureCode: SubscriptionFeature
        frequencyMilli: Number
        [arg: string]: any

        constructor(callingUser: Discord.User, featureCode: SubscriptionFeature, args?: any) {
            this.userId = callingUser.id
            this.featureCode = featureCode
            this.frequencyMilli
        }
    }

    export class DMSubscription implements Subscription {
        name: string
        dmChannelId: string
        featureCode: SubscriptionFeature
        frequencyMilli: Number
        [args: string]: any

        constructor(callingDM: Discord.DMChannel, featureCode: SubscriptionFeature, args?: any) {
            this.dmChannelId = callingDM.id
            this.featureCode = featureCode
            this.frequencyMilli = this.frequencyMilli
        }
    }

    export type SubscriptionFeature = 'Nothing' | 'Ping' | 'DayCounter' | 'QuoteFetch' | 'RedditPost'

}