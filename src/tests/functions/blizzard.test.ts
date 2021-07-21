import { expect } from 'chai'
import 'mocha'

import Bot from '../../Bot.js'
import BotModuleBlizzard from '../../bot_functions/fetching/game/blizzard/BlizzardMasterFunctions.js'

let bot = new Bot()
globalThis.bot = bot

describe('WoW Game Data API works', function () {
    it('Fetched', async () => {
        let Blizzard = BotModuleBlizzard.Blizzard

        let result = await Blizzard.query(`/data/wow/achievement-category/index`)
            .then((data) => {
                console.log(data)
                expect(data).to.not.be.null
            }).catch((err) => {
                console.error(err)
                throw err
            })
    })
})
