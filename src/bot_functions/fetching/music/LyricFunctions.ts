import Genius from 'genius-lyrics'
import Discord from 'discord.js'
import Bot from '../../../Bot.js'

import KEYS from '../../../user_creds.js'

import PHRASES from '../../../bot_knowledge/phrases/phrases_lyrics.js'

export default class BotModuleLyric {

    static geniusClient = new Genius.Client(
        KEYS.genius.client_token
    )

    static async fireLyricMatchMessage(message: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'lyric fetch (Genius)', true)

        const response = await this.fetchBuiltLyricMatchMessageForSong(
            message.content.toString(), trigger)

        if (!response) message.reply(`lyrics for what song? 😮`)

        if (Array.isArray(response))
            response.forEach(part => {
                message.channel.send({ embeds: [part] })
            });
        else
            message.channel.send({ embeds: [response] })

        return true
    }

    static async fetchBuiltLyricMatchMessageForSong(song: string, trigger?: string):
        Promise<Discord.MessageEmbed | Discord.MessageEmbed[]> {
        song = song.toLowerCase()

        if (song.includes(trigger))
            song = song.replace(trigger, '').trim()

        if (!song)
            return null

        let songInfo = await this.fetchLyricsInfoOfSong(song)
        if (!songInfo) {
            let bot: Bot = globalThis.bot
            bot.generateErrorMessage(
                `I couldn't find those lyrics at the moment.`
                + ` Try again later.`)
            return null
        }

        let songLyrics = await songInfo.lyrics()
        let prettifiedLyrics = songLyrics.replace(/\[(.*?)\]/g, '').match(/.{1,2040}/gs)

        let built: Discord.MessageEmbed | Discord.MessageEmbed[]

        built = new Discord.MessageEmbed()
            .setURL(songInfo.url)
            .setTitle(songInfo.title)
            .setAuthor(songInfo.artist.name)
            .setColor('#ffff64')
            .setDescription(prettifiedLyrics[0])
            .setThumbnail(songInfo.thumbnail)
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
                    .setThumbnail(songInfo.thumbnail)
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
            const search =
                await this.geniusClient.songs.search(song)

            return await search[0]
        } catch (e) {
            console.error(`Error fetching song lyrics through Genius API!`)

            if (e.message === 'invalid_token')
                console.info(`Please update your Genius API token.`)

            let bot: Bot = globalThis.bot
            bot.saveBugReport(e, this.fetchLyricsInfoOfSong.name, true)
            return null
        }
    }

    static async singSongInChat(query: Discord.Message | string = this.fetchRandomSongTitle(),
        trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'lyric SINGING!!! (Genius)', true)

        if (query instanceof Discord.Message)
            query = query.content

        query = query.toLowerCase()
        if (query.includes(trigger))
            query = query.replace(trigger, '').trim()


        const songInfo = await this.fetchLyricsInfoOfSong(query)

        //Limited to just a portion to prevent TTS annoyance
        let lyrics: string[] =
            (await songInfo.lyrics()).replace(/\[(.*?)\]/g, '').match(/((?:[^\n][\n]?))+/g)

        // Gets a random verse
        const verse = lyrics[Math.floor(Math.random() * lyrics.length)];

        lyrics = verse.match(/.{0,200}.+/gs)
        // TTS character limit is 200

        const infoMessage = new Discord.MessageEmbed()
            .setAuthor(Bot.fetchRandomPhrase(PHRASES.singing_start))
            .setTitle(`${songInfo.title} - ${songInfo.artist.name}`)
            .setDescription(`Megadork sings ${songInfo.title}!`)
            .setURL(songInfo.url)
            .addFields({ name: `Excuse the 'Megadork says' ...that's Discord's control!`, value: `🤔` })
            .setColor('#ffff64')
            .setThumbnail(songInfo.thumbnail)
            .setFooter('Megadork Bowie - Powered by Genius © 2020',
                'https://cdn.apk4all.com/wp-content/uploads/apps/Genius-%E2%80%94-Song-Lyrics-More/KEzNV79C2uSJnYjJxImKUt_dIAnXjBiB3aahKHeMOsMAxZJlBvZ6gviOKaReUNBi5v7N.png')

        bot.context.channel.send({ embeds: [infoMessage] })

        lyrics.forEach(part => {
            bot.context.channel.send({ content: part, tts: true }) // ultimate weapon
        })
    }

    static fetchRandomSongTitle() {
        return PHRASES.default.songs_to_sing
        [Math.floor(Math.random() * (PHRASES.default.songs_to_sing.length))]
    }
}