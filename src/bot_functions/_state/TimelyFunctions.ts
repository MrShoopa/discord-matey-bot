import BotSwearJarModule from "../novelty/swear/SwearJarFunctions"
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
    }

    static runTimeSensitive() {
        this.checkLastRun()

        if (!this.doneForDay) {

            if (this.now.getDate() === 1)
                BotSwearJarModule.printSwearStats()

            BotModuleBirthday.checkBirthdays()

            this.doneForDay = true
        }

        if (!this.doneForHour) {

            this.doneForHour = true
        }

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
