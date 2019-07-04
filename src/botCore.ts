/*  
    Oddly Specific Discord Bot
    
    @author Joe Villegas (joevillegasisawesome@gmail.com)
    @date   May 16th, 2019
*/

//*  Server-Specific settings    (INCLUDE YOUR SERVER'S INFO WHERE APPLICABLE)
const RESTRICTED_ROLE_NAME = 'sKrUb!!! 😅👌🔥👈'


/* --- Assets --- */

//*  IDs (Provide your own)
import AUTH from './auth.json';

//  DEPENDENCIES
import * as Discord from 'discord.js'
import * as FileSystem from 'fs'
import * as Path from 'path'

//  PHRASES
import PHRASES_FRONT from './bot_knowledge/phrases/phrases_front.json';
import PHRASES_SING from './bot_knowledge/phrases/phrases_sing.json';
import PHRASES_CONVO from './bot_knowledge/phrases/phrases_conversational.json';
import PHRASES_SERVER_MOD from './bot_knowledge/phrases/phrases_server_mod.json';
import PHRASES_IMAGE_SEARCH from './bot_knowledge/phrases/phrases_image_search.json';
import PHRASES_SWEAR_JAR from './bot_knowledge/phrases/phrases_swear_jar.json';

//  DEFAULTS
import DEFAULTS_IMAGE from './bot_knowledge/defaults/image_search.json';

//  TRIGGERS
import TRIGGERS from './bot_knowledge/triggers/triggers.json';

import BotData from './bot_functions/BotData';

//  TYPINGS
import { StreamInfo } from './typescript/index'


/*  -----  */

//  DIRECTORIES
const LOCAL_AUDIO_LOCATION = __dirname + '/bot_knowledge/audio'

//  ENTITIES
const BOT = new Discord.Client()
let initTime = new Date()

//  Check data
if (!BotData.getUserDataFile()) BotData.createNewDataFile()

//  Initialize Discord Bot
console.group('Initializing...')
BOT.login(AUTH.discord.API_KEY)
BOT.on('ready', () => {
    console.log(`Initialized at ${new Date().toLocaleString()}.`)
    console.log('I\'m alive and ready to go!\n')
})
console.groupEnd()

//  States
var songState: string | boolean = 'idle'

//  Messaging to bot
BOT.on('message', (message) => {
    let user: String = message.author.id  // Fetch user's ID

    //  So bot doesn't respond to itself
    if (user === BOT.user.id) return

    var matchedCommand = false

    //  Grabbing properties from user input
    let messageString = (message.content).toString()
    const voiceChannel: Discord.VoiceChannel = message.member.voice.channel

    //  Begin logging block
    console.log(`\nA user said: ${messageString}`)


    /*      F U N C T I O N A L I T Y       */


    /*  ---- Swear Jar Functionality ----  */
    TRIGGERS.swear_jar_triggers.bad_words.forEach(trigger => {
        trigger.toLowerCase()

        //TODO: Truncate message when swearing multiple times

        if (messageString.toLowerCase().split(" ").includes(trigger)) {


            logBotResponse(trigger, 'Swear Jar')

            // TODO? Shrink code further
            let userData = BotData.getUserData(message.author.id)

            if (userData === undefined) {
                BotData.createUserData(message.author.id)
                userData = BotData.getUserData(message.author.id)
            }

            //  Get current swear count
            try {
                if (!userData.swearScore) {
                    userData.swearScore = 1
                    message.reply(fetchRandomPhrase(PHRASES_SWEAR_JAR.new_user))
                } else userData.swearScore++
            } catch (error) {
                console.log('User data malfunction!')
                console.error(error)
            }

            BotData.updateUserData(message.author.id, userData)

            return message.reply(`
            🚨✝${fetchRandomPhrase(PHRASES_SWEAR_JAR.bad_word_detected)}✝🚨
            ${fetchRandomPhrase(PHRASES_SWEAR_JAR.swear_point_increment.one_point)}!\n
            **Times you have sworn: ${userData.swearScore}!**`)
        }
    })

    /*  ---- Music Functionality ----  */

    //  Play song
    TRIGGERS.singing_triggers.play.forEach(trigger => {
        trigger.toLowerCase()

        //  Attempt to play song
        if (messageString.substring(0, 15).toLowerCase().includes(trigger)) {
            songState = 'fetching'

            try {

                //  Iterates over list of listed songs before taking action.
                PHRASES_SING.songs_to_sing.forEach(song => {
                    if (messageString.toLowerCase().
                        includes(song.title.toLowerCase())
                        && !matchedCommand) {
                        //  When song from local files is found

                        playAudioFromFiles(song, trigger)
                        return
                    } else if (messageString.toLowerCase().
                        includes(TRIGGERS.url_trigger.any) &&
                        !matchedCommand) {
                        //  When song from URL is found

                        var url_string: string[] = messageString.split(' ')
                        playAudioFromURL(url_string[url_string.length - 1], trigger)
                        return

                    }
                })

                // Start searching local audio folder for 'non-tagged' songs
                let matchedSongs =
                    searchRecursive('./',
                        `${messageString.substring(trigger.length + 1)}.mp3`);
                if (matchedSongs.length > 0) {
                    console.log(`Local matching songs found:`)
                    console.log(matchedSongs)

                    playAudioFromFiles(matchedSongs[0])
                    return
                }

            } catch (err) {
                console.log(voiceChannel)

                if (!voiceChannel) {
                    console.warn('User is not in voice channel. Song wasn\'t played.')
                    message.reply(
                        PHRASES_SING.message_not_in_channel)
                } else {
                    console.error(err)
                }

            }
            if (songState == 'fetching' && !matchedCommand) { //  When song is not found
                message.reply(
                    PHRASES_SING.message_unknown_summon)

                console.error('No such song found.')
            }

            // Finished
            matchedCommand = true
        }


    })
    //  Stop audio
    TRIGGERS.singing_triggers.stop.forEach(trigger => {
        if (!matchedCommand)
            if (messageString.substring(0, 25).toLowerCase().includes(trigger)) {
                logBotResponse(trigger, 'Singing Stop')

                if (voiceChannel != null && BOT.voice.connections.size !== 0) {
                    message.member.voice.channel.leave()

                    message.reply(fetchRandomPhrase(PHRASES_SING.command_feedback.stop.active))
                    console.log('Bot exited voice channel by user message.')
                } else {
                    if (messageString.substring(0, 6).toLowerCase().includes("stop"))
                        return  // No message is sent when just saying 'stop' on no playback

                    message.reply(fetchRandomPhrase(PHRASES_SING.command_feedback.stop.null))
                    console.log('No sound was playing, nothing terminated.')
                }

                matchedCommand = true
            }

    })
    /*  ----  */

    /*  ----    Image-Fetching (Google JS API)  ----    */

    //  Find random image (from Google Images)
    TRIGGERS.image_search_triggers.random_image.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Image Search')

            var userQuery: string = ''

            TRIGGERS.image_search_triggers.context_prefix.forEach(trigger => {
                //  If user includes a specific thing to look for.
                if (messageString.toLowerCase().includes(trigger)) {
                    //  Sets query to user's query (after prefix trigger)
                    userQuery =
                        messageString.substring(
                            messageString.indexOf(trigger) + trigger.length + 1)
                }
            })

            fetchImageFromGoogle(userQuery)

            //  FINISHED
            matchedCommand = true
        }
    })
    /*  -----  */

    /*      ---- External Data Retreival ----   */

    //  Get copypasta post (from reddit)
    TRIGGERS.reddit_fetch.copypasta.default.forEach(async trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            matchedCommand = true
            logBotResponse(trigger, 'reddit copypasta fetch')

            let topPastaUrl = 'https://www.reddit.com/r/copypasta/top.json?limit=1'

            let pastaObject = await fetchJSONFromURL(topPastaUrl)


            //  Replies back 'currently best' copypasta by title if it's not in the subtext of the post.
            if (pastaObject.data.children[0].data.selftext == '')
                message.channel.send(pastaObject.data.children[0].data.title)
            else
                message.channel.send(pastaObject.data.children[0].data.selftext)
        }
    })

    /*  ----    Server-Management   ---- */

    //  Set Restricted Role
    TRIGGERS.server_mod_triggers.set_restricted_role.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Set restricted role')

            message.mentions.members.forEach(member => {
                message.reply(
                    `${fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_set)},
                     ${member.displayName}`)
                member.roles.add(fetchRestrictedRoleID())
                    .then(() => {
                        console.log(
                            `Adding ${member.displayName} to the role: ${RESTRICTED_ROLE_NAME}`)
                    })
                    .catch(
                        console.error)
                //.catch(console.error(`Failed to add ${member.displayName} to the role: ${restricted_role_id}`))
            })

            // FINISHED
            matchedCommand = true
        }

    })
    //  Unset Restricted Role
    TRIGGERS.server_mod_triggers.unset_restricted_role.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Unset restricted role')

            message.mentions.members.forEach(member => {
                message.reply(
                    `${fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_unset)},
                     ${member.displayName}`)
                member.roles.remove(fetchRestrictedRoleID())
                    .then(() => {
                        console.log(
                            `Removing ${member.displayName} from the role: ${RESTRICTED_ROLE_NAME}`)
                    })
                    .catch(console.error)
            })

            // FINISHED
            matchedCommand = true
        }

    })
    /*  -----  */


    /*  ----    Phrase play     ---- */

    //  Suicidal
    TRIGGERS.third_person_phrase_triggers.self_death_wish.die.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'self death wish')
            matchedCommand = true

            if (trigger == 'can i die')
                return message.reply(
                    PHRASES_CONVO.counter_suicide_phrases[0])
            else
                return message.reply(
                    fetchRandomPhrase(PHRASES_CONVO.counter_suicide_phrases))
        }
    })
    TRIGGERS.third_person_phrase_triggers.self_death_wish.kill_self.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'self death wish')
            matchedCommand = true

            return message.reply(
                PHRASES_CONVO.counter_suicide_phrases[1])
        }
    })

    //  "S. A. D."
    if (messageString.includes(TRIGGERS.third_person_phrase_triggers.suck_thing[0]) &&
        messageString.includes(TRIGGERS.third_person_phrase_triggers.suck_thing[1])) {
        matchedCommand = true

        return message.reply(
            fetchRandomPhrase(PHRASES_CONVO.not_desired.to_look))
    }

    //  Send Nudes (Per request of a friend :P)
    TRIGGERS.send_nude_triggers.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Send nude')
            matchedCommand = true

            return message.reply(
                fetchRandomPhrase(PHRASES_CONVO.asked_to_send_nudes))
        }
    })


    //  Thank you
    TRIGGERS.thank_you_triggers.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Thank you!')
            matchedCommand = true

            return message.reply(
                fetchRandomPhrase(PHRASES_FRONT.asked.thank_you))
        }
    })

    //  "Are you a X?"
    if (messageString.toLowerCase().includes(TRIGGERS.are_you_triggers.communist)) {
        logBotResponse(TRIGGERS.are_you_triggers.communist, 'Communist response')

        PHRASES_SING.songs_to_sing.forEach(song => {
            if (song.title === 'USSR Anthem')
                playAudioFromFiles(song)
        })
        matchedCommand = true

        return message.reply(
            fetchRandomPhrase(PHRASES_FRONT.asked.communist))
    }

    /*  -----  */

    /* ---- DEFAULT CASE ---- */

    //  When mentioning name afterwards (anytime main_trigger is mentioned)
    TRIGGERS.main_trigger.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger, 1)) {

            //  Death threats
            TRIGGERS.threat.kill_self.forEach(trigger => {
                if (messageString.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger, 'Self-diminishment')

                    //  FRIEND SPECIFIC :)
                    if (message.author.username == 'MrShoopa')
                        message.reply('joe you a hoe')
                    if (message.author.username == 'The King of Bling')
                        message.reply('nick ya dick')
                    if (message.author.username == 'Vitalion')
                        message.reply('mitch ya snitch')
                    if (message.author.username == 'Jaygoo')
                        message.reply('ur dog gay')

                    message.reply(
                        fetchRandomPhrase(PHRASES_CONVO.asked_death_threat))
                }
            })
        }
    })



    //  MAIN (When started with "Megadork", for example)
    TRIGGERS.main_trigger.forEach(trigger => {
        if (messageString.substring(0, 10).toLowerCase().includes(trigger) &&
            !matchedCommand) {

            //  HELP
            TRIGGERS.help_questions.actions.forEach(trigger => {
                if (messageString.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger, 'Help with Actions')

                    message.reply(PHRASES_FRONT.help_intro)

                    //  Sing
                    message.reply(PHRASES_FRONT.help_sing)

                    //  Image-Search
                    message.reply(PHRASES_FRONT.help_image_search)

                    //  Motivate
                    message.reply(
                        (PHRASES_FRONT.help_conversation.main +
                            PHRASES_FRONT.help_conversation.example.threat) +
                        '\n    ' +
                        PHRASES_FRONT.help_conversation.example.send_nudes)

                    //  Secret functions
                    message.reply((PHRASES_FRONT.help_secret.main))

                }
            })

            //  SINGING HELP
            TRIGGERS.help_questions.singing.forEach(trigger => {
                if (messageString.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger, 'Help with Singing')

                    var songList = ''

                    message.reply(PHRASES_SING.help_intro)
                    message.reply(PHRASES_SING.help_youtube)

                    PHRASES_SING.songs_to_sing.forEach(song => {
                        if (song.title != PHRASES_SING.songs_to_sing[0].title) {
                            songList += `\n ${song.title}`
                            if (song.explicit == true) {
                                songList +=
                                    PHRASES_SING.songs_to_sing[0].explicit_text
                            }
                        }
                    })
                    message.reply(songList)
                }
            })

            //  PHRASE-PLAY
            TRIGGERS.how_is_bot.forEach(trigger => {
                if (messageString.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger, 'How is bot')

                    message.reply(
                        fetchRandomPhrase(PHRASES_CONVO.asked_how_are_you))
                }
            })
            TRIGGERS.threat.kill_self.forEach(trigger => {
                if (messageString.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger, 'Retaliating')

                    message.reply(
                        fetchRandomPhrase(PHRASES_CONVO.asked_death_threat))
                }
            })

            //  COMMANDS

            TRIGGERS.main_trigger.forEach(trigger => {
                if (messageString == trigger) {
                    logBotResponse(trigger, 'Generic response')

                    message.reply(PHRASES_FRONT.name_only_callout)
                }
            })

            //  UHHH
            if (!matchedCommand)
                message.reply(fetchRandomPhrase(PHRASES_FRONT.unknown_command))
        }

    })

    /*  -----  */

    /*  ---- Helper Functions ---- */

    function playAudioFromFiles(song, trigger?: string) {

        if (!matchedCommand) {
            if (trigger)
                logBotResponse(trigger, 'Audio playback from files')
            songState = 'playing'

            voiceChannel.join().then(connection => {
                console.group(`Local song playing...`)
                console.info(
                    `Voice channel connection status: ${connection.status}`)

                let dispatcher: Discord.StreamDispatcher


                if (typeof song === "string") {
                    dispatcher = connection.play(song)

                    console.log(`Playing non-tagged song from first match: ${song}`)

                    message.reply(`Playing ${song.split('\\').pop()} 👌`)
                } else {
                    dispatcher = connection.play(song.file)

                    console.log(`Playing tagged song: ${song.title}`)
                    console.log(`Responding with '${song.play_phrase}'`)

                    message.reply(song.play_phrase)
                }


                dispatcher.on('end', () => {
                    console.info(
                        'Song played successfully.')
                    songState = 'finished'
                    voiceChannel.leave()
                })
                dispatcher.on('close', () => {
                    console.log(`Song interrupted by user.`)
                })

                console.groupEnd()
            })

            // FINISHED
            matchedCommand = true
        }
    }
    async function playAudioFromURL(url: string, trigger?: string) {

        //TODO: More efficient handling (deal with matchedCommand)
        if (!matchedCommand) {
            matchedCommand = true


            console.log('URL Command matched')
            if (trigger)
                logBotResponse(trigger, 'Audio playback from URL')
            songState = 'playing'

            var stream: Discord.VoiceBroadcast
            var streamOptions: object = {
                seek: 0,
                volume: .75
            }
            var streamInfo: StreamInfo = { source: 'None' }


            if (url.includes('youtu')) {
                streamInfo.source = 'YouTube'
                const YTDL = require('ytdl-core-discord')


                stream = await YTDL(url.toString(), {
                    filter: 'audioonly'
                })
                streamOptions['type'] = 'opus'

                streamInfo = { source: url, platform: 'YouTube' }
            } else if (url.includes('soundcloud')) {

                //  TODO: SoundCloud support
                /*
                                const SC_CLIENT_ID = 'b45b1aa10f1ac2941910a7f0d10f8e28'
                                const SC = require('soundcloud')
                
                                SC.initialize({
                                    client_id: SC_CLIENT_ID
                                })
                
                                stream = SC.stream('/tracks/293').then(function (player) {
                                    console.log('test)')
                                    player.play();
                                });
                
                                stream.resolve(url.toString())

                                streamInfo = { source: url, name: SC.info, platform: 'SoundCloud' }
                */

                return message.reply('SoundCloud support coming sometime later. :)')

            }
            try {
                voiceChannel.join().then(connection => {
                    songState = 'playing'
                    console.log(
                        `Voice channel connection status: ${connection.status}`)

                    var dispatcher: Discord.StreamDispatcher = connection.play(stream, streamOptions)

                    dispatcher.on('start', () => {
                        console.group(`Now playing song from ${url}.`)

                        if (streamInfo.name && streamInfo.platform)
                            message.reply(`\nPlaying ${streamInfo.name} from ${streamInfo.platform}. 👌`)
                        else if (streamInfo.platform)
                            message.reply(`\nI'm playing your song from ${streamInfo.platform}. 👌`)
                        else
                            message.reply(`\nPlaying song from your above URL.`)
                    })

                    dispatcher.on('close', () => {
                        console.log(`Song interrupted by user.`)
                    })

                    dispatcher.on('end', () => {
                        console.log('Song played successfully.')
                        console.groupEnd()

                        songState = 'finished'
                        voiceChannel.leave()
                    })

                    // FINISHED
                    matchedCommand = true
                })
            } catch (error) {
                if (!voiceChannel) console.log(`User is not in a server's voice channel.`)
                throw error
            }

            //TODO: Optimize error handling
        }
    }

    function fetchRestrictedRoleID(roleName = RESTRICTED_ROLE_NAME) {
        message.guild.roles.forEach(role => {
            //.console.log(role.name)

            if (role.name == roleName)
                return role.id

        })
        return null
    }

    function fetchImageFromGoogle(userQuery = '') {
        //  Modules   
        const GoogleImages = require('google-images')
        const GOOGLE_IMAGER =
            new GoogleImages(
                AUTH.google.search.CSE_ID, AUTH.google.search.API_KEY)


        //  Random generated (from defaults list) query if user doesn't specify specific item
        userQuery = (userQuery == '') ?
            DEFAULTS_IMAGE.random_query[Math.floor(Math.random() * DEFAULTS_IMAGE.random_query.length)] : userQuery

        try {
            if (userQuery.length > 0)
                console.log(`Performing image search for ${userQuery}.`)
            else
                console.log(`Performing generic image search.`)

            //  Attempts to search for query
            GOOGLE_IMAGER.search(userQuery).then(results => {
                //.console.log(results)

                let resultReply: Discord.MessageAttachment | string
                    = !results.length ?
                        'Nothing found' :
                        new Discord.MessageAttachment(results[Math.floor(Math.random() * results.length)].url)

                //  Generates reply with random image and response
                if (userQuery !== '') {
                    message.reply(
                        `${fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_with_context)}${userQuery}.`)
                } else {
                    message.reply(
                        `${fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_random)}`)
                }
                message.channel.send(resultReply)
            })
        } catch (e) {
            //  The other cases
            console.error(e)
            message.channel.send(
                'Couldn\'t find image! Let Joe know to find the error.')
        }
    }


    function logBotResponse(trigger: string = 'None', intent?: string) {
        //TODO: Make sure this doesn't break matchedCommand = true

        console.group(`--- BOT GO! ---`)
        console.log(`TRIGGER: "${trigger}"`)
        console.log(`CALLER: '${message.author.username}'`)
        console.log(`CONTEXT: "${messageString}"`)
        if (intent) console.log(`ACTION: ${intent}`)
        console.groupEnd()

    }

    /*  -----  */
})

//TODO?:  Greeting
BOT.on('guildMemberAdd', member => {
    //  Send the message to a designated channel on a server:
    const CHANNEL: Discord.GuildChannel =
        member.guild.channels.find(ch => ch.name === 'member-log')
    //  Do nothing if the channel wasn't found on this server
    if (!CHANNEL) return
    //  Send the message, mentioning the member
    if (!((CHANNEL): CHANNEL is Discord.TextChannel =>
        CHANNEL.type === 'text')
        (CHANNEL))
        return

    CHANNEL.send(
        `Welcome to the server, ${member}! \n\n\n\n...\n\n who the f-`)
})


/*  ----    State Checking      ----   */

if (initTime.getDate() === new Date(2008, initTime.getMonth() + 1, 0).getDate())
    console.log('Swear stats of the month!')


/*  ----    Helper Functions    ----   */

//  Helper function for blind-picking phrases of lists
function fetchRandomPhrase(key: string[]) {
    return key[Math.floor(Math.random() * (key.length))]
}

function searchRecursive(dir, pattern: string) {
    // This is where we store pattern matches of all files inside the directory
    var results = [];

    // Read contents of directory
    FileSystem.readdirSync(dir).forEach(dirInner => {
        // Obtain absolute path
        dirInner = Path.resolve(dir, dirInner);

        // Get stats to determine if path is a directory or a file
        var stat = FileSystem.statSync(dirInner);

        // If path is a directory, scan it and combine results
        if (stat.isDirectory()) {
            results = results.concat(searchRecursive(dirInner, pattern));
        }

        // If path is a file and ends with pattern then push it onto results
        if (stat.isFile() && dirInner.endsWith(pattern)) {
            results.push(dirInner);
        }
    });

    return results;
};


