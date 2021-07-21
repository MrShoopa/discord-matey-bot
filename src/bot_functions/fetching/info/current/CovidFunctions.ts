import Discord, { MessageEmbed } from 'discord.js'
import Bot from '../../../../Bot.js'

import TRIGGERS from '../../../../bot_knowledge/triggers/triggers.js'

import * as NovelCovid from 'novelcovid'
import { VaccineCovid } from '../../../../bot_modules/_external_wrappers/CovidExtras/index.js'

export default class BotModuleCovid {
    static async fireCovidInfoMessage(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot
        bot.preliminary(trigger, 'Covid case pullup')

        let response: string | Discord.MessageEmbed
        let query: string = message.toString()

        for (const keyword of TRIGGERS.covid.state)
            if (query.includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                response = await BotModuleCovid.fetchBuiltCovidInfoMessage('United States', query) // Province?
                break
            }
        for (const keyword of TRIGGERS.covid.country)
            if (query.includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                response = await BotModuleCovid.fetchBuiltCovidInfoMessage(query)
                break
            }
        for (const keyword of TRIGGERS.covid.continent)
            if (query.includes(keyword)) {
                query = query.substring(query.indexOf(keyword) + keyword.length).trim()
                response = await BotModuleCovid.fetchBuiltCovidInfoMessage(null, null, query)
                break
            }
        for (const keyword of TRIGGERS.covid.default)
            if (query.endsWith(keyword)) {
                response = await BotModuleCovid.fetchBuiltCovidInfoMessage()
                break
            }

        if (response && response instanceof MessageEmbed)
            return message.channel.send({ embeds: [response] })
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
                    strict: false,
                })
                data.location = data.country


                let vaccineData = await VaccineCovid.Getter.getVaccinesInCountry(country)
                data = BotModuleCovid.calculateVaccineData(data, vaccineData)
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

                let vaccineData = await VaccineCovid.Getter.getVaccines()
                data = BotModuleCovid.calculateVaccineData(data, vaccineData)
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

        let description = ""

        if (data.countryInfo?.flag) response.setThumbnail(data.countryInfo.flag)
        if (data.continent) description += `Country in *${data.continent}*`
        if (data.population) description += `, Population of **${data.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}**`

        response.setDescription(description)

        let recPercentage = `${((data.active / data.cases) * 100).toFixed(2)}%`
        let vaccineIncreasePercentage = `${(((data.totalVaccinesToday / data.totalVaccinesLastWeek) * 100) - 100).toFixed(2)}%`
        if (vaccineIncreasePercentage == 'NaN%') vaccineIncreasePercentage = null

        if (data.active) response.addFields({ name: 'Active', value: `${data.active.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.recovered) response.addFields({ name: 'Recoveries', value: `${data.recovered.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.deaths) response.addFields({ name: 'Deaths', value: `${data.deaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.cases) response.addFields({ name: 'Total Cases', value: `${data.cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.tests) response.addFields({ name: 'Total Tests', value: `${data.tests.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.affectedCountries) response.addFields({ name: 'Affected Countries', value: `${data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.todayCases) response.addFields({ name: `Today's Cases`, value: `+${data.todayCases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.todayDeaths) response.addFields({ name: `Today's Deaths`, value: `+${data.todayDeaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (recPercentage) response.addFields({ name: 'Active/Total %', value: `${recPercentage}`, inline: true })
        if (data.vaccinesToday && data.vaccinesToday != 0) response.addFields({ name: `Today's Vaccinations`, value: `+${data.vaccinesToday.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (data.totalVaccinesToday) response.addFields({ name: `Total Vaccinations`, value: `${data.totalVaccinesToday.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, inline: true })
        if (vaccineIncreasePercentage) response.addFields({ name: 'Vaccination +% this week', value: `${vaccineIncreasePercentage}`, inline: true })

        return response
    }

    static calculateVaccineData(data: any, vaccineData: any) {
        var today = new Date();
        var yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        var yesteryesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
        var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

        data.totalVaccinesToday = vaccineData.timeline[`${this.generateDateString(today)}`]
        data.totalVaccinesYesterday = vaccineData.timeline[`${this.generateDateString(yesterday)}`]
        data.totalVaccinesYesterYesterday = vaccineData.timeline[`${this.generateDateString(yesteryesterday)}`]
        data.totalVaccinesLastWeek = vaccineData.timeline[`${this.generateDateString(lastWeek)}`]

        data.vaccinesToday = data.totalVaccinesToday - data.totalVaccinesYesterday
        data.vaccinesYesterday = data.totalVaccinesYesterday - data.totalVaccinesYesterYesterday

        return data
    }

    static generateDateString(date: Date): string {
        var dd = String(date.getDate())
        var mm = String(date.getMonth() + 1) //January is 0!
        var yy = String(date.getFullYear()).substr(-2)

        let dateString = mm + '/' + dd + '/' + yy

        return dateString
    }
}