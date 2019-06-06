const SAVE_DATA = __dirname + '/../save_data'
const SAVE_DATA_FILE = `${SAVE_DATA}/user_data.json`
import * as FileSystem from 'fs';

/*  -----  */
export default class BotData {
    //TODO? Moar function
    //TODO: Types?

    //  User Data
    static getUserDataFile(log?: boolean) {
        try {
            var data = JSON.parse(FileSystem.readFileSync(SAVE_DATA_FILE).toString())
        } catch (err) {
            //.console.error(err);
            console.log('Have you deleted the save file?');
        }
        if (log) console.log(data)

        return data
    }

    //  Retreive data of a single user by ID
    static getUserData(id: string | number) {
        let userData
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
            return userData
        }
    }

    static createNewDataFile() {
        let dataSkeleton = [{}]

        try {
            FileSystem.writeFile(SAVE_DATA_FILE, JSON.stringify(dataSkeleton), err => {
                if (err) console.log(err);
            });
            console.log(`New User Data save file created.`);
        } catch (error) {
            console.error('Error creating new save file.')
            console.error(error)
        }
    }

    static createUserData(id: string | number) {
        var data = BotData.getUserDataFile()
        //  Find user,
        let userData = data.find((matchedUser: {
            _id: string | number;
        }) => {
            return matchedUser._id === id;
        })

        if (userData === undefined) {
            // ,if not found, create new data.
            data.push({
                "_id": id
            })

            FileSystem.writeFile(SAVE_DATA_FILE, JSON.stringify(data), err => {
                if (err) throw err;
            });
            console.log(`Data created for User ${id}.`);
        } else {
            //  ,if found, do nothing.
            console.log(`Data already exists for User ${id}.`)
        }

    }

    static updateUserData(id: number | string, newData: object) {
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

        Object.keys(newData).forEach(key => userData[key] = newData[key])

        FileSystem.writeFile(SAVE_DATA_FILE, JSON.stringify(data),
            err => {
                if (err) throw err;

            });
        console.group(`User data updated for User ${id}:`)
        console.log(userData)
    }
}
