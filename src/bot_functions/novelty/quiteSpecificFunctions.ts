import Bot from '../../Bot'
import Discord from 'discord.js'

import BotModuleGoogleImage from '../fetching/google/googleImageCommands.ts/GoogleImageCommands'
import BotTwitterModule from '../fetching/twitter/TwitterFunctions'

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json'

import PHRASES_FRONT from '../../bot_knowledge/phrases/phrases_front.json'
import PHRASES_SING from '../../bot_knowledge/phrases/phrases_sing.json'
import PHRASES_CONVO from '../../bot_knowledge/phrases/phrases_conversational.json'
import BotModuleReddit from '../fetching/reddit/RedditFunctions'

export default class BotModuleBraindead {
    static communistRepsonse(bot = globalThis.bot) {
        bot.preliminary(TRIGGERS.are_you_triggers.communist, 'Communist response', true)

        PHRASES_SING.songs_to_sing.some(song => {
            if (song.title === 'USSR Anthem')
                bot.playAudioFromFiles(song)
        })

        return bot.context.reply(
            Bot.fetchRandomPhrase(PHRASES_FRONT.asked.communist))
    }

    /**
     * Joe says this is totally the best way to
     * test most of the bot's functionalities. :)
     */
    static async beans(bot: Bot = globalThis.bot) {
        bot.preliminary("beans", "beans", true)

        bot.textChannel.send(`Did you say... BEANZ?!?!?!?`)

        let funnyImageJson =
            await bot.fetchJSONFromURL('https://www.reddit.com/r/beans/top.json?limit=1')


        bot.textChannel.send(
            Bot.fetchRandomPhrase(PHRASES_CONVO.beans.spam_intro))

        await BotModuleGoogleImage.fetchImageFromGoogle('beans')

        let response: any = await BotTwitterModule.fetchTweetWithQuery('beans')
        bot.textChannel.send(response.text)

        await bot.playAudioFromURL('https://www.youtube.com/watch?v=wEEuzUGEWw')

        /* good luck
        let beansInThing: Discord.MessageAttachment =
            new Discord.MessageAttachment(await BotModuleReddit.fetchImageFromSubmission(funnyImageJson))
        bot.textChannel.send(beansInThing)
        */
        
        bot.textChannel.send(
            Bot.fetchRandomPhrase(PHRASES_CONVO.beans.spam_intro))

        return bot.textChannel.send('...👌😤💨')
    }
}