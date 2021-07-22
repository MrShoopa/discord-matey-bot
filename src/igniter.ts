/*  
	~~~~~~Oddly Specific Discord Bot~~~~~~
    
	@author Joe Villegas (joevillegasisawesome@gmail.com)
	@date   Started on May 16th, 2019.
	
	@see	./user_creds.js for providing API keys/secrets to use third-party services.
*/

import Discord from 'discord.js'

import Bot from './Bot.js'

import WebServices from './www/Webpage.js'

import TriggerHandlers from './bot_functions/TriggerHandlers.js'
import PostReadyFunctions from './bot_functions/_state/PostReadyFunctions.js'
import BotModuleModeration from './bot_functions/_state/Moderation.js'
import su from './tools/ConsoleFunctions.js' // Keep here for console.
globalThis.su = new su()

globalThis.prod_mode = (() => { return process.argv.includes('prod') })()
globalThis.dev_mode = (() => { return process.argv.includes('dev-mode') })()

//  Initialize Discord Bot
console.log('Initializing...')

try {
	globalThis.bot = new Bot()
	WebServices.startWebpage()

	if (globalThis.prod_mode) {
		console.log("Giving breathing time...")
		setTimeout(() => console.log("...end wait!"), 10000)
	}
	else
		console.log('Moving forward now.')
} catch (error) {
	if (error.message.includes('ENOTFOUND'))
		console.log('Reattempting connection...')
}
var bot: Bot = globalThis.bot

console.log("Installing Discord.js event listeners...")
bot.on('ready', () => {
	console.info(`Hey there! The time is ${new Date().toLocaleString()}. I'm ready! 😀\n`)

	PostReadyFunctions.run()
})

//  Bot joining server for first time
bot.on('guildCreate', guild => {
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). There are ${guild.memberCount} members here.`)

	guild.systemChannel.send('Hello world?')
})

//  Messaging to bot
bot.on('messageCreate', async (message) => {
	bot.context = message

	//  Logging message

	try {
		if (message.channel instanceof Discord.DMChannel) {
			console.group(`DM from ${message.author.username} (${message.author.id})`)
			console.log(`${message.content}`)
			console.groupEnd()

			bot.lastDM = message
		}

		if (globalThis.dev_mode) {
			if (message.guild)
				console.log(`\nOn ${new Date().toString()}, a user said:\n	"${(message.content).toString()}"`)

			if (message.toString().startsWith('`')) {
				message.content = message.content.substring(1)
				await TriggerHandlers.validateMessage(message)
			}

		} else await TriggerHandlers.validateMessage(message)
	} catch (e) {
		bot.saveBugReport(e, 'on message event', true)
	}
})

bot.on('guildMemberAdd', async member => {
	let URLLIST = await import('./bot_knowledge/references/urllist.js').then(a => a).catch(err => {
		console.log(err)
		return null
	})
	let WELCOMEMESSAGE = await import('./bot_knowledge/phrases/phrases_welcome.js')
	let announcementChannel: Discord.TextChannel = member.guild.systemChannel

	if (!BotModuleModeration.kickIfBlacklisted(member as Discord.GuildMember)) {
		let message = new Discord.MessageEmbed()
			.setAuthor('Hello hello? Hello hello!!! 😊')
			.setTitle(`Welcome to the server, ${member.displayName}!`)
			.setDescription(Bot.fetchRandomPhrase(WELCOMEMESSAGE.default.guild_member_add))
			.setFooter(`-but actually, GIVE IT UP FOR ${member.displayName}!!!!!!!`)
			.setColor(member.displayHexColor)
			.setURL(Bot.fetchRandomPhrase(URLLIST.welcome))
			.setImage(member.user.avatarURL())

		announcementChannel.send({ embeds: [message] }).then(mes => {
			mes.react('🔥')
			mes.react('🎊')
			mes.react('👋')
		})
	}
})

bot.on('error', error => {
	bot.context.channel.send(`Ah! Something crashed my lil' engine!
Log submitted to Joe. Restarting...`)

	bot.saveBugReport(error)

	//  Re-login
	bot = new Bot()
})

// System Signal Listeners
process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });

console.log("...done!")