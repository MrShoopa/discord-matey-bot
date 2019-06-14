/*  Modules  */
import * as FileSystem from 'fs';

/*  Locations  */
const SAVE_DATA = __dirname + '/../save_data'
const SAVE_DATA_FILE = `${SAVE_DATA}/user_data.json`

export interface Member {
    _id?: number,
    [x: string]: any
}

/*  -----  */
export default class BotData {
    //TODO? Moar function
    //TODO: Types?

    //  User Data
    static getUserDataFile(log?: boolean) {
        try {
            var data: any = JSON.parse(FileSystem.readFileSync(SAVE_DATA_FILE).toString())
        } catch (err) {
            if (log) console.error(err);
            console.log('Have you deleted the save file?');
        }
        if (log) console.log(data)

        return data
    }

    //  Retreive data of a single user by ID
    static getUserData(id: string | number, log?: boolean) {
        let userData: Member
        try {

            userData = BotData.getUserDataFile().find((matchedUser: {
                _id: string | number;
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

    static createNewDataFile(force?: boolean) {
        let dataSkeleton = [{}]

        if (BotData.getUserDataFile() && !force) return console.log('Data already exists.')

        try {
            FileSystem.writeFile(SAVE_DATA_FILE, JSON.stringify(dataSkeleton), err => {
                if (err) {
                    //  If folder is missing
                    if (err.code === 'ENOENT')
                        FileSystem.mkdir(SAVE_DATA_FILE, { recursive: true }, (err) => {
                            if (err) throw err;
                        });
                    throw err
                }
            });
            console.log(`New User Data save file created.`);
        } catch (error) {
            console.error('Error creating new save file.')
            console.error(error)
        }
    }

    static createUserData(id: string | number, force?: boolean) {
        var data = BotData.getUserDataFile()
        //  Find user,
        let userData = data.find((matchedUser: {
            _id: string | number;
        }) => {
            return matchedUser._id === id;
        })

        if (userData === undefined || force) {
            // ,if not found, create new data.
            data.push({
                "_id": id
            })

            FileSystem.writeFile(SAVE_DATA_FILE, JSON.stringify(data), err => {
                if (err) throw err;
            });
            console.log(`Data created for User ${id}.`);
            console.log(data)
        } else {
            //  ,if found, do nothing.
            console.log(`Data already exists for User ${id}.`)
        }

    }

    static updateUserData(id: number | string, newData: object) {
        console.group(`Updating data for User ${id}:`)

        //  Pointer to local user data
        var data = BotData.getUserDataFile()

        //  Pointer to single user's data through above variable
        let userData = data.find((matchedUser: {
            _id: string | number;
        }) => {
            return matchedUser._id === id;
        })

        if (!userData) {
            console.log(`Data for User ${id} is missing. Creating new data subset.`)
            this.createUserData(id)
        }
        console.log(`Old Data:`)
        console.log(userData)
        console.log(`New Data:`)
        console.log(newData)

        Object.keys(newData).forEach(key => userData[key] = newData[key])

        FileSystem.writeFile(SAVE_DATA_FILE, JSON.stringify(data),
            err => {
                if (err) throw err;

            });
        console.log(`\nUpdate completed.`)
        console.groupEnd()
    }
}
