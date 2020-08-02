export module Subscriptions {
    export interface Subscription extends Object {
        featureCode: SubscriptionFeature,
        frequencyMilli: Number,
        durationMilli?: Number,
        endDate?: Date,
        [args: string]: any
    }
    export interface ChannelSubscription extends Subscription {
        channelId: string,
        authorId: string
    }

    export interface UserSubscription extends Subscription {
        userId: string
    }

    export interface DMSubscription extends Subscription {
        channelId: string
    }

    export enum SubscriptionFeature {
        Ping,
        DayCounter,
        RedditPost
    }
}