import Discord from 'discord.js';
import Bot from "../../../Bot"

import PHRASES_SERVER_MOD from '../../../bot_knowledge/phrases/phrases_server_mod.json'


export default class BotModuleRestrictedRole {
    static assignToRestrictedRole(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Set restricted role', true)

        if (bot.context.member.hasPermission(['ADMINISTRATOR']))
            bot.context.mentions.members.forEach(member => {
                let message = new Discord.MessageEmbed()
                    .setTitle(`${Bot.fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_set)}`)
                    .setColor('BLACK')
                    .setDescription(`${bot.context.author.username} has banished ${member.displayName} for inexplicable reasons.`)
                    .setFooter(`Role Enforced: ${bot.restrictedRoleIds[0]}`)

                bot.context.channel.send(message)

                member.roles.set([bot.restrictedRoleIds[0]])
                    .then(() => {
                        console.log(
                            `Adding ${member.displayName} to the role: ${bot.restrictedRoleIds[0]}`)
                    })
                    .catch((error) => {
                        console.error(`Failed to add ${member.displayName} to the role: ${bot.restrictedRoleIds[0]}`)
                        bot.saveBugReport(error, this.assignToRestrictedRole.name)
                    })
            })
        else return bot.context.channel.send(`You cannot harness this power without admin plox`)
    }

    static unassignFromRestrictedRole(trigger: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Unset restricted role', true)

        bot.context.mentions.members.forEach(member => {
            bot.context.reply(
                `${Bot.fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_unset)} ${member.displayName}`)
            member.roles.remove(bot.restrictedRoleIds[0])
                .then(() => {
                    console.log(
                        `Removing ${member.displayName} from the role: ${globalThis.RESTRICTED_ROLE_NAME}`)
                }, error => console.error(`Couldn't remove member from restricted role - ${error}`))
        })
    }
}