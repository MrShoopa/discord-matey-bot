import Discord from 'discord.js';
import Bot from '../../../Bot.js'

import PHRASES_SERVER_MOD from '../../../bot_knowledge/phrases/phrases_server_mod.js'


export default class BotModuleRestrictedRole {
    static assignToRestrictedRole(message: Discord.Message, trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Set restricted role', true)

        if (message.member.permissions.has(['ADMINISTRATOR']))
            message.mentions.members.forEach(member => {
                let response = new Discord.MessageEmbed()
                    .setTitle(`${Bot.fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_set)}`)
                    .setColor('DARK_GREY')
                    .setDescription(`${message.author.username} has banished ${member.displayName} for inexplicable reasons.`)
                    .setFooter(`Role Enforced: ${bot.restrictedRoleIds[0]}`)

                message.channel.send({ embeds: [response] })

                member.roles.set([bot.restrictedRoleIds[0] as `${bigint}`])
                    .then(() => {
                        console.log(
                            `Adding ${member.displayName} to the role: ${bot.restrictedRoleIds[0]}`)
                    })
                    .catch((error) => {
                        console.error(`Failed to add ${member.displayName} to the role: ${bot.restrictedRoleIds[0]}`)
                        bot.saveBugReport(error, this.assignToRestrictedRole.name)
                    })
            })
        else return message.channel.send(`You cannot harness this power without admin plox`)
    }

    static unassignFromRestrictedRole(message: Discord.Message, trigger: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Unset restricted role', true)

        message.mentions.members.forEach(member => {
            message.reply(
                `${Bot.fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_unset)} ${member.displayName}`)
            member.roles.remove(bot.restrictedRoleIds[0] as `${bigint}`)
                .then(() => {
                    console.log(
                        `Removing ${member.displayName} from the role: ${globalThis.RESTRICTED_ROLE_NAME}`)
                }, error => console.error(`Couldn't remove member from restricted role - ${error}`))
        })
    }
}