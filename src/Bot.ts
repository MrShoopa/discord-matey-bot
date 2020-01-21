import * as FileSystem from 'fs'
import * as Path from 'path'
import Request from 'request'
import Stream from 'stream'
import NodeFetch from 'node-fetch'

import YTDL from 'ytdl-core'
import SC from 'soundcloud-audio'

import Discord from 'discord.js'

import * as Datypes from './types/index'
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

        if (this.voiceChannel === null &&
            this.waker.id === this.user.id)
            this.voiceChannel = this.lastMessage.member.voice.channel
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
                }).catch(e => { throw e })
            } catch (error) {
                if (!this.voiceChannel)
                    this.context
                        .reply(`where do I dump this noise? you gotta be in a voice channel first!`)
                else
                    this.saveBugReport(error, true)
            }
        }

        function playAudioFile(song: string | Datypes.Song.SongObject, connection, replaying?: boolean) {
            let bot: Bot = globalThis.bot

            if (typeof song == 'string') {
                dispatcher = connection.play(song)
                bot.songState = SongState.Playing

                if (!replaying) {
                    console.log(`Playing non-tagged song from first match: ${song}`)

                    bot.context.reply(`playing ${song.split('\\').pop()} 👌`)
                }
            } else if (Datypes.Song.isSongObject(song)) {
                dispatcher = connection.play(song.file)
                bot.songState = SongState.Playing


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

                    bot.songState = SongState.Finished
                    bot.voiceChannel.leave()
                }
            })
            dispatcher.on('close', () => {
                console.log(`Song interrupted by user.`)
            })
        }
    }

    async playAudioFromURL(url: string, loop?: boolean, trigger?: string) {
        var dispatcher: Discord.StreamDispatcher
        var stream: Stream.Readable | Discord.VoiceBroadcast
        var streamInfo: Datypes.Stream.StreamInfo
            = { source: 'None' }

        if (!this.commandSatisfied) {
            console.log('URL Command matched')

            if (trigger)
                this.preliminary(trigger, 'Audio playback from URL', true)

            var streamOptions: object = {
                seek: 0,
                volume: .75
            }
            var streamInfo: Datypes.Stream.StreamInfo
                = { source: 'None' }

            try {
                return this.voiceChannel.join().then(connection => {
                    console.group()
                    console.info(
                        `Voice channel connection status: ${connection.status}`)
                    this.songState = SongState.Playing

                    if (loop)
                        this.context.channel.send(`Looks like I'm looping this one! 💫🤹‍♀️`)

                    if (!playAudioURL(connection))
                        return this.context.channel.send(`I couldn't play that source. Did you type in your URL correctly?`)
                }).catch(e => { throw e })
            } catch (error) {
                if (!this.voiceChannel)
                    this.context
                        .reply(`where do I dump this noise? you gotta be in a voice channel first!`)
                else
                    this.saveBugReport(error, true)
            }
        }

        async function createStreamObject() {

            if (url.includes('youtu')) {
                streamInfo = { source: url, platform: 'YouTube' }


                try {
                    stream = YTDL(url.toString(), {
                        filter: 'audioonly',
                        highWaterMark: 1 << 25,
                    })

                    await YTDL.getInfo(url.toString()).then(info => {
                        streamInfo.name = info.title
                        streamInfo.thumbnailUrl = info.thumbnail_url
                        streamInfo.author = info.author.name
                    })
                    return stream
                } catch (error) {
                    let bot: Bot = globalThis.bot
                    if (error.message.includes('Video id'))
                        bot.context.reply(`this youtube link isn't valid`)
                    else
                        bot.saveBugReport(error, true)

                    return null
                }

            } else if (url.includes('soundcloud')) {

                //  TODO: SoundCloud support

                const SC_CLIENT_ID = CREDS.soundcloud.client_id

                SC.initialize({
                    client_id: SC_CLIENT_ID
                })

                stream = SC.stream('/tracks/293').then((player: { play: () => void }) => {
                    console.log('test)')
                    player.play();
                });

                //stream.resolve(url.toString())

                streamInfo = { source: url, name: SC.info, platform: 'SoundCloud' }


                return this.context.reply('SoundCloud support coming sometime later. :)')
            }
        }

        async function playAudioURL(
            connection: Discord.VoiceConnection, replaying?: boolean) {
            let bot: Bot = globalThis.bot

            stream = await createStreamObject()
            if (!stream) return null

            try {
                dispatcher = connection.play(stream, streamOptions)

                dispatcher.on('start', () => {
                    bot.songState = SongState.Playing
                    console.group()
                    console.log(`Now playing song from ${url}.`)

                    if (!replaying)
                        bot.textChannel.send(generatePlaybackMessage())

                })

                dispatcher.on('close', () => {
                    bot.songState = SongState.Stopped

                    console.log(`Song interrupted by user.`)
                    console.groupEnd()
                })

                dispatcher.on('end', () => {
                    if (loop) {
                        console.info('Looping song...')
                        return playAudioURL(connection, true)
                    } else {
                        console.info('Song played successfully.')

                        bot.songState = SongState.Finished
                        bot.voiceChannel.leave()
                    }

                    console.groupEnd()
                })

                return true
            } catch (error) {
                console.log(`Error playing URL stream!`)
                bot.saveBugReport(error, true)

                bot.waker.lastMessage.channel
                    .send(`Ah! I couldn't play that song for some reason. Sent a bug report to Joe.`)
            }

        }

        function generatePlaybackMessage(bot: Bot = globalThis.bot) {
            let playbackMessage = new Discord.MessageEmbed()
                .setAuthor('Mega-Juker! 🔊')
                .setTitle('Playing Online Audio')
                .setColor('ffc0cb')
                .setURL(url)

            playbackMessage
                .setDescription(`\nI'm playing your request, ${bot.context.author.username}! 👌`)

            if (streamInfo.name && streamInfo.author)
                playbackMessage
                    .addField(streamInfo.name, streamInfo.author)
            else if (streamInfo.name)
                playbackMessage
                    .addField(streamInfo.name, streamInfo.source)

            if (streamInfo.platform)
                playbackMessage
                    .setFooter(streamInfo.platform)

            if (streamInfo.thumbnailUrl)
                playbackMessage
                    .setImage(streamInfo.thumbnailUrl)

            if (loop)
                playbackMessage
                    .setFooter('this song is gonna be **LOOOOOPED**')

            return playbackMessage
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
                            this.saveBugReport(error, true)
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
                new TypeError(`Tried to fetch image that's not a string URL: ${url}`), true)

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
    saveBugReport(error: Error
        , logInConsole?: boolean, reply?: boolean) {
        if (logInConsole) console.error(`Error occured on: ${new Date().toString()}:\n ${error.stack}`)

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
        ${this.waker.username} on ${this.context?.guild.name}` +
                    // Add extra details where necessary            
                    `${(() => {
                        if (this.textChannel instanceof Discord.TextChannel) {
                            return `'s channel '${this.textChannel.name}'`
                        }
                    })()}`
                    // Finish adding details
                    + ` said:
            "${this.context.toString()}"
                `)
                , callback => {
                    if (callback as Error)
                        console.error(`Error writing crash log: ${callback}`)
                })
        }
        )

        if (reply && this.lastWaker)
            this.lastWaker.lastMessage.channel.send(new Discord.MessageEmbed()
                .setAuthor('Megadork Crash Reporter 📝')
                .setDescription`Log submitted to Joe.`)
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
