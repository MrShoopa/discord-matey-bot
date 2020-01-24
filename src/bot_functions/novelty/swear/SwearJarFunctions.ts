import Discord from 'discord.js';
import Bot from "../../../Bot"
import BotData from "../../DataHandler"

import { swear_jar_triggers } from '../../../bot_knowledge/triggers/triggers.json'

import PHRASES_SWEAR_JAR from '../../../bot_knowledge/phrases/phrases_swear_jar.json';

export default class BotModuleSwearJar {
    static dingUser(trigger: string) {
        let bot: Bot = globalThis.bot
        let words: string[] =
            bot.context.toString().toLowerCase().split(" ")
        let matchedWords: number = 0

        bot.preliminary(trigger, 'Swear Jar')

        wordLoop:
        for (const word of words)
            for (const trigger of swear_jar_triggers.bad_words)
                if (word.includes(trigger)) {
                    matchedWords++
                    continue wordLoop
                }


        if (matchedWords !== 0) {
            let userData = BotData.getUserData(bot.context.author.id, true)

            if (userData === undefined)
                userData = BotData.createUserData(bot.context.author.id)

            //  Get current swear count
            try {
                if (!userData.swearScore) {
                    userData.swearScore = matchedWords
                    bot.context.reply(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.new_user))
                } else userData.swearScore += matchedWords
            } catch (error) {
                console.error(new EvalError(`Error updating swear score for ${bot.context.author.username}!`))
                bot.saveBugReport(error)
            }

            BotData.updateUserData(bot.context.author.id, userData)

            let response = function determineResponse() {
                if (matchedWords == 1)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.one_point)
                else if (matchedWords < 5)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_small)
                else if (matchedWords < 10)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_medium)
                else if (matchedWords < 100)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_large)
                else if (matchedWords < 1000)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_metricfrickton)
                else
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_unbound)

            }()

            let swearDetectedMessage = new Discord.MessageEmbed()
                .setColor('pink')
                .setTitle(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.bad_language_detected))
                .setAuthor('Your Friendly Neighborhood Megadork ✝', bot.user.avatarURL())
                .setDescription(response)
                .setImage(bot.context.author.avatarURL())
                .addField(`Watch out, ${bot.context.member.displayName}!`,
                    `Your score has been updated to ${userData.swearScore}`)

            return bot.context.channel.send(swearDetectedMessage)
        }
    }

    static printSwearStats() {
        console.log('Swear stats of the month!')

        var stats: string[]
        let data: Object = BotData.getUserDataFile()

        for (var userData in data) {
            /*  USER_LIST.forEach(userEntity => {
                if (userEntity.id === data[userData]._id) {
                    if (announce) { } //TODO

                    stats.push(`${userEntity.username}'s swear score:\t ${data[userData].swearScore}.`)
                    BOT.channels.
                }
            }) */
        }

        return stats.join('\n')
    }
}