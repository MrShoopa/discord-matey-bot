import Bot from '../../Bot'
import BotDiscordActivity from './DiscordActivityStatus'

import TimelyFunctions from "./TimelyFunctions"
import BotLoggerFunctions from '../general/LoggerFunctions'

import BotModuleMusic from "../music/MusicFunctions"

export default class PostReadyFunctions {
    static run() {

        this.loadClients()

        this.postBotConnectDataFetch()

        BotLoggerFunctions.instantiateLogFolder()

        BotDiscordActivity.updateRandomStatus()

        TimelyFunctions.timeContexual()
    }

    static loadClients() {
        BotModuleMusic.loadClients()
    }

    static postBotConnectDataFetch() {
        let bot: Bot = globalThis.bot

        bot.populateRestrictedRoleList()
    }
}
