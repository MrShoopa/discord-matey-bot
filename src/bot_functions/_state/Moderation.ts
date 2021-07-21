import Discord from 'discord.js'

import Bot from '../../Bot.js'
import PARAMS from '../../user_creds.js'


const PLAYLISTCHOICE = "https://www.youtube.com/playlist?list=PLYb74g1gGQ0wmPN8vemhi49o6yu9TNOGm"

export default class BotModuleModeration {

    static checkIfUserInKickList(user: Discord.GuildMember) {
        if (Object.keys(PARAMS.you.auto_kicker).includes(user.guild.id))
            for (let id of PARAMS.you.auto_kicker[`${user.guild.id}`])
                if (user.user.id == id) {
                    console.log(`User ${user.displayName} is in ${user.guild.name}'s (${user.guild.id}) kicklist!`)
                    return true
                }
    }

    static kickIfBlacklisted(member: Discord.GuildMember, message?: boolean) {
        let bot: Bot = globalThis.bot

        if (this.checkIfUserInKickList(member)) {
            member.kick().then(res => {
                console.warn(`User ${member.user.username} was kicked succesfully from guild ${member.guild.name}!`)
                if (message) member.guild.systemChannel.send(`You're on the blacklist ${member.user.username}. b̴̩̳͈͙̻͍̩̙̜͇̟͚͈̜͎̈́̀͌̿̑̃̏e̴̡̧̹̳̫̺͔̹͓͇̩̖͋̊̇͌̒̎͜g̵̛͕͎̞̣̪̤͙̤̫̻̗̼͇̈́̕͜ö̵̳̻̦̭̖̲͎̟̦̯̩̝́̊̇̔̎̀͑̂̒̚͝n̶̨̯̹̥̱̩͙͙͇̼̣͗̅͐̊͑͐̋̾͌͆̄͝ę̸͈͈̖͍̼̞́̋̃̔̽̚ ̶̨͍̮͎̝̦̪͚͚̹̦͆͆͐̆̒͛̔͆̿̔͘͜**ţ̵̛͎̞̬̯̮̬̪̩̪̥̒͛̈͊̚̚͠  ḩ̵̜̳̙̰͓̘̹͌͐̓̋͋̿̕  o̸̡̨͎̫̤͖͉͐̿́̑̀͜  t̶̢̛̙͉͍͍̙̙͙̥̻̠̣̉̕** 💨💨💨`)
            }).catch(e => {
                bot.saveBugReport(e, this.kickIfBlacklisted.name, true)
            })
            return true
        }
    }
}