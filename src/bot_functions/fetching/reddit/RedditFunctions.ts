import Discord from 'discord.js'
import BotModuleTranslation, { Language } from '../../../bot_functions/language/TranslationFunctions.js'

import Bot from '../../../Bot.js'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.js'

export default class BotModuleReddit {

    static async fireRedditSubmissionMessage(channel?: Discord.TextChannel | Discord.DMChannel, query?: string, trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'reddit post fetch', true)

        if (!channel) {
            if (bot.context?.channel instanceof Discord.TextChannel)
                channel = channel ? channel : bot.context.channel as Discord.TextChannel
            if (bot.context?.channel instanceof Discord.DMChannel)
                channel = channel ? channel : bot.context.channel as Discord.DMChannel
        }

        if (!query)
            query = bot.context.toString().toLowerCase()

        for (const keyword of TRIGGERS.context_prefix)
            if (query.includes(keyword)) {
                query = query.replace(`${trigger} ${keyword}`, '').trim()
                break
            }
        let post: any

        try {
            if (query.includes('r/')) {
                query = query.substring(query.indexOf('r/'))
                post = await this.fetchRandomSubmission(query.replace('r/', ''))
            } else if (query.includes('u/')) {
                query = query.substring(query.indexOf('u/'))
                post = await this.fetchRandomSubmissionFromUser(query.replace('u/', ""))
            }
        } catch (err) {
            if (channel)
                return bot.generateErrorMessage(`That does not exist within reddit. Check your request.`)
        }

        this.
            buildRedditSubmissionMessage(post).forEach(message => {
                channel.send({ embeds: [message] })
            })
        return true
    }

    static async fireCopypastaFetch(channel?: Discord.TextChannel | Discord.DMChannel, trigger?: string) {
        let bot: Bot = globalThis.bot
        channel = channel ? channel : bot.textChannel

        if (trigger) bot.preliminary(trigger, 'reddit copypasta fetch', true)

        let pasta: any

        try {
            pasta = await this.fetchRandomSubmission('copypasta', 'best')
        } catch {
            if (channel)
                return bot.generateErrorMessage(`r/copypasta went missing? Try again later.`)
        }

        let delivery = new Discord.MessageEmbed()
            .setTitle(`From r/${pasta.data.subreddit}`)
            .setAuthor(`Courtesy of u/${pasta.data.author}`)
            .setURL(pasta.data.url)
            .setColor('#FF5700')
            .setFooter('Copypasta Fetcher - reddit',
                'https://icons-for-free.com/iconfiles/png/512/reddit+round+icon+icon-1320190507793599697.png')
        if (pasta.data.selftext == '')
            //  Replies by title if it's not in the subtext of the post.
            delivery.setDescription(pasta.data.title)
        else {

            let text = pasta.data.selftext

            if (text.length >= 2000) {
                console.log("Copypasta exceeds 2000 characters. 🔥🍝 Splitting...")

                delivery.setDescription(text)

                text = text.match(/(?!&amp#x200B)[\s\S]{1,2000}/g)

                text.forEach((chunk: any) => {
                    channel.send(chunk)
                })
            } else delivery.setDescription(pasta.data.selftext)

        }
        channel.send({ embeds: [delivery] })
    }
    static async fire5050Fetch(channel?: Discord.TextChannel | Discord.DMChannel, trigger?: string) {
        let bot: Bot = globalThis.bot
        channel = channel ? channel : bot.textChannel

        if (trigger) bot.preliminary(trigger, 'Reddit - 50/50 Fetch', true)

        let riskyRiskyThingy = await BotModuleReddit.fetchRandomSubmission('fiftyfifty'), extension = 'jpg'

        while (riskyRiskyThingy.data.title.includes('Here are all the answers') || riskyRiskyThingy.data.title.includes('Users follow the rules'))
            riskyRiskyThingy = await BotModuleReddit.fetchRandomSubmission('fiftyfifty')

        let fiftyPost = new Discord.MessageEmbed()
            .setColor('#8B0000')
            .setTitle(`${riskyRiskyThingy.data.title}`)
            .setURL(`https://www.reddit.com${riskyRiskyThingy.data.permalink}`)
            .setAuthor(`Here's a r/fiftyfifty post! Proceed with caution!`)
            .setFooter(`Courtesy of u/${riskyRiskyThingy.data.author}`,
                'https://images.vexels.com/media/users/3/129189/isolated/preview/59a4614a4e033709d1b90042a9cc9bd2-50-percent-infographic-by-vexels.png')
        channel.send({ embeds: [fiftyPost] })

        if (riskyRiskyThingy.data.url.includes('jpg') || riskyRiskyThingy.data.url.includes('png') || riskyRiskyThingy.data.url.includes('webm') || riskyRiskyThingy.data.url.includes('gif')) {
            if (riskyRiskyThingy.data.url.includes('gif')) extension = 'gif'
            channel.send({
                files: [{
                    attachment: riskyRiskyThingy.data.url,
                    name: `SPOILER_FILE.${extension}`
                }]
            })
        } else {
            let response = new Discord.MessageEmbed()
                .setTitle(`Mystery link...`)
                .setURL(riskyRiskyThingy.data.url)
                .setColor('#8B0000')
            channel.send({ embeds: [response] })
        }
    }

    static async fireQuestionAsk(channel?: Discord.TextChannel | Discord.DMChannel, trigger?: string, lang?: Language) {
        let bot: Bot = globalThis.bot
        channel = channel ? channel : bot.textChannel
        if (trigger) bot.preliminary(trigger, 'Reddit - 50/50 Fetch', true)

        try {
            let question = await BotModuleReddit.fetchRandomSubmission('askreddit')

            if (lang)
                question.data.title = await BotModuleTranslation.googleTranslateText(question.data.title, lang, Language.English)

            let response = new Discord.MessageEmbed()
                .setTitle(question.data.title)
                .setAuthor(`A question by u/${question.data.author}...`)
                .setURL(question.data.url)
                .setColor('#8B0000')
                .setFooter('r/AskReddit',
                    'https://b.thumbs.redditmedia.com/EndDxMGB-FTZ2MGtjepQ06cQEkZw_YQAsOUudpb9nSQ.png')

            channel.send({ embeds: [response] })
        } catch (err) {
            channel.send({ embeds: [bot.generateErrorMessage(`Something happened while trying to generate the message. Get Shoop to check the logs 🥴`, `r/AskReddit Routine`)] })
        }
    }

    static async fireSubmissionImageMessage(redditObject: any) {
        let bot: Bot = globalThis.bot

        return bot.context.channel.send(await this.fetchImageFromSubmission(redditObject))
    }


    static async fetchSubmissions(
        subreddit: string = 'funny', sort: string = 'best', limit: number = 25) {
        let bot: Bot = globalThis.bot

        let redditUrl = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`

        let submissions = await bot.fetchJSONFromURL(redditUrl)
            .catch((error: any) => {
                bot.saveBugReport(error, this.fetchSubmissions.name, true)
            })
        return submissions.data?.children
    }

    static async fetchSubmissionsFromUser(
        user: string, sort: string = 'best', limit: number = 25) {
        let bot: Bot = globalThis.bot

        let redditUrl = `https://www.reddit.com/user/${user}/submitted.json?limit=${limit}?sort=${sort}`

        let submissions = await bot.fetchJSONFromURL(redditUrl)
            .catch((error: any) => {
                bot.saveBugReport(error, this.fetchSubmissionsFromUser.name, true)
            })
        return submissions.data.children
    }

    static async fetchRandomSubmission(
        subreddit: string = 'funny', category: string = 'best') {
        let list = await this.fetchSubmissions(subreddit, category, 100)

        if (list)
            return list[Math.floor(Math.random() * list.length)]
        else
            throw new ReferenceError(`Unable to fetch from ${subreddit}.`)
    }

    static async fetchRandomSubmissionFromUser(
        user: string, category: string = 'best') {
        let list = await this.fetchSubmissionsFromUser(user, category, 100)

        return list[Math.floor(Math.random() * list.length)]
    }

    static async fetchImageFromSubmission(redditObject: any) {
        let bot: Bot = globalThis.bot

        // @see https://www.reddit.com/dev/api/ for more info.
        let image = await bot.fetchImageFromURL(redditObject.data.url)
        return image
    }

    static buildRedditSubmissionMessage(redditObject: any):
        Array<Discord.MessageEmbed> {
        let messageArray: Discord.MessageEmbed[] = []

        let message = new Discord.MessageEmbed()
            .setTitle(`${redditObject.data.title} - *r/${redditObject.data.subreddit}*`)
            .setAuthor(`u/${redditObject.data.author} posted:`)
            .setURL(`https://www.reddit.com${redditObject.data.permalink}`)
            .setDescription(redditObject.data.selftext)
            //.setTimestamp(Date.now() - redditObject.data.created_utc)
            .setColor('#FF5700')
            .setFooter('redditdork',
                'https://icons-for-free.com/iconfiles/png/512/reddit+round+icon+icon-1320190507793599697.png')

        if (redditObject.data.selftext == '')
            //  Replies by title if it's not in the subtext of the post.
            messageArray.push(new Discord.MessageEmbed(message)
                .setDescription(redditObject.data.title)
                .setTitle(`r/${redditObject.data.subreddit} post`))
        else {
            let text = redditObject.data.selftext

            if (text.length >= 2000) {
                console.log("Post exceeds 2000 characters. 🔥 Splitting...")

                let textblocks: any[] = text.match(/(?!&amp#x200B)[\s\S]{1,2000}/g)

                message.setDescription(text[0])

                textblocks.forEach((chunk: any, i) => {
                    if (i == 0)
                        messageArray.push(new Discord.MessageEmbed(message)
                            .setDescription(chunk))
                    else
                        messageArray.push(new Discord.MessageEmbed(message)
                            .setTitle('Continued...')
                            .setDescription(chunk))
                })
            } else if (!text) {
                message.setDescription('')
            } else messageArray.push(message)
        }

        if (redditObject.data.post_hint == 'image' && !redditObject.data.over_18)
            messageArray[0]
                .setImage(redditObject.data.url)
        if (redditObject.data.over_18)
            messageArray[0].title = messageArray[0].title += ` **NSFW!!!**`


        return messageArray
    }
}