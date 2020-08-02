import { Subscriptions } from './../../types/index';

export default class SubscriptionHandler {
    static RunTask(subscription: Subscriptions.Subscription) {


        if (subscription instanceof Subscriptions.ChannelSubscription)
            SubscriptionHandler.RunChannelTask(subscription as Subscriptions.ChannelSubscription)
    }

    static RunChannelTask(subscription: Subscriptions.ChannelSubscription) {

    }
}