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

export default class BotSubscriptionHandler {
    static SAVE_DATA = __dirname + '/../../../save_data'
    static SUBSCRIPTION_DATA_FILE = `${BotSubscriptionHandler.SAVE_DATA}/megadorkbot_subscription_collection.json`
    static S3_SAVE_NAME = 'save_data/megadorkbot_subscription_collection.json'

    static getSubscriptionData() {
        try {
            var data: Data.SubscriptionSave =
                JSON.parse(FileSystem.readFileSync(this.SUBSCRIPTION_DATA_FILE).toString())
        } catch (err) {
            let bot: Bot = globalThis.bot
            if (err.code === 'ENOENT') {
                console.info('Subscription data file is missing! Creating new collection...')
                try {
                    return this.instantiateSubscriptionData(true, true)
                } catch (err) {
                    bot.saveBugReport(err, this.getSubscriptionData.name, true)
                }
                return null
            } else bot.saveBugReport(err)
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
        if (!force &&
            JSON.parse(FileSystem.readFileSync(this.SUBSCRIPTION_DATA_FILE).toString())) {
            console.log('Data already exists.')
            return null
        }

        let dataSkeleton: Data.SubscriptionSave =
        {
            _type: 'test',
            frequencyMilli: 0,
            featureCode: 'Nothing',
            sampleData: { sampleArg: 'Yuh' }
        }

        try {
            FileSystem.writeFileSync(this.SUBSCRIPTION_DATA_FILE, JSON.stringify(dataSkeleton))

            if (fetch) return this.getSubscriptionData()
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
	 * Updates an existing subscription's data with any given as an subobject.
	 * 
	 * @param  {number|string} id User's Discord ID
	 * @param  {object} newData New data to overwrite existing data with.
	 */
    static updateSubscriptionData(newData: Data.SubscriptionSave, log?: boolean) {
        var data = this.getSubscriptionData()

        if (log) {
            console.log(`Updating time data...`)
            console.group()

            console.log(`Old Data:`)
            console.info(data)
            console.log(`New Data:`)
            console.info(newData)
        }

        this.writeSubscriptionDataFile(newData)

        if (log) {
            console.log(`\Subscription data updated. 📰🌩`)
            console.groupEnd()
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
    static createUserData(id: number | string, force?: boolean): Data.SubscriptionSave {
        if (typeof id === 'number') id = id.toString()

        var data = this.getSubscriptionData()

        //  Find user...
        let subscription: Data.SubscriptionSave = data.find((givenChannel: any) => {
            return givenChannel._id == id
        })

        if (subscription === undefined || force) {
            // ...if not found, create new data.
            let newSave: Data.SubscriptionSave = {
                _type: 'test',
                frequencyMilli: 0,
                featureCode: 'Nothing',
                sampleData: { sampleArg: 'Yuh' }
            }

            data.push(newSave)

            this.writeSubscriptionDataFile(data)
            console.log(`Data created for message channel ${id}.`)
            if (force) console.warn(`YOU HAVE REWRITTEN A SUBSCRIPTION BY FORCE!`)

            return data
        } else {
            //  ,if found, do nothing.
            console.log(`Data already exists for message channel ${id}.`)
        }

    }

	/**
	 * Updates an existing user's data with given new data.
	 * 
	 * @param  {number|string} id User's Discord ID
	 * @param  {object} newData New data to overwrite existing data with.
	 */
    static updateUserData(id: string, newData: Data.SubscriptionSave) {
        console.group(`Updating data for Subscription ${id}:`)

        //  Pointer to local user data
        var data = this.getSubscriptionData()

        //  Pointer to single user's data through above variable
        let subscription: Data.SubscriptionSave = data.find((givenChannel: any) => {
            return givenChannel._id == id
        })

        if (!subscription) {
            console.log(`Data for User ${id} is missing. Creating new data subset.`)
            this.createUserData(id)
        }

        console.log(`Old Data:`)
        console.info(subscription)
        console.log(`New Data:`)
        console.info(newData)

        Object.keys(newData).forEach(key => subscription[key] = newData[key])

        this.writeSubscriptionDataFile(data)

        console.log(`\nUpdate completed.`)
        console.groupEnd()
    }

    static getUserProperty(id: number | string, property: string, enableIfNone?: boolean) {
        let data = this.getUserData(id, true, true)

        if (!data._toggles)
            data._toggles = {}

        if (data._toggles[property] !== undefined)
            return data._toggles[property]
        else
            return this.toggleUserProperty(id, property, enableIfNone)
    }

    static toggleUserProperty(id: number | string, property: string, forceBoolean?: boolean) {
        let data = this.getUserData(id, true)
        let boolChoice: boolean

        if (!data._toggles)
            data._toggles = {}

        if (data._toggles[property] !== undefined) {
            boolChoice = forceBoolean ? forceBoolean : !data._toggles[property]

            data._toggles[property] = boolChoice
        } else {
            data._toggles[property] = forceBoolean ? forceBoolean : true

            boolChoice = data._toggles[property]
        }

        console.log(`Toggled user preference '${property}' to ${boolChoice}.`)

        this.updateUserData(id, data)

        return boolChoice
    }

    static deleteSubscrription(id: string) {

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
            case 'Ping':
                BotGeneralCommands.firePingPongMessage(channel)
                break;
            case 'DayCounter':
                //TODO
                break;
            case 'QuoteFetch':
                //TODO
                break;
            case 'RedditPost':
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


}