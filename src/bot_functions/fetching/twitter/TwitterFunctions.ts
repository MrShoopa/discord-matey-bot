import Discord from 'discord.js';
import Twitter from 'twitter'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json'

export default class BotTwitterModule {
    private static _twitterEntity: Twitter

    static get twitterEntity() {
        if (!BotTwitterModule._twitterEntity) {
            BotTwitterModule.initializeTwitter()
            return this._twitterEntity
        } else return BotTwitterModule._twitterEntity
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

    static async fireTweetMessageOfQuery(query: string, trigger?: string) {
        let bot: Bot = globalThis.bot
        bot.textChannel.send(await this.fetchBuiltMsgTweetWithQuery(query.toString(), trigger))
    }

    static async fetchBuiltMsgTweetWithQuery(query: string, trigger?: string) {
        let bot: Bot = globalThis.bot

        bot.preliminary(trigger, 'twitter latest post fetch', true)

        if (query.includes(trigger))
            query = query.replace(trigger, '').trim()

        let tweet = await this.fetchTweetWithQuery(query)

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

    static async fetchBuiltMsgTweetWithUserTopPost(trigger: string) {

    }

    //TODO: Fetch user's top post
    static fetchTopTweetFromUser(userQuery = '') {
        this.twitterEntity.get('search/tweets', { q: 'beans' }, (error, tweets, response) => {
            console.log(tweets)
        })
    }

    static fetchTweetWithQuery(userQuery: string, top?: boolean, log?: boolean): any {
        //  Modules
        return new Promise((resolve, reject) => {

            this.twitterEntity.get('search/tweets', { q: userQuery }, (error, tweets, response) => {
                //?
                if (error) {
                    globalThis.bot.saveBugReport(error)
                    reject(error)
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