import Discord from 'discord.js'
import Bot from '../../../../Bot'

import { covid } from '../../../../bot_knowledge/triggers/triggers.json'

import * as NovelCovid from 'novelcovid'

export default class BotModuleCovid {
    static async fireCovidInfoMessage(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Covid case pullup')

        let response: string | Discord.MessageEmbed
        let query: string = message.toString()

        for (const keyword of covid.state)
            if (query.includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                response = await BotModuleCovid.fetchBuiltCovidInfoMessage('United States', query) // Province?
                break
            }
        for (const keyword of covid.country)
            if (query.includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                response = await BotModuleCovid.fetchBuiltCovidInfoMessage(query)
                break
            }
        for (const keyword of covid.continent)
            if (query.includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                response = await BotModuleCovid.fetchBuiltCovidInfoMessage(null, null, query)
                break
            }
        for (const keyword of covid.default)
            if (query.endsWith(keyword)) {
                response = await BotModuleCovid.fetchBuiltCovidInfoMessage()
                break
            }

        if (response)
            return message.channel.send(response)
        else
            return message.channel.send(`Invalid COVID-19 info request. *megadork help covid*`)
    }

    static async fetchBuiltCovidInfoMessage(country?: string, state?: string, continent?: string) {
        let bot: Bot = globalThis.bot

        let data: any

        try {

            if (state) {
                state = state.charAt(0).toUpperCase() + state.slice(1);
                data = await NovelCovid.states()
                data = data.find(x => x.state.toLowerCase() == state.toLowerCase())
                if (data) data.location = data.state
            }
            else if (country) {
                country = country.charAt(0).toUpperCase() + country.slice(1);
                data = await NovelCovid.countries({
                    country: country.toLowerCase(),
                    allowNull: true,
                    sort: "cases",
                    strict: false
                })
                data.location = data.country
            } else if (continent) {
                continent = continent.charAt(0).toUpperCase() + continent.slice(1);
                data = await NovelCovid.continents({
                    continent: continent.toLowerCase(),
                    allowNull: true,
                    sort: "cases",
                    strict: false
                })
                data.location = data.continent
            }
            else {
                data = await NovelCovid.all()
                data.location = 'World'
            }

            if (data?.message?.includes('not found'))
                data = undefined
        } catch (err) {
            bot.saveBugReport(err, this.fetchBuiltCovidInfoMessage.name, true)
            data = undefined
        }

        if (data === undefined)
            return "Couldn't fetch cases for your location."

        return BotModuleCovid.generateCovidInfoMessage(data)
    }

    static generateCovidInfoMessage(data: any) {
        let response = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle(`Coronavirus Cases for ${data.location}`)
            .setTimestamp(new Date(data.updated))

        if (data.countryInfo?.flag) response.setThumbnail(data.countryInfo.flag)
        if (data.continent) response.setDescription(`${data.continent}`)

        let recPercentage = `${((data.active / data.cases) * 100).toFixed(2)}%`

        if (data.active) response.addFields({ name: 'Active', value: `${data.active.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.recovered) response.addFields({ name: 'Recoveries', value: `${data.recovered.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.deaths) response.addFields({ name: 'Deaths', value: `${data.deaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.cases) response.addFields({ name: 'Total Cases', value: `${data.cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.tests) response.addFields({ name: 'Total Tests', value: `${data.tests.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.affectedCountries) response.addFields({ name: 'Affected Countries', value: `${data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.todayCases) response.addFields({ name: `Today's Cases`, value: `+${data.todayCases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.todayDeaths) response.addFields({ name: `Today's Deaths`, value: `+${data.todayDeaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (recPercentage) response.addFields({ name: 'Active/Total %', value: `${recPercentage}`, inline: true })

        return response
    }
}