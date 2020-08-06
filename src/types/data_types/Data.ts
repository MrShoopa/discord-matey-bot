import { Subscriptions } from './Subscription';

export module Data {
    export interface UserSave extends Object {
        _id: string
        _toggles: any
        [x: string]: any
    }

    export interface TimeSave extends Object {
        last_initiliazed: string
        last_ran_functions: { [key: string]: string }
        [x: string]: any
    }

    export interface SubscriptionSave extends Object {
        _type: string,
        _enabled: boolean
        featureCode: Subscriptions.SubscriptionFeature,
        frequencyMilli: Number,
        name: string,
        durationMilli?: Number,
        endDate?: Date,
        channelId?: string
        authorId?: string,
        userId?: string,
        dmChannelId?: string,
        [args: string]: any
    }
}
