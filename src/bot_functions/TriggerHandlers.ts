import Discord from 'discord.js'

import Bot from '../Bot'
import BotGeneralCommands from './general/GeneralCommands.js'
import BotDefaultResponder from './general/DefaultCase'

import TRIGGERS from '../bot_knowledge/triggers/triggers.json'
import HelpTriggers from './general/HelpTriggers'

import BotModuleMusic from './music/MusicFunctions'
import BotModuleSwearJar from './novelty/swear/SwearJarFunctions'
import BotModuleRestrictedRole from './novelty/restricted_role/RestrictiedRoleFunctions'
import BotModuleTwitter from './fetching/twitter/TwitterFunctions'
import BotModuleGoogleImage from './fetching/google/GoogleImageCommands'
import BotModuleReddit from './fetching/reddit/RedditFunctions'
import BotModuleBirthday from './novelty/birthday/BirthdayFunctions'
import BotModuleAnime from './fetching/anime/AnimeFunctions'
import BotModuleFun from './general/FunFunctions'

import BotWordplay from './wordplay/WordplayFunctions'
import BotModuleQuote from './fetching/quote/QuoteFunctions'
import BotModuleLyric from './fetching/lyrics/LyricFunctions'
import TranslationFunctions from './language/TranslationFunctions'


export default class TriggerHandlers {
    public static bot: Bot
    public static message: Discord.Message | Discord.PartialMessage

    static audioLocation = __dirname + '/bot_knowledge/audio'

    private static functions: any[] = [
        TriggerHandlers.checkForBirthdayAppendRequest,
        TriggerHandlers.checkForBirthdayInquiryRequest,

        TriggerHandlers.checkForMusicPlaybackRequest,
        TriggerHandlers.checkForMusicStopRequest,
        TriggerHandlers.checkForMusicQueueAddRequest,
        TriggerHandlers.checkForMusicQueueStartRequest,
        TriggerHandlers.checkForMusicQueueSkipRequest,
        TriggerHandlers.checkForMusicQueueAvoidNextRequest,
        TriggerHandlers.checkForMusicQueueInquireNextRequest,
        TriggerHandlers.checkForMusicQueueInquireListRequest,

        TriggerHandlers.checkForImageFetchRequest,

        TriggerHandlers.checkForTranslationRequest,

        //  Third-Party APIs
        TriggerHandlers.checkForRedditFetchRequest,
        TriggerHandlers.checkForTwitterFetchRequest,
        TriggerHandlers.checkForMALFetchRequest,
        TriggerHandlers.checkForQuoteFetchRequest,
        TriggerHandlers.checkForLyricFetchRequest,
        TriggerHandlers.checkForLyricSingRequest,

        TriggerHandlers.checkForRestrictedRoleAssignRequest,
        TriggerHandlers.checkForRestrictedRoleUnassignRequest,

        TriggerHandlers.checkForDiceRollRequest,

        TriggerHandlers.checkForBotKillRequest,

        HelpTriggers.checkForHelpInfoRequest

    ]

    public static validateMessage(message: Discord.Message | Discord.PartialMessage) {
        this.bot = globalThis.bot
        this.bot.commandSatisfied = false

        this.message = message

        if (this.preventUnnecessaryResponse()) return

        //  Ambient events (Happens before requests are made)
        this.ambientEventCheck()

        //  Does the user want to redo?
        this.checkForRedoActionRequest()

        //  Actual processing
        this.requestCheck()
        this.chatterCheck()

        if (!this.bot.commandSatisfied)
            this.replyGeneralDefault()
    }

    private static preventUnnecessaryResponse() {
        let messageString = this.message.toString()

        //  Preventing bot to respond to itself or other bots
        if (this.bot.waker.id === this.bot.user.id)
            if (!messageString.startsWith('redoin, '))
                return true
            else {
                this.message =
                    new Discord.Message(this.bot, { content: messageString.substring(7) }, this.bot.context.channel)
                this.bot.waker = this.bot.lastWaker
                return false
            }
        else if (this.bot.waker.bot)
            return true
    }

    private static ambientEventCheck() {
        this.checkForSwearWord()
    }

    private static requestCheck() {
        for (var check of this.functions)
            if (check()) return this.bot.commandSatisfied = true
    }

    private static chatterCheck() {
        BotWordplay.runWordplayCheck()
    }

    private static checkForRedoActionRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.redo_trigger)
            if (message.toString().toLowerCase().includes(trigger))
                return BotGeneralCommands.redoLastAction(trigger)
        //  Redo last command
    }


    /*  ---- Swear Jar Functionality ----  */

    private static checkForSwearWord(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.swear_jar_triggers.bad_words)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleSwearJar.dingUser(trigger)
    }

    /*  ---- Birthday Functionality ----  */

    private static checkForBirthdayAppendRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.remember.birthday.self)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleBirthday.assignBirthdaySelf(trigger)
        //  Add birthday reminder!
    }

    private static checkForBirthdayInquiryRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.remember.birthday.inquire)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleBirthday.inquireBirthdaySelf()
    }

    /*  ---- Music Functionality ----  */

    private static checkForMusicPlaybackRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.play)
            if (message.toString().substring(0, 15).toLowerCase().includes(trigger))
                return BotModuleMusic.playMusic(trigger)
        //  Attempt to play song based on given info
    }

    private static checkForMusicStopRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.stop)
            if (!TriggerHandlers.bot.commandSatisfied) {
                if (message.toString().substring(0, 25).toLowerCase().includes(trigger)) {
                    return BotModuleMusic.stopMusic(trigger)
                }
            } else return
    }

    private static checkForMusicQueueAddRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.add)
            if (message.toString().substring(0).toLowerCase().includes(trigger))
                return BotModuleMusic.addNewSongRequest(trigger)
    }
    private static checkForMusicQueueStartRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.start)
            if (message.toString().substring(0).toLowerCase().includes(trigger))
                return BotModuleMusic.processNextSongRequest(false, true, trigger)
    }
    private static checkForMusicQueueSkipRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.play_next)
            if (message.toString().substring(0).toLowerCase().includes(trigger))
                return BotModuleMusic.processNextSongRequest(false, false, trigger)
    }
    private static checkForMusicQueueAvoidNextRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.skip)
            if (message.toString().substring(0).toLowerCase().includes(trigger))
                return BotModuleMusic.processNextSongRequest(true, false, trigger)
    }
    private static checkForMusicQueueInquireNextRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.inquire.next)
            if (message.toString().substring(0).toLowerCase().includes(trigger))
                return BotModuleMusic.fireQueueNextUpMessage(trigger)
    }
    private static checkForMusicQueueInquireListRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.queue.inquire.list)
            if (message.toString().substring(0).toLowerCase().includes(trigger))
                return BotModuleMusic.fireQueueListMessage(trigger)
    }


    /*  ----    Image-Fetching (Google JS API)  ----    */

    private static checkForImageFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.image_search_triggers.random_image)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleGoogleImage.fireImageMessageFromGoogle(trigger)
    }

    /*  ----    Translation  ----    */

    private static checkForTranslationRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.translate.hotword_default)
            if (message.toString().toLowerCase().includes(trigger))
                return TranslationFunctions.processTranslationRequest(TriggerHandlers.bot.context)
        //  Find random image (from Google Images)
    }

    /*      ---- External Data Retreival ----   */

    private static checkForRedditFetchRequest(message = TriggerHandlers.message) {
        for (const baseTrigger of TRIGGERS.reddit_fetch.default)
            for (const trigger of TRIGGERS.reddit_fetch.query_type.post)
                if (message.toString().toLowerCase().includes(`${baseTrigger} ${trigger}`))
                    return BotModuleReddit.fireRedditSubmissionMessage(`${baseTrigger} ${trigger}`)
        //  Get copypasta post [from Reddit]

        for (const trigger of TRIGGERS.reddit_fetch.copypasta.default)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleReddit.fireCopypastaFetch(trigger)
        //  Get copypasta post [from Reddit]
    }

    private static checkForTwitterFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.twitter_fetch.tweet.query)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleTwitter.fireTweetMessageOfQuery(message.toString(), trigger)
        //  Get latest Tweet with specific query [from Twitter]

        for (const trigger of TRIGGERS.twitter_fetch.tweet.user_latest)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleTwitter.fireTweetMessageFromUser(message.toString(), trigger)
        //  Get latest Tweet from specific user
    }

    private static checkForMALFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.anime_fetch.default)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleAnime.fireAnimeInfoMessageOfName(trigger)
        //  Get anime recommendation [from My Anime List (JikanTS)]
    }

    private static checkForQuoteFetchRequest(message = TriggerHandlers.message) {
        if (message.toString().toLowerCase().includes('quote'))
            return BotModuleQuote.fireQuoteMessage()
    }

    private static checkForLyricFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.lyric_fetch.default)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleLyric.fireLyricMatchMessage(trigger)
    }

    private static checkForLyricSingRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.lyric_sing.default)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleLyric.singSongInChat(message.toString(), trigger)
    }

    /*  ----    Server-Management   ---- */

    private static checkForRestrictedRoleAssignRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.server_mod_triggers.set_restricted_role)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleRestrictedRole.assignToRestrictedRole(trigger)
        //  Set Restricted Role        
    }

    private static checkForRestrictedRoleUnassignRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.server_mod_triggers.unset_restricted_role)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleRestrictedRole.unassignFromRestrictedRole(trigger)
        //  Unset Restricted Role
    }

    /*  ----    Fun Functions   ---- */

    private static checkForDiceRollRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.dice_roll)
            if (message.toString().toLowerCase().includes(trigger))
                if (/\d/.test(message.toString())) {
                    let number = parseInt((message.toString().match(/\d+/g)).pop())
                    return BotModuleFun.rollDice(number, trigger)
                } else return BotModuleFun.rollDice(6, trigger)
        //  Get anime recommendation [from My Anime List (JikanTS)]
    }

    /* ----  Admin-only functions --- */
    private static checkForBotKillRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.kill_trigger)
            if (message.toString().toLowerCase().includes(trigger))
                return BotGeneralCommands.killBot(true, trigger)
        //  Redo last command
    }

    //  All else comes around
    private static replyGeneralDefault(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.main_trigger)
            if (message.toString().substring(0, 12).toLowerCase().includes(trigger))
                return BotDefaultResponder.generateResponse()
    }
}
