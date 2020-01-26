import BotDiscordActivity from './DiscordActivityStatus'
import TimelyFunctions from "./TimelyFunctions"

import BotModuleMusic from "../music/MusicFunctions"

export default class PostReadyFunctions {
    static run() {
        this.loadClients()

        BotDiscordActivity.updateRandomStatus()

        TimelyFunctions.timeContexual()
    }

    static loadClients() {
        BotModuleMusic.loadClients()
    }
}
