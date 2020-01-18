import Twitter from 'twitter'
import Bot from '../../../Bot'

import AUTH from '../../../user_creds.json.json'


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

    static async fetchBuiltMsgTweetWithQuery(trigger: string) {
        let bot: Bot = globalThis.bot

        bot.preliminary(trigger, 'twitter latest post fetch', true)

        let query = bot.context.toString().split(trigger).pop()

        let tweet = await this.fetchTweetWithQuery(query)

        bot.textChannel.send(`Tweet from @${tweet.user.name}\nabout '${query}':\n\n${tweet.text}`)
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