import Discord from 'discord.js'
import Bot from '../../../../Bot'

import BotModuleBlizzard from './BlizzardMasterFunctions'

import { blizard } from '../../../../bot_knowledge/triggers/triggers.json'

export default class BotModuleWarcraft {
    static Blizzard = BotModuleBlizzard.Blizzard

    static async fireWarcraftProfileMessage(query: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Image Search', true)

        let userQuery: string | string[] = query.toString().replace(trigger, '').trim()

        userQuery = userQuery.replace('this', '').replace('from', '').replace('of', '').split(' ')

        if (userQuery.length != 2)
            return query.channel.send('Invalid WoW Profile fetch request input. (*megadork help blizzard* for more info)')

        let character = userQuery[0], realm = userQuery[1]

        let profile = await this.fetchWarcraftProfile(realm, character)

        let message = new Discord.MessageEmbed()
            .setAuthor('MegaGoog Image Searcher 📷')
            .setColor('BLUE')
            .setFooter(`Blizzard - WoW Info`,
                'https://i.ya-webdesign.com/images/world-of-warcraft-icon-png-8.png')
            .setImage(item.toString())

    }

    static async fetchWarcraftProfile(realm: string, character: string) {
        return await this.Blizzard.query(`/profile/wow/character/${realm}/${character}`)
            .then((data) => {
                console.log(data)
            }).catch(e => {
                console.error(`Error fetching song lyrics through Blizzard API!`)

                if (e.code === '')
                    console.info(`Please update your Battle.net API credentials.`)

                let bot: Bot = globalThis.bot
                bot.saveBugReport(e, this.fetchWarcraftProfile.name, true)
                return null
            })
    }
}