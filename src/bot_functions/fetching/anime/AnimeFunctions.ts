import Discord from 'discord.js'
import Bot from '../../../Bot.js'

import { JikanApiClient, JikanApiType } from '@thorbens/jikan-api'

export default class BotModuleAnime {

    static MAL = new JikanApiClient()

    static async fireAnimeInfoMessageOfName(message: Discord.Message, trigger: string) {
        let fetchedMessage = await this.fetchBuiltMsgAnimeInfoMessageOfName(message.toString(), message.channel, trigger)
        message.channel.send({ embeds: [fetchedMessage] })
    }

    static async fireMangaInfoMessageOfName(message: Discord.Message, trigger: string) {
        let fetchedMessage = await this.fetchBuiltMsgMangaInfoMessageOfName(message.toString(), message.channel, trigger)
        message.channel.send({ embeds: [fetchedMessage] })
    }

    static async fetchBuiltMsgAnimeInfoMessageOfName(query: string, channel, trigger?: string):
        Promise<Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'MyAnimeList anime fetch', true)

        query = query.toLowerCase()

        if (query.includes(trigger))
            query = query.replace(trigger, '').trim()

        let anime = await BotModuleAnime.fetchAnimeOfName(query)

        if (anime === undefined)
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Anime broke?`)
                .setAuthor('Megaweeb Finds')
                .setDescription(`I couldn't fetch swag info of your animoo at the moment.`)

        return BotModuleAnime.generateInfoMessage(anime)
    }

    static async fetchBuiltMsgMangaInfoMessageOfName(query: string, channel, trigger?: string):
        Promise<Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'MyAnimeList manga fetch', true)

        query = query.toLowerCase()

        if (query.includes(trigger))
            query = query.replace(trigger, '').trim()

        let anime = await BotModuleAnime.fetchMangaOfName(query)

        if (anime === undefined)
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Manga broke?`)
                .setAuthor('Megaweeb Finds')
                .setDescription(`I couldn't fetch swag info of your mango at the moment.`)

        return BotModuleAnime.generateInfoMessage(anime)
    }

    static generateInfoMessage(anime) {
        let message = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Sup fellow weeb! Check out **${anime.title}**:\n`)
            .setAuthor('Megaweeb Finds')
            .setImage(anime.image_url)
            .setURL(anime.url)
        if (anime.synopsis)
            message.setDescription(`${anime.synopsis}`)

        if (anime.type)
            message.addFields({ name: 'Type', value: `${anime.type}`, inline: true })
        if (anime.score)
            message.addFields({ name: 'MAL Score', value: `${anime.score}`, inline: true })
        if (anime.start_date)
            message.setTimestamp(anime.start_date)
        if (anime.rated)
            message.addFields({ name: 'Rated', value: `${anime.rated}`, inline: true })

        if (anime.volumes)
            message.addFields({ name: 'Volumes', value: `${anime.volumes}`, inline: true })

        if (anime.airing)
            message.setFooter('This show is currently airing!')

        return message
    }

    static async fetchAnimeOfName(name: string = 'Boku', multipleResults = false) {
        return await this.MAL.search(name, JikanApiType.ANIME)
            .catch(error => {
                let bot: Bot = globalThis.bot
                bot.saveBugReport(error, this.fetchAnimeOfName.name, true)
                return null
            })
            .then(anime => {
                console.log(`Anime fetched for '${name}' via MAL`)
                if (anime)
                    if (multipleResults)
                        return anime.results
                    else
                        return anime.results[0]
            })
    }

    static async fetchMangaOfName(name: string = 'Boku', multipleResults = false) {
        return await this.MAL.search(name, JikanApiType.MANGA)
            .catch(error => {
                let bot: Bot = globalThis.bot
                bot.saveBugReport(error, this.fetchMangaOfName.name)
                return null
            })
            .then(anime => {
                console.log(`Manga fetched for '${name}' via MAL`)
                if (anime)
                    if (multipleResults)
                        return anime.results
                    else
                        return anime.results[1]
            })
    }
}