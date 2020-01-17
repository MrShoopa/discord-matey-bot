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

/*  Modules  */
import * as FileSystem from 'fs'
import { Data } from '../ts/interfaces/index'

/*  Locations  */
const SAVE_DATA = __dirname + '/../save_data'
const SAVE_DATA_FILE = `${SAVE_DATA}/user_data.json`

/*  -----  */
export default class BotData {
	//TODO? Moar function
	//TODO? Types? (MemberDatabase)


	//  User Data
	static getUserDataFile(log?: boolean) {
		try {
			var data: any = JSON.parse(FileSystem.readFileSync(SAVE_DATA_FILE).toString())
		} catch (err) {
			if (log) console.error(err);

			if (err.code === 'ENOENT') {
				console.error('Save file is missing. Have you deleted the save file?')
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
	static getUserData(id: number | string, log?: boolean) {
		if (typeof id === 'string') Number(id)

		let userData: Data.MemberSave
		try {
			userData = BotData.getUserDataFile().find((matchedUser: {
				_id: number;
			}) => {
				return matchedUser._id === id;
			});
		} catch (error) {
		}

		if (userData === undefined) {
			console.log(`User data for ${id} not found.`)
			return undefined
		} else {
			console.log(`User data for ${id} accessed!`)
			if (log) console.log(userData)
			return userData
		}
	}

	/**
	 * Retreive all users' data of a certain single value
	 * 
	 * @param  {string} the single requested value to be retrieved per user
	 * @param  {boolean} log? If true, logs extra info to console.
	*/
	getAllUserDataOfValue(value: string, log?: boolean): Array<any> {
		let userDataArray: Array<string> = []

		let dataObj = BotData.getUserDataFile()

		dataObj.forEach(user => {
			if (user[value]) {
				let userObj = {
					//TODO'id', value
				}

				userDataArray.push()
			}

		});

		return userDataArray
	}


	/**
	 * Creates a new datastore file for the server's instance.
	 * 
	 * @param  {boolean} force? Erases the existing datastore if it already exists.
	 */
	static createNewDataFile(force?: boolean) {
		let dataSkeleton = [{ _id: 42069, sampleData: "Mega!" }]

		if (BotData.getUserDataFile() && !force) return console.log('Data already exists.')

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
			console.log(`New User Data save file created.\n`);
		} catch (error) {
			console.error('Error creating new save file.')
			console.error(error)
		}
	}
	/**
	 * Creates a new Datype.MemberSave object based off a user's ID and saves it to the datastore file.
	 * 
	 * @param  {number|string} id User's Discord ID
	 * @param  {boolean} log? If true, logs extra info to console.
	 */
	static createUserData(id: number | string, force?: boolean) {
		if (typeof id === 'string') Number(id)

		var data = BotData.getUserDataFile()

		//  Find user,
		let userData: Data.MemberSave = data.find((matchedUser: {
			_id: number;
		}) => {
			return matchedUser._id === id;
		})

		if (userData === undefined || force) {
			// ,if not found, create new data.
			data.push({
				"_id": id
			})

			BotData.writeDataFile(data)
			console.log(`Data created for User ${id}.`);
			if (force) console.log(data)
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
		if (typeof id === 'string') Number(id)
		console.group(`Updating data for User ${id}:`)

		//  Pointer to local user data
		var data = BotData.getUserDataFile()

		//  Pointer to single user's data through above variable
		let userData: Data.MemberSave = data.find((matchedUser: {
			_id: number;
		}) => {
			return matchedUser._id === id;
		})

		if (!userData) {
			console.log(`Data for User ${id} is missing. Creating new data subset.`)
			this.createUserData(id)
		}
		console.log(`Old Data:`)
		console.log(JSON.stringify(userData))
		console.log(`New Data:`)
		console.log(JSON.stringify(newData))

		Object.keys(newData).forEach(key => userData[key] = newData[key])

		BotData.writeDataFile(data)

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
				if (err.code === 'ENOENT') {
					console.error(`Data has been deleted. Please restart the Bot.`)
					process.exit(404)
				} else throw err
			}
	}
}
