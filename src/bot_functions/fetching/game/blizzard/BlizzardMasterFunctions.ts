import BlizzardAPI from 'blizzapi'
import Discord from 'discord.js'
import Bot from '../../../../Bot.js'

import KEYS from '../../../../user_creds.js'

export default class BotModuleBlizzard {
    static Blizzard = new BlizzardAPI.BlizzAPI({
        region: 'us',
        clientId: KEYS.blizzard.client_id,
        clientSecret: KEYS.blizzard.client_secret
    })
}