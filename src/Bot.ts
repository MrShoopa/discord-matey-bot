import * as FileSystem from 'fs'
import * as Path from 'path'
import Snekfetch from 'snekfetch'
import Request from 'request'
import YTDL from 'ytdl-core'

import Discord from 'discord.js'

import * as Datypes from './ts/interfaces/index'
import BotData from './bot_functions/DataHandler'

import CREDS from './user_creds.json'

import { main_trigger } from './bot_knowledge/triggers/triggers.json'

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
            .then(
                this.restrictedRoleId = this.fetchRoleID(CREDS.you.restricted_role_name)
            )

        //  Check data
        try {
            this.data = BotData.getUserDataFile()
            if (!this.data)
                BotData.createNewDataFile()
            this.data = BotData.getUserDataFile()
        } catch {

        }
    }

    data: BotData;
    restrictedRoleId: string

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
        this.voiceChannel = value.member.voice.channel
    }

    get lastMessage() {
        if (!this.lastMessage) return this._context
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

    /*  ---- Bot Helper Background Functions ---- */

    //TODO: Make a version that works for multiple guilds.
    fetchRoleID(roleName = this.restrictedRoleId) {
        this.guilds.forEach(guild => {
            guild.roles.forEach(role => {
                if (role.name == roleName)
                    return role.id
            })
        })
        return null
    }

    playAudioFromFiles(song: Datypes.Song.SongObject | string, loop?: boolean, trigger?: string) {
        let dispatcher: Discord.StreamDispatcher

        if (!this.commandSatisfied) {

            if (trigger)
                this.preliminary(trigger, 'Audio playback from files', true)

            try {
                this.voiceChannel.join().then(connection => {
                    console.group()
                    console.log(`Local song playing...`)
                    console.info(
                        `Voice channel connection status: ${connection.status}`)
                    this.songState = SongState.Playing

                    playAudioFile(song, connection)

                    if (loop)
                        this.context.channel.send('This track is... loop-de-looped! 💫🤹‍♀️')

                    console.groupEnd()
                })
            } catch (error) {
                if (!this.voiceChannel)
                    this._context
                        .reply(`, where do I dump this noise? you gotta be in a voice channel first!`)
                else
                    this.saveBugReport(error)
            }
        }

        function playAudioFile(song: string | Datypes.Song.SongObject, connection, replaying?: boolean) {
            let bot: Bot = globalThis.bot

            if (typeof song == 'string') {
                dispatcher = connection.play(song)

                if (!replaying) {
                    console.log(`Playing non-tagged song from first match: ${song}`)

                    bot.context.reply(`Playing ${song.split('\\').pop()} 👌`)
                }
            } else if (Datypes.Song.isSongObject(song)) {
                dispatcher = connection.play(song.file)

                if (!replaying) {
                    console.log(`Playing tagged song: ${song.title}`)
                    console.log(`Responding with '${song.play_phrase}'`)

                    bot.context.reply(song.play_phrase)
                }

            } else {
                console.log(`No song was played. Nothing... passed in?`)

                bot.saveBugReport(
                    new Error('Tried to play an unsupported audio-based object.'))
            }

            dispatcher.on('end', () => {
                if (loop) {
                    console.info('Looping song...')
                    playAudioFile(song, connection, true)
                } else {
                    console.info('Song played successfully.')

                    this.songState = SongState.Finished
                    this.voiceChannel.leave()
                }
            })
            dispatcher.on('close', () => {
                console.log(`Song interrupted by user.`)
            })
        }
    }

    //TODO: Add loop (see above for reference)
    async playAudioFromURL(url: string, loop?: boolean, trigger?: string) {
        if (!this.commandSatisfied) {

            console.log('URL Command matched')
            if (trigger)
                this.preliminary(trigger, 'Audio playback from URL', true)

            var stream: string | import("stream").Readable | Discord.VoiceBroadcast
            var streamOptions: object = {
                seek: 0,
                volume: .75
            }
            var streamInfo: Datypes.Stream.StreamInfo
                = { source: 'None' }


            if (url.includes('youtu')) {
                streamInfo.source = 'YouTube'

                try {
                    stream = YTDL(url.toString(), {
                        filter: 'audioonly',
                        highWaterMark: 1 << 25,
                    })
                } catch (error) {
                    if (error.message.includes('Video id'))
                        return this._context.reply(`this youtube link isn't valid`)
                }

                streamInfo = { source: url, platform: 'YouTube' }
            } else if (url.includes('soundcloud')) {

                //  TODO: SoundCloud support
                /*
                                const SC_CLIENT_ID = 'b45b1aa10f1ac2941910a7f0d10f8e28'
                                const SC = require('soundcloud')
                
                                SC.initialize({
                                    client_id: SC_CLIENT_ID
                                })
                
                                stream = SC.stream('/tracks/293').then( (player) {
                                    console.log('test)')
                                    player.play();
                                });
                
                                stream.resolve(url.toString())
    
                                streamInfo = { source: url, name: SC.info, platform: 'SoundCloud' }
                */

                return this.context.reply('SoundCloud support coming sometime later. :)')

            }

            if (this.voiceChannel === null &&
                this.waker.id === this.user.id)
                this.voiceChannel = this.lastMessage.member.voice.channel

            try {
                this.voiceChannel.join().then(connection => {
                    this.songState = SongState.Playing
                    console.log(
                        `Voice channel connection status: ${connection.status}`)

                    try {
                        var dispatcher: Discord.StreamDispatcher
                            = connection.play(stream, streamOptions)

                        dispatcher.on('start', () => {
                            console.group()
                            console.log(`Now playing song from ${url}.`)

                            if (streamInfo.name && streamInfo.platform)
                                this.context.reply(`\nPlaying ${streamInfo.name} from ${streamInfo.platform}. 👌`)
                            else if (streamInfo.platform)
                                this.context.reply(`\nI'm playing your song from ${streamInfo.platform}. 👌`)
                            else
                                this.context.reply(`\nPlaying song from your above URL.`)
                        })

                        dispatcher.on('close', () => {
                            this.songState = SongState.Stopped

                            console.log(`Song interrupted by user.`)
                            console.groupEnd()
                        })

                        dispatcher.on('end', () => {
                            if (loop)
                                connection.play(stream, streamOptions)
                            else {
                                console.log('Song played successfully.')
                                console.groupEnd()

                                this.songState = SongState.Finished
                                this.voiceChannel.leave()
                            }
                        })

                    } catch (error) {
                        console.log(`Error playing song!.`)
                        this.saveBugReport(error)

                        this.waker.lastMessage.channel
                            .send(`Ah! I couldn't play that song for some reason. Sent a bug report to Joe.`)
                    }

                    // FINISHED
                    this.commandSatisfied = true
                })
            } catch (error) {
                if (!this.voiceChannel)
                    this._context
                        .reply(`, where do I dump this noise? you gotta be in a voice channel first!`)
                else
                    this.saveBugReport(error)
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
                            this.saveBugReport(error)
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
                new TypeError(`Tried to fetch image that's not a string URL: ${url}`))

        return new Promise((res, rej) => {
            Snekfetch.get(url)
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

    //TODO:
    botError(code?: number, messageString?: string) {
        let errorMessage: string

        if (!messageString && !code) {
            errorMessage = `Hmmm. Something wrong happened.`
        } else if (code) {
            if (code == 4001)
                errorMessage = `Error ${code} - Couldn't play song.`
        } else this.textChannel.send(`Error ${code} - ${messageString}`)

        this.textChannel.send(errorMessage)
    }

    /**
     * Takes in error in program and saves a generated bug log with timestamp in a single
     * bug report.
     * @param error Error thrown by code
     */
    saveBugReport(error: Error
        , logInConsole?: boolean) {
        if (logInConsole) console.error(`Error occured on: ${new Date().toString()}:\n
            ${error}`)

        var reportPath: string = __dirname + `/../crash_logs`

        FileSystem.exists(reportPath, exists => {
            if (!exists)
                FileSystem.mkdir(reportPath, folderError => {
                    console.error(`Error creating crash log folder: ${folderError}`)
                })
            reportPath = Path.join(reportPath)

            FileSystem.appendFile(reportPath + `/` + `crash_log_` +
                (new Date().getMonth() + 1) + `_` +
                new Date().getDate() + `_` +
                new Date().getFullYear().toString() +
                `.txt`,
                (`
        Error encountered during bot runtime! -> ${new Date().toString()}
        ---------
        ${error.stack}
        ---------

        `)
                , logError => {
                    console.error(`Error writing crash log: ${logError}`)
                })
        }
        )

        if (this.lastWaker)
            this.lastWaker.lastMessage.channel.send(`Log submitted to Joe.`)
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

        var results = [];

        // Read contents of directory
        FileSystem.readdirSync(dir).forEach(dirInner => {
            if (!caseSensitive) dirInner = dirInner.toLowerCase()

            // Obtain absolute path
            dirInner = Path.resolve(dir, dirInner);

            // Get stats to determine if path is a directory or a file
            var stat = FileSystem.statSync(dirInner);

            // If path is a directory, scan it and combine results
            if (stat.isDirectory()) {
                results = results.concat(Bot.searchFilesRecursive(dirInner, pattern));
            }

            // If path is a file and ends with pattern then push it onto results
            if (stat.isFile() && dirInner.endsWith(pattern)) {
                results.push(dirInner);
            }
        });

        return results;
    };

    /**
     * Helper for blind-picking phrases of lists
     * @param key Array of strings filled with quotes
     */
    static fetchRandomPhrase(key: string[]) {
        return key[Math.floor(Math.random() * (key.length))]
    }

}
