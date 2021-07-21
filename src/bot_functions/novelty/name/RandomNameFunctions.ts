import Discord from 'discord.js'
import Bot from '../../../Bot.js'
import TRIGGERS from '../../../bot_knowledge/triggers/triggers.js'

import { uniqueNamesGenerator, Config, names, colors, adjectives, animals, starWars } from 'unique-names-generator';
import PHRASES_NAME_CHANGE from '../../../bot_knowledge/phrases/phrases_name_change.js'

export default class BotModuleNameGenerator {
    static processRandomNameRequest(messageObj: Discord.Message = globalThis.bot.context) {

        for (const trigger of TRIGGERS.name_change.star_wars)
            if (messageObj.toString().toLowerCase().startsWith(trigger))
                return this.giveUserRandomName(messageObj, 'starwars')
        for (const trigger of TRIGGERS.name_change.funky)
            if (messageObj.toString().toLowerCase().startsWith(trigger))
                return this.giveUserRandomName(messageObj, 'funky')
        for (const trigger of TRIGGERS.name_change.default)
            if (messageObj.toString().toLowerCase().startsWith(trigger))
                return this.giveUserRandomName(messageObj)
    }

    static giveUserRandomName(messageObj: Discord.Message, custom?: string, punishment?: boolean, automated?: boolean) {
        let bot: Bot = globalThis.bot
        bot.preliminary(bot.context.toString(), 'Random Name Change', true)

        var name: string
        if (custom?.includes('funky'))
            name = this.generateRandomNameFunky()
        else if (custom?.includes('starwars'))
            name = this.generateRandomNameStarWars()
        else
            name = this.generateRandomName()

        this.changeMemberName(messageObj, name, punishment, automated).then(suc => {
            if (suc)
                if (punishment)
                    messageObj.channel.send(Bot.fetchRandomPhrase(PHRASES_NAME_CHANGE.response.punishment))
        }).catch(err => {

        })

    }

    static async changeMemberName(messageObj: Discord.Message, name: string, noReply: boolean, automated: boolean) {
        console.log(`Name Generator: Changing ${messageObj.member.user.username}'s name to '${name}' here!`)

        try {
            await messageObj.member.edit({ nick: name }).catch(err => { throw err })

            if (!noReply)
                messageObj.channel.send(Bot.fetchRandomPhrase(PHRASES_NAME_CHANGE.response.user_demanded))
            return true
        } catch (err) {
            if (!automated)
                if (messageObj.toString().includes('Missing Permissions'))
                    messageObj.channel.send(`Looks like you're more powerful than I am in this server! Or... I can't change nicknames. Can't change your name...`)
                else
                    messageObj.channel.send(`I couldn't change your name for some reason...`)
        }

    }

    // Name Generators

    static generateRandomName() {
        console.log(`Name Generator: Fetching random name...`)

        const config: Config = {
            dictionaries: [names],
            length: 1
        }

        return uniqueNamesGenerator(config);
    }

    static generateRandomNameStarWars() {
        console.log(`Name Generator: Fetching random Star Wars name...`)

        const config: Config = {
            dictionaries: [starWars],
            length: 1
        }

        return uniqueNamesGenerator(config);
    }

    static generateRandomNameFunky() {
        console.log(`Name Generator: Fetching random funky name...`)

        const config: Config = {
            dictionaries: [colors, adjectives, animals]
        }

        return uniqueNamesGenerator(config);
    }
}
