import FileSystem from 'fs'
// yeah just write whatever here to test

import { expect } from 'chai'
import 'mocha'

import Bot from '../Bot'
import BotData from '../bot_functions/DataHandler'
import BotDiscordActivity from '../bot_functions/_state/DiscordActivityStatus'

let bot = new Bot()
globalThis.bot = bot

let timeout: number = 5000

describe('calculate', function () {
    it('done and done lmao', function () {
        let result = 2 + 2
        expect(result)
            .equal(4)
    })
})

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
        }, timeout)
    })
})

describe('User data file is being read', () => {
    it('accessed', () => {
        let wholeData = BotData.getUserDataFile()
        expect(wholeData).to.be.not.null
    })
})

describe('Can fetch specific users with available attribute', () => {
    it('access', () => {
        let pickedData = BotData.getAllUserDataWithAttribute('_id')

        let wholeData = BotData.getUserDataFile()

        expect(Object.keys(pickedData).length)
            .equal(Object.keys(wholeData).length)
    })
})

describe('Bot can find specific user in guilds', () => {
    it('matched', () => {
        let wholeData = BotData.getUserDataFile()

        let randomID: `${bigint}` = wholeData[0]._id

        let matchedUser

        bot.guilds.cache.forEach(guild => {
            if (guild.members.cache.has(randomID))
                matchedUser = guild.members.cache.get(randomID)
        })

        expect(matchedUser)
            .to.not.be.undefined
    })
})

describe(`Bot cycles through different statuses`, () => {
    it('cycled statuses', done => {
        try {
            let numberCycle = 5

            while (numberCycle > 0) {
                //await five successes
                BotDiscordActivity.updateRandomStatus()
                numberCycle--
            }

            done()
        } catch (e) {
            done(e)
        }
    })
})