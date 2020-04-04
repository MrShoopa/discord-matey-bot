import Discord from 'discord.js'
import TriggerHandlers from '../TriggerHandlers'

import { help_author, help_functions, help_special, help_reference, i } from '../../bot_knowledge/triggers/trigger_info.json'

import PHRASES_FRONT from '../../bot_knowledge/phrases/phrases_front.json'
import PHRASES_SING from '../../bot_knowledge/phrases/phrases_sing.json'

// REMEMBER TO DOCUMENT ANY NEW COMMANDS IN 'trigger_info.json'!!! 🙂

// Any new commands in 'triggers.json' MUST BE documented in 'triggers_info.json'
// in order to properly show help info. 

// You can pretty much copy-paste your trigger list and then
// manipulate that list to have the template like the ones in 'i' below.

export default class HelpTriggers {
    static helpAuthor = help_author
    static lastUpdated = new Date(`2020-03-15T08:21:45.919Z`)

    static checkForHelpInfoRequest(message = TriggerHandlers.message) {
        for (const category of Object.keys(help_functions))
            for (const hotword of help_functions[category])
                if (message.toString().toLowerCase().includes(hotword))
                    return HelpTriggers.sendFunctionHelpMessage(i[category])

        //  General Help
        for (const category of Object.keys(help_special))
            for (const hotword of help_special[category])
                if (message.toString().toLowerCase().startsWith(hotword))
                    switch (category) {
                        case 'general':
                            return HelpTriggers.replyForGeneralInfo(message)
                        case 'music':
                            return HelpTriggers.replyForMusicInfo(message)
                        case 'translate':
                            return HelpTriggers.replyForTranslateInfo(message)
                    }
    }

    static replyForGeneralInfo(message = TriggerHandlers.message) {
        TriggerHandlers.bot.preliminary(message.toString(), 'Help with Actions', true)

        let listedMessage = new Discord.MessageEmbed()
            .setTitle("General Help")
            .setAuthor(this.helpAuthor)
            .setDescription(PHRASES_FRONT.help_function_intro)
            .setColor('WHITE')
            .setFooter(`Last updated: ${this.lastUpdated.toLocaleDateString()}`)
        Object.keys(help_functions).forEach(key => {
            listedMessage.addFields({ name: key, value: '\u200B', inline: true })
        })

        message.channel.send(listedMessage)

        for (const x of Object.keys(PHRASES_FRONT)) {
            if (x.includes('help_secret'))
                message.channel.send(PHRASES_FRONT.help_secret.main + '\n' + PHRASES_FRONT.help_secret.egg)
            else if (x.includes('help_conversation'))
                message.channel.send((PHRASES_FRONT.help_conversation.main +
                    PHRASES_FRONT.help_conversation.example.threat) +
                    '\n    ' +
                    PHRASES_FRONT.help_conversation.example.send_nudes)
        }
    }

    static replyForMusicInfo(message = TriggerHandlers.message) {
        TriggerHandlers.bot.preliminary(message.toString(), 'Help with Singing', true)
        var songList = ''

        let listedMessage = new Discord.MessageEmbed()
            .setTitle("Music Useful Info 🎧")
            .setAuthor(this.helpAuthor)
            .setDescription(PHRASES_SING.help_intro + '\n\n' + PHRASES_SING.help_url)
            .setColor('WHITE')

        PHRASES_SING.songs_to_sing.some(song => {
            if (song.title != PHRASES_SING.songs_to_sing[0].title) {
                songList += `\n ${song.title}`
                if (song.explicit == true) {
                    songList +=
                        PHRASES_SING.songs_to_sing[0].explicit_text
                }
            }
        })

        listedMessage.setDescription(
            PHRASES_SING.help_intro
            + '\n' + PHRASES_SING.help_url
            + '\n\n **Local Song List**:' + songList
        )

        return message.channel.send(listedMessage)
    }

    static replyForTranslateInfo(message = TriggerHandlers.message) {
        TriggerHandlers.bot.preliminary(message.toString(), 'Help with Translation', true)
        var languageList = ''

        let listedMessage = new Discord.MessageEmbed()
            .setTitle("Translation List 💬")
            .setAuthor(this.helpAuthor)
            .setColor('BLUE')

        help_reference.translate.some((lang: string) => {
            languageList += lang + '\n'
        })

        listedMessage.setDescription(languageList)

        return message.channel.send(listedMessage)
    }

    static buildFunctionMessage(trigRef: FunctionReference) {
        let discordMessage = new Discord.MessageEmbed()
            .setTitle(trigRef._title)
            .setAuthor(this.helpAuthor)
            .setDescription(trigRef._description)
            .setColor('WHITE')

        buildCommandList(trigRef._command_list, discordMessage)

        function buildCommandList(list, message: Discord.MessageEmbed) {
            Object.keys(list).forEach((key, i) => {
                if (key == 'title')
                    message.addFields({ name: list.title, value: list.example, inline: true })
                else if (key == 'example')
                    2 + 2
                else if (Object.keys(list).length > 0) {
                    // TODO: Organize lines console.log(Object.keys(list).length - 1 == i)
                    // if (Object.keys(list).length - 1 == i)
                    // message.addFields({ name: '\u200B', value: '\u200B' })
                    buildCommandList(list[key], message) // RECURSSSIONNNN
                }
            });
        }

        return discordMessage
    }

    static sendFunctionHelpMessage(trigRef: FunctionReference, message = TriggerHandlers.message) {
        TriggerHandlers.bot
            .preliminary(message.toString(), `Function Info Inquiry for ${trigRef._title}`, true)

        return message.channel.send(this.buildFunctionMessage(trigRef))
    }
}

interface FunctionReference {
    _title: string
    _description: string
    _footer: string
    _command_list: any
}