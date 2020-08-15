import Discord from 'discord.js'
import Bot from '../../../Bot'

import { stock_market } from '../../../../bot_knowledge/triggers/triggers.json'

import AlphaVantage from 'alphavantage'

export default class BotModuleStockMarket {
    static async fireTickerInfoMessage(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Stock Market Ticker search', true)

        //TODO:
    }
}