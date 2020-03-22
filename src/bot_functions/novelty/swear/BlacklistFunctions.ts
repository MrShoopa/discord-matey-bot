import Discord from 'discord.js'
import { you } from '../../../user_creds.json'
import Bot from '../../../Bot'


export default class BotModuleSwearBlacklist {

    static checkIfWordBlacklistedForRole(word: string, user: Discord.GuildMember) {
        console.log(Object.keys(you.word_list.black_list))
        if (Object.keys(you.word_list.black_list).includes(user.guild.id))
            for (let w of you.word_list.black_list[`${user.guild.id}`])
                if (word == w) {
                    console.log(`Word ${word} passes blacklist in guild ${user.guild.id} for user ${user.user.username}. Uh oh.`)
                    return true
                }
    }

    static banUserIfInBlacklist(word: string, user: Discord.GuildMember) {
        let bot: Bot = globalThis.bot

        if (this.checkIfWordBlacklistedForRole(word, user)) {
            user.kick() // EZ PZ
            bot.context.channel.send(`Your time has come, ${user.user.username}. *b̴̩̳͈͙̻͍̩̙̜͇̟͚͈̜͎̈́̀͌̿̑̃̏e̴̡̧̹̳̫̺͔̹͓͇̩̖͋̊̇͌̒̎͜g̵̛͕͎̞̣̪̤͙̤̫̻̗̼͇̈́̕͜ö̵̳̻̦̭̖̲͎̟̦̯̩̝́̊̇̔̎̀͑̂̒̚͝n̶̨̯̹̥̱̩͙͙͇̼̣͗̅͐̊͑͐̋̾͌͆̄͝ę̸͈͈̖͍̼̞́̋̃̔̽̚ ̶̨͍̮͎̝̦̪͚͚̹̦͆͆͐̆̒͛̔͆̿̔͘͜ţ̵̛͎̞̬̯̮̬̪̩̪̥̒͛̈͊̚̚͠ḩ̵̜̳̙̰͓̘̹͌͐̓̋͋̿̕o̸̡̨͎̫̤͖͉͐̿́̑̀͜t̶̢̛̙͉͍͍̙̙͙̥̻̠̣̉̕*`)
        }
    }
}