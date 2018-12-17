//Crappa-Bot, created by Joe Villegas (joevillegasisawesome@gmail.com)

//IDs
const auth = require('./auth.json');

//DEPENDENCIES
const Discord = require(`discord.js`);
const logger = require('winston');

const phrases_front = require(`./bot_knowledge/phrases/phrases_front.json`);
const phrases_sing = require(`./bot_knowledge/phrases/phrases_sing.json`)
const phrases_convo = require(`./bot_knowledge/phrases/phrases_conversational.json`)

const triggers = require(`./bot_knowledge/phrases/triggers/triggers.json`)


//ENTITIES
const bot = new Discord.Client();

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
bot.login(auth.token)
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    console.log(`I'm alive!`);
});

//Messaging to bot
bot.on('message', function (message) {
    var matched_command = false;

    var message_string = (message.content).toString();
    var voiceChannel = message.member.voiceChannel;

    console.log(`A user said: ${message_string}`);

    /*
        Music Functionality
    */
    triggers.singing_triggers.play.forEach(trigger => {
        trigger.toLowerCase();

        //Attempt to play song
        if (message_string.substring(0, 15).toLowerCase().includes(trigger)) {
            matched_command = true;
            var song_state = "fetching";

            try {
                phrases_sing.songs_to_sing.forEach(song => {
                    //When song is found
                    if (message_string.toLowerCase().includes(song.title.toLowerCase())) {
                        song_state = "playing";

                        voiceChannel.join().then(connection => {
                            console.log(`Voice channel connection status: ${voiceChannel.connection.status}`)
                            const dispatcher = connection.playFile(song.file);
                            message.reply(song.play_phrase);


                            dispatcher.on("end", end => {
                                console.log(`Song played successfully.`);
                                song_state = "finished";
                                voiceChannel.leave();
                            });
                        })
                    }
                });
            } catch (err) { //When user is not in voice channel
                console.log(err)
                message.reply(phrases_sing.message_not_in_channel);
            }
            if (song_state == "fetching") { //When song is not found
                message.reply(phrases_sing.message_unknown_summon);
            }
        }
    });
    //Stop audio
    triggers.singing_triggers.stop.forEach(trigger => {
        if (message_string.substring(0, 25).toLowerCase().includes(trigger) && voiceChannel.connection.status == 0) {
            message.member.voiceChannel.leave();
            message.reply(fetchRandomPhrase(phrases_sing.command_feedback.stop));
        }
    });

    /*
        Phrase play
    */

    //Suicidal
    triggers.third_person_phrase_triggers.self_death_wish.die.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            if (trigger == "can i die") return message.reply(phrases_convo.counter_instant_phrases[0]);
            else return message.reply(fetchRandomPhrase(phrases_convo.counter_instant_phrases));
        }
    });
    triggers.third_person_phrase_triggers.self_death_wish.kill_self.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger)) {
            return message.reply(phrases_convo.counter_instant_phrases[1]);
        }
    });
    //Random
    if (message_string.includes(triggers.third_person_phrase_triggers.suck_thing[0]) &&
        message_string.includes(triggers.third_person_phrase_triggers.suck_thing[1])) {
        return message.reply(fetchRandomPhrase(phrases_convo.not_desired.to_look));
    }

    //When mentioning name afterwards (anytime main_trigger is mentioned)
    triggers.main_trigger.forEach(trigger => {
        if (message_string.toLowerCase().includes(trigger, 1)) {
            triggers.threat.kill_self.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    return message.reply(fetchRandomPhrase(phrases_convo.asked_death_threat));
                }
            });
        }
    });



    //MAIN (When started with "Megadork", for example)
    triggers.main_trigger.forEach(trigger => {
        if (message_string.substring(0, 10).toLowerCase().includes(trigger) && !matched_command) {

            //HELP
            triggers.help_questions.actions.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    matched_command = true;

                    message.reply(phrases_front.help_intro);

                    //Sing
                    message.reply(phrases_front.help_sing);

                    //Motivate
                    message.reply(phrases_front.help_phrase_play);
                }
            });

            //SINGING HELP
            triggers.help_questions.singing.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    matched_command = true;

                    var song_list = "";

                    message.reply(phrases_sing.help_intro);

                    phrases_sing.songs_to_sing.forEach(song => {
                        if (song.title != phrases_sing.songs_to_sing[0].title) {
                            song_list += `\n ${song.title}`;
                            if (song.explicit == true) {
                                song_list += phrases_sing.songs_to_sing[0].explicit_text;
                            }
                        }
                    });
                    message.reply(song_list);
                }
            });

            //PHRASE-PLAY
            triggers.how_is_bot.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    matched_command = true;

                    message.reply(fetchRandomPhrase(phrases_convo.asked_how_are_you));
                }
            });
            triggers.threat.kill_self.forEach(trigger => {
                if (message_string.toLowerCase().includes(trigger)) {
                    matched_command = true;

                    message.reply(fetchRandomPhrase(phrases_convo.asked_death_threat));
                }
            });

            //COMMANDS

            triggers.main_trigger.forEach(trigger => {
                if (message_string == trigger) {
                    matched_command = true;

                    message.reply(phrases_front.name_only_callout);
                }
            });

            //UHHH
            if (!matched_command) message.reply(fetchRandomPhrase(phrases_front.unknown_command));
        }

    });
})

//Greeting
bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find(ch => ch.name === 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}! \n\n\n\n...\n\n who the f-`);
});

function fetchRandomPhrase(key) {
    return key[Math.floor(Math.random() * (key.length))]
}

//function logBotResponse(trigger = "None", )