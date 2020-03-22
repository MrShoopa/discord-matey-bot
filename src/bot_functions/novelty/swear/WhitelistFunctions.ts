import Discord from 'discord.js'
import { you } from './../../../user_creds.json'


export default class BotModuleSwearWhitelist {

    static checkIfWordWhitelistedForRole(word: string, user: Discord.GuildMember) {
        for (let roleId in user.roles)
            if (Object.keys(you.word_list.white_list).includes(roleId))
                for (let w of you.word_list.white_list[`${roleId}`])
                    if (word == w) {
                        console.log(`Word ${word} passes whitelist for role ${roleId} for user ${user.user.username}.`)
                        return true
                    }
    }
}