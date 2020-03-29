import Bot from "../../Bot"

export default class BotModuleFun {

    static rollDice(number: number = 6, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Dice roll', true)

        let rolled = Math.floor(Math.random() * (number + 1))

        bot.context.channel.send(`🎲... ${rolled}!`)
    }

}