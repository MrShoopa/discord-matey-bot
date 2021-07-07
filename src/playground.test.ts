// Test any functions uncovered here!

import { expect } from 'chai'
import 'mocha'
import BotData from './bot_functions/DataHandler'
import Bot from './Bot'

var test = 'megadork hi'
var testInput = 'megadork! hi'

console.log(`are you cool? ${test.includes(testInput)}`)

let bot = new Bot()
globalThis.bot = bot

let timeout: number = 200

describe(`Bot connected`, () => {
	it('connected', done => {
		setTimeout(function () {
			try {
				expect(bot.guilds.cache.size)
					.to.not.be.null
				done()
			} catch (e) {
				done(e)
			}
		}, timeout)
	})
})

describe('Finding specific user in guilds', () => {
	it('matched', () => {
		let wholeData = BotData.getUserDataFile()

		wholeData[0]._id

		let matchedUser

		bot.guilds.cache.forEach(guild => {
			guild.members.cache.get(`23`)
		})

		expect(matchedUser)
			.to.not.be.null
	})
})
