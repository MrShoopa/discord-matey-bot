import Discord from 'discord.js'
import Bot from '../../../../Bot'

import { covid } from '../../../../bot_knowledge/triggers/triggers.json'

import Covid from 'novelcovid'

export default class BotModuleCovid {
    static async fireCovidInfoMessage(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Covid case pullup')

        let message: Discord.Message | Discord.MessageEmbed
        let query: string = bot.context.toString()


        await covid.country.some(async (keyword: string) => {
            if (bot.context.toString().includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length)
                message = await BotModuleCovid.fetchBuiltCovidInfoMessage('United States', query) // Province?
                return true
            }
        })
        await covid.state.some(async (keyword: string) => {
            if (bot.context.toString().includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length)
                message = await BotModuleCovid.fetchBuiltCovidInfoMessage(query)
                return true
            }
        })
        if (!message)
            message = await BotModuleCovid.fetchBuiltCovidInfoMessage()

        bot.context.channel.send(message)
    }

    static async fetchBuiltCovidInfoMessage(country?: string, state?: string):
        Promise<Discord.Message | Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot

        let data: any

        if (state) {
            data = await Covid.getState({ state: state })
            data.location = state
        }
        else if (country) {
            data = await Covid.getCountry({ country: country })
            data.location = country
        }
        else {
            data = await Covid.getAll()
            data.location = 'World'
        }

        if (data === undefined)
            return new Discord.Message(bot.user.client,
                { content: "Couldn't fetch cases for your location." }, bot.context.channel)

        return BotModuleCovid.generateCovidInfoMessage(data)
    }

    static generateCovidInfoMessage(data: any) {
        let message = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle(`Coronavirus Cases for ${data.location}`)
            .addFields(
                { name: 'Active Cases', value: `${data.active}`, inline: true },
                { name: 'Recovered', value: `${data.active}`, inline: true },
                { name: 'Total Cases', value: `${data.cases}`, inline: true },
                { name: 'New Cases Today', value: `${data.todayCases}`, inline: true },
                { name: 'Deaths', value: `${data.deaths}`, inline: true },
                { name: 'New Deaths Today', value: `${data.todayDeaths}`, inline: true },
            )
            .setTimestamp(new Date(data.updated))

        return message
    }
}