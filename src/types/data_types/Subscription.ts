import Discord from 'discord.js'

export module Subscriptions {
    export interface Subscription extends Object {
        featureCode: SubscriptionFeature,
        frequencyMilli: Number,
        durationMilli?: Number,
        endDate?: Date,
        [args: string]: any
    }
    export class ChannelSubscription implements Subscription {
        frequencyMilli: Number
        channelId: string
        authorId: string
        featureCode: SubscriptionFeature
        [arg: string]: any

        constructor(callingUser: Discord.GuildMember, featureCode: SubscriptionFeature, frequencyMilli: Number, args?: any) {
            this.authorId = callingUser.id
            this.channelId = callingUser.lastMessageChannelID
            this.featureCode = featureCode
            this.frequencyMilli = frequencyMilli
        }
    }

    export class UserSubscription implements Subscription {
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
        [args: string]: any
        dmChannelId: string
        featureCode: SubscriptionFeature
        frequencyMilli: Number
        durationMilli?: Number
        endDate?: Date

        constructor(callingDM: Discord.DMChannel, featureCode: SubscriptionFeature, args?: any) {
            this.dmChannelId = callingDM.id
            this.featureCode = featureCode
            this.frequencyMilli = this.frequencyMilli
        }
    }

    export type SubscriptionFeature = 'Nothing' | 'Ping' | 'DayCounter' | 'QuoteFetch' | 'RedditPost'

}