import TimelyFunctions from "./TimelyFunctions";

import BotModuleBirthday from "../novelty/birthday/BirthdayFunctions";

export default class PostReadyFunctions {
    static run() {
        TimelyFunctions.timeContexual()

        BotModuleBirthday.checkBirthdays()
    }
}
