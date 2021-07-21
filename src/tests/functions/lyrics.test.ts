import { expect } from 'chai'
import 'mocha'
import Bot from '../../Bot.js'

// Tested module of interest
import BotModuleLyric from '../../bot_functions/fetching/music/LyricFunctions.js'

let bot = new Bot()
globalThis.bot = bot

describe('Able to fetch lyrics from Genius API', function () {
    it('fetched', async () => {
        let object = await BotModuleLyric.fetchLyricsInfoOfSong('Allstar Smash Mouth')
            .catch(e => { throw e })

        expect(object)
            .to.not.be.null

        console.info(`Obtained song lyrics from Genius API:`)
        console.log(object)
    })
})