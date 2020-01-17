import BotSwearJarModule from "../novelty/swear/SwearJarFunctions"

export default class TimelyFunctions {
    static timeContexual() {
        let now: Date = new Date()

        //TODO
        if (now.getDate() === 1)
            BotSwearJarModule.printSwearStats()
    }
}
