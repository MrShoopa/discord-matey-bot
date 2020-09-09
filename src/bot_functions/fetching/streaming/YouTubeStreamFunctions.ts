
import YouTube, { YoutubeVideoSearchItem, YoutubeSearchParams, YoutubeVideoSearch } from 'youtube.ts'
import Discord from 'discord.js'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json'

export default class BotModuleYouTube {

    static YouTubeHelper = new YouTube(AUTH.youtube.api_key)

    static async fireChannelNowStreamingNotification(message: Discord.Message, trigger?: string, replyIfNot?: boolean) {
        let response = await this.buildChannelNowStreamingMessage(message, trigger, replyIfNot)
        if (response)
            return message.channel.send(await this.buildChannelNowStreamingMessage(message, trigger, replyIfNot))
        else
            return false
    }

    static async fireChannelNewVideoNotification(message: Discord.Message, trigger?: string, replyIfNot?: boolean) {
        let response = await this.buildChannelNewVideoMessage(message, trigger, replyIfNot)
        if (response)
            return message.channel.send(await this.buildChannelNewVideoMessage(message, trigger, replyIfNot))
        else
            return false
    }

    static async buildChannelNowStreamingMessage(query: string | Discord.Message, trigger?: string, replyIfNot?: boolean) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Fire YouTube Now Streaming', true)

        if (query instanceof Discord.Message)
            query = query.content.substr(query.content.indexOf(trigger) + trigger.length).trim()

        if (query.length === 0)
            return 'Which YouTube channel? Please include a name!'

        let search: YoutubeVideoSearch
        try {
            search = await this.fetchChannelInfoResults(
                ({
                    q: query, type: "video", eventType: "live", maxResults: 5
                })
                , 1, replyIfNot)
        } catch (err) {
            if (replyIfNot && err.message.includes('Nothing'))
                return "That user is not streaming right now."
            else
                return null
        }
        let hit: YoutubeVideoSearchItem = search.items[0]

        if (hit.snippet.liveBroadcastContent.includes("live")) {
            let response = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(`!!!🎥 ${hit.snippet.channelTitle} is now streaming 🎥!!!`)
                .setImage(hit.snippet.thumbnails.default.url)
                .setURL(`https://www.youtube.com/watch?v=${hit.id.videoId}`)
                .setTimestamp(Date.parse(hit.snippet.publishedAt))
                .setDescription(hit.snippet.description)
                .setFooter('Megadork YouTube Stream Checker')

            return response
        } else {
            if (replyIfNot)
                return `${query} is not streaming right now.`
            else
                return null
        }
    }

    static async buildChannelNewVideoMessage(query: string | Discord.Message, trigger?: string, replyIfNot?: boolean) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Fire YouTube New Video', true)

        if (query instanceof Discord.Message)
            query = query.content.substr(query.content.indexOf(trigger) + trigger.length).trim()

        if (query.length === 0)
            return 'Which YouTube channel? Please include a name!'

        let search: YoutubeVideoSearch
        try {
            let now = new Date()
            now.setDate(now.getDate() - 1)
            search = await this.fetchChannelInfoResults(
                ({
                    q: query, type: "video", publishedAfter: now.toISOString(), maxResults: 5
                })
                , 1, replyIfNot)
        } catch (err) {
            if (replyIfNot && err.message.includes('Nothing'))
                return "That user didn't publish a new video today."
            else
                return null
        }
        let hit: YoutubeVideoSearchItem = search.items[0]

        if (hit) {
            let response = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(`${hit.snippet.channelTitle} released a new video 🎥!!!`)
                .setImage(hit.snippet.thumbnails.default.url)
                .setURL(`https://www.youtube.com/watch?v=${hit.id.videoId}`)
                .setTimestamp(Date.parse(hit.snippet.publishedAt))
                .setDescription(hit.snippet.description)
                .setFooter('Megadork YouTube New Vid Checker')

            return response
        } else {
            if (replyIfNot)
                return `${query} has no new video today.`
            else
                return null
        }
    }

    static async fetchChannelInfoResults(query: YoutubeSearchParams, limit = 25, log) {
        if (limit) query.maxResults = limit
        if (log) console.group(`Fetching YouTube Channel Info Search for ${query.q}...`)

        try {
            const res = await this.YouTubeHelper.videos.search(query)

            if (log) console.log('...success!')
            console.groupEnd()
            return res
        }
        catch (err) {
            if (log) {
                let bot: Bot = globalThis.bot
                bot.saveBugReport(err, this.fetchChannelInfoResults.name, true)
            }
            throw new Error(err.response.data.error.message)
        }

    }

    static async fetchRandomVideoInPlaylist(playlistUrl: string, limit = 25, log?) {
        if (log) console.group(`Fetching YouTube Playlist Info for ${playlistUrl}...`)

        try {
            const playlist = await this.YouTubeHelper.playlists.items(playlistUrl, { maxResults: limit.toString() })
            let items = playlist.items

            if (log) console.log('...success!')
            console.groupEnd()

            let video = items[Math.floor(Math.random() * items.length)]

            return video
        }
        catch (err) {
            if (log) {
                let bot: Bot = globalThis.bot
                bot.saveBugReport(err, this.fetchRandomVideoInPlaylist.name, true)
            }
            throw new Error(err)
        }

    }

}
