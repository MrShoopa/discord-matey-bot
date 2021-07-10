import SpotifyWebApi from 'spotify-web-api-node'
import Discord from 'discord.js'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

export default class BotModuleSpotify {
    static funcName = 'MegaSpotter'
    static Spotify: SpotifyWebApi

    static async fireSpotifyRecommendationMessage(message: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Spotify Rec Fetch', true)

        let query: string = message.content, limit = 1, finalQuery = ""

        if (query.includes(trigger))
            query = query.replace(trigger, '').trim()

        TRIGGERS.spotify.recomendations.limit.forEach(trig => {
            if (query.includes(trig)) {
                limit = parseInt(query.substr(query.indexOf(trig) + trig.length).trim())
                query = query.replace(query.substring(query.indexOf(trig)), '')
            }
        })
        if (query.includes('genre'))
            finalQuery += query.substring(query.indexOf('genre')).trim().replace(' ', '-')
        if (query.match(/(https?:\/\/open.spotify.com\/(track|user|artist|album)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/))
            finalQuery += " " + query.match(/(https?:\/\/open.spotify.com\/(track|user|artist|album)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/g).join(' ')

        if (!finalQuery.includes('genre'))
            if (!finalQuery)
                return message.channel.send('Fetch recommendations based of what?\nSee ```;help spotify``` for more info.')

        const response = await this.fetchBuiltRecommendationMessage(
            finalQuery, limit, message.channel as Discord.TextChannel)

        if (Array.isArray(response))
            response.forEach(part => {
                message.channel.send(part)
            });
        else
            message.channel.send({ embeds: [response] })

        return true
    }

    static async fetchBuiltRecommendationMessage(query: string, limit: number = 1, channel?: Discord.TextChannel | Discord.DMChannel) {
        let bot: Bot = globalThis.bot

        let recs = await this.fetchRecommendationsFromTextQuery(query, limit)
        if (recs === 'Error') {
            return bot.generateErrorMessage('There was an issue getting recommendations at the moment. Try again later.', this.funcName)
        } else if (recs == null) {
            return bot.generateErrorMessage(`Couldn't find any recommendations from your query.\`\`\`; help spotify\`\`\` for help.`, this.funcName)
        }

        query = query.trim()

        let built = new Discord.MessageEmbed()
            //.setURL(query)
            .setTitle('Spotify Recommends...')
            .setColor('GREEN')
            .setDescription(`Based off: ${query.replace(' ', '\n+ ')}`)
            //.setThumbnail(songInfo.thumbnail)
            .setFooter(this.funcName, 'https://www.freepnglogos.com/uploads/spotify-logo-png/spotify-download-logo-30.png');

        (recs as SpotifyApi.RecommendationsFromSeedsResponse).tracks.forEach(track => {
            built.addField(track.name + ' - ' + track.artists.map(a => a.name).join(', ').trim(), track.external_urls.spotify)
        })

        return built
    }


    static async fetchRecommendationsFromTextQuery(query: string, limit: number = 5) {
        try {
            var recObj = { seed_artists: [], seed_tracks: [], seed_genres: [], limit: limit }
            let querySplits = query.split(' ')
            for (let q of querySplits) {
                if (q.includes('track/')) {
                    let trackId = (await BotModuleSpotify.Spotify.getTrack(q.substring(q.indexOf('k/') + 2).trim())).body.id
                    recObj.seed_tracks.push(trackId)
                }
                if (q.includes('artist/')) {
                    let artistId = (await BotModuleSpotify.Spotify.getArtist(q.substring(q.indexOf('t/') + 2).trim())).body.id
                    recObj.seed_artists.push(artistId)
                }
                if (q.includes('genre'))
                    recObj.seed_genres.push(q.substring(q.indexOf('genre') + 6).trim().split(' ')[0])
            }

            const recomendations =
                await BotModuleSpotify.Spotify.getRecommendations(recObj)
                    .then(recs => recs)
                    .catch(e => { throw e })

            return recomendations.body
        } catch (e) {
            console.error(`Error fetching recommendations through Spotify API!`)

            if (e.message === 'Unauthorized')
                console.warn(`Please update your Spotify API token.`)
            if (e.code === 404)
                return null

            let bot: Bot = globalThis.bot
            bot.saveBugReport(e, this.fetchRecommendationsFromTextQuery.name, true)
            return 'Error'
        }
    }

    static async fireGenresListMessage(message: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Spotify genre fetch', true)

        //TODO Add type for function
        var genres = await BotModuleSpotify.Spotify.getAvailableGenreSeeds()
            .then(g => g)
            .catch((e: Error) => {
                let bot: Bot = globalThis.bot
                bot.saveBugReport(e, this.fireGenresListMessage.name, true)
                return message.channel.send(`Couldn't fetch Spotify genres at the moment.`)
            })

        if (genres instanceof Discord.Message)
            return `This doesn't work yet :)`

        let response = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('Available Spotify Genre Codes')
            .setDescription(genres.body.genres.join('\n'))
            .setFooter(this.funcName, 'https://www.freepnglogos.com/uploads/spotify-logo-png/spotify-download-logo-30.png');

        return message.channel.send({ embeds: [response] })
    }

    static async initAPI() {
        this.Spotify = await new SpotifyWebApi({ clientId: AUTH.spotify.client_id, clientSecret: AUTH.spotify.client_secret })
        let token = (await this.Spotify.clientCredentialsGrant()).body.access_token
        this.Spotify.setAccessToken(token)
    }
}