//Crappa-Bot, created by Joe Villegas (joevillegasisawesome@gmail.com)

/* eslint-disable no-console, no-unused-vars, indent */

//IDs
const auth = require('./auth.json')

//DEPENDENCIES
const Discord = require('discord.js')
const logger = require('winston')

const phrases_front = require('./bot_knowledge/phrases/phrases_front.json')
const phrases_sing = require('./bot_knowledge/phrases/phrases_sing.json')
const phrases_convo = require('./bot_knowledge/phrases/phrases_conversational.json')

const triggers = require('./bot_knowledge/phrases/triggers/triggers.json')


//ENTITIES
const bot = new Discord.Client()

// Configure logger settings
logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug'

// Initialize Discord Bot
bot.login(auth.token)
bot.on('ready', function (evt) {
    logger.info('Connected')
    logger.info('Logged in as: ')
    logger.info(bot.username + ' - (' + bot.id + ')')

    console.log('I\'m alive!')
})

//Messaging to bot
bot.on('message', function (message) {
    //So bot doesn't respond to itself
    if (message.author.id == 449625729509097482) return

    var matched_command = false

    var message_string = (message.content).toString()
    var voiceChannel = message.member.voiceChannel

    console.log(`A user said: ${message_string}`)


    /*
        Music Functionality
    */
    triggers.singing_triggers.play.forEach(trigger => {
        trigger.toLowerCase()
        var song_state = 'idle'

        //Attempt to play song
        if (message_string.substring(0, 15).toLowerCase().includes(trigger)) {
            logBotResponse(trigger)

            song_state = 'fetching'

            try {
                phrases_sing.songs_to_sing.forEach(song => {
                    //When song is found
                    if (message_string.toLowerCase().includes(song.title.toLowerCase())) {
                        song_state = 'playing'

                        voiceChannel.join().then(connection => {
                            console.log(`Voice channel connection status: ${voiceChannel.connection.status}`)
                            const dispatcher = connection.playFile(song.file)
                            message.reply(song.play_phrase)


                            dispatcher.on('end', () => {
                                console.log('Song played successfully.')
                                song_state = 'finished'
                                voiceChannel.leave()
                            })
                        })
                    } else if (message_string.toLowerCase().includes('youtube.com/') || message_string.toLowerCase.includes('youtu.be/')) {
                        playYouTubeSong()
                    }
                })
            } catch (err) { //When user is not in voice channel
                console.log(err)
                message.reply(phrases_sing.message_not_in_channel)
            }
            if (song_state == 'fetching') { //When song is not found
                message.reply(phrases_sing.message_unknown_summon)
            }
        }

        function playYouTubeSong(url) {
            const ytdl = require('ytdl-core')

            const stream = ytdl(url, {
                filter: 'audioonly'
            })
            const streamOptions = {
                seek: 0,
                volume: .75
            }


            voiceChannel.join().then(connection => {
                song_state = 'playing'
                console.log(`Voice channel connection status: ${voiceChannel.connection.status}`)

                const dispatcher = connection.playStream(stream, streamOptions)

                dispatcher.on('start', () => {
                    console.log(`Playing song from ${url}.`)
                    song_state = 'finished'
                })
                dispatcher.on('end', () => {
                    console.log('Song played successfully.')
                    song_state = 'finished'
                    voiceChannel.leave()
                })
            })
        }
    })
    //Stop audio
    triggers.singing_triggers.stop.forEach(trigger => {
        if (message_string.substring(0, 25).toLowerCase().includes(trigger) && voiceChannel.connection.status == 0) {
            logBotResponse(trigger)

            message.member.voiceChannel.leave()
            message.reply(fetchRandomPhrase(phrases_sing.command_feedback.stop))
        }
    })


    /*
        Phrase play
    */
    //Suicidal
    triggers.third_person_phrase_triggers.self_death_wish.die.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)

            if (trigger == 'can i die') return message.reply(phrases_convo.counter_suicide_phrases[0])
            else return message.reply(fetchRandomPhrase(phrases_convo.counter_suicide_phrases))
        }
    })
    triggers.third_person_phrase_triggers.self_death_wish.kill_self.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            logBotResponse(trigger)

            return message.reply(phrases_convo.counter_suicide_phrases[1])
        }
    })
    //Random
    if (message_string.includes(triggers.third_person_phrase_triggers.suck_thing[0]) &&
        message_string.includes(triggers.third_person_phrase_triggers.suck_thing[1])) {
        return message.reply(fetchRandomPhrase(phrases_convo.not_desired.to_look))
    }

    //When mentioning name afterwards (anytime main_trigger is mentioned)
    triggers.main_trigger.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger, 1)) {

            //Death threats
            triggers.threat.kill_self.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    //FRIEND SPECIFIC :)
                    if (message.author.username == 'MrShoopa') message.reply('joe you a hoe')
                    if (message.author.username == 'The King of Bling') message.reply('nick ya dick')
                    if (message.author.username == 'Vitalion') message.reply('mitch ya snitch')
                    if (message.author.username == 'Jaygoo') message.reply('ur dog gay')

                    message.reply(fetchRandomPhrase(phrases_convo.asked_death_threat))
                }
            })
        }
    })



    //MAIN (When started with "Megadork", for example)
    triggers.main_trigger.forEach(trigger => {
        if (message_string.substring(0, 10).toLowerCase().includes(trigger) && !matched_command) {

            //HELP
            triggers.help_questions.actions.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    message.reply(phrases_front.help_intro)

                    //Sing
                    message.reply(phrases_front.help_sing)

                    //Motivate
                    message.reply((phrases_front.help_conversation.main +
                        phrases_front.help_conversation.example.threat))

                }
            })

            //SINGING HELP
            triggers.help_questions.singing.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    var song_list = ''

                    message.reply(phrases_sing.help_intro)

                    phrases_sing.songs_to_sing.forEach(song => {
                        if (song.title != phrases_sing.songs_to_sing[0].title) {
                            song_list += `\n ${song.title}`
                            if (song.explicit == true) {
                                song_list += phrases_sing.songs_to_sing[0].explicit_text
                            }
                        }
                    })
                    message.reply(song_list)
                }
            })

            //PHRASE-PLAY
            triggers.how_is_bot.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    message.reply(fetchRandomPhrase(phrases_convo.asked_how_are_you))
                }
            })
            triggers.threat.kill_self.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    logBotResponse(trigger)

                    message.reply(fetchRandomPhrase(phrases_convo.asked_death_threat))
                }
            })

            //COMMANDS

            triggers.main_trigger.forEach(trigger => {
                if (message_string == trigger) {
                    logBotResponse(trigger)

                    message.reply(phrases_front.name_only_callout)
                }
            })

            //UHHH
            if (!matched_command) message.reply(fetchRandomPhrase(phrases_front.unknown_command))
        }

    })

    function logBotResponse(trigger = 'None') {
        matched_command = true

        console.log(`Bot did something! TRIGGER: "${trigger}", TRIGGERED_BY: '${message.author.username}', USER_CONTEXT: "${message_string}"`)
    }
})

//Greeting
bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find(ch => ch.name === 'member-log')
    // Do nothing if the channel wasn't found on this server
    if (!channel) return
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}! \n\n\n\n...\n\n who the f-`)
})

function fetchRandomPhrase(key) {
    return key[Math.floor(Math.random() * (key.length))]
}