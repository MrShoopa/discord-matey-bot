import Discord from 'discord.js'
import Bot from '../../../../Bot'

import BotModuleBlizzard from './BlizzardMasterFunctions'

import { blizzard } from '../../../../bot_knowledge/triggers/triggers.json'

export default class BotModuleWarcraft {
    static Blizzard = BotModuleBlizzard.Blizzard

    static async fireWarcraftProfileMessage(query: Discord.Message | Discord.PartialMessage, trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Image Search', true)

        let userQuery: string | string[] = query.toString().replace(trigger, '').trim()

        userQuery = userQuery.toLowerCase().replace('this', '').replace('from', '').replace('of', '').replace('  ', ' ').replace(`'`, '').split(' ')

        // Multi-Word Realm Names
        if (userQuery.length > 2) {
            userQuery[userQuery.length - 1] = userQuery[userQuery.length - 1].replace(`'`, '')
            userQuery = [userQuery[0], userQuery.slice(1).join('-')]
        }

        if (userQuery.length != 2)
            return query.channel.send('Invalid WoW Profile fetch request input. (*megadork help blizzard* for more info)')

        let character = userQuery[0], realm = userQuery[1]

        let profile: any
        profile = await this.fetchWarcraftProfile(realm, character).catch(e => {
            if (e == 'Not Found')
                query.reply('that character does not exist in this realm.')
            if (e.response.status === 401 || e.response.status === 403)
                query.channel.send('WoW profile fetching does not work due to the dev needing to refresh something. Try again later.')

            return 'Error'
        })


        if (profile == 'Error')
            return true

        let image =
            await this.Blizzard.query(`/profile/wow/character/${realm}/${character}/character-media?namespace=profile-us&locale=en_US`)
        let title =
            await this.Blizzard.query(`/profile/wow/character/${realm}/${character}/titles?namespace=profile-us&locale=en_US`)
        /* TODO let guild =
            await this.Blizzard.query(`/profile/wow/guild/${realm}/${character}?namespace=profile-us&locale=en_US`)
        */
        let builtTitle = ""
        if (title.titles)
            title.titles.forEach(t => {
                builtTitle += t.name + ", "
            })
        else
            builtTitle = "Titleless Wanderer"
        builtTitle = builtTitle.slice(0, -2)

        let message = new Discord.MessageEmbed()
            .setAuthor(builtTitle)
            .setTitle(profile.name)
            .setDescription(`${profile.race.name} ${profile.character_class.name} of ${profile.realm.name}`)
            .setImage(image.assets[3].value)
            .setColor('BLUE')
            .setFooter(`Blizzard - WoW Info`,
                'https://i.ya-webdesign.com/images/world-of-warcraft-icon-png-8.png')

        if (profile.active_title?.name)
            message.setAuthor(profile.active_title.name)

        message.addFields(
            //TODO{ name: 'Guild', value: profile.guild?.name },
            { name: 'Faction', value: profile.faction.name },
            { name: 'Level', value: profile.level, inline: true },
            { name: 'Exp. at Level', value: profile.experience, inline: true },
            { name: 'Achievement Points', value: profile.achievement_points, inline: true },
            { name: 'Active Spec', value: profile.active_spec.name, inline: true },
            { name: 'Equipped Item Level', value: profile.equipped_item_level, inline: true },
        )

        return query.reply({ embeds: [message] })
    }

    static async fetchWarcraftProfile(realm: string, character: string) {
        return await this.Blizzard.query(`/profile/wow/character/${realm}/${character}?namespace=profile-us&locale=en_US`)
            .then((data) => {
                console.log(data)
                return data
            }).catch(e => {
                console.error(`Error fetching info through Blizzard API!`)

                if (e.response.status === 401 || e.response.status === 403)
                    console.error(`Please update your Battle.net API credentials.`)
                if (e.response.status === 404)
                    return 'Not Found'

                let bot: Bot = globalThis.bot
                bot.saveBugReport(e, this.fetchWarcraftProfile.name, true)
                throw e
            })
    }
}