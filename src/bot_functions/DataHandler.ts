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
import { Data } from '../types/index'

import Bot from '../Bot'

/*  Locations  */
const SAVE_DATA = __dirname + '/../../save_data'
const SAVE_DATA_FILE = `${SAVE_DATA}/user_data.json`

/*  -----  */
export default class BotData {

	static get bot(): Bot { return globalThis.bot }

	//  User Data
	static getUserDataFile(log?: boolean) {
		try {
			var data: any = JSON.parse(FileSystem.readFileSync(SAVE_DATA_FILE).toString())
		} catch (err) {
			if (log) console.error(err);

			if (err.code === 'ENOENT') {
				console.error('Save file is missing. Have you deleted the save file?')
				try {
					return this.createNewDataFile()
				} catch (err) {
					this.bot.saveBugReport(err, true)
				}
				return null
			}

		}
		if (log) console.log(data)

		return data
	}

	/**
	 * Retreive data of a single user by ID
	 * 
	 * @param  {number|string} id User's Discord ID
	 * @param  {boolean} log? If true, logs extra info to console.
	 */
	static getUserData(id: number | string, createIfMissing?: boolean) {
		if (typeof id === 'string') id = Number(id)

		let userData: Data.UserSave
		try {
			userData = this.getUserDataFile().find((matchedUser: {
				_id: number;
			}) => {
				return matchedUser._id == id;
			});
		} catch (err) {
			this.bot.saveBugReport(err)
			throw new ReferenceError(`Couldn't attempt to find user's data.`)
		}

		if (userData === undefined) {
			console.log(`User data for ${id} not found.`)
			if (createIfMissing) return this.createUserData(id)
		} else {
			console.log(`User data for ${id} accessed!`)
			return userData
		}
	}

	/**
	 * Retreive any user data with a specific attribute
	 * 
	 * @param  {string} the single requested attribute to be retrieved per user
	 * @param  {boolean} log? If true, logs extra info to console.
	*/
	static getAllUserDataWithAttribute(attribute: string, log?: boolean): Array<Data.UserSave> {
		let dataObj = this.getUserDataFile()

		return dataObj.map((user: Data.UserSave) => {
			return attribute in user
		})
	}


	/**
	 * Creates a new datastore file for the server's instance.
	 * 
	 * @param  {boolean} fetch? Returns the new data file.
	 * @param  {boolean} force? Erases the existing datastore if it already exists.
	 */
	static createNewDataFile(fetch?: boolean, force?: boolean) {
		let dataSkeleton = [{ _id: 42069, sampleData: "Mega!" }]

		if (this.getUserDataFile() && !force) return console.log('Data already exists.')

		try {
			FileSystem.writeFile(SAVE_DATA_FILE, JSON.stringify(dataSkeleton), err => {
				if (err) {
					//  If folder is missing
					if (err.code === 'ENOENT')
						FileSystem.mkdir(SAVE_DATA_FILE, { recursive: true }, (err) => {
							if (err) throw err;
						});
					else
						throw err
				}
			});

			if (fetch) return this.getUserDataFile()
			console.log(`New User Data save file created.\n`);
		} catch (err) {
			console.error('Error creating new save file.')
			this.bot.saveBugReport(err)
		}
	}

	/**
	 * Creates a new Datype.MemberSave object based off a user's ID and saves it to the datastore file.
	 * 
	 * @param  {number|string} id User's Discord ID
	 * @param  {boolean} log? If true, logs extra info to console.
	 */
	static createUserData(id: number | string, force?: boolean) {
		if (typeof id === 'string') id = Number(id)

		var data = this.getUserDataFile()

		//  Find user...
		let userData: Data.UserSave = data.find((matchedUser: {
			_id: number;
		}) => {
			return matchedUser._id == id;
		})

		if (userData === undefined || force) {
			// ...if not found, create new data.
			let newSave: Data.UserSave = {
				_id: id
			}

			data.push(newSave)

			this.writeDataFile(data)
			console.log(`Data created for User ${id}.`);
			if (force) console.warn(`YOU HAVE REWRITTEN SOMEONE'S SAVE!`)

			return data
		} else {
			//  ,if found, do nothing.
			console.log(`Data already exists for User ${id}.`)
		}

	}

	/**
	 * Updates an existing user's data with given new data.
	 * 
	 * @param  {number|string} id User's Discord ID
	 * @param  {object} newData New data to overwrite existing data with.
	 */
	static updateUserData(id: number | string, newData: object) {
		if (typeof id === 'string') id = Number(id)
		console.group()
		console.log(`Updating data for User ${id}:`)

		//  Pointer to local user data
		var data = this.getUserDataFile()

		//  Pointer to single user's data through above variable
		let userData: Data.UserSave = data.find((matchedUser: {
			_id: number;
		}) => {
			return matchedUser._id == id;
		})

		if (!userData) {
			console.log(`Data for User ${id} is missing. Creating new data subset.`)
			this.createUserData(id)
		}

		console.log(`Old Data:`)
		console.info(userData)
		console.log(`New Data:`)
		console.info(newData)

		Object.keys(newData).forEach(key => userData[key] = newData[key])

		this.writeDataFile(data)

		console.log(`\nUpdate completed.`)
		console.groupEnd()
	}
	/**
	 * Overwrites the current datastore file with any given data.
	 * 
	 * @param  {any} data
	 */
	private static writeDataFile(data: any) {

		if (typeof data === 'object')
			try {
				FileSystem.writeFileSync(SAVE_DATA_FILE, JSON.stringify(data))
			} catch (err) {
				this.bot.saveBugReport(err, true)
				if (err.code === 'ENOENT') {
					console.error(`Data has been deleted. Please restart the Bot.`)
					process.exit(404)
				} else throw err
			}
	}
}
