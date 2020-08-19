import Discord, { MessageEmbed } from 'discord.js'
import Bot from "../../../Bot"
import BotData from "../../DataHandler"
import { Audio } from '../../../types/index'
import { you } from '../../../user_creds.json'

import PHRASES_SWEAR_JAR from '../../../bot_knowledge/phrases/phrases_swear_jar.json'
import { swear_jar_triggers } from '../../../bot_knowledge/triggers/triggers.json'
import BotModuleSwearWhitelist from './WhitelistFunctions'
import BotModuleSwearBlacklist from './BlacklistFunctions'
import BotModuleNameGenerator from '../name/RandomNameFunctions'
import BotModuleReddit from '../../fetching/reddit/RedditFunctions'

export default class BotModuleSwearJar {
    static dingUser(message: Discord.Message, trigger: string, keepStat?: boolean) {
        let bot: Bot = globalThis.bot
        let words: string[] =
            message.toString().toLowerCase().split(" ")
        let wordMatches: number = 0
        let oldNum: number, newNum: number

        bot.preliminary(trigger, 'Swear Jar')

        for (const word of words)
            this.checkForSoundReply(word, message)

        for (const word of words)
            if (BotModuleSwearBlacklist.banUserIfInBlacklist(word, message.member, message))
                return

        for (const word of words) {
            if (BotModuleSwearWhitelist.checkIfWordWhitelistedForRole(word, message.member))
                wordMatches -= this.matchWord(word)
            else
                wordMatches += this.matchWord(word)

            if (wordMatches <= 0)
                wordMatches = 0
        }

        if (wordMatches !== 0) {

            let userData = BotData.getUserData(message.author.id, true)

            if (userData === undefined)
                userData = BotData.createUserData(message.author.id)

            oldNum = userData.swear_score ? userData.swear_score : 0

            //  Get current swear count
            try {
                if (!userData.swear_score) {
                    userData.swear_score = wordMatches
                    message.reply(Bot.fetchRandomPhrase(PHRASES_SWEAR_JAR.new_user))
                } else userData.swear_score += wordMatches
            } catch (error) {
                console.error(new EvalError(`Error updating swear score for ${message.author.username}!`))
                bot.saveBugReport(error, this.dingUser.name)
            }

            newNum = userData.swear_score

            BotData.updateUserData(message.author.id, userData)

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
                //.setImage(message.author.avatarURL()) <- Noise
                .addFields({
                    name: `Watch out, ${message.member.displayName}!`,
                    value: `Your swear score has been updated to ${userData.swear_score}`
                })

            this.thresholdCheck(oldNum, newNum)
            message.channel.send(swearDetectedMessage).then(message => {
                if (!keepStat) message.delete({ timeout: 3000, reason: 'Prevent clutter' })
            })

            return true
        }
    }

    static fireSwearCountInquiryMessage(message: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Swear Jar Check')

        let data = BotData.getUserData(message.author.id)

        if (data.swear_score > 0)
            message.reply(`you have sworn ${data.swear_score} times.`)
        else
            message.reply(`oh wow, you're clean! 👀`)

        return true
    }

    static generateSwearStatsMessage(guild: Discord.Guild) {

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

    static async thresholdCheck(oldNum: number, newNum: number, message: Discord.Message = globalThis.bot.context) {
        console.log(`Swear Jar: Doing treshold check...`)

        if (oldNum % 1000 < 1000 && newNum % 1000 < oldNum % 1000) {
            console.log(`Swear Jar: Giving the user a random name.`)

            BotModuleNameGenerator.giveUserRandomName(message.member, 'funky', true, true)
        } else if (oldNum % 100 < 100 && newNum % 100 < oldNum % 100) {
            console.log(`Swear Jar: Giving the user a random meme.`)
            let submission = await BotModuleReddit.fetchRandomSubmission('fiftyfifty'), extension = 'jpg'

            message.reply(`You reached a hundred new points! Here's a 50/50 image! Proceed with caution! \n\n **Topic: *${submission.data.title}***`)
            if (submission.data.url.includes('jpg') || submission.data.url.includes('png') || submission.data.url.includes('webm') || submission.data.url.includes('gif')) {
                if (submission.data.url.includes('gif')) extension = 'gif'
                message.channel.send({
                    files: [{
                        attachment: submission.data.url,
                        name: `SPOILER_FILE.${extension}`
                    }]
                })
            }
            else
                message.channel.send(new MessageEmbed({ title: "Mystery link...", url: submission.data.url, color: 'PINK' }))
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

        message.delete({ timeout: 3000, reason: 'Unclutter' })

        return true
    }

}