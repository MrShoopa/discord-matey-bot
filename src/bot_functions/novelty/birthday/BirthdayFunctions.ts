import Discord, { TextChannel } from 'discord.js'

import Bot from '../../../Bot.js'
import BotData from '../../DataHandler.js'
import { DataType } from '../../../types/data_types/DataType';

import CALENDAR from "../../../bot_knowledge/calendar/values.js"

import PHRASES from "../../../bot_knowledge/phrases/phrases_calendar.js"

export default class BotModuleBirthday {
	static assignBirthdaySelf(message: Discord.Message, trigger?: string) {
		let bot: Bot = globalThis.bot
		//  Trim trigger for easier parsing of date
		bot.preliminary(trigger, "Birthday reminder", true)
		let context: string = message.toString().replace(trigger, "").trim()

		let birthday: Date

		CALENDAR.months.some(month => {
			if (context.toLowerCase().includes(month)) {

				let dateNumber: number = parseInt(context.match(/[0-9]{1,2}/)[0].toString())
				let monthNumber: number = CALENDAR.months.findIndex((item, i) => {
					return item === month
				})
				let yearNumber: number = parseInt(context.match(/([0-9])\w+/g)[1]?.toString())

				if ((1 <= dateNumber) && (31 >= dateNumber)) {
					// Construct birthday object
					if (!yearNumber) yearNumber = 6969

					birthday = new Date(yearNumber, monthNumber, dateNumber)

				} else {
					return message.reply('you wrote an invalid date. Include a date from 1-31.')
				}
			}

		})

		if (!birthday)
			return message.reply(`invalid date. Type the month and date like this: 'September 10 (year optional)'`)

		let userData = BotData.getUserData(message.author.id)

		try {
			let newBirthday: boolean = userData.birthday !== null
			userData.birthday = birthday

			if (newBirthday) {
				message.reply(Bot.fetchRandomPhrase(PHRASES.birthday.created_user) +
					` ${CALENDAR.months_prettier[birthday.getMonth()]} ${birthday.getDate().toLocaleString()}!`)
			} else {
				message.reply(Bot.fetchRandomPhrase(PHRASES.birthday.updated_user) +
					` ${CALENDAR.months_prettier[birthday.getMonth()]} ${birthday.getDate().toLocaleString()}!`)
			}
		} catch (error) {
			bot.saveBugReport(error, this.assignBirthdaySelf.name, true)
			return message.reply(`I couldn't save your birthday for some reason... :(`)
		}


		return BotData.updateUserData(message.author.id, userData)
	}

	static inquireBirthdaySelf(message: Discord.Message, trigger?: string) {
		let bot: Bot = globalThis.bot
		bot.preliminary(trigger, 'Birthday Inquiry', true)

		let userData = BotData.getUserData(message.author.id)

		if (userData?.birthday === undefined) {
			message.reply(`looks like I don't know it? Maybe tell me to remember? 🍰`)
		} else {
			let birthday = new Date(userData.birthday)
			message.reply(`your birthday is on ${CALENDAR.months_prettier[birthday.getMonth()]} ${birthday.getDate()}! `)

			let difToleranceMs = 2160000000
			let birthdayFromNowMs = (birthday.getMilliseconds() - Date.now())

			if (birthday.getMonth() === new Date().getMonth()
				&& birthday.getDate() === new Date().getDate())
				message.channel.send(`Hey, your birthday's today! I hope you have a great one! 🎂🎉`)
			else if (Math.abs(birthdayFromNowMs) < difToleranceMs && birthdayFromNowMs > 0)
				message.channel.send(`Looks like your birthday's coming up soon! I'm excited!`)
			else if (Math.abs(birthdayFromNowMs) < difToleranceMs && birthdayFromNowMs < 0)
				message.channel.send(`Looks like your birthday came by recently!`)

		}

		return
	}

	static checkBirthdaysToday(announce?: boolean) {
		let birthdayList: [{ userId: string, date: Date }?] = []

		BotData.getUserDataFile().forEach((user: DataType.UserSave) => {
			let birthday = new Date(user?.birthday)
			if (birthday?.getDate() === new Date().getDate()
				&& birthday?.getMonth() === new Date().getMonth()) {
				if (announce)
					this.announceBirthday(user)
				birthdayList.push({ userId: user._id, date: new Date(user.birthday) })
			}
		})

		return birthdayList
	}

	static announceBirthday(user: DataType.UserSave, earrape?: boolean) {
		let bot: Bot = globalThis.bot

		bot.guilds.cache.forEach(guild => {
			if (guild.members.cache.has(user._id)) {
				let specialUser = guild.members.cache.get(user._id)

				let specialSong
					= "Happy Birthday to You\n" +
					"You live in a zoo\n" +
					"You look like a monkey\n" +
					"And you smell like one too.\n"

				/* const att =
					new Discord.MessageAttachment(fs.realpathSync('.') +
						'..\\..\\..\\bot_knowledge\\images\\birthday-stock-image.jpg',
						'birthday-stock.jpg') */

				let birthdayMesssage = new Discord.MessageEmbed()
					.setColor('#FFC0CB')
					.setFooter('🎂🎂🎂🎂🎂🎂🎂🎂🎂', 'https://img.icons8.com/bubbles/2x/birthday.png')
					.setTitle(`DOOT DOOT! IT'S SOMEONE'S BIRTHDAY!!!! `)
					.setDescription(`GIVE IT UP FOR ${specialUser.displayName}!!!!1111!! \n aite hit the mic \n\n\n${specialSong}`)
					.setImage(specialUser.user.avatarURL())
					//.attachFiles([att])
					.setThumbnail('https://i.redd.it/d33lp13fd6w11.jpg')

				if (new Date(user.birthday).getUTCFullYear() !== 6969)
					birthdayMesssage.addFields({
						name: `${specialUser.user.username} turns ` +
							(new Date().getUTCFullYear() - new Date(user.birthday).getUTCFullYear()),
						value: Bot.fetchRandomPhrase(PHRASES.birthday.singing)
					})

				if (earrape && specialUser.voice.channel) {
					bot.voiceChannel = specialUser.voice.channel as Discord.VoiceChannel
					bot.playAudioFromURL('https://www.youtube.com/watch?v=s6gLh6mf0Ig&ab_channel=jobv3')
				}

				if (guild.systemChannel)
					guild.systemChannel.send({ embeds: [birthdayMesssage] })
				/*
				TODO else
					guild.channels.cache.some(item => {

					}) */
				return true
			} else return false
		})
	}
}