import Discord from 'discord.js'
import Bot from '../../../../Bot'

import { covid } from '../../../../bot_knowledge/triggers/triggers.json'

import { NovelCovid } from 'novelcovid'

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
        for (const keyword of covid.continent)
            if (bot.context.toString().includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                message = await BotModuleCovid.fetchBuiltCovidInfoMessage(null, null, query)
                break
            }
        for (const keyword of covid.default)
            if (bot.context.toString().endsWith(keyword)) {
                message = await BotModuleCovid.fetchBuiltCovidInfoMessage()
                break
            }

        if (message)
            return bot.context.channel.send(message)
        else
            return bot.context.channel.send(`Invalid COVID-19 info request. *megadork help covid*`)
    }

    static async fetchBuiltCovidInfoMessage(country?: string, state?: string, continent?: string):
        Promise<Discord.Message | Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot

        let data: any

        try {

            if (state) {
                state = state.charAt(0).toUpperCase() + state.slice(1);
                data = await Covid.states()
                data = data.find(x => x.state.toLowerCase() == state.toLowerCase())
                if (data) data.location = data.state
            }
            else if (country) {
                country = country.charAt(0).toUpperCase() + country.slice(1);
                data = await Covid.countries(country.toLowerCase())
                data.location = data.country
            } else if (continent) {
                continent = continent.charAt(0).toUpperCase() + continent.slice(1);
                data = await Covid.continents(continent.toLowerCase())
                data.location = data.continent
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

        if (data.countryInfo?.flag) message.setThumbnail(data.countryInfo.flag)
        if (data.continent) message.setDescription(`${data.continent}`)

        let recPercentage = `${((data.active / data.cases) * 100).toFixed(2)}%`

        if (data.active) message.addFields({ name: 'Active Cases', value: `${data.active}`, inline: true })
        if (data.recovered) message.addFields({ name: 'Recovered', value: `${data.recovered}`, inline: true })
        if (data.cases) message.addFields({ name: 'Total Cases', value: `${data.cases}`, inline: true })
        if (data.deaths) message.addFields({ name: 'Deaths', value: `${data.deaths}`, inline: true })
        if (data.tests) message.addFields({ name: 'Total Tests', value: `${data.tests}`, inline: true })
        if (data.affectedCountries) message.addFields({ name: 'Affected Countries', value: `${data.affectedCountries}`, inline: true })
        if (data.todayCases) message.addFields({ name: 'New Cases Today', value: `+${data.todayCases}`, inline: true })
        if (data.todayDeaths) message.addFields({ name: 'New Deaths Today', value: `+${data.todayDeaths}`, inline: true })
        if (recPercentage) message.addFields({ name: 'Active/Total %', value: `${recPercentage}`, inline: true })

        return message
    }
}