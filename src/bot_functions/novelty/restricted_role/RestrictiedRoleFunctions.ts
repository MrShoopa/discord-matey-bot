import Bot from "../../../Bot"

import PHRASES_SERVER_MOD from '../../../bot_knowledge/phrases/phrases_server_mod.json';


export default class BotModuleRestrictedRole {
    static assignToRestrictedRole(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Set restricted role', true)

        bot.context.mentions.members.forEach(member => {
            bot.context.reply(
                `${Bot.fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_set)},
                ${member.displayName}`)
            member.roles.add(bot.restrictedRoleId)
                .then(() => {
                    console.log(
                        `Adding ${member.displayName} to the role: ${globalThis.RESTRICTED_ROLE_NAME}`)
                })
                .catch((error) => {
                    console.error(`Failed to add ${member.displayName} to the role: ${globalThis.RESTRICTED_ROLE_NAME}`)
                    bot.saveBugReport(error)
                })
        })
    }

    static unassignFromRestrictedRole(trigger: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'Unset restricted role', true)

        bot.context.mentions.members.forEach(member => {
            bot.context.reply(
                `${Bot.fetchRandomPhrase(PHRASES_SERVER_MOD.restricted_role_unset)},
        ${member.displayName}`)
            member.roles.remove(bot.restrictedRoleId)
                .then(() => {
                    console.log(
                        `Removing ${member.displayName} from the role: ${globalThis.RESTRICTED_ROLE_NAME}`)
                }, error => console.error(`Couldn't remove member from restricted role - ${error}`))
        })
    }
}