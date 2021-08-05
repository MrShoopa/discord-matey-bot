import Discord from 'discord.js'

export module Subscriptions {
    export interface Subscription extends Object {
        name: string,
        _enabled: boolean,
        featureCode: SubscriptionFeature,
        frequencyMilli: Number,
        endDate?: Date,
        [args: string]: any
    }
    export class ChannelSubscription implements Subscription {
        name: string
        _enabled: boolean

        channelId: Discord.Snowflake
        authorId: string
        featureCode: SubscriptionFeature
        frequencyMilli: number
        [arg: string]: any

        constructor(messageObj: Discord.Message, featureCode: SubscriptionFeature, frequencyMilli: number, args?: any) {
            this.authorId = messageObj.member.id
            this.channelId = messageObj.member.id
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
        frequencyMilli: number
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


    export type SubscriptionFeature =
        'NOTHING' |
        'PING' |
        'DAYCOUNTER' |
        'QUOTEFETCH' |
        'REDDITPOST' |
        'SHITPOSTTIME' |
        'COPYPASTATIME' |
        'INSPIRATIONALQUOTE' |
        'MRSHOOPASTREAMWATCH' |
        'ASKREDDITRELAY' |
        '5050FETCH' |
        'NINTENDODIRECTWATCH' |
        'JAPANESEASKREDDITRELAY' |
        'SONGOFTHEDAY'

    export type ChannelType = 'test' | 'DM' | 'PartialGroup' | 'GuildChannel'

}