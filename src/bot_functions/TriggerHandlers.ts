import fs from 'fs'
import Discord from 'discord.js'

import Bot from '../Bot.js'
import BotData from './DataHandler.js'
import BotGeneralCommands from './general/GeneralCommands.js'
import BotLoggerFunctions from './general/LoggerFunctions.js'
import BotDefaultResponder from './general/DefaultCase.js'

import PARAMS from '../user_creds.js'
import TRIGGERS from '../bot_knowledge/triggers/triggers.js'
import HelpTriggers from './general/HelpTriggers.js'

import BotModuleMusic from './music/MusicFunctions.js'
import BotModuleSwearJar from './novelty/swear/SwearJarFunctions.js'
import BotModuleRestrictedRole from './novelty/restricted_role/RestrictedRoleFunctions.js'
import BotModuleTwitter from './fetching/twitter/TwitterFunctions.js'
import BotModuleGoogleSearch from './fetching/google/GoogleSearchCommands.js'
import BotModuleGoogleImage from './fetching/google/GoogleImageCommands.js'
import BotModuleReddit from './fetching/reddit/RedditFunctions.js'
import BotModuleBirthday from './novelty/birthday/BirthdayFunctions.js'
import BotModuleAnime from './fetching/anime/AnimeFunctions.js'
import BotModuleQuote from './fetching/quote/QuoteFunctions.js'
import BotModuleLyric from './fetching/music/LyricFunctions.js'
import BotModuleTranslation from './language/TranslationFunctions.js'
import BotModuleCovid from './fetching/info/current/CovidFunctions.js'
import BotModuleJoke from './fetching/joke/JokeFunctions.js'
import BotModuleNameGenerator from './novelty/name/RandomNameFunctions.js'
import BotModuleMeme from './fetching/meme/MemeGeneratorFunctions.js'

import BotModuleFun from './general/FunFunctions.js'
import BotWordplay from './wordplay/WordplayFunctions.js'
import BotModuleWarcraft from './fetching/game/blizzard/WarcraftDataFunctions.js'
import BotModuleGiphy from './fetching/gif/GiphyFunctions.js'
import BotSubscriptionCommands from './general/SubscriptionCommands.js'
import BotModuleStockMarket from './fetching/finance/StockMarketFunctions.js'
import BotModuleYouTube from './fetching/streaming/YouTubeStreamFunctions.js'
import BotModuleSpotify from './fetching/music/SpotifyFunctions.js'
import BotModuleTextEditor from './language/TextEditorFunctions.js'
import BotModuleUW from './fetching/college/UW.js'


export default class TriggerHandlers {
    public static bot: Bot
    public static message: Discord.Message | Discord.PartialMessage

    static audioLocation = fs.realpathSync('.') + '/bot_knowledge/audio'

    private static functions: any[] = [
        // Toggles
        TriggerHandlers.checkForSwearToggleRequest,
        TriggerHandlers.checkForSwearWhitelistRequest,

        // Functional Requests
        TriggerHandlers.checkForBirthdayAppendRequest,
        TriggerHandlers.checkForBirthdayInquiryRequest,

        TriggerHandlers.checkForSwearCountRequest,
        TriggerHandlers.checkForSwearLeaderboardRequest,

        TriggerHandlers.checkForMusicPlaybackRequest,
        TriggerHandlers.checkForMusicStopRequest,
        TriggerHandlers.checkForMusicQueueAddRequest,
        TriggerHandlers.checkForMusicQueueStartRequest,
        TriggerHandlers.checkForMusicQueueSkipRequest,
        TriggerHandlers.checkForMusicQueueAvoidNextRequest,
        TriggerHandlers.checkForMusicQueueInquireNextRequest,
        TriggerHandlers.checkForMusicQueueInquireListRequest,

        TriggerHandlers.checkForSearchEngineRequest,
        TriggerHandlers.checkForImageFetchRequest,

        TriggerHandlers.checkForTranslationRequest,

        TriggerHandlers.checkForTextEditRequest,

        TriggerHandlers.checkForCurrentTimeRequest,
        TriggerHandlers.checkForCurrentUtcTimeRequest,

        // External Data Requests
        TriggerHandlers.checkForRedditFetchRequest,
        TriggerHandlers.checkForTwitterFetchRequest,
        TriggerHandlers.checkForMALAnimeFetchRequest,
        TriggerHandlers.checkForMALMangaFetchRequest,
        TriggerHandlers.checkForQuoteFetchRequest,
        TriggerHandlers.checkForLyricFetchRequest,
        TriggerHandlers.checkForSpotifyRecommendationRequest,
        TriggerHandlers.checkForSpotifyGenreListRequest,
        TriggerHandlers.checkForLyricSingRequest,
        TriggerHandlers.checkForJokeRequest,
        TriggerHandlers.checkForCovidInfoRequest,
        TriggerHandlers.checkForMemeRequest,
        TriggerHandlers.checkForWarcraftProfileRequest,
        TriggerHandlers.checkForGIPHYRandomRequest,
        TriggerHandlers.checkForStockTickerDailyRequest,
        TriggerHandlers.checkForCryptoTickerDailyRequest,
        TriggerHandlers.checkForYouTubeChannelLiveActivityRequest,
        TriggerHandlers.checkForYouTubeChannelNewVideoRequest,
        TriggerHandlers.checkForUWFacultyRequest,
        TriggerHandlers.checkForUWFacultyRandomRequest,

        // Management Requests
        TriggerHandlers.checkForNameChangeRequest,
        TriggerHandlers.checkForRestrictedRoleAssignRequest,
        TriggerHandlers.checkForRestrictedRoleUnassignRequest,

        TriggerHandlers.checkForSubscriptionCreateRequest,
        TriggerHandlers.checkForSubscriptionEditRequest,
        TriggerHandlers.checkForSubscriptionDeleteRequest,
        TriggerHandlers.checkForSubscriptionGetRequest,
        TriggerHandlers.checkForSubscriptionListRequest,

        // Minigame Requests
        TriggerHandlers.checkForDiceRollRequest,
        TriggerHandlers.checkFor8BallRequest,
        TriggerHandlers.checkForPingPongRequest,

        // Bot Sudo Requests
        TriggerHandlers.checkForBotKillRequest,

        // Dev-Com Requests
        TriggerHandlers.checkForUserSuggestionRequest,

        HelpTriggers.checkForHelpInfoRequest
    ]

    public static async validateMessage(message: Discord.Message | Discord.PartialMessage) {
        this.bot = globalThis.bot
        this.bot.commandSatisfied = false

        this.message = message
        let unmodifiedMessage = message.content.toString()
        let msgString = message.toString()

        if (this.preventUnnecessaryResponse()) return

        //  Ambient events (Happens before requests are made)
        this.ambientEventCheck()

        //  Does the user want to redo?
        this.checkForRedoActionRequest()

        //  Actual processing
        await this.requestCheck()
        this.chatterCheck(message, unmodifiedMessage)

        if (this.bot.commandSatisfied === false)
            this.replyGeneralDefault(msgString)
    }

    private static preventUnnecessaryResponse() {
        let messageString = this.message.toString()

        //  Prevent unwanted invocation for users needing a space after
        if (this.isHotwordSpaceRequired(this.message)) return true

        //  Preventing bot to respond to itself or other bots
        if (this.bot.waker.id === this.bot.user.id)
            if (!messageString.startsWith('redoin, '))
                return true
            else {
                this.message =
                    new Discord.Message(this.bot, { content: messageString.substring(7).trim() },
                        this.bot.context.channel as Discord.TextChannel | Discord.DMChannel)
                this.bot.waker = this.bot.lastWaker
                return false
            }
        else if (this.bot.waker.bot)
            return true
    }

    private static isHotwordSpaceRequired(message = TriggerHandlers.message) {
        if (PARAMS.you.hotword_space_only_users.some(listedId => message.author.id == listedId))
            return true
        else
            return false
    }

    private static ambientEventCheck() {
        this.checkForSwearWord()
    }

    private static async requestCheck(message = TriggerHandlers.message) {
        for (var hotword of TRIGGERS.main_trigger)
            if (message.toString().toLowerCase().startsWith(hotword)) {

                //? tbh this messes with the message edits on discord (lots of calls)
                //TODO: Figure out why it doesn't work for music playback
                //let loading = await TriggerHandlers.processThinkingMessage(message.channel as Discord.TextChannel)

                message.content = message.content.replace(hotword, '').trim()
                for (var check of this.functions)
                    if (await check()) {
                        //TriggerHandlers.clearThinkingMessage(loading)
                        return this.bot.commandSatisfied = true
                    }
                //TriggerHandlers.clearThinkingMessage(loading)
            }
    }

    static async processThinkingMessage(channel: Discord.TextChannel) {
        let thinkingMessage =
            await channel.send({
                embeds: [new Discord.MessageEmbed()
                    .setDescription('🧠 \\ Thinking.')
                    .setColor('RANDOM')]
            })
        let animationTimeout = setInterval(() => {
            let nextIcon = () => {
                if (thinkingMessage.embeds[0].description.includes('\\'))
                    return '|'
                if (thinkingMessage.embeds[0].description.includes('|'))
                    return '/'
                if (thinkingMessage.embeds[0].description.includes('/'))
                    return '-'
                if (thinkingMessage.embeds[0].description.includes('-'))
                    return '\\'
            }
            let nextText = () => {
                if (thinkingMessage.embeds[0].description.includes('...'))
                    return 'Thinking.  '
                if (thinkingMessage.embeds[0].description.includes('..'))
                    return 'Thinking...'
                if (thinkingMessage.embeds[0].description.includes('.'))
                    return 'Thinking.. '
            }
            thinkingMessage.edit({
                embeds: [new Discord.MessageEmbed()
                    .setDescription(`🧠 ${nextIcon()} ${nextText()}`)
                    .setColor('RANDOM')]
            }).catch(e => this.bot.saveBugReport(e, 'Loading Animation'))
        }, 5000)

        return { thinkingMessage, animationTimeout }
    }

    static clearThinkingMessage(loading: { thinkingMessage: Discord.Message; animationTimeout: NodeJS.Timeout }) {
        clearInterval(loading.animationTimeout)
        loading.thinkingMessage.delete()
    }

    private static chatterCheck(message: Discord.Message | Discord.PartialMessage, unmodifiedMessage: string) {
        BotWordplay.runWordplayCheck(message as Discord.Message, unmodifiedMessage)
    }

    private static checkForRedoActionRequest(message = TriggerHandlers.message) {
        for (const mainTrig of TRIGGERS.main_trigger)
            if (message.toString().toLowerCase().startsWith(mainTrig))
                for (const trigger of TRIGGERS.redo_trigger)
                    if (message.toString().toLowerCase().includes(trigger))
                        return BotGeneralCommands.redoLastAction(trigger)
        //  Redo last command
    }


    /*  ---- Swear Jar Functionality ----  */

    private static checkForSwearToggleRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.swear_jar_triggers.toggle)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleSwearJar.toggleUserJar(message, trigger)
    }

    private static checkForSwearWhitelistRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.swear_jar_triggers.whitelist)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleSwearJar.toggleUserJarChannelNotification(message, trigger)
    }

    private static checkForSwearCountRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.swear_jar_triggers.count)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleSwearJar.fireSwearCountInquiryMessage(message as Discord.Message, trigger)
    }

    private static checkForSwearLeaderboardRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.swear_jar_triggers.server_stats)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleSwearJar.fireSwearServerStatsMessage(message as Discord.Message, trigger)
    }

    private static checkForSwearWord(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.swear_jar_triggers.bad_words)
            if (message.toString().toLowerCase().includes(trigger))
                if (BotData.getUserProperty(message.author.id, 'swear_jar', false))
                    return BotModuleSwearJar.dingUser(message as Discord.Message, trigger)
    }

    /*  ---- Birthday Functionality ----  */

    private static checkForBirthdayAppendRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.remember.birthday.self)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleBirthday.assignBirthdaySelf(message as Discord.Message, trigger)
        //  Add birthday reminder!
    }

    private static checkForBirthdayInquiryRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.remember.birthday.inquire)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleBirthday.inquireBirthdaySelf(message as Discord.Message)
    }

    /*  ---- Music Functionality ----  */

    private static checkForMusicPlaybackRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.play)
            if (message.toString().substring(0, 15).toLowerCase().startsWith(trigger))
                return BotModuleMusic.playMusic(trigger)
        //  Attempt to play song based on given info
    }

    private static checkForMusicStopRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.stop)
            if (!TriggerHandlers.bot.commandSatisfied) {
                if (message.toString().substring(0, 25).toLowerCase().startsWith(trigger)) {
                    return BotModuleMusic.stopMusic(trigger)
                }
            } else return
    }

    private static checkForMusicQueueAddRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.add)
            if (message.toString().substring(0).toLowerCase().startsWith(trigger))
                return BotModuleMusic.addNewSongRequest(trigger, message as Discord.Message)
    }
    private static checkForMusicQueueInquireListRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.inquire.list)
            if (message.toString().substring(0).toLowerCase().startsWith(trigger))
                return BotModuleMusic.fireQueueListMessage(message as Discord.Message, trigger)
    }
    private static checkForMusicQueueStartRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.start)
            if (message.toString().substring(0).toLowerCase().startsWith(trigger))
                return BotModuleMusic.processNextSongRequest(message as Discord.Message, false, true, trigger)
    }
    private static async checkForMusicQueueSkipRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.play_next)
            if (message.toString().substring(0).toLowerCase().startsWith(trigger))
                return await BotModuleMusic.processNextSongRequest(message as Discord.Message, false, false, trigger)
    }
    private static checkForMusicQueueAvoidNextRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.skip)
            if (message.toString().substring(0).toLowerCase().startsWith(trigger))
                return BotModuleMusic.processNextSongRequest(message as Discord.Message, true, false, trigger)
    }
    private static checkForMusicQueueInquireNextRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.inquire.next)
            if (message.toString().substring(0).toLowerCase().startsWith(trigger))
                return BotModuleMusic.fireQueueNextUpMessage(message as Discord.Message, trigger)
    }


    /*  ----    Search-Engine-Fetching (Google Search API)  ----    */

    private static checkForSearchEngineRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.google_search_triggers.base_request)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleGoogleSearch.fireSearchMessageFromGoogle(trigger)
    }

    /*  ----    Image-Fetching (Google JS API)  ----    */

    private static checkForImageFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.image_search_triggers.random_image)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleGoogleImage.fireImageMessageFromGoogle(message as Discord.Message, trigger)
    }

    /*  ----    Translation  ----    */

    private static checkForTranslationRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.translate.hotword_default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleTranslation.processTranslationRequest(message as Discord.Message, null, trigger)
    }

    private static checkForTextEditRequest(message = TriggerHandlers.message) {
        BotModuleTextEditor.processRequest(message as Discord.Message)
    }
    /*      ---- External Data Retreival ----   */

    private static checkForRedditFetchRequest(message = TriggerHandlers.message) {
        for (const baseTrigger of TRIGGERS.reddit_fetch.default)
            for (const trigger of TRIGGERS.reddit_fetch.query_type.post)
                if (message.toString().toLowerCase().startsWith(`${baseTrigger} ${trigger}`))
                    return BotModuleReddit.fireRedditSubmissionMessage((message as Discord.Message).channel as Discord.TextChannel)

        for (const trigger of TRIGGERS.reddit_fetch.copypasta.default)
            if (message.toString() === (trigger))
                return BotModuleReddit.fireCopypastaFetch(null, trigger)
        //  Get copypasta post [from Reddit]

        for (const trigger of TRIGGERS.reddit_fetch.fiftyfifty.default)
            if (message.toString() === (trigger))
                return BotModuleReddit.fire5050Fetch(null, trigger)
        //  Get fifityfifity post [from Reddit]

        for (const trigger of TRIGGERS.reddit_fetch.askreddit.default)
            if (message.toString() === (trigger))
                return BotModuleReddit.fireQuestionAsk(null, trigger)
        //  Get askreddit post [from Reddit]
    }

    private static checkForTwitterFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.twitter_fetch.tweet.query)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleTwitter.fireTweetMessageOfQuery(message.toString(), trigger)
        //  Get latest Tweet with specific query [from Twitter]

        for (const trigger of TRIGGERS.twitter_fetch.tweet.user_latest)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleTwitter.fireTweetMessageFromUser(message.toString(), trigger)
        //  Get latest Tweet from specific user
    }

    private static checkForMALAnimeFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.anime_fetch.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleAnime.fireAnimeInfoMessageOfName(message as Discord.Message, trigger)
        //  Get anime recommendation [from My Anime List (Jikan API)]
    }

    private static checkForMALMangaFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.manga_fetch.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleAnime.fireMangaInfoMessageOfName(message as Discord.Message, trigger)
        //  Get manga recommendation [from My Anime List (Jikan API)]
    }

    private static checkForQuoteFetchRequest(message = TriggerHandlers.message) {
        if (message.toString().toLowerCase().includes('quote'))
            return BotModuleQuote.fireQuoteMessage(message as Discord.Message)
    }

    private static checkForLyricFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.lyric_fetch.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleLyric.fireLyricMatchMessage(message as Discord.Message, trigger)
    }

    private static checkForLyricSingRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.lyric_sing.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleLyric.singSongInChat(message.toString(), trigger)
    }

    private static checkForSpotifyRecommendationRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.spotify.recomendations.base)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleSpotify.fireSpotifyRecommendationMessage(message as Discord.Message, trigger)
    }

    private static checkForSpotifyGenreListRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.spotify.recomendations.genres)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleSpotify.fireGenresListMessage(message as Discord.Message, trigger)
    }

    private static checkForJokeRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.joke.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleJoke.fireJokeMessage(message as Discord.Message, trigger)
    }

    private static checkForCovidInfoRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.covid.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleCovid.fireCovidInfoMessage(message as Discord.Message, trigger)
    }

    private static checkForMemeRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.meme_triggers.base)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleMeme.fireMemeRequest(message as Discord.Message)
    }

    private static checkForWarcraftProfileRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.blizzard.warcraft.character_profile)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleWarcraft.fireWarcraftProfileMessage(message, trigger)
    }

    private static checkForGIPHYRandomRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.giphy.random_gif)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleGiphy.fireGIFMessage(message as Discord.Message, trigger)
    }

    private static checkForStockTickerDailyRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.finance.stock_market.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleStockMarket.fireTickerInfoDailyMessage(message as Discord.Message, '', trigger)
    }

    private static checkForCryptoTickerDailyRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.finance.crypto.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleStockMarket.fireCryptoInfoDailyMessage(message as Discord.Message, '', trigger)
    }

    private static checkForYouTubeChannelLiveActivityRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.youtube.live.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleYouTube.fireChannelNowStreamingNotification(message as Discord.Message, trigger, true)
    }

    private static checkForYouTubeChannelNewVideoRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.youtube.new_video.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleYouTube.fireChannelNewVideoNotification(message as Discord.Message, trigger, true)
    }

    private static checkForUWFacultyRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.faculty_search.query)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleUW.fireFacultySearchMessage(message as Discord.Message, trigger)
    }

    private static checkForUWFacultyRandomRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.faculty_search.random)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleUW.fireRandomFacultySearchMessage(message as Discord.Message, trigger)
    }

    /*  ----    Server-Management   ---- */

    private static checkForNameChangeRequest(message = TriggerHandlers.message) {
        if (message.toString().toLowerCase().includes('name'))
            return BotModuleNameGenerator.processRandomNameRequest()
        //  Set Random Name   
    }

    private static checkForRestrictedRoleAssignRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.server_mod_triggers.set_restricted_role)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleRestrictedRole.assignToRestrictedRole(message as Discord.Message, trigger)
        //  Set Restricted Role        
    }

    private static checkForRestrictedRoleUnassignRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.server_mod_triggers.unset_restricted_role)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleRestrictedRole.unassignFromRestrictedRole(message as Discord.Message, trigger)
        //  Unset Restricted Role
    }

    private static checkForSubscriptionCreateRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.subscription.create_general)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotSubscriptionCommands.createSubscription(message as Discord.Message, trigger)
    }

    private static checkForSubscriptionEditRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.subscription.update_general)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotSubscriptionCommands.updateSubscription(message as Discord.Message, trigger)
    }

    private static checkForSubscriptionDeleteRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.subscription.delete_general)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotSubscriptionCommands.deleteSubscription(message as Discord.Message, trigger)
    }

    private static checkForSubscriptionGetRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.subscription.get_general)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotSubscriptionCommands.getSubscription(message as Discord.Message, trigger)
    }

    private static checkForSubscriptionListRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.subscription.list_general)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotSubscriptionCommands.listSubscriptionsForChannel(message as Discord.Message, trigger)
    }

    /*  ----    Fun Functions   ---- */

    private static checkForDiceRollRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.dice_roll)
            if (message.toString().toLowerCase().startsWith(trigger))
                if (/\d/.test(message.toString())) {
                    let number = parseInt((message.toString().match(/\d+/g)).pop())
                    return BotModuleFun.rollDice(number, trigger)
                } else return BotModuleFun.rollDice(6, trigger)
    }

    private static checkFor8BallRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.magic_ball)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotModuleFun.eightBall(null, trigger)
    }

    private static checkForPingPongRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.ping_pong.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotGeneralCommands.firePingPongMessage(message.channel as Discord.TextChannel, trigger)
    }

    private static checkForCurrentTimeRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.current_time.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotGeneralCommands.getCurrentTime(message.channel as Discord.TextChannel, trigger)
    }

    private static checkForCurrentUtcTimeRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.current_time.utc)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotGeneralCommands.getCurrentUtcTime(message.channel as Discord.TextChannel, trigger)
    }

    /* ----  Admin-only functions --- */
    private static checkForBotKillRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.kill_trigger)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotGeneralCommands.killBot(true, trigger)
        //  Redo last command
    }

    /* ----  Feedback/Dev-Com functions --- */
    private static checkForUserSuggestionRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.user_suggestion.default)
            if (message.toString().toLowerCase().startsWith(trigger))
                return BotLoggerFunctions.saveUserSuggestion(message, true, trigger)
        //  Send user suggestion as email to dev
    }

    //  All else comes around
    private static replyGeneralDefault(message: string) {
        for (const trigger of TRIGGERS.main_trigger)
            if (message.toString().toLowerCase().startsWith(trigger))
                BotDefaultResponder.generateResponse()
    }
}
