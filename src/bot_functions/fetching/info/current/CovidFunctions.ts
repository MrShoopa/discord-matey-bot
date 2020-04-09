import Discord from 'discord.js'
import Bot from '../../../../Bot'

import { covid } from '../../../../bot_knowledge/triggers/triggers.json'

import { NovelCovid, State } from 'novelcovid'

let Covid = new NovelCovid()

export default class BotModuleCovid {
    static async fireCovidInfoMessage(trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Covid case pullup')

        let message: Discord.Message | Discord.MessageEmbed
        let query: string = bot.context.toString()


        for (const keyword of covid.state)
            if (bot.context.toString().includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                message = await BotModuleCovid.fetchBuiltCovidInfoMessage('United States', query) // Province?
                break
            }
        for (const keyword of covid.country)
            if (bot.context.toString().includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                message = await BotModuleCovid.fetchBuiltCovidInfoMessage(query)
                break
            }
        for (const keyword of covid.default)
            if (bot.context.toString().endsWith(keyword)) {
                message = await BotModuleCovid.fetchBuiltCovidInfoMessage()
                break
            }

        return bot.context.channel.send(message)
    }

    static async fetchBuiltCovidInfoMessage(country?: string, state?: string):
        Promise<Discord.Message | Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot

        let data: any

        try {

            if (state) {
                state = state.charAt(0).toUpperCase() + state.slice(1);
                data = await Covid.states()
                data = data.find(x => x.state.toLowerCase() == state.toLowerCase())
                if (data) data.location = state
            }
            else if (country) {
                country = country.charAt(0).toUpperCase() + country.slice(1);
                data = await Covid.countries(country.toLowerCase())
                data.location = country
            }
            else {
                data = await Covid.all()
                data.location = 'World'
            }

            if (data?.message?.includes('not found'))
                data = undefined
        } catch (err) {
            bot.saveBugReport(err, this.fetchBuiltCovidInfoMessage.name, true)
            data = undefined
        }

        if (data === undefined)
            return new Discord.Message(bot.user.client,
                { content: "Couldn't fetch cases for your location." },
                bot.context.channel as Discord.TextChannel | Discord.DMChannel)

        return BotModuleCovid.generateCovidInfoMessage(data)
    }

    static generateCovidInfoMessage(data: any) {
        let message = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle(`Coronavirus Cases for ${data.location}`)
            .setTimestamp(new Date(data.updated))

        if (data.active) message.addFields({ name: 'Active Cases', value: `${data.active}`, inline: true })
        if (data.recovered) message.addFields({ name: 'Recovered', value: `${data.recovered}`, inline: true })
        if (data.cases) message.addFields({ name: 'Total Cases', value: `${data.cases}`, inline: true })
        if (data.deaths) message.addFields({ name: 'Deaths', value: `${data.deaths}`, inline: true })
        if (data.todayCases !== undefined) message.addFields({ name: 'New Cases Today', value: `${data.todayCases}`, inline: true })
        if (data.todayDeaths !== undefined) message.addFields({ name: 'New Deaths Today', value: `${data.todayDeaths}`, inline: true })

        return message
    }
}