import Discord, { Message } from 'discord.js'
import Bot, { SongState } from "../../Bot"
import { Audio, Stream } from "../../types"
import QueueHandler from '../_state/QueueHandler'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json'
import PHRASES_SING from '../../bot_knowledge/phrases/phrases_sing.json'

import AUTH from '../../user_creds.json'

import YouTube from 'youtube-search'
import YouTubeDownloader from 'ytdl-core'
import YouTubePlaylister from 'youtube-playlist'

import Soundcloud, { SoundcloudTrackV2, SoundcloudTrackSearchV2 } from "soundcloud.ts"

export default class BotModuleMusic {

    static queueStore = new Array<MusicQueue>()

    static scClient: Soundcloud =
        new Soundcloud(AUTH.soundcloud.client_id, AUTH.soundcloud.o_auth_token)

    static async playMusic(trigger: string, loop?: boolean, queueNumber?: number, messageObj?: Message) {
        let bot: Bot = globalThis.bot
        let songState = SongState.Fetching

        if (!messageObj)
            messageObj = bot.context as Message

        let context: string[] =
            messageObj.toString().substring(0, 100).split(' ')

        loop = loop ? true : checkForLoop()

        function checkForLoop() {
            if (TRIGGERS.singing_triggers.args.loop.some((trigger) => {
                return context.some(word => {
                    if (word === trigger) {
                        context = context.slice(0, context.length - 1)
                        return messageObj.content =
                            messageObj.content.replace(trigger, '').trimRight()
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

                requestedQuery = context.slice(index).join(' ')

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

                messageObj.content =
                    messageObj.content.replace(`${requestedQuery}`, newQuery).trim()
                return true
            } else return false

        }())


        try {
            bot.commandSatisfied = false //? heheheheheh

            let urlRegex: RegExp =
                /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

            /*  Iterates over list of listed songs before taking action.
                
                Music search priorities:
                1. URLs (Videos, playlists, etc.)
                2. Local Files w/ special names
                3. Local Files w/ exact file
            */
            if (messageObj.toString().toLowerCase().match(urlRegex)
                && songState == SongState.Fetching) {
                //  When song from URL is found

                var url_string: any = messageObj.toString().match(urlRegex)
                url_string = url_string[0]

                if (await this.checkIfUrlSpecialFormat(url_string, messageObj)) return true

                songState = SongState.Playing
                songState =
                    await bot.playAudioFromURL(url_string, messageObj, loop, queueNumber, trigger)
                        .catch(error => { throw error })
            }

            if (songState == SongState.Fetching) {
                for (const song of PHRASES_SING.songs_to_sing) {
                    if (messageObj.toString().toLowerCase().includes(song.title.toLowerCase())) {

                        //  When song from local files is found

                        let foundSong: Audio.SongObject = song

                        songState = SongState.Playing
                        songState =
                            await bot.playAudioFromFiles(foundSong, messageObj, loop, queueNumber, trigger)
                                .catch(error => { throw error })
                    }
                }
            }

            if (songState == SongState.Fetching) {
                // Start searching local audio folder for 'non-tagged' songs
                let songRequest = messageObj.toString().substring(trigger.length + 1)

                let matchedSongs = Bot.searchFilesRecursive('./', `${songRequest}.mp3`)
                if (matchedSongs.length > 0 && songRequest) {
                    console.group()
                    console.log(`Local matching songs found:`)
                    console.info(matchedSongs)
                    console.groupEnd()

                    songState = SongState.Playing
                    songState =
                        await bot.playAudioFromFiles(matchedSongs[0], messageObj, loop, queueNumber, trigger)
                            .catch(error => { throw error })
                }
            }

        } catch (error) {
            if (!bot.voiceChannel) {
                console.warn(`Bot couldn't find a voice channel to join. Please have user join a channel first.`)
                messageObj.reply(
                    PHRASES_SING.message_not_in_channel)

                songState = SongState.Unknown
            } else bot.saveBugReport(error, this.playMusic.name, true)
        }

        if (songState == SongState.Fetching) { //  When song is not found
            messageObj.reply(
                PHRASES_SING.message_unknown_summon)

            console.warn('No such song found.')
        }

        // Finished
        bot.commandSatisfied = true
        if (queueNumber && songState == SongState.Finished) {
            return 'next'
        }
    }

    static async stopMusic(trigger?: string, messageObj?: Discord.Message) {
        let bot: Bot = globalThis.bot

        if (!messageObj) messageObj = bot.context as Message

        let connection = bot.voice.connections.find(c => c.channel.id == messageObj.member.voice?.channel?.id)

        if (trigger) bot.preliminary(trigger, 'Singing Stop', true, true)

        if (bot.voiceChannel != null && bot.voice.connections.size !== 0) {

            try {
                if (!connection) // "the bottom might annoy some"
                    return console.log(`Matching voice connection not found`)
                //.messageObj.reply(`join my voice channel and repeat that action!`)
                else {
                    await bot.playSFX(connection, Audio.SFX.MusicLeave)
                    messageObj.member.voice.channel.leave()

                    //. dw about it bot.textChannel.send(Bot.fetchRandomPhrase(PHRASES_SING.command_feedback.stop.active))
                    console.log('Bot exited voice channel by user message.')

                    if (this.findQueue()?.queue.peek()) {
                        bot.textChannel.send(`Jukebox is cleaned out too.`)
                        this.findQueue().queue.empty()
                    }
                }
            } catch (error) {
                bot.saveBugReport(error, this.stopMusic.name, true)
            }
        } else {
            messageObj.reply(Bot.fetchRandomPhrase(PHRASES_SING.command_feedback.stop.null))
            console.log('No sound was playing, nothing terminated.')
        }
    }

    static generatePlaybackMessage(message: Message, songInfo?: Stream.SongInfo)
        : Discord.MessageEmbed {
        let playbackMessage = new Discord.MessageEmbed()
            .setAuthor('Mega-Juker! 🔊')
            .setTitle('Playing some 🅱eatz')
            .setColor('ffc0cb')

        playbackMessage
            .setDescription(`\nI'm playing your request, ${message.author.username}! 👌`)

        if (songInfo.name && songInfo.author)
            playbackMessage
                .addFields({ name: songInfo.author, value: songInfo.name })
        else if (songInfo.name && songInfo.source)
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

        if (songInfo.queueNumber)
            playbackMessage.setDescription(`\nPlaying ${message.author.username}'s request! ${songInfo.queueNumber} songs left in queue.`)

        return playbackMessage
    }

    static convertPlaybackMessageToFinished(botResponse: Message, ogMessage: Message) {
        botResponse.edit(botResponse.content, {
            embed: {
                author: botResponse.embeds[0].author,
                url: botResponse.embeds[0].url,
                fields: botResponse.embeds[0].fields,
                footer: botResponse.embeds[0].footer,
                title: 'Played some 🅱eatz',
                description: `- Finished playing ${ogMessage.author.username}'s jam! -`,
                color: '#7c7286'
            }
        })
    }

    static convertPlaybackMessageToInterrupted(botResponse: Message, ogMessage: Message) {
        botResponse.edit(botResponse.content, {
            embed: {
                author: botResponse.embeds[0].author,
                url: botResponse.embeds[0].url,
                fields: botResponse.embeds[0].fields,
                footer: botResponse.embeds[0].footer,
                title: 'Played some 🅱eatz',
                description: `- Jam got interrupted by ${ogMessage.author.username} -`,
                color: '#7c7286'
            }
        })
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
        : Promise<SoundcloudTrackV2> {
        let result = await this.processSoundCloudSearch(query, 1)
        return result.collection[0]
    }

    static async checkIfUrlSpecialFormat(url: string, message: Message) {
        function checkForShuffle() {
            let context: string[] = message.toString().substring(0, 1000).split(' ')
            return TRIGGERS.singing_triggers.args.shuffle.some((trigger) => {
                return context.some(word => {
                    if (word === trigger) return true
                })
            })
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array
        }

        let playlistUrls: any[]
        if (url.includes('youtu') && url.includes('playlist?') && !url.includes('watch?'))
            playlistUrls = await this.checkIfYouTubePlaylist(url)

        if (playlistUrls) {
            let messageReply: string
            if (checkForShuffle()) {
                playlistUrls = shuffleArray(playlistUrls)
                messageReply = `🎶📃▶ **Playing ${message.author.username}'s *shuffled* playlist!** `
            } else {
                messageReply = `🎶📃▶ **Playing ${message.author.username}'s playlist!** `
            }

            let queue = this.createNewQueue(message.member.voice?.channel)

            playlistUrls.forEach((url: string) => {
                queue.addNewSongRequest(message, '', url)
            })

            message.channel.send(messageReply)
            await queue.processNextSongRequest(message)

            return true
        }

        return false
    }

    static async checkIfYouTubePlaylist(url: string): Promise<any[]> {
        let result: any[] | PromiseLike<any[]>
        try {
            result = await YouTubePlaylister(url, 'url').then((res: any) => {
                console.log('Extracted YouTube URL links from YouTube playlist.');
                if (res.data.playlist?.length != 0)
                    return res.data.playlist
                else return null
            })
        } catch (err) {
            if (err.message.includes(`Cannot read property 'split' of undefined`))
                return null
            else globalThis.bot.saveBugReport(err, this.checkIfYouTubePlaylist.name, true)
        }

        return result
    }

    static async fetchYouTubeVideoInfo(url: string) {
        return await YouTubeDownloader.getInfo(url)
            .then(video => { return video })
            .catch(e => { throw e })
    }

    static async processYouTubeSearch(query: string, resultCount = 10, type = 'video')
        : Promise<Array<YouTube.YouTubeSearchResults>> {
        var opts: YouTube.YouTubeSearchOptions = {
            type: type,
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
        : Promise<SoundcloudTrackSearchV2> {

        return await this.scClient.tracks.searchV2({ q: query })
            .then(res => {
                console.info(`Fetched SoundCloud search results:`)
                console.log(res)

                return res
            })
            .catch(err => {
                globalThis.bot.saveBugReport(err, this.processSoundCloudSearch.name, true)

                return null
            })
    }

    static addNewSongRequest(trigger: string, message: Discord.Message) {
        if (message.member.voice.channel) {
            let queue = this.findQueue(message.member.voice.channel)

            if (!queue?.addNewSongRequest(message, trigger))
                return this.createNewQueue(message.member.voice.channel).addNewSongRequest(message, trigger)
        } else return message.channel.send(`Join a channel first before adding to a music queue.`)
    }
    static processNextSongRequest(message: Discord.Message, skip?: boolean, restart?: boolean, trigger?: string) {
        if (message.member.voice.channel) {
            let queue = this.findQueue()

            if (!queue?.processNextSongRequest(message, skip, restart, trigger))
                return this.createNewQueue(message.member.voice.channel).processNextSongRequest(message, skip, restart, trigger)
        } else return message.channel.send(`Join a channel first before managing a music queue.`)
    }
    static fireQueueNextUpMessage(message: Discord.Message, trigger?: string) {
        if (message.member.voice.channel) {
            let queue = this.findQueue()

            if (!queue?.fireQueueNextUpMessage(trigger))
                return this.createNewQueue(message.member.voice.channel).fireQueueNextUpMessage(trigger)
        } else return message.channel.send(`Join a channel first before reading music queues.`)
    }
    static fireQueueListMessage(message: Discord.Message, trigger?: string) {
        if (message.member.voice.channel) {
            let queue = this.findQueue()

            if (!queue?.fireQueueListMessage(message, trigger))
                return this.createNewQueue(message.member.voice.channel).fireQueueListMessage(message, trigger)
        } else return message.channel.send(`Join a channel first before reading music queues.`)
    }

    static findQueue(channel: Discord.VoiceChannel = globalThis.bot.context.member.voice.channel) {
        let queue = this.queueStore.find(q => q.channel.id == channel?.id)
        return queue
    }

    static createNewQueue(channel: Discord.VoiceChannel = globalThis.bot.context.member.voice.channel) {
        let newQueue = new MusicQueue(channel)
        this.queueStore.push(newQueue)
        return newQueue
    }

    static loadClients() {
        BotModuleMusic.scClient
    }
}

class MusicQueue {

    queue: QueueHandler<Message>
    channel: Discord.VoiceChannel

    constructor(channel: Discord.VoiceChannel) {
        this.channel = channel
        this.queue = new QueueHandler<Message>()
    }

    addNewSongRequest(message: Message, trigger?: string, manualQuery?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) {
            bot.preliminary(trigger, 'Song Request Enqueue', true)

            message.content = message.content.replace(trigger, "").trim()
        }

        try {
            if (manualQuery) {
                this.queue.add(new Discord.Message(bot,
                    { author: message.author, content: manualQuery },
                    message.channel as Discord.TextChannel))
                return true
            }

            message.channel.send(`${message.author.username}, queuing your request.`)

            this.queue.add(message as Message)
        } catch (err) {
            bot.saveBugReport(err, this.addNewSongRequest.name, true)
        }

        return true
    }

    async processNextSongRequest(message: Message, skip?: boolean, restart?: boolean, trigger?: string, channel?: Discord.VoiceChannel) {
        let request = this.queue.dequeue()
        let bot: Bot = globalThis.bot
        let connection: Discord.VoiceConnection
        if (trigger) bot.preliminary(trigger, `Song Request Process for ${this.channel.guild.name}`, true)
        if (channel)
            connection = await channel.join()
        else
            connection = bot.voice.connections.find(c => c.channel.id == message.member.voice.channel?.id)

        if (request === undefined) {
            console.info(`Music queue list for ${this.channel.name} is now empty.`)
            message.channel.send(`📻... *that's all folks*!`)

            if (connection) {
                await bot.playSFX(connection, Audio.SFX.MusicLeave)
                return connection.voice.channel.leave()
            }

            return true
        }

        try {
            if (!skip) {
                if (connection)
                    await bot.playSFX(connection, Audio.SFX.MusicTransition)
                else {
                    if (message.member.voice.channel)
                        connection = await message.member.voice.channel.join()
                    else
                        return message.channel.send(`😵 Join a voice channel in this server first to play your queue!`)
                    await bot.playSFX(connection, Audio.SFX.MusicJoin)
                }

                /*  if (request.author?.username)
                     request.channel.send(`👉💿👉 ${request.author.username}'s song is up next!`)
                 else */
                request.channel.send(`👉💿👉 Playing next song.`)

                message = request
                bot.voiceChannel = message.member.voice.channel

                if (await BotModuleMusic.playMusic(request.content.toString(), false, this.queue.size(), message)
                    == 'next')
                    this.processNextSongRequest(message, skip, false, null, connection.channel)
            }
            else {
                request.channel.send(`${request.author.username}'s request is being skipped.`)
            }
        } catch (err) {
            bot.saveBugReport(err, this.processNextSongRequest.name, true)
        }

        return true
    }

    async fireQueueListMessage(messageObj: Message, trigger?: string) {
        let bot: Bot = globalThis.bot
        let textChannel = messageObj.channel
        if (trigger) bot.preliminary(trigger, `Song Request List Inquiry for ${this.channel.guild.name}`, true)

        let currentList = this.queue.peekAll()

        if (currentList.length === 0)
            return textChannel.send(`The song queue is empty... 🍃`)

        let message = new Discord.MessageEmbed()
            .setTitle(`Music Queue for ${this.channel.name} 💽`)
            .setColor('LUMINOUS_VIVID_PINK')
            .setFooter(`${currentList.length} request(s) to play...`)

        for (let i = 0; i < currentList.length; i++) {
            let refactoredRequest =
                currentList[i].content.replace("play", "")
            let loadingMsg: Discord.Message

            if (i == 10)
                loadingMsg = await textChannel.send(`Loading ${this.channel.name}'s big list...`)

            if (currentList[i].toString().match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/)) {
                try {
                    let url = currentList[i].toString().match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/)
                    let vid = await BotModuleMusic.fetchYouTubeVideoInfo(url[0])

                    refactoredRequest = `${vid.videoDetails.title} - ${vid.videoDetails.author.name}`
                } catch (err) {
                    refactoredRequest = "Unknown YouTube Item"
                }
            }

            if (message.length < 5900)
                message.addFields({ name: currentList[i].author.username, value: refactoredRequest })
            else {
                message.addFields({ name: "But wait!", value: "There's more... :)" })
                break
            }

            if (i == currentList.length - 1 && loadingMsg)
                loadingMsg.delete()
        }

        textChannel.send(message)

        return true
    }


    fireQueueNextUpMessage(trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'Song Next Up Inquiry', true)

        let next = this.queue.peek()

        if (next === undefined)
            return bot.context.channel.send(`There's nothing next to play. 😶`)

        let refactoredRequest =
            next.content.replace("megadork play", "")

        let message = new Discord.MessageEmbed()
            .setTitle(`💿 Next up for ${this.channel.name}...`)
            .addFields({ name: next.author.username, value: refactoredRequest })
            .setColor('LUMINOUS_VIVID_PINK')
            .setFooter(`${this.queue.peekAll().length} request(s) to play...`)

        bot.context.channel.send(message)

        return true

    }
}