import BlizzardAPI from 'blizzapi'
import Discord from 'discord.js'
import Bot from '../../../../Bot'

import AUTH from '../../../user_creds.json'

import TRIGGERS from '../../../bot_knowledge/triggers/triggers.json'

import PHRASES_GOOGLE_SEARCH from '../../../bot_knowledge/phrases/phrases_google_search.json'
import DEFAULTS_GOOGLE from '../../../bot_knowledge/defaults/image_search.json'

export default class BotModuleBlizzard {
    static Blizzard = new BlizzardAPI({
        region: 'us',
        clientId: AUTH.blizzard.client_id,
        clientSecret: AUTH.blizzard.client_secret
    })
}