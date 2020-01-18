/*  
    ~~~~~~Oddly Specific Discord Bot~~~~~~
    
    @author Joe Villegas (joevillegasisawesome@gmail.com)
	@date   Started on May 16th, 2019.
	
	@see	./user-creds.json for providing API keys/secrets to use third-party services.
*/

import Discord from 'discord.js'

import Bot from './Bot';

import TriggerHandlers from './bot_functions/TriggerHandlers.js';
import PostReadyFunctions from './bot_functions/state/PostReadyFunctions';

//  Initialize Discord Bot
console.group('Initializing...')

globalThis.bot = new Bot()
var bot: Bot = globalThis.bot

bot.on('ready', () => {
	console.log(`Initialized at ${new Date().toLocaleString()}.`)
	console.log('I\'m alive and ready to go!\n')

	bot.user.setActivity(`with your servers`, { type: 'PLAYING' });

	PostReadyFunctions.run()
	console.groupEnd()
})

//  Bot joining server for first time
bot.on('guildCreate', guild => {
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). There are ${guild.memberCount} members here.`);

	guild.systemChannel.send('Hello world?')
});

//  Messaging to bot
bot.on('message', async (message) => {
	bot.context = message

	//  Logging message
	console.log(`\nOn ${new Date().toString()}, a user said:\n	"${(message.content).toString()}"`)

	TriggerHandlers.validateMessage(message)
})

//TODO?:  Greeting
bot.on('guildMemberAdd', member => {
	let announcementChannel: Discord.TextChannel = member.guild.systemChannel

	announcementChannel.send(
		`Welcome to the server, ${member}! \n\n\n\n...\n\n who the f-`)
})

bot.on('error', error => {
	bot.waker.lastMessage.channel.send(`Ah! Something crashed my lil' engine!
    Log submitted to Joe. Restarting...`)

	bot.saveBugReport(error)

	//  Re-login
	bot = new Bot()
})

/*  ----    State Checking      ----   */
//	TODO: Consider using a 'per-day' check system