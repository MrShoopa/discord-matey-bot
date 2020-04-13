import Bot from '../../Bot'
import BotDiscordActivity from './DiscordActivityStatus'

import TimelyFunctions from "./TimelyFunctions"
import BotLoggerFunctions from '../general/LoggerFunctions'

import BotModuleMusic from "../music/MusicFunctions"
import BotData from '../DataHandler'

export default class PostReadyFunctions {
    static run() {

        this.loadClients()

        this.postBotConnectDataFetch()

        BotLoggerFunctions.instantiateLogFolder()

        if (this.checkProdMode) {

        }

        if (this.checkDevMode()) {
            this.applyDevMode()
        } else {
            globalThis.bot.user.setUsername("Megadork");
            BotDiscordActivity.updateRandomStatus()
        }

        TimelyFunctions.timeContexual()
    }

    static loadClients() {
        if (this.checkProdMode()) {
            BotData.initS3()
        }

        BotModuleMusic.loadClients()
    }

    static postBotConnectDataFetch() {
        let bot: Bot = globalThis.bot

        bot.populateRestrictedRoleList()
    }

    static checkDevMode() {
        if (globalThis.dev_mode) {
            console.log('~~~~~~~~~~~Dev mode enabled.~~~~~~~~~~\n')

            return true
        }
    }

    static checkProdMode() {
        if (globalThis.prod_mode) {
            console.log('~~~~~~~~~~~!!!!!  PROD ENABLED !!!!!~~~~~~~~~~\n')

            return true
        }
    }

    static applyDevMode() {
        let bot: Bot = globalThis.bot

        //BotDiscordActivity.useDevModeStatus()

        //bot.user.setUsername("`B8tadork");
    }
}
