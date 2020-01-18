import Discord from 'discord.js';

import Bot from '../Bot';
import BotGeneralCommands from './general/GeneralCommands.js';
import BotDefaultResponder from './general/DefaultCase';

import TRIGGERS from '../bot_knowledge/triggers/triggers.json';
import HelpTriggers from './general/HelpTriggers';

import BotMusicModule from './music/MusicFunctions';
import BotSwearJarModule from './novelty/swear/SwearJarFunctions';
import BotRestrictedRoleModule from './novelty/restricted_role/RestrictiedRoleFunctions';
import BotTwitterModule from './fetching/twitter/TwitterFunctions';
import BotModuleGoogleImage from './fetching/google/googleImageCommands.ts/GoogleImageCommands';
import BotModuleReddit from './fetching/reddit/RedditFunctions';
import BotModuleBirthday from './novelty/birthday/BirthdayFunctions';
import BotModuleAnime from './fetching/anime/AnimeFunctions';

import BotWordplay from './wordplay/wordplayFunctions';
import BotModuleQuote from './fetching/quote/QuoteFunctions';


export default class TriggerHandlers {
    public static bot: Bot
    public static message: Discord.Message | Discord.PartialMessage

    static audioLocation = __dirname + '/bot_knowledge/audio'

    private static functions: any[] = [
        TriggerHandlers.checkForBirthdayAppendRequest,
        TriggerHandlers.checkForBirthdayInquiryRequest,

        TriggerHandlers.checkForMusicPlaybackRequest,
        TriggerHandlers.checkForMusicStopRequest,

        TriggerHandlers.checkForImageFetchRequest,

        //  Third-Party APIs
        TriggerHandlers.checkForRedditFetchRequest,
        TriggerHandlers.checkForTwitterFetchRequest,
        TriggerHandlers.checkForMALFetchRequest,
        TriggerHandlers.checkForQuoteFetchRequest,

        TriggerHandlers.checkForRestrictedRoleAssignRequest,
        TriggerHandlers.checkForRestrictedRoleUnassignRequest,

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
                return BotGeneralCommands.RedoLastAction(trigger)
        //  Redo last command
    }


    /*  ---- Swear Jar Functionality ----  */

    private static checkForSwearWord(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.swear_jar_triggers.bad_words)
            if (message.toString().toLowerCase().includes(trigger))
                return BotSwearJarModule.dingUser(trigger)
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
                return BotMusicModule.playMusic(trigger)
        //  Attempt to play song based on given info
    }

    private static checkForMusicStopRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.singing_triggers.stop)
            if (!TriggerHandlers.bot.commandSatisfied) {
                if (message.toString().substring(0, 25).toLowerCase().includes(trigger)) {
                    return BotMusicModule.stopMusic(trigger)
                }
            } else { return }
    }


    /*  ----    Image-Fetching (Google JS API)  ----    */

    private static checkForImageFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.image_search_triggers.random_image)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleGoogleImage.fetchBuiltImageFromGoogle(trigger)
        //  Find random image (from Google Images)
    }

    /*      ---- External Data Retreival ----   */

    private static checkForRedditFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.reddit_fetch.copypasta.default)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleReddit.fetchSomeCopypasta(trigger)
        //  Get copypasta post [from Reddit]
    }

    private static checkForTwitterFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.twitter_fetch.tweet.query)
            if (message.toString().toLowerCase().includes(trigger))
                return BotTwitterModule.fetchBuiltMsgTweetWithQuery(trigger)
        //  Get latest Tweet with specific query [from Twitter]
    }

    private static checkForMALFetchRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.anime_fetch.default)
            if (message.toString().toLowerCase().includes(trigger))
                return BotModuleAnime.fetchBuiltMsgAnimeInfoMessageOfName()
        //  Get anime recommendation [from My Anime List (JikanTS)]
    }

    private static async checkForQuoteFetchRequest(message = TriggerHandlers.message) {
        if (message.toString().toLowerCase().includes('quote'))
            BotModuleQuote.fireQuoteMessage()
    }

    /*  ----    Server-Management   ---- */

    private static checkForRestrictedRoleAssignRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.server_mod_triggers.set_restricted_role)
            if (message.toString().toLowerCase().includes(trigger))
                return BotRestrictedRoleModule.assignToRestrictedRole(trigger)
        //  Set Restricted Role        
    }

    private static checkForRestrictedRoleUnassignRequest(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.server_mod_triggers.unset_restricted_role)
            if (message.toString().toLowerCase().includes(trigger))
                return BotRestrictedRoleModule.unassignFromRestrictedRole(trigger)
        //  Unset Restricted Role
    }

    //  All else comes around
    private static replyGeneralDefault(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.main_trigger)
            if (message.toString().substring(0, 12).toLowerCase().includes(trigger))
                return BotDefaultResponder.generateResponse()
    }
}
