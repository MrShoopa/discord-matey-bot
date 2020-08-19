/*  
    ~~~~~~Oddly Specific Discord Bot~~~~~~
    
    @author Joe Villegas (joevillegasisawesome@gmail.com)
	@date   Started on May 16th, 2019.
	
	@see	./user_creds.json for providing API keys/secrets to use third-party services.
*/

import Discord from 'discord.js'

import Bot from './Bot'

import WebServices from './www/Webpage'

import TriggerHandlers from './bot_functions/TriggerHandlers'
import PostReadyFunctions from './bot_functions/_state/PostReadyFunctions'
import su from './tools/ConsoleFunctions' // Keep here for console.
globalThis.su = new su()

globalThis.prod_mode = (() => { return process.argv.includes('prod') })()
globalThis.dev_mode = (() => { return process.argv.includes('dev-mode') })()

//  Initialize Discord Bot
console.log('Initializing...')

try {
	globalThis.bot = new Bot()
	WebServices.startWebpage()
} catch (error) {
	if (error.message.includes('ENOTFOUND'))
		console.log('Reattempting connection...')
}
var bot: Bot = globalThis.bot

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
bot.on('message', async (message) => {
	bot.context = message

	//  Logging message

	try {
		if (globalThis.dev_mode) {
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
	let URLLIST = await import('./bot_knowledge/references/urllist.json').then(a => a)
	let WELCOMEMESSAGE = await import('./bot_knowledge/phrases/phrases_welcome.json').then(a => a)
	let announcementChannel: Discord.TextChannel = member.guild.systemChannel

	let message = new Discord.MessageEmbed()
		.setAuthor('Hello hello? Hello hello!!! 😊')
		.setTitle(`Welcome to the server, ${member.displayName}!`)
		.setDescription(Bot.fetchRandomPhrase(WELCOMEMESSAGE.guild_member_add))
		.setFooter(`-but actually, GIVE IT UP FOR ${member.displayName}!!!!!!!`)
		.setColor(member.displayHexColor)
		.setURL(Bot.fetchRandomPhrase(URLLIST.welcome))
		.setImage(member.user.avatarURL())

	announcementChannel.send(message).then(mes => {
		mes.react('🔥')
		mes.react('🎊')
		mes.react('👋')
	})
})

bot.on('error', error => {
	bot.waker.lastMessage.channel.send(`Ah! Something crashed my lil' engine!
		Log submitted to Joe. Restarting...`)

	bot.saveBugReport(error)

	//  Re-login
	bot = new Bot()
})

// System Signal Listeners
process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });