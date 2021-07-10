import { Subscriptions } from './Subscription';

export module Data {
    export interface UserSave extends Object {
        _id: `${bigint}`
        _toggles: any
        [x: string]: any
    }

    export interface TimeSave extends Object {
        last_initiliazed: string
        last_ran_functions: { [key: string]: string }
        [x: string]: any
    }

    export interface SubscriptionSave extends Object {
        _type: Subscriptions.ChannelType,
        _enabled: boolean
        _lastRun: Date
        featureCode: Subscriptions.SubscriptionFeature,
        frequencyMilli: number,
        name: string,
        endDate?: Date,
        channelId?: `${bigint}`
        authorId?: `${bigint}`
        userId?: string,
        dmChannelId?: string,
        [args: string]: any
    }
}
