import fs from 'fs'
import * as FileSystem from 'fs-extra'
import Path, { dirname } from 'path'
import Request from 'request'
import Stream from 'stream'
import NodeFetch from 'node-fetch'

import Discord, { Role } from 'discord.js'
import DJSVoice, { createAudioPlayer } from '@discordjs/voice';
import YTDL from 'ytdl-core'
import { raw as YTDLExectuer } from 'youtube-dl-exec'

import BotData from './bot_functions/DataHandler.js'
import { AudioData } from './types/data_types/AudioType.js'
import { StreamData } from './types/data_types/StreamType.js'

import KEYS from './user_creds.js'
import TRIGGERS from './bot_knowledge/triggers/triggers.js'

import BotLoggerFunctions from './bot_functions/general/LoggerFunctions.js'

import BotModuleMusic from './bot_functions/music/MusicFunctions.js'
import { DiscordGatewayAdapterCreator, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice'

export enum SongState {
    Unknown = 'unknown',
    Down = 'down',
    Fetching = 'fetching',
    Loading = 'loading',
    Playing = 'playing',
    Stopped = 'stopped',
    Finished = 'finished'
}

export default class Bot extends Discord.Client {

    constructor(apiKey: string = KEYS.discord.API_KEY) {
        super({
            intents: [
                'GUILDS',
                'DIRECT_MESSAGES',
                'DIRECT_MESSAGE_TYPING',
                'GUILD_BANS',
                'GUILD_INVITES',
                'GUILD_MESSAGES',
                'GUILD_PRESENCES',
                'GUILD_VOICE_STATES'
            ]
        })

        this.login(apiKey).catch(error => {
            console.error(`Discord connection error: ${error}`)
            throw error
        })

        //  Check data

        if (!BotData.getUserDataFile())
            BotData.createNewDataFile()
    }

    restrictedRoleIds: string[] = []

    private _context: Discord.Message | Discord.PartialMessage
    lastDM: Discord.Message
    waker: Discord.User
    textChannel: Discord.TextChannel | Discord.DMChannel
    voiceChannel: Discord.VoiceChannel

    private _lastMessage: Discord.Message | Discord.PartialMessage
    private _lastWaker: Discord.User

    commandSatisfied: boolean | string
    songState: SongState
    overrideContext: boolean

    get context() { return this._context }
    set context(value: Discord.Message | Discord.PartialMessage) {
        if (this.user.id !== value.author.id || this.overrideContext) {
            this.lastMessage = this._context
            this.lastWaker = this._context?.author

            this._context = value

            this.overrideContext = false
        }

        this.waker = value.author
        this.textChannel = value.channel as Discord.TextChannel | Discord.DMChannel

        if (this.lastMessage.member.voice.channel instanceof Discord.VoiceChannel && value.member.voice.channel instanceof Discord.VoiceChannel)
            if (this.voiceChannel === null &&
                this.waker.id === this.user.id)
                this.voiceChannel = this.lastMessage.member.voice.channel
            else if (this.waker.id === this.user.id)
                this.voiceChannel = this.voiceChannel
            else if (value.member?.voice.channel)
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
        KEYS.you.restricted_role_names.forEach(name => {
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

    async playAudioFromFiles(song: AudioData.SongObject | string, message: Discord.Message,
        loop?: boolean, queueNumber?: number,
        trigger?: string, skipLog?: boolean)
        : Promise<SongState> {
        let songInfo: StreamData.SongInfo
            = {
            source: 'local',
            platform: 'Local Files 💖'
        }

        if (!this.commandSatisfied) {

            if (trigger)
                this.preliminary(trigger, 'Audio playback from files', true)

            try {
                let connection = joinVoiceChannel({
                    channelId: this.voiceChannel.id,
                    guildId: this.voiceChannel.guild.id,
                    //? why do i gotta write this like this aaaaa
                    adapterCreator: this.voiceChannel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
                })

                if (!queueNumber)
                    await this.playSFX(connection, AudioData.SFX.MusicJoin).catch(() => {
                        console.warn(`Couldn't play SFX sound ${AudioData.SFX.MusicLeave.name}. Check it's location!`)
                    })

                console.groupEnd()
                console.group()
                console.log(`Local song playing...`)
                //? i dont need this lol console.info(`Voice channel connection status: ${connection.status}`)

                if (loop)
                    message.channel.send('This track is... loop-de-looped! 💫🤹‍♀️')

                try {
                    let result = await playAudioFile(song, connection).catch(e => {
                        message.channel.send(`I couldn't play that right now. Try again later.`)
                        throw e
                    })

                    return new Promise(resolve => {
                        resolve(result)
                    })
                } catch (err) { throw err }
            } catch (error) {
                if (!this.voiceChannel)
                    message
                        .reply(`where do I dump this noise? you gotta be in a voice channel first!`)
                else
                    this.saveBugReport(error, this.playAudioFromFiles.name, true)

                return new Promise(resolve => {
                    resolve(SongState.Unknown)
                })
            }
        }

        async function playAudioFile(song: string | AudioData.SongObject,
            connection: DJSVoice.VoiceConnection, messageObj?: Discord.Message, replaying?: boolean) {
            let bot: Bot = globalThis.bot

            try {
                return new Promise<SongState>((resolve, reject) => {
                    let player = createAudioPlayer()
                    let state = SongState.Loading
                    let response: Discord.Message

                    // Installing events...

                    // User interuption!
                    connection.on('stateChange', async (_, stateShift) => {

                        if (stateShift.status == VoiceConnectionStatus.Destroyed) {
                            console.log(`Song interrupted by user.`)
                            console.groupEnd()

                            BotModuleMusic.convertPlaybackMessageToInterrupted(response, message)

                            resolve(SongState.Stopped)
                        }
                    })

                    player.on('stateChange', async (_, stateShift) => {

                        // Connected and ready!
                        if (stateShift.status === DJSVoice.AudioPlayerStatus.Playing) {
                            state = SongState.Playing
                            console.groupEnd()
                            console.group()
                            if (AudioData.isSongObject(song))
                                console.log(`Now playing local and tagged file: ${songInfo.name} in ${songInfo.localFolder}.`)
                            else
                                console.log(`Now playing local file: ${song}`)

                            if (!replaying && !skipLog && message)
                                response = await messageObj.channel
                                    .send({ embeds: [BotModuleMusic.generatePlaybackMessage(messageObj, songInfo)] })
                        }


                        if (stateShift.status == DJSVoice.AudioPlayerStatus.Idle) {
                            if (loop) {
                                console.info('Looping song...')
                                playAudioFile(song, connection, messageObj, true)
                            } else {
                                BotModuleMusic.convertPlaybackMessageToFinished(response, message)

                                console.info('Song played successfully.')

                                bot.songState = SongState.Finished
                                if (!queueNumber) {
                                    await bot.playSFX(connection, AudioData.SFX.MusicLeave).catch(() => {
                                        console.warn(`Couldn't play SFX sound ${AudioData.SFX.MusicLeave.name}. Check it's location!`)
                                    })
                                    connection.disconnect()
                                }
                            }

                            console.groupEnd()

                            resolve(SongState.Finished)
                        }
                    })

                    connection.on('error', err => { throw err })
                    player.on('error', err => { throw err })


                    // Now Play!

                    if (typeof song == 'string') {

                        //?connection.subscribe(player)
                        //?player.play(song)
                        connection.playOpusPacket(fs.readFileSync(song))
                        state = SongState.Playing

                        let songPath = song.split('\\')

                        songInfo.name = songPath.pop()
                        songInfo.localFolder = songPath[songPath.length - 2]

                    } else if (AudioData.isSongObject(song)) {

                        //?connection.subscribe(player)
                        //?player.play(song)
                        connection.playOpusPacket(fs.readFileSync(song.file))
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
                })
            } catch (error) {
                bot.saveBugReport(error, playAudioFile.name, true)

                messageObj.channel
                    .send(`Ah! I couldn't play that song for some reason. Sent a bug report to Shoop.`)

                throw new Error(`Music playback error (file), see above for error message.`)
            }
        }
    }

    async playAudioFromURL(url: string, message?: Discord.Message,
        loop?: boolean, queueNumber?: number, trigger?: string,
        skipLog?: boolean)
        : Promise<SongState> {
        var stream: Stream.Readable | SongState.Down
        var songInfo: StreamData.SongInfo
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
            var songInfo: StreamData.SongInfo
                = { source: 'None' }

            try {
                let connection = joinVoiceChannel({
                    channelId: this.voiceChannel.id,
                    guildId: this.voiceChannel.guild.id,
                    //? why do i gotta write this like this aaaaa
                    adapterCreator: this.voiceChannel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
                })

                if (!queueNumber)
                    await this.playSFX(connection, AudioData.SFX.MusicJoin).catch(() => {
                        console.warn(`Couldn't play SFX sound ${AudioData.SFX.MusicLeave.name}. Check it's location!`)
                    })

                console.groupEnd()
                console.group()
                console.info(
                    `Voice channel connection status: ${connection.state.status}`)

                if (loop)
                    message.channel.send(`Looks like I'm looping this one! 💫🤹‍♀️`)

                try {
                    let result = await playAudioURL(connection, message, null, queueNumber).catch(e => {
                        message.channel.send(`I couldn't play that right now. Try again later.`)
                        throw e
                    })
                    if (result == SongState.Unknown) {
                        console.warn(`No source was created while playing from URL. Check the flow of playAudioURL().`)
                        message.channel.send(`I couldn't play that source. Did you type in your URL correctly?`).then(mes => {
                            setTimeout(() => mes.delete(), 5000);
                        })
                    }

                    if (result == SongState.Down)
                        message.channel.send(`Currently my backend to ${songInfo.platform} is down! Try again later.`)

                    return new Promise(resolve => {
                        resolve(result)
                    })
                } catch (err) { throw err }
            } catch (err) {
                if (!this.voiceChannel)
                    message
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
                url = url.replace(`youtu.be/`, `https://www.youtube.com/watch?v=`)
                let regexTest = url.match(/(?<=\?v=).*(?=&)/g)
                if (regexTest) url = regexTest[0]
                else {
                    regexTest = url.match(/(?<=\?v=).*(?=&)?/g)
                    if (regexTest) url = regexTest[0]
                }
                if (!regexTest) throw new Error('No parsable YT URL found - invalid video id')

                try {
                    let timeStart = "0s"
                    if (url.includes('?t='))
                        timeStart = url.substring(url.indexOf('?t=') + 3) + "s"
                    let ytSource = YTDLExectuer(url.toString(), {
                        o: '-',
                        q: '',
                        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                        r: '100K'
                    },
                        { stdio: ['ignore', 'pipe', 'ignore'] }
                    )
                    if (!ytSource.stdout)
                        throw new Error('No stdout') //? Understand this a bit better
                    stream = ytSource.stdout;
                    const onError = (error: Error) => {
                        if (!ytSource.killed) ytSource.kill();
                        (stream as Stream.Readable).resume();
                        throw error
                    };

                    await YTDL.getInfo(url).then(video => {
                        songInfo.name = video.videoDetails.title
                        songInfo.thumbnailUrl = video.videoDetails.thumbnails[3].url
                        songInfo.author = video.videoDetails.author.name
                        songInfo.url = video.videoDetails.video_url
                    }).catch(e => {
                        console.error(`Error happened when getting info for ${url}...`)
                        throw e
                    })
                    if (globalThis.dev_mode) console.log(`Finished walking through YT source creation.`)
                    return stream

                    //return stream
                } catch (error) {
                    let bot: Bot = globalThis.bot

                    console.error(`Error occured when making Stream object: ${error.message}`)
                    console.error(error.stack)

                    if (error.message.includes('video id'))
                        message.reply(`this YouTube link isn't valid...`)
                    else if (error.message.includes('404'))
                        message.reply(`Video not... found? Huh?`)
                    else if (error.message.includes('unavailable'))
                        message.reply(`unfortunately this YouTube video is unavailable to play. Damn copyrights.`)
                    else if (error.message.includes('429'))
                        message.reply(`Too many YouTube requests have been made in my sh5ared pod. Try again later 😊`)
                    else if (error.message.includes('410')) {

                        message.reply(`Error code 410. That means 'Gone'. Huh, might not see some info here 😁`)
                        return stream
                    } else
                        bot.saveBugReport(error, createStreamObject.name, false)

                    return null
                }
            } else if (url.includes('soundcloud')) {
                songInfo = { source: url, platform: 'SoundCloud' }
                url = url.substr(url.indexOf('soundcloud.com') + 15)

                let sc = BotModuleMusic.scClient

                try {

                    await sc.tracks.getV2(url).then(async track => {
                        songInfo.name = track.title
                        songInfo.author = track.user.username
                        songInfo.thumbnailUrl = track.artwork_url
                        songInfo.authorImgUrl = track.user.avatar_url
                        songInfo.genre = track.genre

                        stream = await BotModuleMusic.scClient.util.streamTrack(`https://soundcloud.com/${url}`)
                            .then(s => {
                                return s as FileSystem.ReadStream
                            }).catch(e => {
                                console.log(e)
                                throw e
                            }) as FileSystem.ReadStream
                    }).catch(
                        e => {
                            throw e
                        })

                    if (stream instanceof FileSystem.ReadStream)
                        tempSong = stream.path.toString()

                    return stream
                } catch (err) {
                    let bot: Bot = globalThis.bot
                    if (err == 'client id expired' || err.response.status == 403)
                        return SongState.Down;
                    else if (err.response.status == 404)
                        message.reply(`unfortunately this SoundCloud track is unavailable to play.`);
                    else if (err.response.status == 400)
                        message.reply(`this SoundCloud link isn't valid...`);
                    else
                        bot.saveBugReport(err, createStreamObject.name, true);

                    return null
                }
            } else if (url.includes('spotify')) {
                //This will never happen (Look at Spotify ToS)
            }
        }

        async function playAudioURL(
            connection: DJSVoice.VoiceConnection, messageObj?: Discord.Message, replaying?: boolean, queueNumber?: number) {
            let bot: Bot = globalThis.bot

            stream = await createStreamObject()
            if (!stream) return SongState.Unknown

            try {

                return new Promise<SongState>(resolve => {
                    let player = createAudioPlayer()
                    let state = SongState.Loading
                    let response: Discord.Message

                    // Installing events...

                    // User interuption!
                    connection.on('stateChange', async (_, stateShift) => {

                        if (stateShift.status == VoiceConnectionStatus.Destroyed) {
                            console.log(`Song interrupted by user.`)
                            console.groupEnd()

                            if (response) BotModuleMusic.convertPlaybackMessageToInterrupted(response, message)

                            resolve(SongState.Stopped)
                        }
                    })

                    player.on('stateChange', async (_, stateShift) => {

                        // Connected and ready!
                        if (stateShift.status === DJSVoice.AudioPlayerStatus.Playing) {

                            state = SongState.Playing
                            console.groupEnd()
                            console.group()
                            console.log(`Now playing song from ${url}.`)

                            if (!replaying && !skipLog && messageObj)
                                response = await message.channel
                                    .send({ embeds: [BotModuleMusic.generatePlaybackMessage(messageObj, songInfo)] })
                        }

                        // The song finished!
                        if (stateShift.status == DJSVoice.AudioPlayerStatus.Idle) {
                            if (loop) {
                                console.info('Looping song...')
                                playAudioURL(connection, message, true)
                                return
                            } else {

                                if (response) BotModuleMusic.convertPlaybackMessageToFinished(response, message)
                                console.info('Song played successfully.')

                                let fileInstance = cacheFolder + `/${tempSong}`

                                FileSystem.exists(fileInstance, (exists) => {
                                    if (exists)
                                        FileSystem.remove(fileInstance)
                                })

                                bot.songState = SongState.Finished
                                if (!queueNumber) {
                                    await bot.playSFX(connection, AudioData.SFX.MusicLeave).catch(() => {
                                        console.warn(`Couldn't play SFX sound ${AudioData.SFX.MusicLeave.name}. Check it's location!`)
                                    })
                                    connection.disconnect()
                                }
                            }

                            console.groupEnd()

                            resolve(SongState.Finished)
                        }
                    })

                    connection.on('error', err => { throw err })
                    player.on('error', err => { throw err })

                    // Now Play!
                    connection.subscribe(player)
                    //*! Error point
                    player.play(DJSVoice.createAudioResource(stream, { metadata: this, inputType: DJSVoice.StreamType.Arbitrary }))
                })


                //return true
            } catch (error) {
                bot.saveBugReport(error, playAudioURL.name, true)

                messageObj.channel
                    .send(`Ah! I couldn't play that song for some reason. Sent a bug report to Shoop.`)

                throw new Error(`Music playback error (URL), see above for error message.`)
            }

        }
    }

    fetchJSONFromURL(url: string, announce?: boolean, log?: boolean): any {
        console.group(`Fetching JSON from ${url}...`)
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

    playSFX(connection: VoiceConnection, sfx: AudioData.SFX) {
        return new Promise((res, rej) => {
            try {
                let dir = fs.realpathSync('') + sfx.filePath
                connection.playOpusPacket(fs.readFileSync(dir))

                res('completed')
            } catch (err) {
                if (globalThis.dev_mode) this.saveBugReport(err, this.playSFX.name, true)
                rej('failed')
            }
        })
    }

    containsRightTextContext(desiredContext: string, withHotword?: boolean) {
        let bot: Bot = globalThis.bot
        let trigger: string

        if (withHotword)
            for (trigger of TRIGGERS.main_trigger)
                return bot.context.toString().includes(trigger)

        return bot.context.toString().includes(desiredContext)
    }

    generateWarningMessage(message?: string, footer?: string): Discord.MessageEmbed {
        let built = new Discord.MessageEmbed()
            .setAuthor('😮')
            .setDescription(`Something might've not been input right.`)
            .setColor('YELLOW')

        if (message)
            built.setDescription(message)
        if (footer)
            built.setFooter(footer)

        return built
    }

    generateErrorMessage(message?: string, footer?: string, channel?: Discord.TextChannel): Discord.MessageEmbed {
        let built = new Discord.MessageEmbed()
            .setAuthor('🥴')
            .setDescription(`Unfortunately, I couldn't perform that action at the moment.`)
            .setColor('RED')

        if (message)
            built.setDescription(message)
        if (footer)
            built.setFooter(footer)

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
