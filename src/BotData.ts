import { SAVE_DATA_FILE } from './bot-core';
import * as FileSystem from 'fs';

/*  -----  */
export default class BotData {
    //  User Data
    static getUserData() {
        try {
            return JSON.parse(FileSystem.readFileSync(SAVE_DATA_FILE).toString());
            //.console.log(data)
        }
        catch (err) {
            console.error(err);
            console.log('Have you deleted the save file?');
        }
    }
    
    //TODO: Put in own file!
    // Retreive data of a single user by ID
    static getSingleUserData(id: string | number) {
        BotData.getUserData().find((matchedUser: {
            _id: string | number;
        }) => {
            return matchedUser._id === id;
        });
    }
}
