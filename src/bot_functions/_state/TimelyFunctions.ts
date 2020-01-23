import BotModuleSwearJar from "../novelty/swear/SwearJarFunctions"
import BotModuleBirthday from "../novelty/birthday/BirthdayFunctions"

export default class TimelyFunctions {
    static lastRun: Date
    private static _now: Date

    static doneForDay: boolean
    static doneForHour: boolean

    static get now() {
        TimelyFunctions._now = new Date()
        return TimelyFunctions._now
    }

    static timeContexual(pollTime: number = 60000) {
        setInterval(() => this.runTimeSensitive(), pollTime)
        setInterval(() => console.log(`${new Date().toISOString()}: I sit...`), 3600000)
    }

    static runTimeSensitive() {
        this.checkLastRun()

        if (!this.doneForDay) {

            if (this.now.getDate() === 1)
                BotModuleSwearJar.printSwearStats()

            BotModuleBirthday.checkBirthdaysToday(true)

            this.doneForDay = true
        }

        if (!this.doneForHour) {

            this.doneForHour = true
        }

        this.lastRun = this.now
    }

    static checkLastRun() {
        if (!this.lastRun)
            this.lastRun = new Date(0)

        if (this.lastRun.getDate() != this.now.getDate())
            this.doneForDay = false
        if (this.lastRun.getHours() != this.now.getHours())
            this.doneForHour = false
    }
}
