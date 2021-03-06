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
import { DataType } from '../types/data_types/DataType'

import Bot from '../Bot.js'
import KEYS from '../user_creds.js'

import aws from 'aws-sdk'
import BotTimeKeeper from './_state/TimeKeeper.js'
import BotSubscriptionHandler from './_state/SubscriptionHandler.js'

/*  Locations  */
const SAVE_DATA = FileSystem.realpathSync('.') + '/save_data'
const SAVE_DATA_FILE = `${SAVE_DATA}/megadorkbot_data_user.json`
const S3_SAVE_NAME = `save_data/megadorkbot_data_user.json`

/*  -----  */
export default class BotData {

	static get bot(): Bot { return globalThis.bot }

	static S3: aws.S3

	static s3Params = {
		Bucket: KEYS.aws.s3.bucket,
		Key: "FILL_OUT",
		Expires: 60,
		ContentType: "FILL_OUT",
		ACL: 'public-read'
	};

	//  User Data
	static getUserDataFile(log?: boolean) {
		try {
			var data: any = JSON.parse(FileSystem.readFileSync(SAVE_DATA_FILE).toString())
		} catch (err) {
			if (log) console.error(err)

			if (err.code === 'ENOENT') {
				console.error('Save file is missing. Have you deleted the save file?')
				try {
					return this.createNewDataFile(true, true)
				} catch (err) {
					if (this.bot)
						this.bot.saveBugReport(err, this.getUserDataFile.name, true)
					else
						console.error(err)
				}
				return null
			} else if (err.message.includes('Unexpected end')) {
				console.error('The user data collection JSON is malformed. Please fix.')
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
	static getUserData(id: number | string, createIfMissing?: boolean, skipLog?: boolean):
		DataType.UserSave {
		if (typeof id === 'number') id = id.toString()

		let userData: DataType.UserSave
		try {
			userData = this.getUserDataFile().find((matchedUser: {
				_id: string
			}) => {
				return matchedUser._id == id
			})
		} catch (err) {
			this.bot.saveBugReport(err)
			console.log(`Couldn't find user ${id}'s data.`)
			userData === undefined
		}

		if (userData === undefined) {
			if (createIfMissing) return this.createUserData(id)
			else return null
		} else {
			if (!skipLog) console.log(`User data for ${id} accessed!`)
			return userData
		}
	}

	/**
	 * Retreive any user data with a specific attribute
	 * 
	 * @param  {string} the single requested attribute to be retrieved per user
	 * @param  {boolean} log? If true, logs extra info to console.
	*/
	static getAllUserDataWithAttribute(attribute: string, log?: boolean):
		Array<DataType.UserSave> {
		let dataObj = this.getUserDataFile()

		return dataObj.map((user: DataType.UserSave) => {
			if (user.hasOwnProperty(attribute))
				return user
		})
	}


	/**
	 * Creates a new datastore file for the server's instance.
	 * 
	 * @param  {boolean} fetch? Returns the new data file.
	 * @param  {boolean} force? Erases the existing datastore if it already exists.
	 */
	static createNewDataFile(fetch?: boolean, force?: boolean) {
		let dataSkeleton: DataType.UserSave = { _id: '42069', _toggles: {}, sampleData: "Mega!" }

		if (!force)
			try {
				JSON.parse(FileSystem.readFileSync(SAVE_DATA_FILE).toString())
				return console.log('Data already exists.')
			} catch (error) {
				console.log('Creating new user data...')
			}

		try {
			FileSystem.writeFileSync(SAVE_DATA_FILE, `[${JSON.stringify(dataSkeleton)}]`)

			if (fetch) return this.getUserDataFile()
			console.log(`New User Data save file created.\n`)
		} catch (err) {
			//  If folder is missing
			if (err.code === 'ENOENT') {
				FileSystem.mkdirSync(SAVE_DATA, { recursive: true })
				FileSystem.appendFileSync(SAVE_DATA_FILE, "")
			} else {
				console.error('Error creating new save file.')
				console.error(err)
			}
		}
	}

	/**
	 * Creates a new Datype.MemberSave object based off a user's ID and saves it to the datastore file.
	 * 
	 * @param  {number|string} id User's Discord ID
	 * @param  {boolean} log? If true, logs extra info to console.
	 */
	static createUserData(id: number | string, force?: boolean): DataType.UserSave {
		if (typeof id === 'number') id = id.toString()

		var data = this.getUserDataFile()

		//  Find user...
		let userData: DataType.UserSave = data.find((user: any) => {
			return user._id == id
		})

		if (userData === undefined || force) {
			// ...if not found, create new data.
			let newSave: DataType.UserSave = {
				_id: id as `${bigint}`, _toggles: {}
			}

			data.push(newSave)

			this.writeDataFile(data)
			console.log(`Data created for User ${id}.`)
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
	static updateUserData(id: number | string, newData: DataType.UserSave) {
		if (typeof id === 'number') id = id.toString()
		console.group()
		console.log(`Updating data for User ${id}:`)

		//  Pointer to local user data
		var data = this.getUserDataFile()

		//  Pointer to single user's data through above variable
		let userData: DataType.UserSave = data.find((matchedUser: {
			_id: string
		}) => {
			return matchedUser._id == id
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
	private static writeDataFile(data: Array<DataType.UserSave>) {

		if (typeof data === 'object')
			try {
				FileSystem.writeFileSync(SAVE_DATA_FILE, JSON.stringify(data))
			} catch (err) {
				this.bot.saveBugReport(err, this.writeDataFile.name, true)
				if (err.code === 'ENOENT') {
					console.error(`Data has been deleted. Please restart the Bot.`)
					process.exit(404)
				} else throw err
			}
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
			data._toggles[property] = forceBoolean

			boolChoice = data._toggles[property]
		}

		console.log(`Toggled user preference '${property}' to ${boolChoice}.`)

		this.updateUserData(id, data)

		return boolChoice
	}

	static async getS3Object(name: string) {
		if (!this.S3) this.initS3()

		return await this.S3.getObject({ Bucket: KEYS.aws.s3.bucket, Key: name })
			.promise().then(obj => {
				console.log(`Obtained S3 Object from ${KEYS.aws.s3.bucket}: ${name}`)
				return obj
			}).catch(err => {
				if (err.message.contains('does not exist'))
					console.error(`S3 Object does not exist in ${KEYS.aws.s3.bucket}: ${name}`)
				else
					console.error(`Failed getting S3 Object in ${KEYS.aws.s3.bucket}: ${name}`, err)
				return null
			})
	}

	static async updateS3Object(file: Buffer = FileSystem.readFileSync(SAVE_DATA_FILE),
		name: string = S3_SAVE_NAME) {
		if (!this.S3) this.initS3()

		return await this.S3.putObject({ Body: file, Bucket: KEYS.aws.s3.bucket, Key: name })
			.promise().then(obj => {
				console.log(`Updated S3 Object in ${KEYS.aws.s3.bucket}: ${name}`)
				return obj
			}).catch(err => {
				console.error(`Failed updating S3 Object in ${KEYS.aws.s3.bucket}: ${name}`, err)
				return null
			})
	}

	static async initS3() {
		process.env.AWS_ACCESS_KEY_ID = KEYS.aws.auth.accessKeyId
		process.env.AWS_SECRET_ACCESS_KEY = KEYS.aws.auth.secretAccessKey

		this.S3 = new aws.S3();

		// User Data
		let userFile: aws.S3.GetObjectOutput = await this.getS3Object(S3_SAVE_NAME)
		if (!userFile) await this.updateS3Object()
		FileSystem.writeFileSync((SAVE_DATA_FILE), userFile.Body.toString())

		// Time Data
		let timeFile: aws.S3.GetObjectOutput = await this.getS3Object(BotTimeKeeper.S3_SAVE_NAME)
		if (!timeFile) await this.updateS3Object(FileSystem.readFileSync(BotTimeKeeper.TIME_DATA_FILE), BotTimeKeeper.S3_SAVE_NAME)
		FileSystem.writeFileSync((BotTimeKeeper.TIME_DATA_FILE), timeFile.Body.toString())

		// Subscription Data
		let subscriptionFile: aws.S3.GetObjectOutput = await this.getS3Object(BotSubscriptionHandler.S3_SAVE_NAME)
		if (!subscriptionFile) await this.updateS3Object(FileSystem.readFileSync(BotSubscriptionHandler.SUBSCRIPTION_DATA_FILE), BotSubscriptionHandler.S3_SAVE_NAME)
		FileSystem.writeFileSync((BotSubscriptionHandler.SUBSCRIPTION_DATA_FILE), subscriptionFile.Body.toString())
	}
	/**
	 * Updates the S3 bucket with the following objects.
	 * @see AUTH.aws.s3.bucket for bucket name
	 */
	static async updateS3() {
		// User Data
		await this.updateS3Object(FileSystem.readFileSync(SAVE_DATA_FILE), S3_SAVE_NAME)

		//Time Data
		await this.updateS3Object(FileSystem.readFileSync(BotTimeKeeper.TIME_DATA_FILE), BotTimeKeeper.S3_SAVE_NAME)

		//Subscription Data
		await this.updateS3Object(FileSystem.readFileSync(BotSubscriptionHandler.SUBSCRIPTION_DATA_FILE), BotSubscriptionHandler.S3_SAVE_NAME)
	}
}
