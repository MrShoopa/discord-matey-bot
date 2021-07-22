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

import { DataType } from '../../types/data_types/DataType.js'
import Bot from '../../Bot.js'

/*  Locations  */

/*  -----  */
export default class BotTimeKeeper {
    static SAVE_DATA = FileSystem.realpathSync('.') + '/save_data'
    static TIME_DATA_FILE = `${BotTimeKeeper.SAVE_DATA}/megadorkbot_data_time.json`
    static S3_SAVE_NAME = 'save_data/megadorkbot_data_time.json'

    //  User Data
    static getTimeData(): DataType.TimeSave {
        try {
            var data: DataType.TimeSave =
                JSON.parse(FileSystem.readFileSync(BotTimeKeeper.TIME_DATA_FILE).toString())
        } catch (err) {
            let bot: Bot = globalThis.bot
            if (err.code === 'ENOENT') {
                console.info('Time keeping file is missing! Creating new one...')
                try {
                    return this.createNewDataFile(true, true)
                } catch (err) {

                    bot.saveBugReport(err, this.getTimeData.name, true)
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
            JSON.parse(FileSystem.readFileSync(BotTimeKeeper.TIME_DATA_FILE).toString())) {
            console.log('Data already exists.')
            return null
        }

        let dataSkeleton: DataType.TimeSave =
        {
            last_initiliazed: new Date().toString(),
            last_ran_functions: {
                time: new Date().toString()
            }
        }

        try {
            FileSystem.writeFileSync(BotTimeKeeper.TIME_DATA_FILE, JSON.stringify(dataSkeleton))

            if (fetch) return this.getTimeData()
            console.log(`New Time Data save file created.\n`)
        } catch (err) {
            //  If folder is missing
            if (err.code === 'ENOENT') {
                FileSystem.mkdirSync(BotTimeKeeper.SAVE_DATA, { recursive: true })
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
    static updateTimeData(newData: DataType.TimeSave, log?: boolean) {
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
                FileSystem.writeFileSync(BotTimeKeeper.TIME_DATA_FILE, JSON.stringify(data))
            } catch (err) {
                let bot: Bot = globalThis.bot

                bot.saveBugReport(err, this.writeDataFile.name, true)
                if (err.code === 'ENOENT') {
                    console.error(`Data has been deleted. Please restart the Bot.`)
                    process.exit(404)
                } else throw err
            }
    }
}
