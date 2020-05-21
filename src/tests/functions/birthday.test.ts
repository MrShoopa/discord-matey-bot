// Birthday Module testing

import { expect } from 'chai'
import 'mocha'
import BotModuleBirthday from '../../bot_functions/novelty/birthday/BirthdayFunctions'
import Bot from '../../Bot'

let bot = new Bot()
globalThis.bot = bot

describe('Birthdays found in user save data', function () {
    it('find', function () {
        let list = BotModuleBirthday.checkBirthdaysToday()

        console.log(list)

        expect(list)
            .to.not.be.null
    })
})

xdescribe('annouce birthdays today', () => {
    it('find', done => {
        setTimeout(function () {
            try {
                BotModuleBirthday.checkBirthdaysToday(true)
                // No exceptions thrown, really

                done()
            } catch (e) {
                done(e)
            }
        }, 2000)
    })
})