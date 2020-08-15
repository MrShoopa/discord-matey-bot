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

        let data

        try {
            data = await this.fetchTickerInfoDaily(ticker)
        } catch (error) {
            message.reply(bot.generateErrorMessage("Could not find info for your ticker!"))
        }

        return message.channel.send(this.buildTickerInfoDayMessage(ticker, daysAgo))
    }

    static buildTickerInfoDayMessage(tickerDailyData, daysAgo?) {
        let post = new Discord.MessageEmbed()

        let metadata = tickerDailyData["Meta Data"], todayInfo = tickerDailyData["Time Series (Daily)"]
        todayInfo = daysAgo ? todayInfo[Object.keys(todayInfo)[daysAgo]] : todayInfo[Object.keys(todayInfo)[daysAgo]]

        post.setTitle(`$${metadata["2. Symbol"].toUpperCase()} on ${Object.keys(todayInfo)[daysAgo]}`)
        post.addField("Open", todayInfo["1. open"])
        post.addField("Low", todayInfo["3. low"], true)
        post.addField("High", todayInfo["2. high"], true)
        post.addField("Close", todayInfo["4. close"])
        post.addField("Volume", todayInfo["5. volume"])

        if (Number.parseFloat(todayInfo["1. open"]) < Number.parseFloat(todayInfo["4. close"]))
            post.setColor('GREEN')
        else
            post.setColor('RED')

        post.setImage("https://pbs.twimg.com/profile_images/1230031751659114496/UJtP9hb5_400x400.jpg")
        post.setFooter("MegaBroker - AlphaVantage")

        return post
    }

    static async fetchTickerInfoDaily(ticker) {
        let bot: Bot = globalThis.bot

        console.group(`Fetching today's quick ticker info for $${ticker}...`)
        return await Moneyman.data.daily(ticker).then(data => {
            console.log('...success!')
            console.groupEnd()

            return data
        }).catch((err: Error) => {
            bot.saveBugReport(err, this.fireTickerInfoDailyMessage.name, true)
            throw err
        })
    }
}