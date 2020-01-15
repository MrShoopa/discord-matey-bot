import BotData from './bot_functions/BotData';
import Discord from 'discord.js'

export class Bot extends Discord.Client {
    constructor() {
        super();

        //  Check data
        try {
            this.data = BotData.getUserDataFile()
            if (!this.data)
                BotData.createNewDataFile()
            this.data = BotData.getUserDataFile()

        } catch {

        }
    }

    data: BotData;

    lastMessage: string;
    lastCustomer: Discord.User;

    songState: string | boolean = 'idle';
}
