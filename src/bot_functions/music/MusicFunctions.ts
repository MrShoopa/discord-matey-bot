import Discord from 'discord.js'
import Bot, { SongState } from "../../Bot"
import { Song, Stream } from "../../types"

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json'
import PHRASES_SING from '../../bot_knowledge/phrases/phrases_sing.json'

import AUTH from '../../user_creds.json'

import Soundcloud from "soundcloud.ts"

export default class BotModuleMusic {

    static scClient: Soundcloud =
        new Soundcloud(AUTH.soundcloud.client_id, AUTH.soundcloud.o_auth_token)

    static async playMusic(trigger: string, loop?: boolean) {
        let bot: Bot = globalThis.bot
        bot.songState = SongState.Fetching

        let context: string[] =
            bot.context.toString().substring(0, 100).split(' ')

        loop = loop ? true : checkForLoop()

        function checkForLoop() {
            if (TRIGGERS.singing_triggers.args.loop.some((trigger) => {
                return context.some(word => {
                    if (word === trigger)
                        return bot.context.content =
                            bot.context.content.replace(trigger, '').trimRight()
                })
            })) return true
            else return false
        }

        try {
            let urlRegex: RegExp =
                /(^|\s)(https?:\/\/)?(www\.)?[\s\S]+\.com(\/[^\s]+)($|\s)/

            /*  Iterates over list of listed songs before taking action.
                
                Music search priorities:
                1. URLs
                2. Local Files w/ special names
                3. Local Files w/ exact file
            */
            if (bot.context.toString().toLowerCase().match(urlRegex)
                && !bot.commandSatisfied) {
                //  When song from URL is found

                var url_string: string[] = bot.context.toString().split(' ')

                return bot.playAudioFromURL(url_string[url_string.length - 1], loop, trigger)
                    .catch(error => { throw error })
            }

            for (const song of PHRASES_SING.songs_to_sing)
                if (bot.context.toString().toLowerCase().includes(song.title.toLowerCase())
                    && !bot.commandSatisfied) {
                    //  When song from local files is found

                    let foundSong: Song.SongObject = song

                    return bot.playAudioFromFiles(foundSong, loop, trigger)
                }

            // Start searching local audio folder for 'non-tagged' songs
            let songRequest = bot.context.toString().substring(trigger.length + 1)

            let matchedSongs = Bot.searchFilesRecursive('./', `${songRequest}.mp3`)
            if (matchedSongs.length > 0 && songRequest) {
                console.group()
                console.log(`Local matching songs found:`)
                console.info(matchedSongs)
                console.groupEnd()

                return bot.playAudioFromFiles(matchedSongs[0], loop)
            }

        } catch (error) {
            if (!bot.voiceChannel) {
                console.warn(`Bot couldn't find a voice channel to join. Please have user join a channel first.`)
                bot.context.reply(
                    PHRASES_SING.message_not_in_channel)
            } else bot.saveBugReport(error)
        }

        if (bot.songState == SongState.Fetching) { //  When song is not found
            bot.context.reply(
                PHRASES_SING.message_unknown_summon)

            console.warn('No such song found.')
        }

        // Finished
        bot.commandSatisfied = true
    }

    static stopMusic(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Singing Stop', true, true)

        if (bot.voiceChannel != null && bot.voice.connections.size !== 0) {

            try {
                if (!bot.voice.connections.some(connection => {
                    return connection.channel.id == bot.context.member.voice?.channel.id
                })) "the bottom might annoy some"
                //.bot.context.reply(`join my voice channel and repeat that action!`)
                else {
                    bot.context.member.voice.channel.leave()

                    bot.textChannel.send(Bot.fetchRandomPhrase(PHRASES_SING.command_feedback.stop.active))
                    console.log('Bot exited voice channel by user message.')
                }
            } catch (error) {
                bot.saveBugReport(error)
            }
        } else {
            if (bot.context.toString().substring(0, 6).toLowerCase().includes("stop"))
                return  // No message is sent when just saying 'stop' on no playback

            bot.context.reply(Bot.fetchRandomPhrase(PHRASES_SING.command_feedback.stop.null))
            console.log('No sound was playing, nothing terminated.')
        }
    }

    static generatePlaybackMessage(songInfo?: Stream.SongInfo, bot: Bot = globalThis.bot)
        : Discord.MessageEmbed {
        let playbackMessage = new Discord.MessageEmbed()
            .setAuthor('Mega-Juker! 🔊')
            .setTitle('Playing some 🅱eatz')
            .setColor('ffc0cb')

        playbackMessage
            .setDescription(`\nI'm playing your request, ${bot.context.author.username}! 👌`)

        if (songInfo.name && songInfo.author)
            playbackMessage
                .addField(songInfo.author, songInfo.name)
        else if (songInfo.name && songInfo.source && songInfo.url)
            playbackMessage
                .addField(songInfo.source, songInfo.name)
        else if (songInfo.name)
            playbackMessage
                .addField('Local File', songInfo.name)

        if (songInfo.platform)
            playbackMessage
                .setFooter(songInfo.platform)

        if (songInfo.url)
            playbackMessage
                .setURL(songInfo.url)

        if (songInfo.localFolder)
            playbackMessage
                .addField(`Home grown!`,
                    `Locally from my *${songInfo.localFolder}* collection!`)

        if (songInfo.thumbnailUrl)
            playbackMessage
                .setImage(songInfo.thumbnailUrl)

        if (songInfo.authorImgUrl)
            playbackMessage
                .setImage(songInfo.authorImgUrl)

        if (songInfo.genre)
            playbackMessage
                .addField('Genre', songInfo.genre)

        if (songInfo.length)
            playbackMessage
                .addField('Length', songInfo.length)

        if (songInfo.botPhrase)
            playbackMessage
                .setTitle(songInfo.botPhrase)

        return playbackMessage
    }

    static loadClients() {
        BotModuleMusic.scClient
    }
}
