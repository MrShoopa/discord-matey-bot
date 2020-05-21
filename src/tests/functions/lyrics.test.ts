import { expect } from 'chai'
import 'mocha'
import Bot from '../../Bot'

// Tested module of interest
import BotModuleLyric from '../../bot_functions/fetching/lyrics/LyricFunctions'

let bot = new Bot()
globalThis.bot = bot

describe(`Bot connects and populates info`, () => {
    it('connected', done => {
        setTimeout(function () {
            try {
                expect(bot.guilds.cache.size)
                    .to.not.eql(0)
                done()
            } catch (e) {
                done(e)
            }
        }, 5000)
    })
})

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