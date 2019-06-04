const SAVE_DATA = __dirname + '/bot_knowledge/save_data'
const SAVE_DATA_FILE = `${SAVE_DATA}/user_data.json`
import * as FileSystem from 'fs';

/*  -----  */
export default class BotData {
    //TODO? Moar function

    //  User Data
    static getUserData(log?: boolean) {
        try {
            var data = JSON.parse(FileSystem.readFileSync(SAVE_DATA_FILE).toString());
            if (log) console.log(data)

            return data
        }
        catch (err) {
            console.error(err);
            console.log('Have you deleted the save file?');
        }
    }

    //TODO: Put in own file!
    // Retreive data of a single user by ID
    static getSingleUserData(id: string | number) {
        let userData = BotData.getUserData().find((matchedUser: {
            _id: string | number;
        }) => {
            return matchedUser._id === id;
        });

        if (userData === undefined)
            return null
        else
            return userData
    }

    static createUserData(id: string | number) {
        var data = BotData.getUserData()
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
                console.log(`Data created for User ${id}.`);
            });
        } else {
            //  ,if found, do nothing.
            console.log(`Data already exists for User ${id}.`)
        }

    }

    static updateUserData(id: number | string, newData: object) {
        //  Pointer to local user data
        var data = BotData.getUserData()

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

                console.log(`User data updated for User ${id}.`);
            });
    }
}
