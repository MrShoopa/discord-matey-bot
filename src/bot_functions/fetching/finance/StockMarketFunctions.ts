import Discord from 'discord.js'
import Bot from '../../../Bot'
import USER_CREDS from '../../../user_creds.json'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

import AlphaVantage from 'alphavantage'

const Moneyman = AlphaVantage({ key: USER_CREDS.alpha_vantage.key })

export default class BotModuleStockMarket {

    static funcTitle = "MegaBroker - AlphaVantage"

    static async fireTickerInfoDailyMessage(message: Discord.Message, query?: string, trigger?: string, dateChoice?: Date | string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Stock Market Ticker search', true)

        if (!query)
            query = message.content

        let ticker = query.match(/[$][A-Za-z]{1,5}[\S]/)[0].substr(1).trim()
        if (!dateChoice && query.includes('on'))
            dateChoice = new Date(query.substr(query.indexOf('on') + 2).trim())
        else if (typeof dateChoice === 'string')
            dateChoice = new Date(dateChoice)

        if (!ticker) return message.channel.send("Invalid request for finding ticker's info. *;help stocks*")

        let data: StockInfo

        try {
            await this.fetchTickerInfoDaily(ticker).then(d => data = d).catch((err: Error) => { throw err })
            return message.channel.send({ embeds: [this.buildTickerInfoDayMessage(data, dateChoice as Date)] })
        } catch (err) {
            if (err.message.includes('Invalid API call'))
                return message.reply({ embeds: [bot.generateErrorMessage(`invalid ticker!`, this.funcTitle)] })
            if (err.message.includes('No data exists for that day'))
                return message.reply({ embeds: [bot.generateErrorMessage(`did not find your ticker's stats for that day!`, this.funcTitle)] })
            if (err.message.includes('No data exists for that day') && !dateChoice)
                return message.reply({ embeds: [bot.generateErrorMessage(`did not find your ticker's stats for today! Is the market closed today?`, this.funcTitle)] })
            if (err.message.includes('no data whatsoever'))
                return message.reply({ embeds: [bot.generateErrorMessage("could not find info for your stock ticker!", this.funcTitle)] })
        }
    }

    static async fireCryptoInfoDailyMessage(message: Discord.Message, query?: string, trigger?: string, dateChoice?: Date | string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Crypto Ticker search', true)

        if (!query)
            query = message.content

        let crypto = query.match(/[$][A-Za-z]{1,5}[\S]/)[0].substr(1).trim()
        if (!dateChoice && query.includes('on'))
            dateChoice = new Date(query.substr(query.indexOf('on') + 2).trim())
        else if (typeof dateChoice === 'string')
            dateChoice = new Date(dateChoice)

        if (!crypto) return message.channel.send("Invalid request for finding crypto info. *;help stocks*")

        let data: CryptoInfo


        try {
            await this.fetchCryptoInfoDaily(crypto).then(d => data = d).catch((err: Error) => { throw err })
            return message.channel.send({ embeds: [this.buildTickerInfoDayMessage(data, dateChoice as Date)] })
        } catch (err) {
            if (err.message.includes('Invalid API call'))
                return message.reply({ embeds: [bot.generateErrorMessage(`invalid crypto symbol!`, this.funcTitle)] })
            if (err.message.includes('No data exists for that day'))
                return message.reply({ embeds: [bot.generateErrorMessage(`did not find your crypto's stats for that day!`, this.funcTitle)] })
            if (err.message.includes('No data exists for that day') && !dateChoice)
                return message.reply({ embeds: [bot.generateErrorMessage(`did not find your crypto's stats for today! Is the market closed today?`, this.funcTitle)] })
            if (err.message.includes('no data whatsoever'))
                return message.reply({ embeds: [bot.generateErrorMessage("could not find info for your crypto!", this.funcTitle)] })
        }
    }

    static buildTickerInfoDayMessage(tickerDailyData: StockInfo | CryptoInfo, dayChoice?: Date) {
        let post = new Discord.MessageEmbed()

        dayChoice = dayChoice !== undefined ? dayChoice : new Date(Date.now())
        let dayLookup = `${dayChoice.getFullYear()}-${this.force2DigString(dayChoice.getMonth() + 1)}-${this.force2DigString(dayChoice.getDate())}`

        try {

            if (!tickerDailyData["Meta Data"]["1. Information"].includes('Digital')) {
                let metadata = tickerDailyData["Meta Data"], todayInfoArray = tickerDailyData["Time Series (Daily)"]
                let todayInfo = todayInfoArray[dayLookup]

                post.setTitle(`$${metadata["2. Symbol"].toUpperCase()} on ${this.parseDateString(dayChoice)}`)
                post.addField("Open", Number.parseFloat(todayInfo["1. open"]).toFixed(2), true)
                post.addField("Low", Number.parseFloat(todayInfo["3. low"]).toFixed(2), true)
                post.addField("Volume", Number.parseFloat(todayInfo["5. volume"]).toString(), true)
                post.addField("Close", Number.parseFloat(todayInfo["4. close"]).toFixed(2), true)
                post.addField("High", Number.parseFloat(todayInfo["2. high"]).toFixed(2), true)

                if (Number.parseFloat(todayInfo["1. open"]) < Number.parseFloat(todayInfo["4. close"]))
                    post.setColor('GREEN')
                else
                    post.setColor('RED')
            } else if (tickerDailyData["Meta Data"]["1. Information"].includes('Digital')) {
                let metadata = tickerDailyData["Meta Data"], todayInfoArray = tickerDailyData["Time Series (Digital Currency Daily)"]
                let todayInfo = todayInfoArray[dayLookup]
                let irlCurrency = metadata["4. Market Code"]

                post.setTitle(`${metadata["3. Digital Currency Name"]} (to ${irlCurrency}) on ${this.parseDateString(dayChoice)}`)
                if (Number.parseFloat(todayInfo[`1a. open (${irlCurrency})`]).toFixed(1) == "0.0") {
                    post.addField("Open", Number.parseFloat(todayInfo[`1a. open (${irlCurrency})`]).toString(), true)
                    post.addField("Low", Number.parseFloat(todayInfo[`3a. low (${irlCurrency})`]).toString(), true)
                    post.addField("Volume", Number.parseFloat(todayInfo[`5. volume`]).toString(), true)
                    post.addField("Close", Number.parseFloat(todayInfo[`4a. close (${irlCurrency})`]).toString(), true)
                    post.addField("High", Number.parseFloat(todayInfo[`2a. high (${irlCurrency})`]).toString(), true)
                    post.addField("Market Cap", Number.parseFloat(todayInfo[`6. market cap (${irlCurrency})`]).toString(), true)
                } else {
                    post.addField("Open", Number.parseFloat(todayInfo[`1a. open (${irlCurrency})`]).toFixed(2), true)
                    post.addField("Low", Number.parseFloat(todayInfo[`3a. low (${irlCurrency})`]).toFixed(2), true)
                    post.addField("Volume", Number.parseFloat(todayInfo[`5. volume`]).toFixed(2), true)
                    post.addField("Close", Number.parseFloat(todayInfo[`4a. close (${irlCurrency})`]).toFixed(2), true)
                    post.addField("High", Number.parseFloat(todayInfo[`2a. high (${irlCurrency})`]).toFixed(2), true)
                    post.addField("Market Cap", Number.parseFloat(todayInfo[`6. market cap (${irlCurrency})`]).toFixed(2), true)
                }

                if (Number.parseFloat(todayInfo["1. open"]) < Number.parseFloat(todayInfo["4. close"]))
                    post.setColor('GREEN')
                else
                    post.setColor('RED')
            }
        } catch (error) {
            if (!tickerDailyData)
                throw new ReferenceError('Retrieved no data whatsoever.')
            if (error.message.includes('undefined'))
                throw new ReferenceError('No data exists for that day.')
        }

        post.setFooter(this.funcTitle, "https://pbs.twimg.com/profile_images/1230031751659114496/UJtP9hb5_400x400.jpg")

        return post
    }

    static async fetchTickerInfoDaily(ticker: string): Promise<StockInfo> {
        let bot: Bot = globalThis.bot

        console.group(`Fetching daily quick ticker info for $${ticker.toUpperCase()}...`)
        return await Moneyman.data.daily(ticker).then(data => {
            console.log('...success!')
            console.groupEnd()

            return data
        }).catch((err) => {
            bot.saveBugReport(err, this.fetchTickerInfoDaily.name, true)
            console.groupEnd()
            let fakeErrObj = err
            fakeErrObj.message = err
            throw fakeErrObj //hackerman
        })
    }

    static async fetchCryptoInfoDaily(symbol: string, currency: string = 'usd'): Promise<CryptoInfo> {
        let bot: Bot = globalThis.bot

        console.group(`Fetching daily quick crypto info for $${symbol.toUpperCase()} in ${currency.toUpperCase()}...`)
        return await Moneyman.crypto.daily(symbol, currency).then(data => {
            console.log('...success!')
            console.groupEnd()

            return data
        }).catch((err) => {
            bot.saveBugReport(err, this.fetchCryptoInfoDaily.name, true)
            console.groupEnd()
            let fakeErrObj = err
            fakeErrObj.message = err
            throw fakeErrObj  //hackerman
        })
    }

    static parseDateString(dateThing: string | Date): string {
        let date = (dateThing instanceof Date) ? dateThing : new Date(dateThing)
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    }

    static force2DigString(n: number) {
        return (n > 9) ? "" + n : "0" + n
    }
}

class StockInfo {
    [x: string]: any
}
class CryptoInfo {
    [x: string]: any
}