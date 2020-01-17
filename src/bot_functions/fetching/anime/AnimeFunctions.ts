import Discord from 'discord.js'
import Bot from '../../../Bot'

export default class BotModuleAnime {

    static async fetchBuiltMsgAnimeInfoMessageOfName(trigger?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'jikanTS anime fetch', true)

        let query =
            bot.context.toString().split(trigger).pop().length != 0 ?
                bot.context.toString().split(trigger).pop() :
                undefined

        let anime = await BotModuleAnime.fetchAnimeOfName(query)

        return bot.textChannel.send(BotModuleAnime.generateAnimeInfoMessage(anime))
    }

    static generateAnimeInfoMessage(anime) {
        let message = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Sup weeb! Check out **${anime.title}**:\n`)
            .setAuthor('Megaweeb Finds')
            .setImage(anime.image_url)
            .setURL(anime.url)
            .addField('MAL Score', `${anime.score}`, true)
            .addField('Rated', `${anime.rated}`, true)
            .addField('Synopsis', `${anime.synopsis}`)
        if (anime.airing)
            message.setFooter('This show is currently airing!')

        return message
    }

    static fetchAnimeOfName(name: string = 'Boku', multipleResults = false) {

        return new Promise((resolve, reject) => {
            import('jikants').then(JikanTS => {
                JikanTS.default.Search.search(name, "anime")
                    .catch(reason => {
                        console.log(reason)
                        reject(reason)
                    })
                    .then(anime => {
                        console.log(`Anime fetched for ${name}`)
                        if (anime)
                            multipleResults ?
                                resolve(anime.results) : resolve(anime.results[1])
                    })
            })
        })

    }
}