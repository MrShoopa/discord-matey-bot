import Bot, { SongState } from "../../Bot"
import { Song } from "../../ts/interfaces";

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json';

import PHRASES_SING from '../../bot_knowledge/phrases/phrases_sing.json';

export default class BotMusicModule {

    static playMusic(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.songState = SongState.Fetching

        let loop: boolean
        //TODO if (messageString.substring(0, 20).toLowerCase().includes('loop')) loop = true

        try {

            /*  Iterates over list of listed songs before taking action.
                
                Music search priorities:
                1. Local Files w/ special names,
                2. URLs,
                3. Local Files w/ exact file
            */
            for (const song of PHRASES_SING.songs_to_sing)
                if (bot.context.toString().toLowerCase().
                    includes(song.title.toLowerCase())
                    && !bot.commandSatisfied) {
                    //  When song from local files is found

                    let foundSong: Song.SongObject = song

                    return bot.playAudioFromFiles(foundSong, loop, trigger)
                    break
                } else if (bot.context.toString().toLowerCase().
                    includes(TRIGGERS.url_trigger.any) &&
                    !bot.commandSatisfied) {
                    //  When song from URL is found

                    var url_string: string[] = bot.context.toString().split(' ')

                    return bot.playAudioFromURL(url_string[url_string.length - 1], loop, trigger)
                        .catch(error => { throw error })
                }

            // Start searching local audio folder for 'non-tagged' songs
            if (bot.songState == SongState.Fetching) {
                let songRequest = bot.context.toString().substring(trigger.length + 1)

                let matchedSongs = Bot.searchFilesRecursive('./', `${songRequest}.mp3`);
                if (matchedSongs.length > 0 && songRequest.length > 0) {
                    console.group(`Local matching songs found:`)
                    console.log(matchedSongs)
                    console.groupEnd()

                    //TODO: Give choice from multiple matches
                    return bot.playAudioFromFiles(matchedSongs[0], loop)
                }
            }

        } catch (error) {
            //TODO bot.botError(4001)

            if (!bot.voiceChannel) {
                console.warn(`Bot couldn't find a voice channel to join. Please have user join a channel first.`)
                bot.context.reply(
                    PHRASES_SING.message_not_in_channel)
            } else bot.saveBugReport(error)
        }

        if (bot.songState == SongState.Fetching) { //  When song is not found
            bot.context.reply(
                PHRASES_SING.message_unknown_summon)

            console.warn('No such song found.')
        }

        // Finished
        bot.commandSatisfied = true
    }

    static stopMusic(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Singing Stop', true, true)

        if (bot.voiceChannel != null && bot.voice.connections.size !== 0) {
            bot.context.member.voice.channel.leave()

            bot.context.reply(Bot.fetchRandomPhrase(PHRASES_SING.command_feedback.stop.active))
            console.log('Bot exited voice channel by user message.')
        } else {
            if (bot.context.toString().substring(0, 6).toLowerCase().includes("stop"))
                return  // No message is sent when just saying 'stop' on no playback

            bot.context.reply(Bot.fetchRandomPhrase(PHRASES_SING.command_feedback.stop.null))
            console.log('No sound was playing, nothing terminated.')
        }
    }
}