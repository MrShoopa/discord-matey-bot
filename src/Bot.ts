import * as FileSystem from 'fs-extra'
import * as Path from 'path'
import Request from 'request'
import Stream from 'stream'
import NodeFetch from 'node-fetch'

import Discord, { Role } from 'discord.js'
import YTDL from 'ytdl-core'

import * as Datypes from './types/index'
import BotData from './bot_functions/DataHandler'

import CREDS from './user_creds.json'
import { main_trigger } from './bot_knowledge/triggers/triggers.json'

import BotLoggerFunctions from './bot_functions/general/LoggerFunctions'

import BotModuleMusic from './bot_functions/music/MusicFunctions'

export enum SongState {
    Unknown = 'unknown',
    Fetching = 'fetching',
    Loading = 'loading',
    Playing = 'playing',
    Stopped = 'stopped',
    Finished = 'finished'
}

export default class Bot extends Discord.Client {

    constructor(apiKey: string = CREDS.discord.API_KEY) {
        super()

        this.login(apiKey).catch(error => (console.log(`Discord connection error: ${error}`)))

        //  Check data

        if (!BotData.getUserDataFile())
            BotData.createNewDataFile()
    }

    restrictedRoleIds: string[] = []

    private _context: Discord.Message | Discord.PartialMessage
    waker: Discord.User
    textChannel: Discord.TextChannel | Discord.DMChannel
    voiceChannel: Discord.VoiceChannel

    private _lastMessage: Discord.Message | Discord.PartialMessage
    private _lastWaker: Discord.User

    commandSatisfied: boolean
    songState: SongState

    get context() { return this._context }
    set context(value: Discord.Message | Discord.PartialMessage) {
        if (this.user.id !== value.author.id) {
            this.lastMessage = this._context
            this.lastWaker = this._context?.author

            this._context = value
        }

        this.waker = value.author
        this.textChannel = value.channel

        if (this.voiceChannel === null &&
            this.waker.id === this.user.id)
            this.voiceChannel = this.lastMessage.member.voice.channel
        else if (this.waker.id === this.user.id)
            this.voiceChannel = this.voiceChannel
        else
            this.voiceChannel = value.member.voice.channel
    }

    get lastMessage() {
        if (!this._lastMessage) return this._context
        else return this._lastMessage
    }
    get lastWaker() {
        if (!this._lastWaker) return this.waker
        else return this._lastWaker
    }

    set lastMessage(v) { this._lastMessage = v }
    set lastWaker(v) { this._lastWaker = v }

    preliminary(trigger: string = 'None', intent?: string,
        preventNextAction?: boolean, overwriteLastMessage?: boolean) {
        if (preventNextAction)
            this.commandSatisfied = true
        if (overwriteLastMessage && (this.user.id !== this.context.id))
            this.lastMessage = this.context

        console.group()
        console.log(`--- BOT GO! ---`)
        console.info(`TRIGGER: "${trigger}"`)
        console.info(`CALLER: '${this.context.author.username}'`)
        console.info(`CONTEXT: "${this.context}"`)
        if (intent)
            console.info(`ACTION: ${intent}`)
        console.groupEnd()

    }

    /*  ---- Post-Connect Functions ---- */

    populateRestrictedRoleList() {
        CREDS.you.restricted_role_names.forEach(name => {
            this.restrictedRoleIds.push(this.fetchRoleID(name))
        })
    }

    /*  ---- Bot Helper Background Functions ---- */

    fetchRoleID(roleName: string) {
        let role: Role = null

        role = this.guilds.cache.map(guild => {
            return guild.roles.cache.find(r => {
                return r.name == roleName
            })
        })[0]

        if (role)
            return role.id
        else
            return null
    }

    async playAudioFromFiles(song: Datypes.Song.SongObject | string, loop?: boolean, gapless?: boolean, trigger?: string)
        : Promise<SongState> {
        let dispatcher: Discord.StreamDispatcher
        let songInfo: Datypes.Stream.SongInfo
            = {
            source: 'local',
            platform: 'Local Files 💖'
        }

        if (!this.commandSatisfied) {

            if (trigger)
                this.preliminary(trigger, 'Audio playback from files', true)

            try {
                let connection = await this.voiceChannel.join().catch(e => { throw e })
                console.groupEnd()
                console.group()
                console.log(`Local song playing...`)
                console.info(
                    `Voice channel connection status: ${connection.status}`)

                if (loop)
                    this.context.channel.send('This track is... loop-de-looped! 💫🤹‍♀️')

                try {
                    let result = await playAudioFile(song, connection).catch(e => { throw e })

                    return new Promise(resolve => {
                        resolve(result)
                    })
                } catch (err) { throw err }
            } catch (error) {
                if (!this.voiceChannel)
                    this.context
                        .reply(`where do I dump this noise? you gotta be in a voice channel first!`)
                else
                    this.saveBugReport(error, this.playAudioFromFiles.name, true)

                return new Promise(resolve => {
                    resolve(SongState.Unknown)
                })
            }
        }

        async function playAudioFile(song: string | Datypes.Song.SongObject,
            connection: Discord.VoiceConnection, replaying?: boolean) {
            let bot: Bot = globalThis.bot

            try {
                return new Promise<SongState>((resolve, reject) => {
                    let state = SongState.Loading

                    if (typeof song == 'string') {

                        dispatcher = connection.play(song)
                        state = SongState.Playing

                        let songPath = song.split('\\')

                        songInfo.name = songPath.pop()
                        songInfo.localFolder = songPath[songPath.length - 2]

                    } else if (Datypes.Song.isSongObject(song)) {

                        dispatcher = connection.play(song.file)
                        state = SongState.Playing

                        songInfo.name = song.title
                        songInfo.localFolder = song.file.split(`/`)[song.file.split(`/`).length - 2]
                        songInfo.botPhrase = song.play_phrase

                    } else {
                        console.log(`No song was played. Nothing... passed in?`)

                        bot.saveBugReport(
                            new Error('Tried to play an unsupported audio-based object.'))

                        reject(SongState.Unknown)
                    }

                    dispatcher.on('start', () => {
                        state = SongState.Playing
                        console.groupEnd()
                        console.group()
                        if (Datypes.Song.isSongObject(song))
                            console.log(`Now playing local and tagged file: ${songInfo.name} in ${songInfo.localFolder}.`)
                        else
                            console.log(`Now playing local file: ${song}`)

                        if (!replaying)
                            bot.textChannel
                                .send(BotModuleMusic.generatePlaybackMessage(songInfo))
                    })

                    dispatcher.on('close', () => {
                        console.log(`Song interrupted by user.`)
                        console.groupEnd()

                        resolve(SongState.Stopped)
                    })

                    dispatcher.on('finish', () => {
                        if (loop) {
                            console.info('Looping song...')
                            playAudioFile(song, connection, true)
                        } else {
                            console.info('Song played successfully.')

                            bot.songState = SongState.Finished
                            if (!gapless) bot.voiceChannel.leave()
                        }

                        console.groupEnd()

                        resolve(SongState.Finished)
                    })
                })
            } catch (error) {
                bot.saveBugReport(error, playAudioFile.name, true)

                bot.waker.lastMessage.channel
                    .send(`Ah! I couldn't play that song for some reason. Sent a bug report to Joe.`)

                throw new Error(`Music playback error (file), see above for error message.`)
            }
        }
    }

    async playAudioFromURL(url: string, loop?: boolean, gapless?: boolean, trigger?: string)
        : Promise<SongState> {
        var dispatcher: Discord.StreamDispatcher
        var stream: Stream.Readable | FileSystem.ReadStream
        var songInfo: Datypes.Stream.SongInfo
            = { source: 'undefined turtle', url: url }
        var cacheFolder = './cache/music', tempSong: string

        if (!this.commandSatisfied) {
            console.log('URL Command matched')

            if (trigger)
                this.preliminary(trigger, 'Audio playback from URL', true)

            var streamOptions: object = {
                seek: 0,
                volume: .75
            }
            var songInfo: Datypes.Stream.SongInfo
                = { source: 'None' }

            try {
                let connection = await this.voiceChannel.join().catch(e => { throw e })
                console.groupEnd()
                console.group()
                console.info(
                    `Voice channel connection status: ${connection.status}`)

                if (loop)
                    this.context.channel.send(`Looks like I'm looping this one! 💫🤹‍♀️`)

                try {
                    let result = await playAudioURL(connection).catch(e => { throw e })
                    if (result == SongState.Unknown)
                        this.context.channel.send(`I couldn't play that source. Did you type in your URL correctly?`)

                    return new Promise(resolve => {
                        resolve(result)
                    })
                } catch (err) { throw err }
            } catch (err) {
                if (!this.voiceChannel)
                    this.context
                        .reply(`where do I dump this noise? you gotta be in a voice channel first!`)
                else
                    this.saveBugReport(err, playAudioURL.name, true)

                return new Promise(resolve => {
                    resolve(SongState.Unknown)
                })
            }
        }

        async function createStreamObject() {

            if (url.includes('youtu')) {
                songInfo = { source: url, platform: 'YouTube' }

                try {
                    stream = YTDL(url.toString(), {
                        filter: 'audioonly',
                        highWaterMark: 1 << 25,
                    })

                    await YTDL.getInfo(url.toString()).then(video => {
                        songInfo.name = video.title
                        songInfo.thumbnailUrl = video.thumbnail_url
                        songInfo.author = video.author.name
                        songInfo.url = url
                    }).catch(e => { throw e })
                    return stream
                } catch (error) {
                    let bot: Bot = globalThis.bot
                    if (error.message.includes('Video id'))
                        bot.context.reply(`this YouTube link isn't valid...`)
                    else if (error.message.includes('unavailable'))
                        bot.context.reply(`unfortunately this YouTube video is unavailable to play.`)
                    else
                        bot.saveBugReport(error, createStreamObject.name, true)

                    return null
                }
            } else if (url.includes('soundcloud')) {
                songInfo = { source: url, platform: 'SoundCloud' }

                let sc = BotModuleMusic.scClient

                try {

                    await sc.tracks.get(url).then(async track => {
                        songInfo.name = track.title
                        songInfo.author = track.user.username
                        songInfo.thumbnailUrl = track.artwork_url
                        songInfo.authorImgUrl = track.user.avatar_url
                        songInfo.genre = track.genre
                            .catch(e => { throw e })

                        stream = await BotModuleMusic.scClient.util.streamTrack(`${track.id}`,
                            './cache/music/soundcloud')
                            .then(s => {
                                return s as FileSystem.ReadStream
                            }).catch(e => {
                                console.log(e)
                                throw e
                            }) as FileSystem.ReadStream
                    })

                    if (stream instanceof FileSystem.ReadStream)
                        tempSong = stream.path.toString()

                    return stream
                } catch (err) {
                    let bot: Bot = globalThis.bot
                    if (err.message.includes('Video id'))
                        bot.context.reply(`this SoundCloud link isn't valid...`)
                    else if (err.message.includes('unavailable'))
                        bot.context.reply(`unfortunately this SoundCloud track is unavailable to play.`)
                    else
                        bot.saveBugReport(err, createStreamObject.name, true)

                    return null
                }
            } else if (url.includes('spotify')) {
                //This will never happen (Look at Spotify ToS)
            }
        }

        async function playAudioURL(
            connection: Discord.VoiceConnection, replaying?: boolean) {
            let bot: Bot = globalThis.bot

            stream = await createStreamObject()
            if (!stream) return null

            try {

                return new Promise<SongState>(resolve => {
                    dispatcher = connection.play(stream, streamOptions)
                    let state = SongState.Loading

                    dispatcher.on('start', () => {
                        state = SongState.Playing
                        console.groupEnd()
                        console.group()
                        console.log(`Now playing song from ${url}.`)
                        console.log(dispatcher.paused)

                        if (!replaying)
                            bot.textChannel
                                .send(BotModuleMusic.generatePlaybackMessage(songInfo))

                    })

                    dispatcher.on('close', () => {
                        console.log(`Song interrupted by user.`)
                        console.groupEnd()

                        resolve(SongState.Stopped)
                    })

                    dispatcher.on('finish', () => {
                        if (loop) {
                            console.info('Looping song...')
                            return playAudioURL(connection, true)
                        } else {
                            console.info('Song played successfully.')

                            let fileInstance = cacheFolder + `/${tempSong}`

                            FileSystem.exists(fileInstance, (exists) => {
                                if (exists)
                                    FileSystem.remove(fileInstance)
                            })

                            bot.songState = SongState.Finished
                            if (!gapless) bot.voiceChannel.leave()
                        }

                        console.groupEnd()

                        resolve(SongState.Finished)
                    })
                })

                //return true
            } catch (error) {
                bot.saveBugReport(error, playAudioURL.name, true)

                bot.waker.lastMessage.channel
                    .send(`Ah! I couldn't play that song for some reason. Sent a bug report to Joe.`)

                throw new Error(`Music playback error (URL), see above for error message.`)
            }

        }
    }

    fetchJSONFromURL(url: string, announce?: boolean, log?: boolean): any {
        console.group()
        console.log(`Fetching JSON from ${url}...`)
        if (announce) this.textChannel.send(`Fetching from ${url}...`)

        // Asyncrhonous fetching
        return new Promise((resolve, reject) => {
            Request.get(url, { json: true },
                (error, response, body) => {
                    if (error) {

                        console.error('Fetching JSON error: ')
                        if (log) console.error(error)
                        console.error(`Fetching JSON Failed - Code ${response.statusCode}`)

                        if (response.statusCode === 404)
                            console.error(`Couldn't find JSON with URL.`)
                        else if (response.statusCode === 401)
                            console.error(`Not authorized.`)
                        else {
                            console.error(`Unknown error. Logged to report.`)
                            this.saveBugReport(error, this.fetchJSONFromURL.name, true)
                        }

                        console.groupEnd()

                        reject(response.statusMessage)
                    } else {
                        if (response.statusCode === 200)
                            if (log) console.log(body)

                        console.log('Successfully fetched!')
                        console.groupEnd()
                        resolve(body)
                    }
                })
        })
    }

    fetchImageFromURL(url: string): any {
        if (typeof url !== 'string')
            this.saveBugReport(
                new TypeError(`Tried to fetch image that's not a string URL: ${url}`),
                this.fetchImageFromURL.name, true)

        return new Promise((res, rej) => {
            NodeFetch(url)
                .then(result => {
                    console.log(`Image fetched from ${url}.`)
                    res(result)
                }).catch(error => {
                    console.error(`Could not fetch image - ${error}`)
                    rej(error)
                })
        })
    }

    containsRightTextContext(desiredContext: string, withHotword?: boolean) {
        let bot: Bot = globalThis.bot
        let trigger: string

        if (withHotword)
            for (trigger of main_trigger)
                return bot.context.toString().includes(trigger)

        return bot.context.toString().includes(desiredContext)
    }

    generateErrorMessage(message?: string): Discord.Message {
        let built = new Discord.Message(this,
            {
                content: "Unfortunately, I couldn't perform that action at the moment."
            }, this.context.channel)

        if (message)
            built.content = message

        return built
    }

    /**
     * Takes in error in program and saves a generated bug log with timestamp in a single
     * bug report.
     * @param error Error thrown by code
     */
    saveBugReport(error: Error, func?: string, logInConsole?: boolean, reply?: boolean) {
        BotLoggerFunctions.saveBugReport(error, func, logInConsole, reply)
    }

    /**
     * Recursive search a directory within FileSystem
     * @param dir directory of choice
     * @param name of file/folder to find
     * @param caseSensitive Whether to check for cAsE SenSITive matches
     */
    static searchFilesRecursive(dir: string, pattern: string,
        caseSensitive: boolean = false) {
        if (!caseSensitive) pattern = pattern.toLowerCase()

        var results = []

        // Read contents of directory
        FileSystem.readdirSync(dir).forEach(dirInner => {
            if (!caseSensitive) dirInner = dirInner.toLowerCase()

            // Obtain absolute path
            dirInner = Path.resolve(dir, dirInner)

            // Get stats to determine if path is a directory or a file
            var stat = FileSystem.statSync(dirInner)

            // If path is a directory, scan it and combine results
            if (stat.isDirectory()) {
                results = results.concat(Bot.searchFilesRecursive(dirInner, pattern))
            }

            // If path is a file and ends with pattern then push it onto results
            if (stat.isFile() && dirInner.endsWith(pattern)) {
                results.push(dirInner)
            }
        })

        return results
    }

    /**
     * Helper for blind-picking phrases of lists
     * @param key Array of strings filled with quotes
     */
    static fetchRandomPhrase(key: string[]) {
        return key[Math.floor(Math.random() * (key.length))]
    }

}
