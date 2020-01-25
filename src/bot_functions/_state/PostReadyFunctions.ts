import TimelyFunctions from "./TimelyFunctions"

import BotModuleMusic from "../music/MusicFunctions"

export default class PostReadyFunctions {
    static run() {
        this.loadClients()

        TimelyFunctions.timeContexual()
    }

    static loadClients() {
        BotModuleMusic.loadClients()
    }
}
