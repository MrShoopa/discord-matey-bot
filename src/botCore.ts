/*  
    Oddly Specific Discord Bot
    
    @author Joe Villegas (joevillegasisawesome@gmail.com)
    @date   May 16th, 2019
*/

//*  Server-Specific settings    (INCLUDE YOUR SERVER'S INFO WHERE APPLICABLE)
const RESTRICTED_ROLE_NAME = 'sKrUb!!! 😅👌🔥👈'
const MEMBER_ANNOUNCEMENT_CHANNEL = 'announcements'


/* --- Assets --- */

//*  IDs (Provide your own)
import AUTH from './auth.json';

//  DEPENDENCIES
import * as Discord from 'discord.js'
import * as FileSystem from 'fs'
import * as Path from 'path'
import MateyLogger from './tools/WinstonSpinoff'

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

//  NATURAL VALUES
import CALENDAR from './bot_knowledge/calendar/values.json'

//  SAVE DATA
import BotData from './bot_functions/BotData';
import { StreamInfo } from 'index.js';

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
BOT.login(AUTH.discord.API_KEY).catch(err => (console.log(`Discord connection error: ${err}`)))
BOT.on('ready', () => {
    console.log(`Initialized at ${new Date().toLocaleString()}.`)
    console.log('I\'m alive and ready to go!\n')

    BOT.user.setActivity(`with your servers`, { type: 'PLAYING' });
})
console.groupEnd()

//  Bot joining server for first time
BOT.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). There are ${guild.memberCount} members here.`);

    guild.systemChannel.send('Hello world?')
});

//  States
var songState: string | boolean = 'idle'
var lastMessage: string
var lastCustomer: Discord.User

//  Messaging to bot
BOT.on('message', async (message) => {
    let author: Discord.User = message.author // Fetch user's ID

    var matchedCommand = false

    //  Grabbing properties from user input
    let messageString = (message.content).toString()
    const voiceChannel: Discord.VoiceChannel = message.member.voice.channel

    //  Begin logging block
    console.log(`\nA user said: ${messageString}`)

    //  Preventing bot to respond to itself or other bots
    if (author.id === BOT.user.id)
        if (!messageString.startsWith('redoin, '))
            return
        else {
            messageString = messageString.substring(7)
            author = lastCustomer
        }
    else if (message.author.bot)
        return

    //  Remembers user for redo functions
    lastCustomer = author

    /*      F U N C T I O N A L I T Y       */

    /*  ---- Contexual Functionality ----  */

    //  Redo last command
    TRIGGERS.redo_trigger.forEach(trigger => {
        trigger.toLowerCase()

        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Redo command', true, true)

            if (lastMessage == null)
                return message.channel.send(`I haven't done anything yet though!`)
            else if (lastMessage.startsWith('redoin, '))
                lastMessage = lastMessage.substring(8)
            return message.channel.send('redoin, ' + lastMessage)
        }

    })

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

    /*  ---- Birthday Functionality ----  */

    //  Add birthday reminder!
    TRIGGERS.remember.birthday.self.forEach(trigger => {
        trigger.toLowerCase()

        //  Check for birthday save
        if (messageString.substring(0).toLowerCase().includes(trigger)) {
            //  Trim trigger for easier parsing of date
            logBotResponse(trigger, "Birthday reminder", true)
            let context: string = messageString.replace(trigger, "").trim()


            let birthday: { month: String, date: number } = { month: "", date: 0 }

            CALENDAR.months.forEach(month => {
                if (context.includes(month)) {
                    //TODO: Edge case for 30/28 day months

                    let dateNumber: number = parseInt(context.match(/\d+/).toString())
                    if ((1 <= dateNumber) && (31 >= dateNumber)) {
                        // Construct birthday object
                        birthday.month = month
                        birthday.date = dateNumber
                    } else {
                        return message.reply('Invalid date. Include a date from 1-31.')
                    }
                }

            });

            if (!birthday.month)
                return message.reply(`Invalid date. Type the month and date like this: 'September 10'`)

            // TODO? Shrink code further + Take off error handling?
            let userData = BotData.getUserData(message.author.id)

            if (userData === undefined) {
                BotData.createUserData(message.author.id)
                userData = BotData.getUserData(message.author.id)
            }

            try {
                if (!userData.birthday) {
                    message.reply(`your birthday has been recorded as ${birthday.month} ${birthday.date}!`)
                } else {
                    message.reply(`your birthday has been updated to ${birthday.month} ${birthday.date}!`)
                }

                userData.birthday = birthday

            } catch (error) {
                console.log('User data malfunction!')
                console.error(error)
            }

            BotData.updateUserData(message.author.id, userData)

            return
        }
    })

    //TODO: Add birthday announcement!!!

    /*  ---- Music Functionality ----  */

    //  Song playback
    TRIGGERS.singing_triggers.play.forEach(trigger => {
        trigger.toLowerCase()

        //  Attempt to play song based on given info
        if (messageString.substring(0, 15).toLowerCase().includes(trigger)) {
            songState = 'fetching'

            let loop: boolean
            //TODO if (messageString.substring(0, 20).toLowerCase().includes('loop')) loop = true

            try {

                /*  Iterates over list of listed songs before taking action.
                    
                    Music search priorities:
                    1. Local Files w/ special names,
                    2. URLs,
                    3. Local Files w/ exact file
                */
                PHRASES_SING.songs_to_sing.forEach(song => {
                    if (messageString.toLowerCase().
                        includes(song.title.toLowerCase())
                        && !matchedCommand) {
                        //  When song from local files is found

                        playAudioFromFiles(song, loop, trigger)
                        return
                    } else if (messageString.toLowerCase().
                        includes(TRIGGERS.url_trigger.any) &&
                        !matchedCommand) {
                        //  When song from URL is found

                        var url_string: string[] = messageString.split(' ')
                        playAudioFromURL(url_string[url_string.length - 1], loop, trigger)
                        return

                    }
                })

                // Start searching local audio folder for 'non-tagged' songs
                let context = messageString.substring(trigger.length + 1)

                let matchedSongs = searchRecursive('./', `${context}.mp3`);
                if (matchedSongs.length > 0 && context.length > 0) {
                    console.log(`Local matching songs found:`)
                    console.log(matchedSongs)

                    //TODO: Give choice from multiple matches
                    playAudioFromFiles(matchedSongs[0], loop)
                    return
                }

            } catch (err) {
                console.log(voiceChannel)
                botError(4001)

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
                logBotResponse(trigger, 'Singing Stop', true, true)

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
            }

    })
    /*  ----  */

    /*  ----    Image-Fetching (Google JS API)  ----    */

    //  Find random image (from Google Images)
    TRIGGERS.image_search_triggers.random_image.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Image Search', true)

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
        }
    })
    /*  -----  */

    /*      ---- External Data Retreival ----   */

    //  Get copypasta post [from Reddit]
    TRIGGERS.reddit_fetch.copypasta.default.forEach(async trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'reddit copypasta fetch', true)

            let topPastaUrl = 'https://www.reddit.com/r/copypasta/top.json?limit=1'

            let pastaObject = await fetchJSONFromURL(topPastaUrl, true)
                .catch(err => {
                    message.channel.send(`Could not fetch. Error: ${err}`)
                })

            //  References reddit post
            message.channel.send(`From post: ${pastaObject.data.children[0].data.url}`)
            //  Replies back 'currently best' copypasta
            if (pastaObject.data.children[0].data.selftext == '')
                //  Replies by title if it's not in the subtext of the post.
                message.channel.send(pastaObject.data.children[0].data.title)
            else {

                let pasta = pastaObject.data.children[0].data.selftext

                if (pasta.length >= 2000) {
                    console.log("Copypasta exceeds 2000 characters. 🔥🍝 Splitting...")

                    pasta = pasta.match(/(?!&amp;#x200B;)[\s\S]{1,2000}/g)

                    console.log(pasta)
                    pasta.forEach((chunk: any) => {
                        message.channel.send(chunk)
                    });
                } else message.channel.send(pastaObject.data.children[0].data.selftext)

            }
        }
    })

    //  Get latest Tweet with specific query [from Twitter]
    TRIGGERS.twitter_fetch.tweet.query.forEach(async trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'twitter latest post fetch', true)

            let query = messageString.split(trigger).pop()

            let tweet = await fetchTweetWithQuery(query)

            message.channel.send(`Tweet from @${tweet.user.name}\nabout '${query}':\n\n${tweet.text}`)
        }
    })

    //  Get anime recommendation [from My Anime List (JikanTS)]
    TRIGGERS.anime_fetch.default.forEach(async trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'jikanTS anime fetch', true)

            let query =
                messageString.split(trigger).pop().length != 0 ?
                    messageString.split(trigger).pop() :
                    undefined

            let anime = await fetchAnimeOfName(query)

            message.channel.send(generateAnimeInfoMessage(anime))
        }
    })

    //  Get quote [from several APIs]
    if (messageString.toLowerCase().includes('quote')) {

        //  Inspirational quote [from inspirational-quotes]
        TRIGGERS.quote_fetch.inspirational.forEach(async trigger => {
            if (messageString.toLowerCase().includes(trigger)) {
                logBotResponse(trigger, 'quote fetch - inspirational', true)
                let quoteObject: { text: any; author: any; }

                await import('inspirational-quotes').then(quoteMaster => {
                    console.log(quoteMaster)
                    quoteObject = quoteMaster.default.getQuote()
                })

                console.log(quoteObject)

                let quoteMessage: Discord.MessageEmbed =
                    new Discord.MessageEmbed()
                        .setTitle(quoteObject.text)
                        .setAuthor(quoteObject.author)
                        .setFooter('Megadorky Quotter 💬🌟')

                message.channel.send(quoteMessage)
            }
        })
    }

    /*  -----  */


    /*  ----    Server-Management   ---- */

    //  Set Restricted Role
    TRIGGERS.server_mod_triggers.set_restricted_role.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Set restricted role', true)

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
        }
    })
    //  Unset Restricted Role
    TRIGGERS.server_mod_triggers.unset_restricted_role.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Unset restricted role', true)

            message.mentions.members.forEach(member => {
                message.reply(
                    `${fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_unset)},
                    ${member.displayName}`)
                member.roles.remove(fetchRestrictedRoleID())
                    .then(() => {
                        console.log(
                            `Removing ${member.displayName} from the role: ${RESTRICTED_ROLE_NAME}`)
                    }, error => console.error(`Couldn't remove member from restricted role - ${error}`))
            })
        }
    })
    /*  -----  */


    /*  ----    Phrase play     ---- */

    //  Suicidal
    TRIGGERS.third_person_phrase_triggers.self_death_wish.die.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'self death wish', true)

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
            logBotResponse(trigger, 'self death wish', true)

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

    //  the master's favorite food
    if (messageString == 'beans') {
        logBotResponse("beans", "beans", true)

        message.channel.send(`Did you say... BEANZ?!?!?!?`)

        let funnyImageUrl = 'https://www.reddit.com/r/beans/top.json?limit=1'

        message.channel.send(
            fetchRandomPhrase(PHRASES_CONVO.beans.spam_intro))


        await fetchImageFromGoogle('beans')

        let response: any = await fetchTweetWithQuery('beans')
        message.channel.send(response.text)

        let beansInThing: Discord.MessageAttachment =
            new Discord.MessageAttachment(fetchImageFromURL(funnyImageUrl))
        message.channel.send(beansInThing)

        await playAudioFromURL('https://www.youtube.com/watch?v=wEEuzUGEWws&ab_channel=TheBritishPickles')

        message.channel.send(
            fetchRandomPhrase(PHRASES_CONVO.beans.spam_intro))

        return message.channel.send('...👌😤💨')
    }

    //  Send Nudes (Per request of a friend :P)
    TRIGGERS.send_nude_triggers.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Send nude', true)

            return message.reply(
                fetchRandomPhrase(PHRASES_CONVO.asked_to_send_nudes))
        }
    })


    //  Thank you
    TRIGGERS.thank_you_triggers.forEach(trigger => {
        if (messageString.toLowerCase().includes(trigger)) {
            logBotResponse(trigger, 'Thank you!', true)

            return message.reply(
                fetchRandomPhrase(PHRASES_FRONT.asked.thank_you))
        }
    })

    //  "Are you a X?"
    if (messageString.toLowerCase().includes(TRIGGERS.are_you_triggers.communist)) {
        logBotResponse(TRIGGERS.are_you_triggers.communist, 'Communist response', true)

        PHRASES_SING.songs_to_sing.forEach(song => {
            if (song.title === 'USSR Anthem')
                playAudioFromFiles(song)
        })

        return message.reply(
            fetchRandomPhrase(PHRASES_FRONT.asked.communist))
    }

    /*  -----  */

    /* ---- DEFAULT CASE ---- */

    //  When mentioning main hotword anywhere in message!
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



    //  When mentioning main hotword at the start of the message
    TRIGGERS.main_trigger.forEach(trigger => {
        if (messageString.substring(0, 10).toLowerCase().includes(trigger) &&
            !matchedCommand) {

            //  HELP //TODO: Add instructions for anime, twitter, inspirational quotes, etc. Convert to Rich Message.
            TRIGGERS.help_questions.actions.forEach(trigger => {
                if (messageString.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger, 'Help with Actions', true)

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

                    return
                }
            })

            //  SINGING HELP
            TRIGGERS.help_questions.singing.forEach(trigger => {
                if (messageString.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger, 'Help with Singing', true)

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
                    logBotResponse(trigger, 'How is bot', true)

                    message.reply(
                        fetchRandomPhrase(PHRASES_CONVO.asked_how_are_you))
                }
            })
            TRIGGERS.threat.kill_self.forEach(trigger => {
                if (messageString.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger, 'Retaliating', true)

                    message.reply(
                        fetchRandomPhrase(PHRASES_CONVO.asked_death_threat))
                }
            })

            //  COMMANDS

            TRIGGERS.main_trigger.forEach(trigger => {
                if (messageString == trigger) {
                    logBotResponse(trigger, 'Generic response', true)

                    message.reply(PHRASES_FRONT.name_only_callout)
                }
            })

            //  UHHH (aka nothing found)
            if (!matchedCommand)
                message.reply(fetchRandomPhrase(PHRASES_FRONT.unknown_command))
        }

    })

    /*  -----  */

    /*  ---- Bot Helper Background Functions ---- */

    function playAudioFromFiles(song, loop?: boolean, trigger?: string) {

        if (!matchedCommand) {
            if (trigger)
                logBotResponse(trigger, 'Audio playback from files', true)
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
                    if (loop) message.reply('...looped!')
                } else {
                    dispatcher = connection.play(song.file)

                    console.log(`Playing tagged song: ${song.title}`)
                    console.log(`Responding with '${song.play_phrase}'`)

                    message.reply(song.play_phrase)
                    if (loop) message.reply('Looping this song!')
                }



                dispatcher.on('end', () => {
                    if (loop) connection.play(song)
                    else {
                        console.info(
                            'Song played successfully.')
                        songState = 'finished'
                        voiceChannel.leave()
                    }
                })
                dispatcher.on('close', () => {
                    console.log(`Song interrupted by user.`)
                })

                console.groupEnd()
            })

            // FINISHED
        }
    }
    async function playAudioFromURL(url: string, loop?: boolean, trigger?: string) {
        if (!matchedCommand) {

            console.log('URL Command matched')
            if (trigger)
                logBotResponse(trigger, 'Audio playback from URL', true)
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
                    console.groupEnd()
                })

                dispatcher.on('end', () => {
                    if (loop) connection.play(stream, streamOptions)
                    else {
                        console.log('Song played successfully.')
                        console.groupEnd()

                        songState = 'finished'
                        voiceChannel.leave()
                    }
                })

                // FINISHED
                matchedCommand = true
            }), error => {
                if (!voiceChannel) console.log(`User is not in a server's voice channel.`)
                throw error
            }
        }
    }

    function fetchJSONFromURL(url: string, includeURL?: boolean, log?: boolean): any {
        console.group(`Fetching JSON from ${url}...`)
        if (includeURL) message.channel.send(`Fetching from ${url}...`)

        let obj: any

        // Asyncrhonous fetching
        return new Promise((resolve, reject) => {
            import('request').then(Request => {

                Request.get(url, { json: true },
                    (error, response, body) => {
                        if (error) {
                            console.error('Fetching JSON error: ')
                            if (log) console.error(error)
                            console.error(`Fetching JSON Failed - Code ${response.statusCode}`)

                            if (response.statusCode === 404)
                                console.log(`Couldn't find JSON with URL.`)
                            if (response.statusCode === 401)
                                console.log(`Not authorized.`)

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
        })
    }

    function fetchRestrictedRoleID(roleName = RESTRICTED_ROLE_NAME) {
        message.guild.roles.forEach(role => {
            //.console.log(role.name)

            if (role.name == roleName)
                return role.id

        })
        return null
    }

    function fetchImageFromURL(URL: string): any {
        return new Promise((resolve, reject) => {

            import('snekfetch').then(Request => {
                Request.default.get('await')
                    .then(result => {
                        console.log(`Image fetched from ${URL}.`)

                        resolve(result.body)
                    }, error => {
                        console.error(`Could not fetch image - ${error}`)

                        reject(error)
                    })
            })

        })
    }

    //TODO: Modularize like JSON and Tweet
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

    //TODO: Fetch user's top post
    function fetchTweetFromUser(userQuery = '') {
        //  Modules
        import('twitter').then(Twitter => {
            let TwitterEntity =
                new Twitter.default({
                    consumer_key: AUTH.twitter.consumer_key,
                    consumer_secret: AUTH.twitter.consumer_secret,
                    access_token_key: AUTH.twitter.access_token_key,
                    access_token_secret: AUTH.twitter.access_token_secret
                })

            TwitterEntity.get('search/tweets', { q: 'beans' }, function (error, tweets, response) {
                console.log(tweets);
            });
        })
    }

    function fetchTweetWithQuery(userQuery: string, top?: boolean, log?: boolean): any {
        //  Modules
        return new Promise((resolve, reject) => {
            import('twitter').then(Twitter => {
                let TwitterEntity =
                    new Twitter.default({
                        consumer_key: AUTH.twitter.consumer_key,
                        consumer_secret: AUTH.twitter.consumer_secret,
                        access_token_key: AUTH.twitter.access_token_key,
                        access_token_secret: AUTH.twitter.access_token_secret
                    })

                TwitterEntity.get('search/tweets', { q: userQuery }, function (error, tweets, response) {
                    //?
                    if (error) reject(error)

                    let index = Math.floor((Math.random() * tweets.statuses.length))
                    //  Condition for specific placement
                    if (top) index = 0

                    let tweet = tweets.statuses[index]

                    console.log(`Fetched twitter tweet from ${tweet.user.name}.`)
                    if (log) console.log(tweets);

                    resolve(tweet)
                });
            })
        })
    }

    function fetchAnimeOfName(name: string = 'Boku', multipleResults = false) {

        return new Promise((resolve, reject) => {
            import('jikants').then(JikanTS => {
                JikanTS.default.Search.search(name, "anime")
                    .catch(reason => {
                        console.log(reason)
                        reject(reason)
                    })
                    .then(anime => {
                        console.log(`Anime fetched for ${name}`)
                        if (anime)
                            multipleResults ?
                                resolve(anime.results) : resolve(anime.results[1])
                    })
            })
        })

    }

    function generateAnimeInfoMessage(anime) {
        let message = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Sup weeb! Check out **${anime.title}**:\n`)
            .setAuthor('Megaweeb Finds')
            .setImage(anime.image_url)
            .setURL(anime.url)
            .addField('MAL Score', `${anime.score}`, true)
            .addField('Rated', `${anime.rated}`, true)
            .addField('Synopsis', `${anime.synopsis}`)
        if (anime.airing) message.setFooter('This show is currently airing!')

        return message
    }

    function logBotResponse(trigger: string = 'None', intent?: string,
        preventNextAction?: boolean, forgetLastMessage?: boolean) {
        if (preventNextAction) matchedCommand = true
        if (!forgetLastMessage) lastMessage = message.toString()

        console.group(`--- BOT GO! ---`)
        console.log(`TRIGGER: "${trigger}"`)
        console.log(`CALLER: '${message.author.username}'`)
        console.log(`CONTEXT: "${messageString}"`)
        if (intent) console.log(`ACTION: ${intent}`)
        console.groupEnd()

    }

    function botError(code?: number, messageString?: string) {
        let errorMessage: string

        if (!messageString && !code) {

            errorMessage = `Hmmm. Something wrong happened.`
        } else if (code) {
            if (code == 4001)
                errorMessage = `Error ${code} - Couldn't play song.`
        } else message.channel.send(`Error ${code} - ${messageString}`)

        message.channel.send(errorMessage)
    }

    /*  -----  */

    BOT.on('error', error => {
        message.channel.send(`Ah! Something crashed my lil' engine!
         Log submitted to Joe. Restarting...`)

        FileSystem.exists('./crash_logs', exists => {
            if (!exists) FileSystem.mkdir('./crash_logs', folderError => {
                console.error(`Error creating crash log folder: ${folderError}`)
            })

            FileSystem.appendFile(`crash_log_${Date.now()}.txt`,
                (`
            Error encountered during bot runtime!

            ${Date.now}
            
            ${error}
            `)
                , logError => {
                    console.error(`Error writing crash log: ${logError}`)
                });
        }
        )

        //  Re-login
        BOT.login(AUTH.discord.API_KEY)
    })
})

//TODO?:  Greeting
BOT.on('guildMemberAdd', member => {
    //  Send the message to a designated channel when user joins server
    const CHANNEL: Discord.GuildChannel =
        member.guild.channels.find(ch => ch.name === MEMBER_ANNOUNCEMENT_CHANNEL)
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

function searchRecursive(dir: string, pattern: string,
    caseSensitive: boolean = false) {
    if (!caseSensitive) pattern = pattern.toLowerCase()

    // This is where we store pattern matches of all files inside the directory
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
            results = results.concat(searchRecursive(dirInner, pattern));
        }

        // If path is a file and ends with pattern then push it onto results
        if (stat.isFile() && dirInner.endsWith(pattern)) {
            results.push(dirInner);
        }
    });

    return results;
};
