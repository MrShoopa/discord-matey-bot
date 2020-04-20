import Discord from 'discord.js'
import { you } from './../../../user_creds.json'


export default class BotModuleSwearWhitelist {

    static checkIfWordWhitelistedForRole(word: string, user: Discord.GuildMember) {
        for (let roleName of Object.keys(you.word_list.white_list))
            if (user.roles.cache.find(r => r.name.includes(roleName)))
                for (let w of you.word_list.white_list[`${roleName}`])
                    if (word == w) {
                        console.log(`Word ${word} passes whitelist for role ${roleName} for user ${user.user.username}.`)
                        return true
                    }
    }
}