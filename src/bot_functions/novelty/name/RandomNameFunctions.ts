import Discord from 'discord.js'
import Bot from "../../../Bot"
import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

import { uniqueNamesGenerator, Config, names, colors, adjectives, animals, starWars } from 'unique-names-generator';
import PHRASES_NAME_CHANGE from '../../../bot_knowledge/phrases/phrases_name_change.json'

export default class BotModuleNameGenerator {
    static processRandomNameRequest(message: Discord.Message = globalThis.bot.context) {

        for (const trigger of TRIGGERS.name_change.star_wars)
            if (message.toString().toLowerCase().startsWith(trigger))
                return this.giveUserRandomName(message.member, 'starwars')
        for (const trigger of TRIGGERS.name_change.funky)
            if (message.toString().toLowerCase().startsWith(trigger))
                return this.giveUserRandomName(message.member, 'funky')
        for (const trigger of TRIGGERS.name_change.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return this.giveUserRandomName(message.member)
    }

    static giveUserRandomName(member: Discord.GuildMember, custom?: string, punishment?: boolean) {
        let bot: Bot = globalThis.bot
        bot.preliminary(bot.context.toString(), 'Random Name Change', true)

        var name: string
        if (custom?.includes('funky'))
            name = this.generateRandomNameFunky()
        else if (custom?.includes('starwars'))
            name = this.generateRandomNameStarWars()
        else
            name = this.generateRandomName()

        this.changeMemberName(member, name, punishment, true).then(suc => {
            if (suc)
                if (punishment)
                    member.lastMessage.channel.send(Bot.fetchRandomPhrase(PHRASES_NAME_CHANGE.response.punishment))
        }).catch(err => {

        })

    }

    static async changeMemberName(member: Discord.GuildMember, name: string, noReply: boolean, automated: boolean) {
        console.log(`Name Generator: Changing ${member.user.username}'s name to '${name}' here!`)

        try {
            await member.edit({ nick: name }).catch(err => { throw err })

            if (!noReply)
                member.lastMessage.channel.send(Bot.fetchRandomPhrase(PHRASES_NAME_CHANGE.response.user_demanded))
            return true
        } catch (err) {
            if (!automated)
                if (err.message.includes('Missing Permissions'))
                    member.lastMessage.channel.send(`Looks like you're more powerful than I am in this server! Can't change your name...`)
                else
                    member.lastMessage.channel.send(`I couldn't change your name for some reason...`)
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
