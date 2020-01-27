import Bot from "../../Bot"
import { ActivityOptions } from "discord.js"

export default class BotDiscordActivity {
    public static customStatuses: Array<ActivityOptions> = [
        { name: `with your servers`, type: 'PLAYING' },
        { name: `with null exceptions`, type: 'PLAYING' },
        { name: `Y O U`, type: 'WATCHING' },
        {
            name: `stripping to this`, type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=WSwDJUhP8Oo"
        },
        { name: `joe overeat that cake 🎂`, type: 'WATCHING' },
        { name: `with toasters 🍞`, type: 'PLAYING' },
        { name: `boku no pico to kids`, type: 'STREAMING' },
        { name: `to your servers`, type: 'LISTENING' },
        { name: `to bts 😂👌🏿👌🏿👌🏿👌🏿`, type: 'LISTENING' },
        { name: `🍆`, type: 'PLAYING' },
        { name: `nothing cuz i can't IM A BOT`, type: 'STREAMING' },
        { name: `shrek bingewatches`, type: 'WATCHING' },
        {
            name: `t̷̳̞̙̣͓͈̝̣̯̠̺̱͐̂̑̍̂̅̿̀̑̄̈h̴̟͇͇̥͉̅̄̋̉̅͛̌͜͝ͅi̶̧̛̪͔̺͉͓̽̾̚ͅs̸̩͍̝̿́̿́̋̿̽̏̚ ̵̧̘̞̬̥͂̈́̃̋̅̍s̵̛͇̈́͗̎̄͆̃̃̈͑h̷̛̥̯̞̹͎̲̜͔̼̬̫̻̓̍͝i̵̢̨̲͚̳͈̋̉̏̍̒́̚͝t̶̜̲͈͇͔̆̏̈͌͊͑͜`, type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=DBejlYvfBF8"
        },
        {
            name: `this on repeat`, type: 'WATCHING',
            url: "https://www.youtube.com/watch?v=jF-KRZmXfF4&list=WL&index=2&t=0s&ab_channel=sylicaa"
        },

    ]

    static getRandomStatus(): ActivityOptions {
        let dice =
            Math.floor(Math.random() * this.customStatuses.length)

        return this.customStatuses[dice]
    }

    static updateRandomStatus() {
        let bot: Bot = globalThis.bot

        bot.user.setActivity(BotDiscordActivity.getRandomStatus())
    }
}
