import Discord from 'discord.js';
import Twitter from 'twitter'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json'

export default class BotModuleTwitter {
    private static _twitterEntity: Twitter

    static get twitterEntity() {
        if (!BotModuleTwitter._twitterEntity) {
            BotModuleTwitter.initializeTwitter()
            return this._twitterEntity
        } else return BotModuleTwitter._twitterEntity
    }

    private static initializeTwitter() {
        this._twitterEntity =
            new Twitter({
                consumer_key: AUTH.twitter.consumer_key,
                consumer_secret: AUTH.twitter.consumer_secret,
                access_token_key: AUTH.twitter.access_token_key,
                access_token_secret: AUTH.twitter.access_token_secret
            })
    }


    static async fireTweetMessageFromUser(query: string, trigger?: string) {
        let bot: Bot = globalThis.bot
        bot.textChannel.send(await this.fetchBuiltMsgTweetWithUserLatestPost(query.toString(), trigger))
    }

    static async fireTweetMessageOfQuery(query: string, trigger?: string) {
        let bot: Bot = globalThis.bot
        bot.textChannel.send(await this.fetchBuiltMsgTweetWithQuery(query.toString(), trigger))
    }

    static async fetchBuiltMsgTweetWithQuery(query: string, trigger?: string):
        Promise<Discord.Message | Discord.MessageEmbed> {
        let bot: Bot = globalThis.bot

        query = query.toLowerCase()

        bot.preliminary(trigger, 'twitter latest post fetch', true)

        if (query.includes(trigger))
            query = query.replace(trigger, '').trim()

        let tweet = await this.fetchTweetWithQuery(query)

        if (!tweet)
            return bot.generateErrorMessage(`I couldn't fetch that tweet at the moment.`)

        let url =
            `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`


        let built = new Discord.MessageEmbed(tweet)
            .setURL(url)
            .setTitle(`Tweet about '${query}'`)
            .setAuthor(tweet.user.name)
            .setColor('#00aced')
            .setDescription(tweet.text)
            .setThumbnail('https://cdn.drawception.com/images/panels/2018/3-4/AWPpbeMmFT-10.png')
            .setFooter('Megatweety Fetch')

        if (tweet.entities.media)
            built.setImage(tweet.entities.media[0].media_url)
        else
            built.setImage(tweet.user.profile_image_url)

        return built
    }

    static async fetchBuiltMsgTweetWithUserLatestPost(user: string, trigger?: string) {
        let bot: Bot = globalThis.bot

        user = user.toLowerCase()

        bot.preliminary(trigger, 'twitter latest post fetch', true)

        if (user.includes(trigger))
            user = bot.context.toString().split(' ').pop()

        if (/\s/g.test(user))
            return bot.generateErrorMessage(`Please enter the username (no spaces) of the twitter user.`)

        let tweet = await this.fetchLatestTweetFromUser(user)

        if (tweet === 'not found')
            return bot.generateErrorMessage(`That user doesn't seem to exist on Twitter...
            or hasn't tweeted in a while...`)

        if (!tweet)
            return bot.generateErrorMessage(`I couldn't fetch that tweet at the moment.`)

        let url =
            `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`


        let built = new Discord.MessageEmbed(tweet)
            .setURL(url)
            .setTitle(`Tweet from @${user}`)
            .setAuthor(tweet.user.name)
            .setColor('#00aced')
            .setDescription(tweet.text)
            .setThumbnail('https://cdn.drawception.com/images/panels/2018/3-4/AWPpbeMmFT-10.png')
            .setFooter('Megatweety Fetch')

        if (tweet.entities.media)
            built.setImage(tweet.entities.media[0].media_url)
        else
            built.setImage(tweet.user.profile_image_url)

        return built
    }

    static fetchLatestTweetFromUser(user = '', log?: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this.twitterEntity.get('search/tweets', { q: `from:${user}`, count: 1 },
                (error, tweets, response) => {
                    if (error) {
                        globalThis.bot.saveBugReport(error)
                        reject(error)
                    }

                    if (!tweets || tweets.statuses.length == 0) {
                        resolve('not found')
                        return
                    }
                    let tweet = tweets.statuses[0]

                    console.log(`Fetched twitter tweet from ${tweet.user.name}.`)
                    if (log)
                        console.log(tweets)

                    resolve(tweet)
                })
        })
    }

    static fetchTweetWithQuery(userQuery: string, top?: boolean, log?: boolean): Promise<any> {
        return new Promise((resolve, reject) => {

            this.twitterEntity.get('search/tweets', { q: userQuery }, (error, tweets, response) => {
                if (error) {
                    globalThis.bot.saveBugReport(error)
                    reject(error)
                }

                if (!tweets || tweets.statuses.length == 0) {
                    resolve('not found')
                    return
                }
                let index = Math.floor((Math.random() * tweets.statuses.length))
                //  Condition for specific placement
                if (top)
                    index = 0

                let tweet = tweets.statuses[index]

                console.log(`Fetched twitter tweet from ${tweet.user.name}.`)
                if (log)
                    console.log(tweets)

                resolve(tweet)
            })

        })
    }
}