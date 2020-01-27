import Genius from 'genius-lyrics'
import Discord from 'discord.js'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json'

import PHRASES from '../../../bot_knowledge/phrases/phrases_lyrics.json'

export default class BotModuleLyric {

    static geniusClient = new Genius.Client(
        AUTH.genius.client_token
    )

    static async fireLyricMatchMessage(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'lyric fetch (Genius)', true)

        const message = await this.fetchBuiltLyricMatchMessageForSong(
            bot.context.content.toString(), trigger)

        if (Array.isArray(message))
            message.forEach(part => {
                bot.context.channel.send(part)
            });
        else
            bot.context.channel.send(message)

        return true
    }

    static async fetchBuiltLyricMatchMessageForSong(song: string, trigger?: string):
        Promise<Discord.MessageEmbed | Discord.MessageEmbed[]> {
        song = song.toLowerCase()

        if (song.includes(trigger))
            song = song.replace(trigger, '').trim()

        if (!song) {
            let bot: Bot = globalThis.bot
            bot.context.reply(`lyrics for what song? 😮`)
            return null
        }

        let songInfo = await this.fetchLyricsInfoOfSong(song)
        if (!songInfo) {
            let bot: Bot = globalThis.bot
            bot.generateErrorMessage(`I couldn't find those lyrics at the moment.`
                + ` Try again later.`)
            return null
        }

        let prettifiedLyrics =
            songInfo.lyrics.replace(/\[(.*?)\]/g, '').match(/.{1,2040}/gs)

        let built: Discord.MessageEmbed | Discord.MessageEmbed[]

        built = new Discord.MessageEmbed()
            .setURL(songInfo.url)
            .setTitle(songInfo.title)
            .setAuthor(songInfo.primary_artist.name)
            .setColor('#ffff64')
            .setDescription(prettifiedLyrics[0])
            .setThumbnail(songInfo.header_image_thumbnail_url)
            .setFooter('Megalyrics - Powered by Genius © 2020',
                'https://cdn.apk4all.com/wp-content/uploads/apps/Genius-%E2%80%94-Song-Lyrics-More/KEzNV79C2uSJnYjJxImKUt_dIAnXjBiB3aahKHeMOsMAxZJlBvZ6gviOKaReUNBi5v7N.png')

        if (prettifiedLyrics.length > 1) {
            let messageArray = []
            messageArray.push(built)
            for (let i = 1; i < prettifiedLyrics.length; i++) {
                let built = new Discord.MessageEmbed()
                    .setURL(songInfo.url)
                    .setTitle(songInfo.title + ' continued...')
                    .setColor('#ffff64')
                    .setThumbnail(songInfo.header_image_thumbnail_url)
                    .setDescription(prettifiedLyrics[i])
                    .setFooter('Megalyrics - Powered by Genius © 2020',
                        'https://cdn.apk4all.com/wp-content/uploads/apps/Genius-%E2%80%94-Song-Lyrics-More/KEzNV79C2uSJnYjJxImKUt_dIAnXjBiB3aahKHeMOsMAxZJlBvZ6gviOKaReUNBi5v7N.png')

                messageArray.push(built)
            }

            built = messageArray
        }

        return built
    }

    static async fetchLyricsInfoOfSong(song: string) {
        try {
            const search: any[] | any =
                await this.geniusClient.findTrack(song)
            if (search.error)
                throw new Error(search.error)

            return await this.geniusClient.getAll(search)
        } catch (e) {
            let bot: Bot = globalThis.bot
            console.error(`Error fetching song lyrics through Genius API!`)

            if (e.message === 'invalid_token')
                console.info(`Please update your Genius API token.`)


            bot.saveBugReport(e, true)
            return null
        }
    }

    static async singSongInChat(song: string = this.fetchRandomSongTitle(),
        trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'lyric SINGING!!! (Genius)', true)

        song = song.toLowerCase()
        if (song.includes(trigger))
            song = song.replace(trigger, '').trim()

        const songInfo = await this.fetchLyricsInfoOfSong(song)

        //Limited to just a portion to prevent TTS annoyance
        let lyrics: string[] =
            songInfo.lyrics.replace(/\[(.*?)\]/g, '').match(/((?:[^\n][\n]?))+/g)

        // Gets a random verse
        const verse = lyrics[Math.floor(Math.random() * lyrics.length)];

        lyrics = verse.match(/.{0,200}.+/gs)
        // TTS character limit is 200

        const infoMessage = new Discord.MessageEmbed()
            .setAuthor(Bot.fetchRandomPhrase(PHRASES.singing_start))
            .setTitle(`${songInfo.title} - ${songInfo.primary_artist.name}`)
            .setDescription(`Megadork sings ${songInfo.title}!`)
            .setURL(songInfo.url)
            .addField(`Excuse the 'Megadork says' ...that's Discord's control!`, `🤔`)
            .setColor('#ffff64')
            .setThumbnail(songInfo.header_image_thumbnail_url)
            .setFooter('Megadork Bowie - Powered by Genius © 2020',
                'https://cdn.apk4all.com/wp-content/uploads/apps/Genius-%E2%80%94-Song-Lyrics-More/KEzNV79C2uSJnYjJxImKUt_dIAnXjBiB3aahKHeMOsMAxZJlBvZ6gviOKaReUNBi5v7N.png')

        bot.context.channel.send(infoMessage)

        lyrics.forEach(part => {
            bot.context.channel.send(part, { tts: true }) // ultimate weapon
        })
    }

    static fetchRandomSongTitle() {
        return PHRASES.default.songs_to_sing
        [Math.floor(Math.random() * (PHRASES.default.songs_to_sing.length))]
    }
}