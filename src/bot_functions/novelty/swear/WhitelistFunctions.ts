import Discord from 'discord.js'
import PARAMS from './../../../user_creds.js'


export default class BotModuleSwearWhitelist {

    static checkIfWordWhitelistedForRole(word: string, user: Discord.GuildMember) {
        for (let roleName of Object.keys(PARAMS.you.word_list.white_list))
            if (user.roles.cache.find(r => r.name.includes(roleName)))
                for (let w of PARAMS.you.word_list.white_list[`${roleName}`])
                    if (word == w) {
                        console.log(`Word ${word} passes whitelist for role ${roleName} for user ${user.user.username}.`)
                        return true
                    }
    }
}