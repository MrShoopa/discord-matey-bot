import Discord from 'discord.js'
import Bot from '../../../Bot'
import JikanTS from 'jikants'

export default class BotModuleAnime {

    static async fireAnimeInfoMessageOfName(trigger: string) {
        let bot: Bot = globalThis.bot

        bot.context.channel.send(await this.fetchBuiltMsgAnimeInfoMessageOfName(bot.context.toString(), trigger))
    }

    static async fetchBuiltMsgAnimeInfoMessageOfName(query: string, trigger?: string):
        Promise<Discord.Message | Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'jikanTS anime fetch', true)

        query = query.toLowerCase()

        if (query.includes(trigger))
            query = query.replace(trigger, '').trim()

        let anime = await BotModuleAnime.fetchAnimeOfName(query)

        if (anime === undefined)
            return new Discord.Message(bot.user.client,
                { content: "I couldn't fetch swag info of your animoo at the moment." },
                bot.context.channel as Discord.TextChannel | Discord.DMChannel)

        return BotModuleAnime.generateAnimeInfoMessage(anime)
    }

    static generateAnimeInfoMessage(anime) {
        let message = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Sup weeb! Check out **${anime.title}**:\n`)
            .setAuthor('Megaweeb Finds')
            .setImage(anime.image_url)
            .setURL(anime.url)
            .addFields(
                { name: 'MAL Score', value: `${anime.score}`, inline: true },
                { name: 'Rated', value: `${anime.rated}`, inline: true },
                { name: 'Synopsis', value: `${anime.synopsis}` }
            )
        if (anime.airing)
            message.setFooter('This show is currently airing!')

        return message
    }

    static async fetchAnimeOfName(name: string = 'Boku', multipleResults = false) {
        return await JikanTS.Search.search(name, "anime")
            .catch(error => {
                let bot: Bot = globalThis.bot
                bot.saveBugReport(error, this.fetchAnimeOfName.name)
                return null
            })
            .then(anime => {
                console.log(`Anime fetched for ${name}`)
                if (anime)
                    if (multipleResults)
                        return anime.results
                    else
                        return anime.results[1]
            })
    }
}