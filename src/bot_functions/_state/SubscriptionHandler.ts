/**
 * Handles processing any subscriptions created by a user in the context of
 * a direct message channel or guild channel. 
 * 
 * There is a single file that collects and stores all the needed subscription info
 * in the form of a JSON.
 *
 * @author: Joe V.
 * @date August 2020
 */

import Bot from '../../Bot';
import Discord from 'discord.js'

import * as FileSystem from 'fs'
import { Data } from './../../types/data_types/Data'

import { Subscriptions } from './../../types/index';
import BotGeneralCommands from './../general/GeneralCommands'

let dataSkeleton: Data.SubscriptionSave =
{
    _type: 'test',
    _enabled: false,
    _lastRun: new Date(),
    name: 'butt',
    frequencyMilli: 0,
    featureCode: 'NOTHING',
    //sampleData: { sampleArg: 'Yuh' }
}

export default class BotSubscriptionHandler {
    static SAVE_DATA = __dirname + '/../../../save_data'
    static SUBSCRIPTION_DATA_FILE = `${BotSubscriptionHandler.SAVE_DATA}/megadorkbot_subscription_collection.json`
    static S3_SAVE_NAME = 'save_data/megadorkbot_subscription_collection.json'

    static getSubscriptionDatastore(): Data.SubscriptionSave[] {
        try {
            var data: Data.SubscriptionSave[] =
                JSON.parse(FileSystem.readFileSync(this.SUBSCRIPTION_DATA_FILE).toString())
            if (data == undefined)
                throw new Error('Blank Object')
        } catch (err) {
            let bot: Bot = globalThis.bot
            if (err.code === 'ENOENT' || err.message.includes('Blank')) {
                console.info('Subscription data file is missing! Creating new collection...')
                try {
                    return this.instantiateSubscriptionData(true, true)
                } catch (err) {
                    bot.saveBugReport(err, this.getSubscriptionDatastore.name, true)
                }
                return null
            } else if (err.message.includes('Unexpected end')) {
                console.error('The Subscription collection JSON is malformed. Please fix.')
            }
            else bot.saveBugReport(err)
        }
        return data
    }

    /**
	 * Creates a new subscription datastore file for the server's instance.
	 * 
	 * @param  {boolean} fetch? Returns the new data file.
	 * @param  {boolean} force? Erases the existing datastore if it already exists.
	 */
    static instantiateSubscriptionData(fetch?: boolean, force?: boolean) {
        if (!force && JSON.parse(FileSystem.readFileSync(this.SUBSCRIPTION_DATA_FILE).toString())) {
            console.log('Subscription Data already exists.')
            return null
        }

        try {
            FileSystem.writeFileSync(this.SUBSCRIPTION_DATA_FILE, `[${JSON.stringify(dataSkeleton)}]`)

            if (fetch) return this.getSubscriptionDatastore()
            console.log(`New Subscription Data save file created.\n`)
        } catch (err) {
            //  If folder is missing
            if (err.code === 'ENOENT') {
                FileSystem.mkdirSync(BotSubscriptionHandler.SAVE_DATA, { recursive: true })
            } else {
                let bot: Bot = globalThis.bot

                console.error('Error creating new subscription data file.')
                bot.saveBugReport(err)
            }
        }
    }

	/**
	 * Overwrites the current subscription datastore file with any given
     * complete subscription data object.
	 * 
	 * @param  {any} data
	 */
    private static writeSubscriptionDataFile(data: any) {
        if (typeof data === 'object')
            try {
                FileSystem.writeFileSync(this.SUBSCRIPTION_DATA_FILE, JSON.stringify(data))
            } catch (err) {
                let bot: Bot = globalThis.bot

                bot.saveBugReport(err, this.writeSubscriptionDataFile.name, true)
                if (err.code === 'ENOENT') {
                    console.error(`Subscription Data has been deleted. Please restart the Bot to load new data.`)
                    process.exit(404)
                } else throw err
            }
    }

    /**
	 * Creates a new Datype.SubscriptionSave object based off a message channel's ID
     * and saves it to the datastore file.
	 * 
	 * @param  {number|string} id Message Channel Discord ID
	 * @param  {boolean} log? If true, logs extra info to console.
	 */
    static createSubscription(id: number | string, name: string, caller?: Discord.Message, force?: boolean): Data.SubscriptionSave {
        if (typeof id === 'number') id = id.toString()

        var data = this.getSubscriptionDatastore()

        //  Find subscription...
        let subscription: Data.SubscriptionSave = data.find((givenSub: Data.SubscriptionSave) => {
            if (givenSub.channelId == id) id = givenSub.channelId
            else if (givenSub.dmChannel == id) id = givenSub.dmChannel
            else if (givenSub.userId == id) id = givenSub.userId
            else return null

            if (givenSub.name === name && id)
                return true
        })

        if (subscription === undefined || force) {
            // ...if not found, create new data.
            let newSub = dataSkeleton
            newSub.name = name

            if (caller?.channel instanceof Discord.TextChannel) {
                newSub._type = 'GuildChannel'
                newSub.channelId = caller.channel.id
            }
            else if (caller?.channel instanceof Discord.PartialGroupDMChannel) {
                newSub._type = 'PartialGroup'
                newSub.dmChannelId = caller.channel.id //TODO Special Partials
            }
            else if (caller?.channel instanceof Discord.DMChannel) {
                newSub._type = 'DM'
                newSub.dmChannelId = caller.channel.id
            } else newSub.channelId = id

            data.push(newSub)

            this.writeSubscriptionDataFile(data)
            console.log(`Data created for message channel ${id} named ${name}.`)
            if (force) console.warn(`YOU HAVE REWRITTEN A SUBSCRIPTION BY FORCE!`)

            return newSub
        } else {
            //  ,if found, do nothing.
            console.log(`A subscription named ${name} already exists for channel id ${id}.`)
            throw new Error(`Subscription already exists for ${name}`)
        }

    }

	/**
	 * Updates an existing user's data with given new data.
	 * 
	 * @param  {number|string} id Message Channel id
	 * @param  {object} newData New data to overwrite existing data with.
	 */
    static updateSubscription(id: string, name: string, newData: Data.SubscriptionSave, caller?: Discord.Message) {
        console.group(`Updating data for channel ${id}'s subscription with name '${name}'`)

        var data = this.getSubscriptionDatastore()

        //  Pointer to single user's data through above variable
        let subscription: Data.SubscriptionSave = data.find((givenSub: Data.SubscriptionSave) => {
            if (givenSub.channelId == id || givenSub.dmChannel == id || givenSub.userId == id)
                if (givenSub.name === name)
                    return true
        })

        if (!subscription) {
            if (newData === null) {
                console.groupEnd()
                return null
            }
            console.log(`Subscription not found. Creating.`)
            return this.updateSubscription(id, name, this.createSubscription(id, name, caller)) //! TODO yeah idk fix this
        }

        console.log(`Old Data:`)
        console.info(subscription)
        console.log(`New Data:`)
        console.info(newData)

        if (newData === null)
            data = data.filter((sub) => sub.channelId != id && sub.userId != id && sub.dmChannelId != id)
        else
            Object.keys(newData).forEach(key => subscription[key] = newData[key])

        this.writeSubscriptionDataFile(data)

        console.log(`\nUpdate completed.`)
        console.groupEnd()
        return true
    }

    static getSubscription(id: string, name: string, enableIfNone?: boolean) {
        let data = this.getSubscriptionDatastore()

        //  Pointer to single user's data through above variable
        let subscription: Data.SubscriptionSave = data.find((givenSub: Data.SubscriptionSave) => {
            if (givenSub.channelId == id || givenSub.dmChannel == id || givenSub.userId == id)
                if (givenSub.name === name)
                    return true
        })

        if (!subscription && enableIfNone) subscription = this.createSubscription(id, name)

        return subscription
    }

    static toggleSubscription(id: string, name: string, forceBoolean?: boolean) {
        let subscription: Data.SubscriptionSave = this.getSubscription(id, name)

        subscription._enabled = forceBoolean ? forceBoolean : !subscription._enabled
        this.updateSubscription(id, name, subscription)
        console.log(`Toggled channel id ${id} subscription '${name}' to ${subscription._enabled}.`)

        return subscription._enabled
    }

    static deleteSubscription(id: string, name: string) {
        console.log(`Deleting subscription for ${id} named ${name}...`)
        if (this.updateSubscription(id, name, null) == null) {
            console.log('...wait this subscription did not exist in the first place!')
            return null
        } else {
            console.log('...successfully deleted!')
            return true
        }
    }

    static runTask(subscription: Subscriptions.Subscription) {
        let bot: Bot = globalThis.Bot

        let subscribedChannelId: string

        if (subscription instanceof Subscriptions.ChannelSubscription)
            subscribedChannelId = subscription.channelId
        else if (subscription instanceof Subscriptions.DMSubscription)
            subscribedChannelId = subscription.dmChannelId
        else if (subscription instanceof Subscriptions.UserSubscription)
            subscribedChannelId = subscription.userId

        // List of functions to process based on calling function code (@see ChannelSubscription)
        // Make sure your function can handle sending to a channel id.
        let channel: Discord.TextChannel = bot.channels.cache.get(subscribedChannelId) as Discord.TextChannel
        switch (subscription.featureCode) {
            case 'PING':
                BotGeneralCommands.firePingPongMessage(channel)
                break;
            case 'DAYCOUNTER':
                //TODO
                break;
            case 'QUOTEFETCH':
                //TODO
                break;
            case 'REDDITPOST':
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

    static RunSubscribedTasks() {
        let subscriptions = BotSubscriptionHandler.getSubscriptionDatastore()

        subscriptions.forEach(sub => {
            let currentTime = Date.now()

            if (sub.featureCode = 'NOTHING')

                // Checks if this ran before the next interval
                if ((sub.featureCode !== 'NOTHING'
                    && (sub._lastRun?.getMilliseconds() - currentTime) < sub.frequencyMilli))
                    this.runTask(sub)
        })

        console.log('AUTOMATION - Finished running all subscribed tasks for channels!')
    }
}