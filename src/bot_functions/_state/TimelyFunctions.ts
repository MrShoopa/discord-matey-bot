import BotTimeKeeper from '../_state/TimeKeeper.js'

import BotDiscordActivity from './DiscordActivityStatus.js'
import BotModuleSwearJar from '../novelty/swear/SwearJarFunctions.js'
import BotModuleBirthday from '../novelty/birthday/BirthdayFunctions.js'
import BotData from '../DataHandler.js'
import BotSubscriptionHandler from './SubscriptionHandler.js'

export default class TimelyFunctions {
    static get timeSave() {
        return BotTimeKeeper.getTimeData()
    }
    static set timeSave(newData) {
        BotTimeKeeper.updateTimeData(newData)
    }

    private static _now: Date

    static doneForHour: boolean
    static doneForDateMonth: boolean
    static doneForMonth: boolean

    static get now() {
        if (globalThis.prod_mode)
            TimelyFunctions._now = new Date(Date.now() + (globalThis.offsetHour * 3600000))
        else
            TimelyFunctions._now = new Date()
        // TimelyFunctions._now = new Date()
        return TimelyFunctions._now
    }

    static timeContexual(pollTime: number = 60000) {
        let timeObject = this.timeSave
        timeObject.last_initiliazed = new Date().toString()

        setInterval(() => this.runTimeSensitive(), pollTime)
        setInterval(() => console.log(`${new Date().toString()}: I sit...`), 3600000)

        this.timeSave = timeObject
    }

    static runTimeSensitive(log?: boolean) {
        this.checkLastRun()

        BotSubscriptionHandler.RunSubscribedTasks()

        if (!this.doneForDateMonth) {

            if (this.now.getDate() === 1)
                BotModuleSwearJar.printSwearStats()

            BotModuleBirthday.checkBirthdaysToday(true)

            this.doneForDateMonth = true
        }

        if (!this.doneForHour) {
            BotDiscordActivity.updateRandomStatus()
            if (globalThis.prod_mode) {
                BotData.updateS3()
            }
            this.doneForHour = true
        }

        if (log) console.info(`Timely functions ran at ${new Date()}.`)

        this.updateLastRun()
    }

    static checkLastRun() {
        let timeObject = this.timeSave

        if (isNaN(Date.parse(timeObject.last_ran_functions.time)))
            timeObject.last_ran_functions.time = new Date(0).toString()

        let lastRun: Date

        if (globalThis.offsetHour && globalThis.prod_mode)
            lastRun = new Date(new Date(timeObject.last_ran_functions.time).getTime() + (globalThis.offsetHour * 3600000));
        else
            lastRun = new Date(timeObject.last_ran_functions.time)

        this.doneForHour =
            lastRun.getHours() == this.now.getHours()
        this.doneForDateMonth =
            lastRun.getDate() == this.now.getDate()
        this.doneForMonth =
            lastRun.getMonth() == this.now.getMonth()
    }

    static updateLastRun() {
        let timeObject = this.timeSave

        timeObject.last_ran_functions.time = new Date().toString()

        this.timeSave = timeObject
    }

}
