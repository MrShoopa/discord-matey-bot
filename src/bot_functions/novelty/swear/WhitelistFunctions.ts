import Discord from 'discord.js'
import { you } from './../../../user_creds.json'


export default class BotModuleSwearWhitelist {

    static checkIfWordWhitelistedForRole(word: string, user: Discord.GuildMember) {
        for (let roleId of Object.keys(you.word_list.white_list))
            if (user.roles.cache.get(roleId))
                for (let w of you.word_list.white_list[`${roleId}`])
                    if (word == w) {
                        console.log(`Word ${word} passes whitelist for role ${roleId} for user ${user.user.username}.`)
                        return true
                    }
    }
}