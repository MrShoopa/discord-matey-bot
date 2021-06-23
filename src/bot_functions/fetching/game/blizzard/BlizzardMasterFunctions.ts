import BlizzardAPI from 'blizzapi'
import Discord from 'discord.js'
import Bot from '../../../../Bot'

import AUTH from '../../../../user_creds.json'

export default class BotModuleBlizzard {
    static Blizzard = new BlizzardAPI.BlizzAPI({
        region: 'us',
        clientId: AUTH.blizzard.client_id,
        clientSecret: AUTH.blizzard.client_secret
    })
}