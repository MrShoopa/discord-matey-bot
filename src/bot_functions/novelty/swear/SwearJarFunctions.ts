import Discord, { Guild } from 'discord.js'
import Bot from "../../../Bot"
import BotData from "../../DataHandler"
import { Audio, Data } from '../../../types/index'
import { you } from '../../../user_creds.json'

import PHRASES_SWEAR_JAR from '../../../bot_knowledge/phrases/phrases_swear_jar.json'
import { swear_jar_triggers } from '../../../bot_knowledge/triggers/triggers.json'
import BotModuleSwearWhitelist from './WhitelistFunctions'
import BotModuleSwearBlacklist from './BlacklistFunctions'
import BotModuleNameGenerator from '../name/RandomNameFunctions'

export default class BotModuleSwearJar {
    static dingUser(trigger: string) {
        let bot: Bot = globalThis.bot
        let words: string[] =
            bot.context.toString().toLowerCase().split(" ")
        let wordMatches: number = 0

        bot.preliminary(trigger, 'Swear Jar')

        for (const word of words)
            this.checkForSoundReply(word, bot.context)

        for (const word of words)
            if (BotModuleSwearBlacklist.banUserIfInBlacklist(word, bot.context.member))
                return

        for (const word of words) {
            if (BotModuleSwearWhitelist.checkIfWordWhitelistedForRole(word, bot.context.member))
                wordMatches -= this.matchWord(word)
            else
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
                .setColor('PINK')
                //.setTitle(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.bad_language_detected))
                //.setAuthor('Your Friendly Neighborhood Megadork ✝', bot.user.avatarURL())
                .setDescription(response)
                //.setImage(bot.context.author.avatarURL()) <- Noise
                .addFields({
                    name: `Watch out, ${bot.context.member.displayName}!`,
                    value: `Your swear score has been updated to ${userData.swear_score}`
                })

            this.thresholdCheck(userData)

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
                    '..\\..\\..\\..\\bot_knowledge\\images\\dedede-christian.jpg',
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
            else if (word.startsWith(trigger) && word.length < trigger.length + 1) {
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

    static async replyWithSound(message: Discord.Message | Discord.PartialMessage, sound: Audio.SFX) {
        let bot: Bot = globalThis.bot

        let userVC = message.member.voice.channel

        if (userVC) {
            let connection = await userVC.join()

            console.log(`Swear Jar: Playing ${sound.name} -for-> ${message.author.username}`)
            bot.playSFX(connection, sound)
        } else {
            console.log(`Swear Jar: Skipped playing ${sound.name} -for-> ${message.author.username}. No voice connection.`)
        }
    }

    static checkForSoundReply(word: string, message: Discord.Message | Discord.PartialMessage) {
        const list = you.word_list.sound_reply

        for (let key of Object.keys(list))
            for (let cand of list[key])
                if (word === cand) {
                    let bot: Bot = globalThis.bot
                    console.log(`Swear Jar: Playing SFX for matched word '${word}' towards '${message.author.username}'`)
                    try {
                        bot.playAudioFromURL(key, false, false, null, true)
                    } catch (err) {
                        console.log(`Swear Jar: Failed to play SFX on this key '${key}'`)
                    }
                }
    }

    static thresholdCheck(userData: Data.UserSave) {
        let score = userData.swear_score
        let message: Discord.Message = globalThis.bot.context
        console.log(`Swear Jar: Doing treshold check...`)

        if ((score / 100) == 0) {
            console.log(`Swear Jar: Giving the user a random meme.`)
            //TODO
        } else if ((score / 1000) == 0) {
            console.log(`Swear Jar: Giving the user a random name.`)

            BotModuleNameGenerator.giveUserRandomName(message.member, 'funky', true)
        } else {
            console.log(`Swear Jar: ...no checkpoint reached.`)
            return
        }

        console.log(`Swear Jar: ... checkpoint matched! Something happened to the user!`)
    }

    static toggleUserJar(message: Discord.Message | Discord.PartialMessage, trigger?: string) {
        if (trigger) {
            let bot: Bot = globalThis.bot
            bot.preliminary(trigger, 'Toggle User Swear Jar', true)
        }

        let newBoolean = BotData.toggleUserProperty(message.author.id, 'swear_jar')

        if (newBoolean)
            message.reply(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.enable))
        else
            message.reply(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.disable))

        return true
    }

}