import SpotifyWebApi from 'spotify-web-api-node'
import Discord from 'discord.js'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

export default class BotModuleSpotify {
    static Spotify = new SpotifyWebApi({ clientId: AUTH.spotify.client_id, clientSecret: AUTH.spotify.client_secret })

    static async fireSpotifyRecommendationMessage(message: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Spotify Rec Fetch', true)

        let query: string = message.content, limit = 1

        if (query.includes(trigger))
            query = query.replace(trigger, '').trim()

        TRIGGERS.spotify.recomendations.limit.forEach(trig => {
            if (query.includes(trig))
                limit = parseInt(query.substr(query.indexOf(trig) + query.length).trim())
        })
        query = query.match(/(https?:\/\/open.spotify.com\/(track|user|artist|album)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/)[0]

        if (!query)
            return message.channel.send('Fetch recommendations based of what?\nSee ```;help spotify``` for more info.')

        const response = await this.fetchBuiltRecommendationMessage(
            query, limit)

        if (Array.isArray(response))
            response.forEach(part => {
                message.channel.send(part)
            });
        else
            message.channel.send(response)

        return true
    }

    static async fetchBuiltRecommendationMessage(query: string, limit: number = 1) {
        query = query.toLowerCase()

        //let seed = await BotModuleSpotify.Spotify.getGeneric(query)

        let recs = await this.fetchRecommendationsFromTextQuery(query, limit)
        if (recs === 'Error') {
            return 'There was an issue getting recommendations at the moment. Try again later.'
        } else if ((recs as SpotifyApi.RecommendationsFromSeedsResponse).tracks.length == 0) {
            return `Couldn't find any recommendations from your query.\`\`\`; help spotify\`\`\` for help.`
        }

        let built = new Discord.MessageEmbed()
            .setURL(query)
            .setTitle('Spotify Recommendations')
            .setColor('GREEN')
            .setDescription(`Based off: ${query}`)
            //.setThumbnail(songInfo.thumbnail)
            .setFooter('MegaSpotter', 'https://cdn.worldvectorlogo.com/logos/spotify.svg');

        (recs as SpotifyApi.RecommendationsFromSeedsResponse).tracks.forEach(track => {
            built.addField(track.name + track.artists.join(', ').trim(), track.preview_url)
        })

        return built
    }


    static async fetchRecommendationsFromTextQuery(query: string, limit: number = 5) {
        try {
            var recObj: SpotifyApi.RecommendationsOptionsObject = {}
            if (query.includes('track/'))
                recObj.seed_tracks = (await BotModuleSpotify.Spotify.getTrack(query.substring(query.indexOf('k/') + 2).trim())).body.id
            else if (query.includes('artist/'))
                recObj.seed_artists = (await BotModuleSpotify.Spotify.getArtist(query.substring(query.indexOf('t/') + 2).trim())).body.id
            else if (query.includes('genre'))
                recObj.seed_genres = query.substring(query.indexOf('genre') + 5)
            const recomendations =
                await BotModuleSpotify.Spotify.getRecommendations(recObj)
                    .then(recs => recs)
                    .catch(e => { throw e })

            return recomendations.body
        } catch (e) {
            console.error(`Error fetching recommendations through Spotify API!`)

            if (e.message === 'Unauthorized')
                console.warn(`Please update your Spotify API token.`)

            let bot: Bot = globalThis.bot
            bot.saveBugReport(e, this.fetchRecommendationsFromTextQuery.name, true)
            return 'Error'
        }
    }

    static async fireGenresListMessage(message: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Spotify genre fetch', true)

        var genres = await BotModuleSpotify.Spotify.getMe()
        /* .then(g => g.genres)
        .catch(e => {
            let bot: Bot = globalThis.bot()
            bot.saveBugReport(e, this.fireGenresListMessage.name, true)
            return message.channel.send(`Couldn't fetch Spotify genres at the moment.`)
        }) */

        if (genres instanceof Discord.Message)
            return `This doesn't work yet :)`

        /*  let response = new Discord.MessageEmbed()
             .setColor('GREEN')
             .setTitle('Available Spotify Genre Codes')
             .setDescription(genres.join('\n'))
             .setFooter('MegaSpotter', 'https://cdn.worldvectorlogo.com/logos/spotify.svg') */

        //return message.channel.send(response)
    }
}