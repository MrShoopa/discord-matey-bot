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
import * as DISCORD from 'discord.js'
import * as FileSystem from 'fs'
import * as Path from 'path'

//  PHRASES
import PHRASES_FRONT from './bot_knowledge/phrases/phrases_front.json';
import PHRASES_SING from './bot_knowledge/phrases/phrases_sing.json';
import PHRASES_CONVO from './bot_knowledge/phrases/phrases_conversational.json';
import PHRASES_SERVER_MOD from './bot_knowledge/phrases/phrases_server_mod.json';
import PHRASES_IMAGE_SEARCH from './bot_knowledge/phrases/phrases_image_search.json';

//  DEFAULTS
import DEFAULTS_IMAGE from './bot_knowledge/defaults/image_search.json';

//  TRIGGERS
import TRIGGERS from './bot_knowledge/triggers/triggers.json';

/*  -----  */

//  DIRECTORIES
const localAudioLocation = __dirname + '/bot_knowledge/audio'

//  ENTITIES
const Bot = new DISCORD.Client()


//  Initialize Discord Bot
console.log('Initializing bot...')
Bot.login(AUTH.discord.API_KEY)
Bot.on('ready', () => {
    console.log('I\'m alive!')
})

//  States
var song_state: string | boolean = 'idle'

//  Messaging to bot
Bot.on('message', (message) => {
    const user: String = message.author.id  // Fetch user's ID

    //  So bot doesn't respond to itself
    if (user === Bot.user.id) return

    var matched_command = false

    //  Grabbing properties from user input
    const message_string = (message.content).toString()
    const voiceChannel: DISCORD.VoiceChannel = message.member.voice.channel

    //  Begin logging block
    console.log(`\nA user said: ${message_string}`)


    /*      F U N C T I O N A L I T Y       */

    /*  ---- Music Functionality ----  */

    //  Play song
    TRIGGERS.singing_triggers.play.forEach(trigger => {
        trigger.toLowerCase()

        //  Attempt to play song
        if (message_string.substring(0, 15).toLowerCase().includes(trigger)) {
            song_state = 'fetching'

            try {
                PHRASES_SING.songs_to_sing.forEach(song => {
                    if (message_string.toLowerCase().includes(song.title.toLowerCase()) && !matched_command) {
                        //  When song from local files is found
                        playAudioFromFiles(song, trigger)
                        return
                    } else if (message_string.toLowerCase().includes(TRIGGERS.url_trigger.any) && !matched_command) {
                        //  When song from URL is found
                        var url_string: string[] = message_string.split(' ')

                        playAudioFromURL(url_string[url_string.length - 1], trigger)
                        return

                    }
                })

                // Start searching local audio folder for 'non-tagged' songs
                let songsMatched =
                    searchRecursive('./', `${message_string.substring(trigger.length + 1)}.mp3`);
                if (songsMatched.length > 0) {
                    console.log(`Local matching songs found:`)
                    console.log(songsMatched)

                    playAudioFromFiles(songsMatched[0])
                    return
                }

            } catch (err) {

                if (!voiceChannel) {
                    console.log('Warning: User is not in voice channel. Song wasn\'t played.')
                    message.reply(
                        PHRASES_SING.message_not_in_channel)
                } else {
                    console.error(err)
                }
            }
            if (song_state == 'fetching' && !matched_command) { //  When song is not found
                message.reply(
                    PHRASES_SING.message_unknown_summon)
            }

            // Finished
            matched_command = true
        }


    })
    //  Stop audio
    TRIGGERS.singing_triggers.stop.forEach(trigger => {
        if (message_string.substring(0, 25).toLowerCase().includes(trigger) &&
            voiceChannel != null && voiceChannel.bitrate) {
            logBotResponse(trigger)

            message.member.voice.channel.leave()
            message.reply(fetchRandomPhrase(PHRASES_SING.command_feedback.stop))
        }

    })
    /*  ----  */

    /*  ----    Image-Fetching (Google JS API)  ----    */

    //  Find random image (from Google Images)
    TRIGGERS.image_search_triggers.random_image.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)

            //  Modules   
            const google_images = require('google-images')
            const googleBuddy =
                new google_images(AUTH.google.search.CSE_ID, AUTH.google.search.API_KEY)


            var user_query: string = ''
            var user_query_specified: boolean = false

            TRIGGERS.image_search_triggers.context_prefix.forEach(trigger => {
                //  If user includes a specific thing to look for.
                if (message_string.toLowerCase().includes(trigger)) {
                    //  Sets query to user's query (after prefix trigger)
                    user_query =
                        message_string.substring(message_string.indexOf(trigger) + trigger.length + 1)
                    user_query_specified = true
                }
            })

            //  Random generated (from defaults list) query if user doesn't specify specific item
            user_query = (user_query == '') ?
                DEFAULTS_IMAGE.random_query[Math.floor(Math.random() * DEFAULTS_IMAGE.random_query.length)] : user_query

            try {
                if (user_query.length > 0)
                    console.log(`Performing image search for ${user_query}.`)
                else
                    console.log(`Performing generic image search.`)

                //  Attempts to search for query
                googleBuddy.search(user_query).then(results => {
                    //.console.log(results)

                    const result_reply: DISCORD.MessageAttachment | string
                        = !results.length ?
                            'Nothing found' :
                            new DISCORD.MessageAttachment(results[Math.floor(Math.random() * results.length)].url)

                    //  Generates reply with random image and response
                    if (user_query_specified == true) {
                        message.reply(
                            `${fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_with_context)}${user_query}.`)
                    } else {
                        message.reply(
                            `${fetchRandomPhrase(PHRASES_IMAGE_SEARCH.image_search_fetch_response.image_search_random)}`)
                    }
                    message.channel.send(result_reply)
                })
            } catch (e) {
                //  The other cases
                console.error(e)
                message.channel.send(
                    'Couldn\'t find image! Let Joe know to find the error.')
            }

            //  FINISHED
            matched_command = true
        }
    })
    /*  -----  */


    /*  ----    Server-Management   ---- */

    //  Set Restricted Role
    TRIGGERS.server_mod_triggers.set_restricted_role.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)

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
            matched_command = true
        }

    })
    //  Unset Restricted Role
    TRIGGERS.server_mod_triggers.unset_restricted_role.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)

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
            matched_command = true
        }

    })
    /*  -----  */


    /*  ----    Phrase play     ---- */

    //  Suicidal
    TRIGGERS.third_person_phrase_triggers.self_death_wish.die.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)
            matched_command = true

            if (trigger == 'can i die')
                return message.reply(
                    PHRASES_CONVO.counter_suicide_phrases[0])
            else
                return message.reply(
                    fetchRandomPhrase(PHRASES_CONVO.counter_suicide_phrases))
        }
    })
    TRIGGERS.third_person_phrase_triggers.self_death_wish.kill_self.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)
            matched_command = true

            return message.reply(
                PHRASES_CONVO.counter_suicide_phrases[1])
        }
    })

    //  "S. A. D."
    if (message_string.includes(TRIGGERS.third_person_phrase_triggers.suck_thing[0]) &&
        message_string.includes(TRIGGERS.third_person_phrase_triggers.suck_thing[1])) {
        matched_command = true

        return message.reply(
            fetchRandomPhrase(PHRASES_CONVO.not_desired.to_look))
    }

    //  Send Nudes (Per request of a friend :P)
    TRIGGERS.send_nude_triggers.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)
            matched_command = true

            return message.reply(
                fetchRandomPhrase(PHRASES_CONVO.asked_to_send_nudes))
        }
    })


    //  Thank you
    TRIGGERS.thank_you_triggers.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)
            matched_command = true

            return message.reply(
                fetchRandomPhrase(PHRASES_FRONT.asked.thank_you))
        }
    })

    //  "Are you a X?"
    if (message_string.toLowerCase().includes(TRIGGERS.are_you_triggers.communist)) {
        logBotResponse(TRIGGERS.are_you_triggers.communist)

        PHRASES_SING.songs_to_sing.forEach(song => {
            if (song.title === 'USSR Anthem')
                playAudioFromFiles(song)
        })
        matched_command = true

        return message.reply(
            fetchRandomPhrase(PHRASES_FRONT.asked.communist))
    }

    /*  -----  */

    //  TODO: Fix this not working orrrrr
    /* ---- DEFAULT CASE ---- */

    //  When mentioning name afterwards (anytime main_trigger is mentioned)
    TRIGGERS.main_trigger.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger, 1)) {

            //  Death threats
            TRIGGERS.threat.kill_self.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

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
        if (message_string.substring(0, 10).toLowerCase().includes(trigger) &&
            !matched_command) {

            //  HELP
            TRIGGERS.help_questions.actions.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    message.reply(PHRASES_FRONT.help_intro)

                    //  Sing
                    message.reply(PHRASES_FRONT.help_sing)

                    //  Image-Search
                    message.reply(PHRASES_FRONT.help_image_search)

                    //  Motivate
                    message.reply(
                        (PHRASES_FRONT.help_conversation.main +
                            PHRASES_FRONT.help_conversation.example.threat) + '\n    ' +
                        PHRASES_FRONT.help_conversation.example.send_nudes)

                    //  Secret functions
                    message.reply((PHRASES_FRONT.help_secret.main))

                }
            })

            //  SINGING HELP
            TRIGGERS.help_questions.singing.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    var song_list = ''

                    message.reply(PHRASES_SING.help_intro)
                    message.reply(PHRASES_SING.help_youtube)

                    PHRASES_SING.songs_to_sing.forEach(song => {
                        if (song.title != PHRASES_SING.songs_to_sing[0].title) {
                            song_list += `\n ${song.title}`
                            if (song.explicit == true) {
                                song_list +=
                                    PHRASES_SING.songs_to_sing[0].explicit_text
                            }
                        }
                    })
                    message.reply(song_list)
                }
            })

            //  PHRASE-PLAY
            TRIGGERS.how_is_bot.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    message.reply(
                        fetchRandomPhrase(PHRASES_CONVO.asked_how_are_you))
                }
            })
            TRIGGERS.threat.kill_self.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    message.reply(
                        fetchRandomPhrase(PHRASES_CONVO.asked_death_threat))
                }
            })

            //  COMMANDS

            TRIGGERS.main_trigger.forEach(trigger => {
                if (message_string == trigger) {
                    logBotResponse(trigger)

                    message.reply(PHRASES_FRONT.name_only_callout)
                }
            })

            //  UHHH
            if (!matched_command)
                message.reply(fetchRandomPhrase(PHRASES_FRONT.unknown_command))
        }

    })

    /*  -----  */

    /*  ---- Helper Functions ---- */

    function playAudioFromFiles(song, trigger?: string) {

        if (!matched_command) {
            if (trigger)
                logBotResponse(trigger)
            song_state = 'playing'

            voiceChannel.join().then(connection => {
                console.group("Local song playing:")
                console.info(
                    `Voice channel connection status: ${connection.status}`)

                let dispatcher: DISCORD.StreamDispatcher
                if (typeof song === "string") {
                    dispatcher = connection.play(song)
                    console.log(`Playing non-tagged song from first match.`)
                    message.reply(`Playing ${song.split('\\').pop()} 👌`)
                } else {
                    dispatcher = connection.play(song.file)
                    console.log(`Responding with '${song.play_phrase}'`)
                    message.reply(song.play_phrase)
                }


                dispatcher.on('end', () => {
                    console.info(
                        'Song played successfully.')
                    song_state = 'finished'
                    voiceChannel.leave()
                })

                console.groupEnd()
            })

            // FINISHED
            matched_command = true
        }
    }
    function playAudioFromURL(url: string, trigger?: string) {

        if (!matched_command) {
            console.log('URL Command matched')
            if (trigger)
                logBotResponse(trigger)
            song_state = 'playing'

            var stream
            var streamOptions: object = {
                seek: 0,
                volume: .75
            }

            if (url.includes('youtu')) {
                //  Modules 
                const ytdl = require('ytdl-core')

                stream = ytdl(url.toString(), {
                    filter: 'audioonly'
                })

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
                */

                return message.reply('SoundCloud support coming sometime later. :)')

            }

            voiceChannel.join().then(connection => {
                song_state = 'playing'
                console.log(
                    `Voice channel connection status: ${connection.status}`)

                const dispatcher: DISCORD.StreamDispatcher =
                    connection.play(stream, streamOptions)

                dispatcher.on('start', () => {
                    console.log(`Playing song from ${url}.`)
                    song_state = 'finished'
                })
                dispatcher.on('end', () => {
                    console.log('Song played successfully.')
                    song_state = 'finished'
                    voiceChannel.leave()
                })
                // FINISHED
                matched_command = true
            })

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

    function logBotResponse(trigger = 'None') {
        //TODO: Make sure this doesn't break matched_command = true

        console.log(`Bot did something!
            TRIGGER: "${trigger}",
            TRIGGERED_BY: '${message.author.username}',
            USER_CONTEXT: "${message_string}"`)
    }

    /*  -----  */
})

//TODO:  Greeting
Bot.on('guildMemberAdd', member => {
    //  Send the message to a designated channel on a server:
    const CHANNEL: DISCORD.GuildChannel =
        member.guild.channels.find(ch => ch.name === 'member-log')
    //  Do nothing if the channel wasn't found on this server
    if (!CHANNEL) return
    //  Send the message, mentioning the member
    if (!((CHANNEL): CHANNEL is DISCORD.TextChannel =>
        CHANNEL.type === 'text')
        (CHANNEL))
        return

    CHANNEL.send(
        `Welcome to the server, ${member}! \n\n\n\n...\n\n who the f-`)
})



/*  ----    Helper Functions    ----   */

//  Helper function for blind-picking phrases of lists
function fetchRandomPhrase(key: string[]) {
    return key[Math.floor(Math.random() * (key.length))]
}

function searchRecursive(dir, pattern) {
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

/*  -----  */