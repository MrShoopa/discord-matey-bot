import Bot from "../../../Bot"
import BotData from "../../DataHandler"

import PHRASES_SWEAR_JAR from '../../../bot_knowledge/phrases/phrases_swear_jar.json';

export default class BotSwearJarModule {
    static dingUser(trigger: string) {
        let bot: Bot = globalThis.bot
        trigger.toLowerCase()

        //TODO: Truncate message when swearing multiple times

        if (bot.context.toString().toLowerCase().split(" ").includes(trigger)) {

            bot.preliminary(trigger, 'Swear Jar')

            // TODO? Shrink code further
            let userData = BotData.getUserData(bot._context.author.id)

            if (userData === undefined) {
                BotData.createUserData(bot._context.author.id)
                userData = BotData.getUserData(bot._context.author.id)
            }

            //  Get current swear count
            try {
                if (!userData.swearScore) {
                    userData.swearScore = 1
                    bot._context.reply(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.new_user))
                } else userData.swearScore++
            } catch (error) {
                console.log('User data malfunction!')
                console.error(error)
                bot.saveBugReport(error)
            }

            BotData.updateUserData(bot._context.author.id, userData)

            return bot._context.reply(`
                🚨✝${Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.bad_word_detected)}✝🚨
                ${Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.one_point)}!\n
                **Times you have sworn: ${userData.swearScore}!**`)
        }
    }

    // TODO
    static printSwearStats() {
        console.log('Swear stats of the month!')
    }
}