import Bot from '../../Bot'
import BotDiscordActivity from './DiscordActivityStatus'

import TimelyFunctions from "./TimelyFunctions"
import BotLoggerFunctions from '../general/LoggerFunctions'

import BotModuleMusic from "../music/MusicFunctions"

export default class PostReadyFunctions {
    static run() {

        this.loadClients()

        this.postBotConnectDataFetch()

        globalThis.devMode = this.checkDevMode()

        BotLoggerFunctions.instantiateLogFolder()

        if (!globalThis.devMode) {
            globalThis.bot.user.setUsername("Megadork");
            BotDiscordActivity.updateRandomStatus()
        } else {
            this.applyDevMode()
        }

        TimelyFunctions.timeContexual()
    }

    static loadClients() {
        BotModuleMusic.loadClients()
    }

    static postBotConnectDataFetch() {
        let bot: Bot = globalThis.bot

        bot.populateRestrictedRoleList()
    }

    static checkDevMode() {
        var myArgs = process.argv.slice(2);
        return myArgs.some(arg => {
            if (arg === 'dev-mode') {
                console.log('~~~~~~~~~~~Dev mode enabled.~~~~~~~~~~\n')
                return true
            }
        })
    }

    static applyDevMode() {
        let bot: Bot = globalThis.bot

        BotDiscordActivity.useDevModeStatus()

        bot.user.setUsername("~B8tadork");
    }
}
