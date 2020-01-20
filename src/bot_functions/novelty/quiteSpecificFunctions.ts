import { BeanContainer } from '../../types/data_types/Bean';
import Bot from '../../Bot'

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
        let beans: BeanContainer = new BeanContainer()

        bot.preliminary(beans.toString(), beans.toString(), true)

        bot.textChannel.send(`Did you say... BEANZ?!?!?!?`)

        let funnyImageJson =
            await bot.fetchJSONFromURL('https://www.reddit.com/r/beans/top.json?limit=1')

        bot.textChannel.send(
            Bot.fetchRandomPhrase(PHRASES_CONVO.beans.spam_intro))

        await BotModuleGoogleImage.fireImageMessageFromGoogle(beans.toString())

        await BotTwitterModule.fireTweetMessageOfQuery(beans.toString())

        await BotModuleReddit.fireSubmissionImageMessage(funnyImageJson)

        await bot.textChannel.send(
            Bot.fetchRandomPhrase(PHRASES_CONVO.beans.spam_intro))

        await bot.playAudioFromURL('www.youtube.com/watch?v=wEEuzUGEWw')

        return bot.textChannel.send('...👌😤💨')

    }
}