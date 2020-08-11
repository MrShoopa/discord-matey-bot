import Discord from 'discord.js'

export module Subscriptions {
    export interface Subscription extends Object {
        name: string,
        _enabled: boolean,
        featureCode: SubscriptionFeature,
        frequencyMilli: Number,
        durationMilli?: Number,
        endDate?: Date,
        [args: string]: any
    }
    export class ChannelSubscription implements Subscription {
        name: string
        _enabled: boolean

        channelId: string
        authorId: string
        featureCode: SubscriptionFeature
        frequencyMilli: number
        [arg: string]: any

        constructor(callingUser: Discord.GuildMember, featureCode: SubscriptionFeature, frequencyMilli: number, args?: any) {
            this.authorId = callingUser.id
            this.channelId = callingUser.lastMessageChannelID
            this.featureCode = featureCode
            this.frequencyMilli = frequencyMilli

            this._enabled = true
        }
    }
    export class DMSubscription implements Subscription {
        name: string
        _enabled: boolean

        dmChannelId: string
        featureCode: SubscriptionFeature
        frequencyMilli: Number
        [args: string]: any

        constructor(callingDM: Discord.DMChannel, featureCode: SubscriptionFeature, args?: any) {
            this.dmChannelId = callingDM.id
            this.featureCode = featureCode
            this.frequencyMilli = this.frequencyMilli

            this._enabled = true
        }
    }

    export class UserSubscription implements Subscription {
        name: string
        _enabled: boolean

        userId: string
        featureCode: SubscriptionFeature
        frequencyMilli: Number
        [arg: string]: any

        constructor(callingUser: Discord.User, featureCode: SubscriptionFeature, args?: any) {
            this.userId = callingUser.id
            this.featureCode = featureCode
            this.frequencyMilli

            this._enabled = true
        }
    }


    export type SubscriptionFeature = 'NOTHING' | 'PING' | 'DAYCOUNTER' | 'QUOTEFETCH' | 'REDDITPOST'

    export type ChannelType = 'test' | 'DM' | 'PartialGroup' | 'GuildChannel'

}