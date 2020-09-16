import Bot from "../../Bot"
import { ActivityOptions } from "discord.js"
import BotModuleQuote from "../fetching/quote/QuoteFunctions"
import BotModuleYouTube from "../fetching/streaming/YouTubeStreamFunctions"

const PLAYLISTCHOICE = "https://www.youtube.com/playlist?list=PLYb74g1gGQ0wmPN8vemhi49o6yu9TNOGm"

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
        { name: `Capitol Hill Simulator™`, type: 'PLAYING' },
        {
            name: 'the SECRET TUNNELLLLL', type: 'STREAMING',
            url: 'https://www.youtube.com/watch?v=7o4EI_-5reA'
        },
        {
            name: 'Killer Bean Forever™', type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=qyYHWkVWQ4o"
        },
        { name: `the collapse of America`, type: 'WATCHING' },
        { name: `ShoopBeats by Joe`, type: 'PLAYING' },
        { name: 'I LOVE YOU - BASED GOD', type: 'LISTENING' },
        {
            name: '🦀🦀🦀', type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=LDU_Txk06tM"
        },
        { name: `itself`, type: 'PLAYING' },
        {
            name: `切腹`, type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=zvq9r6R6QAY"
        },
        {
            name: `🌟 grinding poptart cat 🌟`, type: 'STREAMING',
            url: "https://www.youtube.com/watch?v=QH2-TGUlwu4"
        },
        { name: `with your emotions 💦😞👌`, type: 'PLAYING' },
        { name: `no games 🔫`, type: 'PLAYING' },

    ]

    static randomObjects: Array<string> = [
        "tacos",
        "english majors",
        "👁👅👁",
        "🅱eter",
        "🅱eans 🌱",
        "myself UwU",
        "Novabot 🔨",
        "Shoopa"
    ]

    static regions: any

    dynamicStatuses: Array<ActivityOptions> = [
        { name: `NSA watch with ${globalThis.bot.guilds.cache.size} servers`, type: 'PLAYING' },
        { name: `shoutouts to ${globalThis.bot?.context?.author?.username}`, type: 'PLAYING' },
        { name: `WINNER: ${globalThis.bot.users.cache.random().username}! PRIZE: NOTHING!`, type: 'PLAYING' },
        { name: `simping for ${BotDiscordActivity.randomObjects[Math.floor(Math.random() * BotDiscordActivity.randomObjects.length)]}`, type: 'PLAYING' },
        { name: `${globalThis.bot.guilds.cache.size} copies of Bad Rats`, type: 'PLAYING' },
        { name: `dj hero on ${globalThis.bot.voice.connections.size} channels`, type: "PLAYING" },
        { name: `crippling ${globalThis.bot.guilds.cache.size} servers`, type: "STREAMING" },
        { name: `traveling to ${BotDiscordActivity.regions.random().name}`, type: "STREAMING" },
        { name: `loves his ${globalThis.bot.users.cache.size} peeps`, type: "STREAMING" },
        { name: `pattycake with ${globalThis.bot.guilds.cache.size} servers`, type: 'PLAYING' },
        { name: `${globalThis.bot.guilds.cache.size} zooms`, type: 'LISTENING' },
        { name: `${globalThis.bot.guilds.cache.size} zooms`, type: 'LISTENING' },
        { name: `with ${globalThis.bot.emojis.cache.size} zooms`, type: 'PLAYING' },
    ]

    static async getRandomStatus(): Promise<ActivityOptions> {
        let looklist = this.customStatuses


        if (globalThis.bot) {
            this.regions = await globalThis.bot.fetchVoiceRegions()
            looklist = this.customStatuses.concat(new BotDiscordActivity().dynamicStatuses)
            looklist = this.customStatuses.concat(await BotDiscordActivity.generateAsyncStatuses())
        }

        let dice = Math.floor(Math.random() * looklist.length)

        let choice = looklist[dice]

        //Special Statuses
        if (choice.name == 'MemeTime')
            choice.url = await BotModuleYouTube.fetchRandomVideoInPlaylist(PLAYLISTCHOICE).then(p => `https://www.youtube.com/watch?v=${p.contentDetails.videoId}`).catch(e => 'No Meme')

        return choice
    }

    static async updateRandomStatus() {
        let bot: Bot = globalThis.bot

        bot.user.setUsername("Megadork");

        bot.user.setActivity(await BotDiscordActivity.getRandomStatus())
    }

    static async generateAsyncStatuses(): Promise<Array<ActivityOptions>> {

        let statuses: ActivityOptions[] = [
            { name: `a quote: ${await BotModuleQuote.fetchInspirationalQuote(null, false).then(m => m.title)}`, type: 'LISTENING' },
            { name: `Meme Time`, type: "STREAMING" }
        ]

        return statuses
    }

    static useDevModeStatus() {
        let bot: Bot = globalThis.bot

        let status: ActivityOptions =
        {
            name: `DEBUGGING. Sorry for unexpected weirdness :)`,
            type: 'PLAYING'
        }

        bot.user.setActivity(status)
    }
}
