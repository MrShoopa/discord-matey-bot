import Bot from "../../Bot"

import PHRASES from '../../bot_knowledge/phrases/phrases_fun.json'

export default class BotModuleFun {

    static rollDice(number: number = 6, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Dice roll', true)

        let rolled = Math.floor(Math.random() * (number + 1))

        bot.context.channel.send(`🎲... ${rolled}!`)
    }

    static eightBall(override?: MagicBallSentiment, trigger?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Magic 8 Ball', true)

        let rolled = override ? override : Math.floor(Math.random() * 3) + 1

        switch (rolled) {
            case 1:
                bot.context.channel.send(Bot.fetchRandomPhrase(PHRASES.magic_ball.negative) + ' 🎱')
                break
            case 2:
                bot.context.channel.send(Bot.fetchRandomPhrase(PHRASES.magic_ball.unsure) + ' 🎱')
                break
            case 3:
                bot.context.channel.send(Bot.fetchRandomPhrase(PHRASES.magic_ball.positive) + ' 🎱')
                break
        }

    }

}

enum MagicBallSentiment {
    Positive = 1,
    Unsure = 2,
    Negative = 3
}