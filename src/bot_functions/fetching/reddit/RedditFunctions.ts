import Discord from 'discord.js'

import Bot from "../../../Bot"

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

export default class BotModuleReddit {

    static async fireRedditSubmissionMessage(trigger?: string) {
        let bot: Bot = globalThis.bot
        if (trigger) bot.preliminary(trigger, 'reddit post fetch', true)

        let query = bot.context.toString().toLowerCase()

        for (const keyword of TRIGGERS.context_prefix)
            if (query.includes(keyword)) {
                query = query.replace(`${trigger} ${keyword}`, '').trim()
                break
            }
        let post: any

        try {
            if (query.includes('r/')) {
                post = await this.fetchRandomSubmission(query.replace('r/', ''))
            } else if (query.includes('u/')) {
                post = await this.fetchRandomSubmissionFromUser(query.replace('u/', ""))
            }
        } catch (err) {
            return bot.generateErrorMessage(`That does not exist within reddit. Check your request.`)
        }

        this.buildRedditSubmissionMessage(post).forEach(message => {
            bot.context.channel.send(message)
        })
        return true
    }

    static async fireCopypastaFetch(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'reddit copypasta fetch', true)

        let pasta: any

        try {
            pasta = await this.fetchRandomSubmission('copypasta', 'best')
        } catch {
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

                text = pasta.match(/(?!&amp#x200B)[\s\S]{1,2000}/g)

                text.forEach((chunk: any) => {
                    bot.textChannel.send(chunk)
                })
            } else delivery.setDescription(pasta.data.selftext)

        }
        bot.textChannel.send(delivery)
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
        let image = await bot.fetchImageFromURL(redditObject.data.children[0].data.url)
        return image
    }

    static buildRedditSubmissionMessage(redditObject: any):
        Array<Discord.MessageEmbed> {
        let messageArray: Discord.MessageEmbed[] = []

        let message = new Discord.MessageEmbed()
            .setTitle(`${redditObject.data.title} - *r/${redditObject.data.subreddit}*`)
            .setAuthor(`u/${redditObject.data.author} posted:`)
            .setURL(redditObject.data.url)
            .setDescription(redditObject.data.selftext)
            //.setTimestamp(new Date(redditObject.data.created_utc))
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

        if (redditObject.data.post_hint == 'image')
            messageArray[0]
                .setImage(redditObject.data.url)


        return messageArray
    }
}