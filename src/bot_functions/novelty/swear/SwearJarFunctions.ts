import Discord, { Guild } from 'discord.js'
import Bot from "../../../Bot"
import BotData from "../../DataHandler"

import { swear_jar_triggers } from '../../../bot_knowledge/triggers/triggers.json'

import PHRASES_SWEAR_JAR from '../../../bot_knowledge/phrases/phrases_swear_jar.json'
import BotModuleSwearWhitelist from './WhitelistFunctions'
import BotModuleSwearBlacklist from './BlacklistFunctions'

export default class BotModuleSwearJar {
    static dingUser(trigger: string) {
        let bot: Bot = globalThis.bot
        let words: string[] =
            bot.context.toString().toLowerCase().split(" ")
        let wordMatches: number = 0

        bot.preliminary(trigger, 'Swear Jar')

        for (const word of words)
            BotModuleSwearBlacklist.banUserIfInBlacklist(word, bot.context.member)

        for (const word of words) {
            if (BotModuleSwearWhitelist.checkIfWordWhitelistedForRole(word, bot.context.member))
                wordMatches -= this.matchWord(word)
            wordMatches += this.matchWord(word)

            if (wordMatches <= 0)
                wordMatches = 0
        }

        if (wordMatches !== 0) {
            let userData = BotData.getUserData(bot.context.author.id, true)

            if (userData === undefined)
                userData = BotData.createUserData(bot.context.author.id)

            //  Get current swear count
            try {
                if (!userData.swear_score) {
                    userData.swear_score = wordMatches
                    bot.context.reply(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.new_user))
                } else userData.swear_score += wordMatches
            } catch (error) {
                console.error(new EvalError(`Error updating swear score for ${bot.context.author.username}!`))
                bot.saveBugReport(error, this.dingUser.name)
            }

            BotData.updateUserData(bot.context.author.id, userData)

            let response = function determineResponse() {
                if (wordMatches == 1)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.one_point)
                else if (wordMatches < 5)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_small)
                else if (wordMatches < 10)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_medium)
                else if (wordMatches < 100)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_large)
                else if (wordMatches < 1000)
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_metricfrickton)
                else
                    return Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.multi_unbound)

            }()

            let swearDetectedMessage = new Discord.MessageEmbed()
                .setColor('pink')
                .setTitle(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.bad_language_detected))
                .setAuthor('Your Friendly Neighborhood Megadork ✝', bot.user.avatarURL())
                .setDescription(response)
                //.setImage(bot.context.author.avatarURL()) <- Noise
                .addFields({
                    name: `Watch out, ${bot.context.member.displayName}!`,
                    value: `Your score has been updated to ${userData.swear_score}`
                })

            return bot.context.channel.send(swearDetectedMessage)
        }
    }

    static generateSwearStatsMessage(guild: Guild) {

        console.log('Swear stats of the month!')

        let swearingUsers =
            BotData.getAllUserDataWithAttribute('swear_score')
                .sort((a, b) =>
                    b.swear_score - a.swear_score
                )

        if (swearingUsers) {

            const att =
                new Discord.MessageAttachment(__dirname +
                    '../../../../bot_knowledge/images/dedede-christian.jpg',
                    'dedede-christian.jpg')

            let swearStatsMessage = new Discord.MessageEmbed()
                .setTitle('Swear Kings of the Month! 🤬')
                .setAuthor(`✝ Pope Megadork ✝`)
                .setColor('DARK_VIVID_PINK')
                .setDescription(`How many times have y'al spoke the nasties??!?!`)
                .setFooter(`congrats to y'all`)
                .attachFiles([att])
                .setImage('attachment://dedede-christian.jpg')
                .setTimestamp(new Date().getMonth() - 1)

            guild.members.cache.forEach(member => {
                swearingUsers.some(user => {
                    if (member.user.id == user?._id)
                        swearStatsMessage
                            .addFields({ name: member.user.username, value: user.swear_score })
                })
            })

            return swearStatsMessage
        } else return null
    }

    static printSwearStats() {
        let bot: Bot = globalThis.bot

        bot.guilds.cache.forEach(guild => {
            let msg = this.generateSwearStatsMessage(guild)

            if (msg && guild.systemChannel)
                guild.systemChannel.send(msg)
        })
    }

    static matchWord(word: string) {
        let count = 0
        for (const trigger of swear_jar_triggers.bad_words) {

            if (word === trigger)
                return 1
            else if (word.startsWith(trigger)) {
                count++

                let index = trigger.length
                while (word.length > index) {
                    console.log(word.substring(index, index + trigger.length))
                    if (word.substring(index, index + trigger.length) == trigger)
                        count++
                    index += trigger.length
                }
            }
        }

        return count
    }
}