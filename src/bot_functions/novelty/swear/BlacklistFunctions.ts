import Discord from 'discord.js'
import PARAMS from '../../../user_creds.js'
import Bot from '../../../Bot.js'
import BotModuleSwearWhitelist from './WhitelistFunctions.js'


export default class BotModuleSwearBlacklist {

    static checkIfWordBlacklistedForRole(word: string, user: Discord.GuildMember) {
        if (user)
            if (Object.keys(PARAMS.you.word_list.black_list).includes(user.guild.id))
                for (let w of PARAMS.you.word_list.black_list[`${user.guild.id}`])
                    if (word == w && !BotModuleSwearWhitelist.checkIfWordWhitelistedForRole(w, user)) {
                        console.log(`Word ${word} passes blacklist in guild ${user.guild.id} for user ${user.user.username}. Uh oh.`)
                        return true
                    }
    }

    static banUserIfInBlacklist(word: string, user: Discord.GuildMember, message?: Discord.Message) {
        let bot: Bot = globalThis.bot

        if (this.checkIfWordBlacklistedForRole(word, user)) {
            user.kick().then(res => {
                console.warn(`User ${user.user.username} was kicked succesfully from guild ${user.guild.name}!`)
                if (message) message.channel.send(`A forbidden word has been heard, ${user.user.username}. b̴̩̳͈͙̻͍̩̙̜͇̟͚͈̜͎̈́̀͌̿̑̃̏e̴̡̧̹̳̫̺͔̹͓͇̩̖͋̊̇͌̒̎͜g̵̛͕͎̞̣̪̤͙̤̫̻̗̼͇̈́̕͜ö̵̳̻̦̭̖̲͎̟̦̯̩̝́̊̇̔̎̀͑̂̒̚͝n̶̨̯̹̥̱̩͙͙͇̼̣͗̅͐̊͑͐̋̾͌͆̄͝ę̸͈͈̖͍̼̞́̋̃̔̽̚ ̶̨͍̮͎̝̦̪͚͚̹̦͆͆͐̆̒͛̔͆̿̔͘͜**ţ̵̛͎̞̬̯̮̬̪̩̪̥̒͛̈͊̚̚͠  ḩ̵̜̳̙̰͓̘̹͌͐̓̋͋̿̕  o̸̡̨͎̫̤͖͉͐̿́̑̀͜  t̶̢̛̙͉͍͍̙̙͙̥̻̠̣̉̕**`)
            }).catch(e => {
                bot.saveBugReport(e, this.banUserIfInBlacklist.name, true)
            })
            return true
        }
    }
}