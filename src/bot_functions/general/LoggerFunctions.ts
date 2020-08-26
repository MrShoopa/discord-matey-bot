import * as FileSystem from 'fs'
import * as Path from 'path'
import Mailer from 'nodemailer'

import Discord from 'discord.js';
import Bot from '../../Bot';

import AUTH from '../../user_creds.json'

export default class BotLoggerFunctions {

    static logPathName = __dirname + `/../../../logs`

    static saveBugReport(error: Error
        , func?: string, logInConsole?: boolean, reply?: boolean) {
        let bot: Bot = globalThis.bot

        if (func)
            console.error(`Error! On function: ${func} `)
        if (logInConsole)
            console.error(`Error occured on: ${new Date().toLocaleTimeString()}:\n ${error.stack}`)

        // Finalize
        this.writeTextToFile(ErrorLog.generateText(error, bot), ErrorLog.filename, ErrorLog.reportPath)

        if (reply && bot.lastWaker)
            bot.lastWaker.lastMessage.channel.send(new Discord.MessageEmbed()
                .setAuthor('Megadork Crash Reporter 📝')
                .setDescription`Log submitted to Shoopa.`)
    }

    static async saveUserSuggestion(message: Discord.Message | Discord.PartialMessage, reply?: boolean, trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'User Suggestion', true)

        message.content = message.toString().replace(trigger, '').trim()

        const transport = Mailer.createTransport({
            service: AUTH.smtp.service,
            auth: {
                user: AUTH.smtp.auth.user,
                pass: AUTH.smtp.auth.pass
            }
        })

        const email = {
            from: AUTH.smtp.email_from,
            to: AUTH.smtp.email_to,
            subject: `${message.author.username} Has a Suggestion for Megadork!`,
            text: `Something something was sent at ${message.createdAt.toLocaleDateString()} ${message.createdAt.toLocaleTimeString()}... \n\n` +
                `Suggestion: "${message.toString()}" \n` +
                `Guild: ${message.guild.name} (Joined: ${message.guild.joinedAt.toLocaleDateString()}) -> ID ${message.guild.id}\n`
                + `Url: ${message.url}\n\n\n\n\n`
                + `Visit Papertrail for logs: https://my.papertrailapp.com/systems/megadork/events`
        }

        try {
            const result = await transport.sendMail(email);
            console.log(`Successfully sent Suggestion Email to ${AUTH.smtp.email_to}.`, result);
            if (reply)
                message.reply(`I have submitted your suggestion to my creator!`);
        }
        catch (err) {
            console.error(`Failed to send Suggestion Email to ${AUTH.smtp.email_to}`, err);
            if (reply)
                message.reply(`I couldn't send your suggestion for some reason. Try again later?`);
        }
    }

    static saveUnknownCommand(message: Discord.Message | Discord.PartialMessage,
        logInConsole?: boolean, reply?: boolean) {
        let bot: Bot = globalThis.bot

        // Finalize
        this.writeTextToFile(UnknownCommandLog.generateText(message, bot),
            UnknownCommandLog.filename, UnknownCommandLog.reportPath)

        if (logInConsole)
            console.info(`Unknown command logged on ${new Date().toString()}: '${message.toString()}'`)

        if (reply && bot.lastWaker)
            bot.lastWaker.lastMessage.channel.send(new Discord.MessageEmbed()
                .setAuthor('Megadork 📝')
                .setDescription`I don't know that command so I've pinged Shoopa to look at it later.`)
    }

    private static writeTextToFile(text: string,
        filename = `botText - ${Date.now.toString()} `,
        path = this.logPathName + `/ general`,
        logInConsole?: boolean, reply?: boolean) {

        let bot: Bot = globalThis.bot

        FileSystem.exists(path, exists => {
            if (!exists)
                FileSystem.mkdir(path, folderError => {
                    if (folderError)
                        console.error(`Error creating folder(${path}): \t${folderError} `)
                    else
                        console.info(`Folder created: ${[path]} `)
                })
            path = Path.join(path)

            // Finalize
            FileSystem.appendFile(filename, text
                , callback => {
                    if (callback as Error)
                        console.error(`Error writing text file: ${callback} `)
                })
        })

        if (logInConsole)
            console.info(`Wrote on "${path}": ${new Date().toString()}: \n\t ${text} `)

        if (reply && bot.lastWaker)
            bot.lastWaker.lastMessage.channel.send(new Discord.MessageEmbed()
                .setAuthor('Megadork Text Writer 📝')
                .setDescription`Log submitted to Shoopa.`)
    }

    static instantiateLogFolder() {
        FileSystem.exists(this.logPathName, exists => {
            if (!exists)
                FileSystem.mkdir(this.logPathName, folderError => {
                    if (folderError)
                        console.error(`Error creating log folder: \n\t ${folderError} `)
                    else
                        console.error(`Logs folder is missing! Created new folder.`)
                })
        })
    }
}

// These classes below are for formulating templates for the types of logging.

class ErrorLog {
    static reportPath: string = BotLoggerFunctions.logPathName + `/error_logs`
    static filename: string = ErrorLog.reportPath + `/` + `crash_log_` +
        (new Date().getMonth() + 1) + `_` +
        new Date().getDate() + `_` +
        new Date().getFullYear().toString() +
        `.txt`

    static generateText(error: Error, bot: Bot) {
        return `
Error encountered during bot runtime! -> ${ new Date().toLocaleTimeString()}
---------
    ${ error.stack}
---------
    ${ bot.waker.username} on ${bot.context?.guild.name} ` +
            // Add extra details where necessary            
            `${
            (() => {
                if (bot.textChannel instanceof Discord.TextChannel) {
                    return `'s channel '${bot.textChannel.name}'`
                }
            })()
            } `
            // Finish adding details
            + ` said:
"${bot.context.toString()}"
    `
    }
}

class UnknownCommandLog {
    static reportPath: string = BotLoggerFunctions.logPathName + `/unknown_commands`
    static filename: string = UnknownCommandLog.reportPath + `/` + `unknown_commands_` +
        (new Date().getMonth() + 1) + `_` +
        new Date().getDate() + `_` +
        new Date().getFullYear().toString() +
        `.txt`

    static generateText(message: Discord.Message | Discord.PartialMessage,
        bot: Bot) {
        return `
Unknown command attempted on ${ new Date().toLocaleTimeString()}:
---------
\t"${message}"
\t\tfrom user: ${ message.author.username}
---------
    `
    }
}