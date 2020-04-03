import Discord, { Message } from 'discord.js'
import Bot, { SongState } from "../../Bot"
import { Audio, Stream } from "../../types"
import QueueHandler from '../_state/QueueHandler'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json'
import PHRASES_SING from '../../bot_knowledge/phrases/phrases_sing.json'

import AUTH from '../../user_creds.json'

import YouTube from 'youtube-search'
import Soundcloud, { SoundCloudTrack } from "soundcloud.ts"

export default class BotModuleMusic {

    static musicQueue = new QueueHandler<Message>()

    static scClient: Soundcloud =
        new Soundcloud(AUTH.soundcloud.client_id, AUTH.soundcloud.o_auth_token)

    static async playMusic(trigger: string, loop?: boolean, queueMode?: boolean) {
        let bot: Bot = globalThis.bot
        let songState = SongState.Fetching

        let context: string[] =
            bot.context.toString().substring(0, 100).split(' ')

        loop = loop ? true : checkForLoop()

        function checkForLoop() {
            if (TRIGGERS.singing_triggers.args.loop.some((trigger) => {
                return context.some(word => {
                    if (word === trigger) {
                        context = context.slice(0, context.length - 1)
                        return bot.context.content =
                            bot.context.content.replace(trigger, '').trimRight()
                    }
                })
            })) return true
            else return false
        }

        await (async function checkForPlatform() {
            let platform, index, requestedQuery, newQuery, hotword

            while (!platform) {
                if (TRIGGERS.singing_triggers.args.platform.yt.some((keyword, i) => {
                    if (context.includes(keyword)) {
                        index = i, hotword = keyword, platform = "yt"
                        return true
                    }
                })) break

                if (TRIGGERS.singing_triggers.args.platform.sc.some((keyword, i) => {
                    if (context.includes(keyword)) {
                        index = i, hotword = keyword, platform = "sc"
                        return true
                    }
                })) break

                break
            }

            if (platform) {

                requestedQuery = context.slice(index + 1).join(' ')

                switch (platform) {
                    case 'yt':
                        newQuery = await
                            BotModuleMusic.searchUrlofYouTubeVideo(requestedQuery)
                        break
                    case 'sc':
                        newQuery = await
                            BotModuleMusic.searchUrlofSoundcloudTrack(requestedQuery)
                        break
                }

                bot.context.content =
                    bot.context.content.replace(`${requestedQuery}`, newQuery).trim()
                return true
            } else return false

        }())


        try {
            bot.commandSatisfied = false //? heheheheheh

            let urlRegex: RegExp =
                /(^|\s)(https?:\/\/)?(www\.)?[\s\S]+\.com(\/[^\s]+)($|\s)/

            /*  Iterates over list of listed songs before taking action.
                
                Music search priorities:
                1. URLs
                2. Local Files w/ special names
                3. Local Files w/ exact file
            */
            if (bot.context.toString().toLowerCase().match(urlRegex)
                && songState == SongState.Fetching) {
                //  When song from URL is found

                var url_string: string[] = bot.context.toString().split(' ')

                songState = SongState.Playing
                songState =
                    await bot.playAudioFromURL(url_string[url_string.length - 1], loop, queueMode, trigger)
                        .catch(error => { throw error })
            }

            if (songState == SongState.Fetching) {
                for (const song of PHRASES_SING.songs_to_sing) {
                    if (bot.context.toString().toLowerCase().includes(song.title.toLowerCase())) {

                        //  When song from local files is found

                        let foundSong: Audio.SongObject = song

                        songState = SongState.Playing
                        songState =
                            await bot.playAudioFromFiles(foundSong, loop, queueMode, trigger)
                                .catch(error => { throw error })
                    }
                }
            }

            if (songState == SongState.Fetching) {
                // Start searching local audio folder for 'non-tagged' songs
                let songRequest = bot.context.toString().substring(trigger.length + 1)

                let matchedSongs = Bot.searchFilesRecursive('./', `${songRequest}.mp3`)
                if (matchedSongs.length > 0 && songRequest) {
                    console.group()
                    console.log(`Local matching songs found:`)
                    console.info(matchedSongs)
                    console.groupEnd()

                    songState = SongState.Playing
                    songState =
                        await bot.playAudioFromFiles(matchedSongs[0], loop, queueMode, trigger)
                            .catch(error => { throw error })
                }
            }

        } catch (error) {
            if (!bot.voiceChannel) {
                console.warn(`Bot couldn't find a voice channel to join. Please have user join a channel first.`)
                bot.context.reply(
                    PHRASES_SING.message_not_in_channel)

                songState = SongState.Unknown
            } else bot.saveBugReport(error, this.playMusic.name, true)
        }

        if (songState == SongState.Fetching) { //  When song is not found
            bot.context.reply(
                PHRASES_SING.message_unknown_summon)

            console.warn('No such song found.')
        }

        // Finished
        bot.commandSatisfied = true
        if (queueMode && songState == SongState.Finished) this.processNextSongRequest()
    }

    static async stopMusic(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Singing Stop', true, true)

        if (bot.voiceChannel != null && bot.voice.connections.size !== 0) {

            try {
                if (!bot.voice.connections.some(connection => {
                    return connection.channel.id == bot.context.member.voice?.channel.id
                })) "the bottom might annoy some"
                //.bot.context.reply(`join my voice channel and repeat that action!`)
                else {
                    await bot.playSFX(bot.context.member.voice.connection, Audio.SFX.MusicLeave)
                    bot.context.member.voice.channel.leave()

                    bot.textChannel.send(Bot.fetchRandomPhrase(PHRASES_SING.command_feedback.stop.active))
                    console.log('Bot exited voice channel by user message.')

                    if (this.musicQueue.peek() !== undefined) {
                        bot.textChannel.send(`Jukebox is cleaned out too.`)
                        this.musicQueue.empty()
                    }
                }
            } catch (error) {
                bot.saveBugReport(error, this.stopMusic.name)
            }
        } else {
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
                .addFields({ name: songInfo.author, value: songInfo.name })
        else if (songInfo.name && songInfo.source && songInfo.url)
            playbackMessage
                .addFields({ name: songInfo.source, value: songInfo.name })
        else if (songInfo.name)
            playbackMessage
                .addFields({ name: 'Local File', value: songInfo.name })

        if (songInfo.platform)
            playbackMessage
                .setFooter(songInfo.platform)

        if (songInfo.url)
            playbackMessage
                .setURL(songInfo.url)

        if (songInfo.localFolder)
            playbackMessage
                .addFields({
                    name: `Home grown!`,
                    value: `Locally from my *${songInfo.localFolder}* collection!`
                })

        if (songInfo.thumbnailUrl)
            playbackMessage
                .setImage(songInfo.thumbnailUrl)

        if (songInfo.authorImgUrl)
            playbackMessage
                .setThumbnail(songInfo.authorImgUrl)

        if (songInfo.genre)
            playbackMessage
                .addFields({
                    name: 'Genre',
                    value: songInfo.genre
                })

        if (songInfo.length)
            playbackMessage
                .addFields({
                    name: 'Length', value: songInfo.length
                })

        if (songInfo.botPhrase)
            playbackMessage
                .setTitle(songInfo.botPhrase)

        return playbackMessage
    }

    static async searchUrlofYouTubeVideo(query: string): Promise<string> {
        let result = await this.fetchSingleYouTubeSearchResult(query)
        return result.link
    }

    static async searchUrlofSoundcloudTrack(query: string): Promise<string> {
        let result = await this.fetchSingleSoundCloudSearchResult(query)
        return result.permalink_url
    }

    static async fetchSingleYouTubeSearchResult(query: string)
        : Promise<YouTube.YouTubeSearchResults> {
        let result = await this.processYouTubeSearch(query, 1)
        return result[0]
    }

    static async fetchSingleSoundCloudSearchResult(query: string)
        : Promise<SoundCloudTrack> {
        let result = await this.processSoundCloudSearch(query, 1)
        return result[0]
    }

    static async processYouTubeSearch(query: string, resultCount = 10)
        : Promise<Array<YouTube.YouTubeSearchResults>> {
        var opts: YouTube.YouTubeSearchOptions = {
            maxResults: resultCount,
            key: AUTH.youtube.api_key
        };

        return new Promise(async (res, rej) => {
            await YouTube(query, opts, (err, result) => {
                if (err)
                    globalThis.bot.saveBugReport(err, this.processYouTubeSearch.name, true)

                console.info(`Fetched YouTube search results:`)
                console.log(result)

                res(result)
            })
        })
    }

    static async processSoundCloudSearch(query: string, resultCount = 10)
        : Promise<Array<SoundCloudTrack>> {

        return await this.scClient.tracks.search({ q: query })
            .then(res => {
                console.info(`Fetched YouTube search results:`)
                console.log(res)

                return res
            })
            .catch(err => {
                globalThis.bot.saveBugReport(err, this.processSoundCloudSearch.name, true)

                return null
            })
    }

    static addNewSongRequest(trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) {
            bot.preliminary(trigger, 'Song Request Enqueue', true)

            bot.context.content = bot.context.content.replace(trigger, "").trim()
        }

        try {
            bot.context.channel.send(`${bot.context.author.username}, queuing your request.`)

            this.musicQueue.add(bot.context as Message)
        } catch (err) {
            bot.saveBugReport(err, this.addNewSongRequest.name, true)
        }

        return true
    }

    static processNextSongRequest(skip?: boolean, restart?: boolean, trigger?: string) {
        let request = this.musicQueue.dequeue()
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Song Request Process', true)

        if (request === undefined) {
            console.info(`Music queue list is now empty.`)
            bot.context.channel.send(`📻... *that's all folks*!`)
            // if (bot.voice.connections.find(bot.context.author.))
            // this.stopMusic()
            return true
        }

        try {
            if (!skip) {
                request.channel.send(`${request.author.username}'s song is up next!`)

                let channel = bot.context.member.voice.channel
                bot.context = request
                bot.voiceChannel = channel

                this.playMusic(request.content.toString(), false, true)
            }
            else {
                request.channel.send(`${request.author.username}'s request is being skipped.`)
            }
        } catch (err) {
            bot.saveBugReport(err, this.processNextSongRequest.name, true)
        }

        return true
    }

    static fireQueueListMessage(trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Song Request List Inquiry', true)

        let currentList = this.musicQueue.peekAll()

        if (currentList.length === 0)
            return bot.context.channel.send(`The song queue is empty... 🍃`)

        let message = new Discord.MessageEmbed()
            .setTitle(`Current Music Queue 💽`)
            .setColor('LUMINOUS_VIVID_PINK')
            .setFooter(`${currentList.length} request(s) to play...`)

        currentList.forEach(request => {
            let refactoredRequest =
                request.content.replace("megadork play", "")

            message.addFields(
                { name: request.author.username, value: refactoredRequest }
            )
        })

        bot.context.channel.send(message)

        return true
    }


    static fireQueueNextUpMessage(trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Song Next Up Inquiry', true)

        let next = this.musicQueue.peek()

        if (next === undefined)
            return bot.context.channel.send(`There's nothing next to play. 😶`)

        let refactoredRequest =
            next.content.replace("megadork play", "")

        let message = new Discord.MessageEmbed()
            .setTitle(`💿 Next up...`)
            .addFields({ name: next.author.username, value: refactoredRequest })
            .setColor('LUMINOUS_VIVID_PINK')
            .setFooter(`${this.musicQueue.peekAll().length} request(s) to play...`)

        bot.context.channel.send(message)

        return true

    }

    static loadClients() {
        BotModuleMusic.scClient
    }
}
