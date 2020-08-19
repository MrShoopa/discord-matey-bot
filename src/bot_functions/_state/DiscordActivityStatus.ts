import Bot from "../../Bot"
import { ActivityOptions } from "discord.js"
import BotModuleQuote from "../fetching/quote/QuoteFunctions"

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
        { name: `your servers`, type: 'LISTENING' },
        { name: `bts 😂👌🏿👌🏿👌🏿👌🏿`, type: 'LISTENING' },
        { name: `🍆`, type: 'PLAYING' },
        { name: `nothing cuz i can't IM A BOT`, type: 'STREAMING' },
        { name: `shrek bingewatches`, type: 'WATCHING' },
        {
            name: `t̷̳̞̙̣͓͈̝̣̯̠̺̱͐̂̑̍̂̅̿̀̑̄̈h̴̟͇͇̥͉̅̄̋̉̅͛̌͜͝ͅi̶̧̛̪͔̺͉͓̽̾̚ͅs̸̩͍̝̿́̿́̋̿̽̏̚ ̵̧̘̞̬̥͂̈́̃̋̅̍s̵̛͇̈́͗̎̄͆̃̃̈͑h̷̛̥̯̞̹͎̲̜͔̼̬̫̻̓̍͝i̵̢̨̲͚̳͈̋̉̏̍̒́̚͝t̶̜̲͈͇͔̆̏̈͌͊͑͜`, type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=DBejlYvfBF8"
        },
        {
            name: `this on repeat`, type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=jF-KRZmXfF4&list=WL&index=2&t=0s&ab_channel=sylicaa"
        },
        { name: `red velvet. pls stan.`, type: 'LISTENING' },
        { name: `EoE 👁👁👁👁👁`, type: 'WATCHING' },
        { name: `Sonic '06, The Greatest Game in the Universe`, type: 'PLAYING' },
        { name: `with coronavirus test kits`, type: 'PLAYING' },
        { name: `SimpMaster 69420™`, type: 'PLAYING' },
        { name: `the collapse of America`, type: 'WATCHING' },
        {
            name: `切腹`, type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=zvq9r6R6QAY"
        },
        {
            name: `🌟 grinding poptart cat 🌟`, type: 'STREAMING',
            url: "https://www.nyan.cat/"
        },
    ]

    dynamicStatuses: Array<ActivityOptions> = [
        { name: `NSA watch with ${globalThis.bot.guilds.cache.size} servers`, type: 'PLAYING' },
        { name: `shoutouts to ${globalThis.bot?.context?.author?.username}`, type: 'PLAYING' },
        { name: `WINNER: ${globalThis.bot.users.cache.random().username}! PRIZE: NOTHING!`, type: 'PLAYING' },
        { name: `${globalThis.bot.guilds.cache.size} copies of Bad Rats`, type: 'PLAYING' },
        { name: `dj hero on ${globalThis.bot.voice.connections.size} channels`, type: "PLAYING" },
        { name: `crippling ${globalThis.bot.guilds.cache.size} servers`, type: "STREAMING" },
        { name: `loves his ${globalThis.bot.users.cache.size} peeps`, type: "STREAMING" },
        { name: `pattycake with ${globalThis.bot.guilds.cache.size} servers`, type: 'PLAYING' },
        { name: `${globalThis.bot.guilds.cache.size} zooms`, type: 'LISTENING' },
        { name: `${BotModuleQuote.fetchInspirationalQuote().then(m => m.title)} zooms`, type: 'LISTENING' }
    ]

    static async getRandomStatus(): Promise<ActivityOptions> {
        let looklist = this.customStatuses

        if (globalThis.bot)
            looklist = this.customStatuses.concat(await new BotDiscordActivity().dynamicStatuses)

        let dice = Math.floor(Math.random() * looklist.length)

        return looklist[dice]
    }

    static async updateRandomStatus() {
        let bot: Bot = globalThis.bot

        bot.voice.connections.size

        bot.user.setUsername("Megadork");

        bot.user.setActivity(await BotDiscordActivity.getRandomStatus())
    }

    static useDevModeStatus() {
        let bot: Bot = globalThis.bot

        let status: ActivityOptions =
        {
            name: `DEBUGGING. Sorry for unexpected weirdness :)`,
            type: 'PLAYING',

        }

        bot.user.setActivity(status)
    }
}
