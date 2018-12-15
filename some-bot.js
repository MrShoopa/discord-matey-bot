//Crappa-Bot, created by Joe Villegas (joevillegasisawesome@gmail.com)

//IDs
const auth = require('./auth.json');
const client_id = auth.token;

//DEPENDENCIES
const Discord = require(`discord.js`);
const logger = require('winston');

const phrases_front = require(`./bot-knowledge/phrases/phrases_front.json`);
const phrases_sing = require(`./bot-knowledge/phrases/phrases_sing.json`)
const phrases_rip = require(`./bot-knowledge/phrases/phrases_suicidal.json`)


//ENTITIES
const bot = new Discord.Client();

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
bot.login(client_id)
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    console.log(`I'm alive!`);
});

//Message bot
bot.on('message', function (message) {
    var message_string = (message.content).toString();
    var voiceChannel = message.member.voiceChannel;

    console.log(`A user said: ${message_string}`);

    //Music Functionality
    if (message_string.substring(0, 8).toLowerCase() == 'i summon' || message_string.substring(0, 13).toLowerCase() == 'megadork sing' || message_string.substring(0, 14).toLowerCase() == 'megadork, sing' || message_string.substring(0, 13).toLowerCase() == 'megadork sing' || message_string.substring(0, 14).toLowerCase() == 'megadork play') {
        try {
            var song_index = 0;

            switch (true) {
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[1].title.toLowerCase()):
                    song_index = 1;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[2].title.toLowerCase()):
                    song_index = 2;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[3].title.toLowerCase()):
                    song_index = 3;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[4].title.toLowerCase()):
                    song_index = 4;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[5].title.toLowerCase()):
                    song_index = 5;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[6].title.toLowerCase()):
                    song_index = 6;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[7].title.toLowerCase()):
                    song_index = 7;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[8].title.toLowerCase()):
                    song_index = 8;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[9].title.toLowerCase()):
                    song_index = 9;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[10].title.toLowerCase()):
                    song_index = 10;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                case message_string.toLowerCase().includes(phrases_sing.songs_to_sing[11].title.toLowerCase()):
                    song_index = 10;

                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.playFile(phrases_sing.songs_to_sing[song_index].file);
                        message.reply(phrases_sing.songs_to_sing[song_index].play_phrase);

                        dispatcher.on("end", end => {
                            console.log(`Song played successfully.`);
                            voiceChannel.leave();
                        });
                    })
                    break;
                default:
                    message.reply(phrases_sing.message_unknown_summon)
            }
        } catch (err) {
            console.log(err)
            message.reply(phrases_sing.message_not_in_channel);
        };
    }
    if (message_string.toLowerCase() == 'stop') {
        message.member.voiceChannel.leave();
        message.reply("Okay...");
    }

    //PHRASE PLAY

    //Suicidal
    switch (message_string) {
        case "i wanna die":
            message.reply(phrases_rip.counter_instant_phrases[0]);
            break;
        case "can i die":
            message.reply(phrases_rip.counter_instant_phrases[Math.floor(Math.random() * (phrases_rip.counter_instant_phrases.length))]);
            break;
    }
    if (message_string.includes("kill myself")) {
        message.reply(phrases_rip.counter_instant_phrases[1]);
    }

    //Random
    if (message_string.includes("suck") + message_string.includes("dick")) {
        message.reply('i ain\'t wanna see that in action');
    }

    //"Thank you"
    if (message_string.toLowerCase() == ("thank you megadork") || message_string.toLowerCase() == ("thanks megadork")) {
        message.reply(phrases_front.asked_thank_you[Math.floor(Math.random() * (phrases_front.asked_thank_you.length))]);
    }




    //MAIN
    if (message_string.substring(0, 8).toLowerCase() == 'megadork') {

        switch (true) {
            //HELP
            case message_string.toLowerCase().includes('what can you summon') || message_string.toLowerCase().includes('what can you do'):
                message.reply(phrases_front.help_intro);

                //Sing
                message.reply(phrases_front.help_sing);

                //Motivate
                message.reply(phrases_front.help_phrase_play);

                break;

                //SINGING HELP
            case message_string.toLowerCase().includes('what can you sing'):
                var song_list = "";

                message.reply(phrases_sing.help_intro);

                phrases_sing.songs_to_sing.forEach(song => {
                    if (song.title != "SONG TITLE") {
                        song_list += `\n ${song.title}`;
                        if (song.explicit == true) {
                            song_list += ` [Explicit]`;
                        }
                    }
                });
                message.reply(song_list);

                break;

                //PHRASE-PLAY
            case message_string.toLowerCase().includes("how are you"):
                message.reply(phrases_rip.asked_how_are_you[Math.floor(Math.random() * (phrases_rip.asked_how_are_you.length + .99))]);
                break;
                //COMMANDS
            case message_string.toLowerCase().includes("sing"):
                break;
            case message_string.toLowerCase().includes("kill the noise") || message_string.toLowerCase().includes("stop"):
                message.reply("Stopping.");

                message.member.voiceChannel.leave();

                break;
            case message_string.toLowerCase().includes("thank you") || message_string.toLowerCase().includes("thanks"):
                message.reply(phrases_front.asked_thank_you[Math.floor(Math.random() * (phrases_front.asked_thank_you.length))]);

                break;

                //UHHH
            case message_string.toLowerCase().length > 8:
                message.reply(phrases_front.unknown_command[Math.floor(Math.random() * (phrases_front.unknown_command.length))]);
                break;
            default:
                message.reply(phrases_front.name_only_callout);
        }

    }
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