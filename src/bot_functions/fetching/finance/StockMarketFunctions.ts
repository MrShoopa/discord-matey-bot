import Discord from 'discord.js'
import Bot from '../../../Bot'
import USER_CREDS from '../../../user_creds.json'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

import AlphaVantage from 'alphavantage'

const Moneyman = AlphaVantage({ key: USER_CREDS.alpha_vantage.key })

export default class BotModuleStockMarket {
    static async fireTickerInfoDailyMessage(message: Discord.Message, query?: string, trigger?: string, daysAgo?: number) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Stock Market Ticker search', true)

        if (!query)
            query = message.content

        let ticker = query.match(/[$][A-Za-z]{1,5}[\S]/)[0].substr(1).trim()

        if (!ticker) return message.channel.send("Invalid request for finding ticker's info. *;help stocks*")

        let data: StockInfo

        try {
            data = await this.fetchTickerInfoDaily(ticker)
        } catch (error) {
            message.reply(bot.generateErrorMessage("could not find info for your ticker!"))
        }

        return message.channel.send(this.buildTickerInfoDayMessage(data, daysAgo))
    }

    static async fireCryptoInfoDailyMessage(message: Discord.Message, query?: string, trigger?: string, daysAgo?: number) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Stock Market Ticker search', true)

        if (!query)
            query = message.content

        let crypto = query.match(/[$][A-Za-z]{1,5}[\S]/)[0].substr(1).trim()

        if (!crypto) return message.channel.send("Invalid request for finding crypto info. *;help stocks*")

        let data: CryptoInfo

        try {
            data = await this.fetchCryptoInfoDaily(crypto)
        } catch (error) {
            message.reply(bot.generateErrorMessage("could not find info for your crypto!"))
        }

        return message.channel.send(this.buildTickerInfoDayMessage(data, daysAgo))
    }

    static buildTickerInfoDayMessage(tickerDailyData: StockInfo | CryptoInfo, daysAgo?: number) {
        let post = new Discord.MessageEmbed()

        daysAgo = daysAgo ? daysAgo : 0

        if (!tickerDailyData["Meta Data"]["1. Information"].includes('Digital')) {

            let metadata = tickerDailyData["Meta Data"], todayInfoArray = tickerDailyData["Time Series (Daily)"]
            let todayInfo = todayInfoArray[Object.keys(todayInfoArray)[daysAgo]]

            post.setTitle(`$${metadata["2. Symbol"].toUpperCase()} on ${this.parseDateString(Object.keys(todayInfoArray)[daysAgo])}`)
            post.addField("Open", Number.parseFloat(todayInfo["1. open"]).toFixed(2), true)
            post.addField("Low", Number.parseFloat(todayInfo["3. low"]).toFixed(2), true)
            post.addField("Volume", Number.parseFloat(todayInfo["5. volume"]).toFixed(2), true)
            post.addField("Close", Number.parseFloat(todayInfo["4. close"]).toFixed(2), true)
            post.addField("High", Number.parseFloat(todayInfo["2. high"]).toFixed(2), true)

            if (Number.parseFloat(todayInfo["1. open"]) < Number.parseFloat(todayInfo["4. close"]))
                post.setColor('GREEN')
            else
                post.setColor('RED')
        } else if (tickerDailyData["Meta Data"]["1. Information"].includes('Digital')) {
            let metadata = tickerDailyData["Meta Data"], todayInfoArray = tickerDailyData["Time Series (Digital Currency Daily)"]
            let todayInfo = todayInfoArray[Object.keys(todayInfoArray)[daysAgo]]
            let irlCurrency = metadata["4. Market Code"]

            post.setTitle(`${metadata["3. Digital Currency Name"]} (to ${irlCurrency}) on ${this.parseDateString(Object.keys(todayInfoArray)[daysAgo])}`)
            post.addField("Open", Number.parseFloat(todayInfo[`1a. open (${irlCurrency})`]).toFixed(2), true)
            post.addField("Low", Number.parseFloat(todayInfo[`3a. low (${irlCurrency})`]).toFixed(2), true)
            post.addField("Volume", Number.parseFloat(todayInfo[`5. volume`]).toFixed(2), true)
            post.addField("Close", Number.parseFloat(todayInfo[`4a. close (${irlCurrency})`]).toFixed(2), true)
            post.addField("High", Number.parseFloat(todayInfo[`2a. high (${irlCurrency})`]).toFixed(2), true)
            post.addField("Market Cap", Number.parseFloat(todayInfo[`6. market cap (${irlCurrency})`]).toFixed(2), true)

            if (Number.parseFloat(todayInfo["1. open"]) < Number.parseFloat(todayInfo["4. close"]))
                post.setColor('GREEN')
            else
                post.setColor('RED')
        }

        post.setFooter("MegaBroker - AlphaVantage", "https://pbs.twimg.com/profile_images/1230031751659114496/UJtP9hb5_400x400.jpg")

        return post
    }

    static async fetchTickerInfoDaily(ticker: string): Promise<StockInfo> {
        let bot: Bot = globalThis.bot

        console.group(`Fetching daily quick ticker info for $${ticker.toUpperCase()}...`)
        return await Moneyman.data.daily(ticker).then(data => {
            console.log('...success!')
            console.groupEnd()

            return data
        }).catch((err: Error) => {
            bot.saveBugReport(err, this.fetchTickerInfoDaily.name, true)
            console.groupEnd()
            throw err
        })
    }

    static async fetchCryptoInfoDaily(symbol: string, currency: string = 'usd'): Promise<CryptoInfo> {
        let bot: Bot = globalThis.bot

        console.group(`Fetching daily quick crypto info for $${symbol.toUpperCase()} in ${currency.toUpperCase()}...`)
        return await Moneyman.crypto.daily(symbol, currency).then(data => {
            console.log('...success!')
            console.groupEnd()

            return data
        }).catch((err: Error) => {
            bot.saveBugReport(err, this.fetchCryptoInfoDaily.name, true)
            console.groupEnd()
            throw err
        })
    }

    static parseDateString(dateString: string) {
        let date = new Date(dateString)
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    }
}

class StockInfo {
    [x: string]: any
}
class CryptoInfo {
    [x: string]: any
}