import Discord from 'discord.js'

import Bot from "../../../Bot"
import BotData from "../../DataHandler"

import * as CALENDAR from "../../../bot_knowledge/calendar/values.json"

export default class BotModuleBirthday {

	static assignBirthdaySelf = (trigger?: string) => {
		let bot: Bot = globalThis.bot
		//  Trim trigger for easier parsing of date
		bot.preliminary(trigger, "Birthday reminder", true)
		let context: string = bot.context.toString().replace(trigger, "").trim()

		let birthday: Date

		CALENDAR.months.forEach(month => {
			if (context.toLowerCase().includes(month)) {

				let dateNumber: number = parseInt(context.match(/([0-9])\w+/g)[0].toString())
				let monthNumber: number = CALENDAR.months.findIndex((item, i) => {
					return item === month
				})
				let yearNumber: number = parseInt(context.match(/([0-9])\w+/g)[1]?.toString())

				if ((1 <= dateNumber) && (31 >= dateNumber)) {
					// Construct birthday object
					if (!yearNumber) yearNumber = 2120

					birthday = new Date(yearNumber, monthNumber, dateNumber)

				} else {
					return bot.context.reply('Invalid date. Include a date from 1-31.')
				}
			}

		});

		if (!birthday)
			return bot.context.reply(`Invalid date. Type the month and date like this: 'September 10 (year optional)'`)

		// TODO? Shrink code further + Take off error handling?
		let userData = BotData.getUserData(bot.context.author.id)

		if (userData === undefined) {
			BotData.createUserData(bot.context.author.id)
			userData = BotData.getUserData(bot.context.author.id)
		}

		try {
			userData.birthday = birthday

			if (!userData.birthday) {
				bot.context.reply(`your birthday has been recorded as ` +
					`${CALENDAR.months_prettier[birthday.getMonth()]} ${birthday.getDate().toLocaleString()}!`)
			} else {
				bot.context.reply(`your birthday has been updated to ` +
					`${CALENDAR.months_prettier[birthday.getMonth()]} ${birthday.getDate().toLocaleString()}!`)
			}

		} catch (error) {
			bot.saveBugReport(error, true)
			return bot.context.reply(`I couldn't save your birthday for some reason... :(`)
		}


		return BotData.updateUserData(bot.context.author.id, userData)
	}

	static inquireBirthdaySelf = (trigger?: string) => {
		let bot: Bot = globalThis.bot;
		bot.preliminary(trigger, 'Birthday Inquiry', true);

		let userData = BotData.getUserData(bot.context.author.id)

		if (userData?.birthday === undefined) {
			bot.context.reply(`Looks like I don't know it? Maybe tell me to remember? 🍰`)
		} else {
			let birthday = new Date(userData.birthday)
			bot.context.reply(`your birthday is on ${CALENDAR.months_prettier[birthday.getMonth()]} ${birthday.getDate()}! `)

			let difToleranceMs = 2160000000
			let birthdayFromNowMs = (birthday.getMilliseconds() - Date.now())

			if (birthday.getMonth() === new Date().getMonth()
				&& birthday.getDate() === new Date().getDate())
				bot.context.channel.send(`Hey, your birthday's today! I hope you have a great one! 🎂🎉`)
			else if (Math.abs(birthdayFromNowMs) < difToleranceMs && birthdayFromNowMs > 0)
				bot.context.channel.send(`Looks like your birthday's coming up soon! I'm excited!`)
			else if (Math.abs(birthdayFromNowMs) < difToleranceMs && birthdayFromNowMs < 0)
				bot.context.channel.send(`Looks like your birthday came by recently!`)

		}

		return
	}

	//	TODO: improve and make this flashy af
	static checkBirthdays() {
		let bot: Bot = globalThis.bot

		BotData.getUserDataFile().forEach(user => {
			let birthday = new Date(user?.birthday)
			if (birthday.getDate() === new Date().getDate()
				&& birthday.getMonth() === new Date().getDate())
				bot.guilds.forEach(guild => {
					if (guild.members.has(user._id)) {
						let specialUser = guild.members.get(user._id)

						let specialSong
							= "Happy Birthday to You\n" +
							"You live in a zoo\n" +
							"You look like a monkey\n" +
							"And you smell like one too.\n"

						guild.systemChannel.send(new Discord.MessageEmbed()
							.setColor('#FFC0CB')
							.setTitle(`DOOT DOOT! IT'S SOMEONE'S BIRTHDAY!!!! `)
							.setDescription(`GIVE IT THE F UP FOR ${specialUser.nickname}!!!!1111!! \n aite hit the mic \n\n\n`)
							.setImage(specialUser.user.avatar)
							.setThumbnail('./bot_knowledge/images/birthday-stock-image.jpg')
						)
					}
				});
		});
	}
}