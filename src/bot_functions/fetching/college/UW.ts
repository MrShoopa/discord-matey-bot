import Discord from 'discord.js'
import UwFacultyAPI from '../../../bot_modules/_external_wrappers/UWCourse'

import Bot from '../../../Bot'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

export default class BotModuleUW {
    static async fireFacultySearchMessage(message: Discord.Message, trigger?: string) {
        //  Quote of Day [from quotes.rest]
        for (const trigger of TRIGGERS.faculty_search.query)
            if (message.toString().toLowerCase().includes(trigger))
                return message.channel.send({ embeds: [await this.fetchFacultyTeacher(message, trigger)] })
    }

    static async fireRandomFacultySearchMessage(message: Discord.Message, trigger?: string) {
        //  Quote of Day [from quotes.rest]
        for (const trigger of TRIGGERS.faculty_search.random)
            if (message.toString().toLowerCase().includes(trigger))
                return message.channel.send({ embeds: [await this.fetchFacultyTeacher(message, trigger, true)] })
    }

    static async fetchFacultyTeacher(message: Discord.Message, trigger?: string, random?: boolean) {
        let bot: Bot = globalThis.bot
        let query: string

        TRIGGERS.faculty_search.query.some(trig => {
            if (message.toString().toLowerCase().includes(trig))
                return query = message.toString().replace(trig, '').trim()
        })

        bot.preliminary('lol', `UW Faculty fetch - ${query}`, true)

        let facultyObject: any
        try {
            if (query)
                facultyObject = await UwFacultyAPI.getFacultyMember(query)
            else if (random)
                facultyObject = await UwFacultyAPI.getRandomFaculty()
            else
                return new Discord.MessageEmbed()
                    .setDescription(`Unable to fetch; Check your UW faculty member's name.`)
                    .setFooter('UW Faculty API')
        } catch (e) {
            bot.saveBugReport(e, this.fetchFacultyTeacher.name)
            if (e.includes(`Bad request`))
                return new Discord.MessageEmbed()
                    .setDescription(`No results found from the UW Faculty API :/ Maybe check spelling?`)
                    .setFooter('UW Faculty API')
            else
                return new Discord.MessageEmbed()
                    .setDescription(`Couldn't retrieve any results from the UW Faculty API :/ Try again later.`)
                    .setFooter('UW Faculty API')
        }

        console.log("Retrieved faculty member from UWFaculty API: ",
            facultyObject)

        let teacher = new Discord.MessageEmbed()
            .setDescription(facultyObject.description)
            .setTitle(`${facultyObject.name}\n`)
            .setFooter('UW Faculty API')

        facultyObject.email.forEach(ema => {
            teacher.addFields([
                { name: 'Email', value: ema.length > 0 ? ema : "N/A" },
            ])
        });

        facultyObject.phone.forEach(pho => {
            teacher.addFields([
                { name: 'Phone', value: pho.length > 0 ? pho : "N/A" },
            ])
        });

        return teacher;
    }
}