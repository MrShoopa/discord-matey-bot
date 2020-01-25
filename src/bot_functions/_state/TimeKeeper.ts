/**
 * Handles the local literal save data of the server
 * consisting of interactions made from users from a server
 * (in which a Matey Bot instance is involved with)
 * based off modules that save data with games, analytics, etc.
 * 
 * Example of a module that utilizes this is the Swear Jar
 * @see /bot-modules/novelty
 *
 * @author: Joe V.
 * @date June 2019
 */

import * as FileSystem from 'fs'
import { Data } from './../../types/data_types/Data';
import Bot from '../../Bot'

/*  Locations  */
const SAVE_DATA = __dirname + '/../../../save_data'
const TIME_DATA_FILE = `${SAVE_DATA}/time_data.json`

/*  -----  */
export default class BotTimeKeeper {

    //  User Data
    static getTimeData(): Data.TimeSave {
        try {
            var data: Data.TimeSave =
                JSON.parse(FileSystem.readFileSync(TIME_DATA_FILE).toString())
        } catch (err) {
            let bot: Bot = globalThis.bot
            if (err.code === 'ENOENT') {
                console.info('Time keeping file is missing. Creating new one...')
                try {
                    return this.createNewDataFile(true, true)
                } catch (err) {

                    bot.saveBugReport(err, true)
                }
                return null
            } else bot.saveBugReport(err)
        }
        return data
    }


	/**
	 * Creates a new datastore file for the server's instance.
	 * 
	 * @param  {boolean} fetch? Returns the new data file.
	 * @param  {boolean} force? Erases the existing datastore if it already exists.
	 */
    static createNewDataFile(fetch?: boolean, force?: boolean) {
        if (!force &&
            JSON.parse(FileSystem.readFileSync(TIME_DATA_FILE).toString())) {
            console.log('Data already exists.')
            return null
        }

        let dataSkeleton: Data.TimeSave =
        {
            last_initiliazed: new Date().toString(),
            last_ran_functions: {
                time: new Date().toString()
            }
        }

        try {
            FileSystem.writeFileSync(TIME_DATA_FILE, JSON.stringify(dataSkeleton))

            if (fetch) return this.getTimeData()
            console.log(`New Time Data save file created.\n`)
        } catch (err) {
            //  If folder is missing
            if (err.code === 'ENOENT') {
                FileSystem.mkdirSync(TIME_DATA_FILE, { recursive: true })
            } else {
                let bot: Bot = globalThis.bot

                console.error('Error creating new timekeeping file.')
                bot.saveBugReport(err)
            }
        }
    }


	/**
	 * Updates an existing user's data with given new data.
	 * 
	 * @param  {number|string} id User's Discord ID
	 * @param  {object} newData New data to overwrite existing data with.
	 */
    static updateTimeData(newData: Data.TimeSave, log?: boolean) {
        //  Pointer to local user data
        var data = this.getTimeData()

        if (log) {
            console.log(`Updating time data...`)
            console.group()

            console.log(`Old Data:`)
            console.info(data)
            console.log(`New Data:`)
            console.info(newData)
        }

        this.writeDataFile(newData)

        if (log) {
            console.log(`\nTime data updated. ⌚`)
            console.groupEnd()
        }
    }
	/**
	 * Overwrites the current datastore file with any given data.
	 * 
	 * @param  {any} data
	 */
    private static writeDataFile(data: any) {

        if (typeof data === 'object')
            try {
                FileSystem.writeFileSync(TIME_DATA_FILE, JSON.stringify(data))
            } catch (err) {
                let bot: Bot = globalThis.bot

                bot.saveBugReport(err, true)
                if (err.code === 'ENOENT') {
                    console.error(`Data has been deleted. Please restart the Bot.`)
                    process.exit(404)
                } else throw err
            }
    }
}
