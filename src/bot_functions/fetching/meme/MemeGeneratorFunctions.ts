import Discord from 'discord.js'
import Bot from '../../../Bot.js'

import BotModuleReddit from '../reddit/RedditFunctions.js'

import REFS_IMGFLIP from '../../../bot_knowledge/references/imgflip.js'

import KEYS from '../../../user_creds.js'

import Flipper from 'imgflip'

export default class BotModuleMeme {
    static ImgFlip = new Flipper({
        username: KEYS.img_flip.user,
        password: KEYS.img_flip.password
    })

    static async fireMemeRequest(context: Discord.Message = globalThis.bot.context) {
        globalThis.bot.preliminary('lol', `meme fetch`, true)

        let response
        let stringed = context.toString()

        try {
            for (const meme of REFS_IMGFLIP.memes)
                if (context.toString().toLowerCase().includes(meme.name))
                    response = await this.fetchCustomMeme(stringed.substring(stringed.indexOf(meme.name) + meme.name.length).trim(), meme.name)
            if (context.toString().length == 4) {
                response = await this.fetchRandomMeme()
            }
        } catch (err) {
            if (err.statusCode == 404) {
                response = `Meme not found.`
            } else if (err.statusCode == 403 || err.statusCode == 401) {
                response = 'Nag my master to get this working again. :)'
            } else if (err.statusCode == 500) {
                response = `Can't get meme. Something happened out of my control.`
            }
        }

        if (!response)
            response = `Couldn't find your meme. Type *megadork meme list* for list of memes you can get.`

        return context.channel.send({ embeds: [response] })
    }

    static async fetchRandomMeme() {
        let object = await BotModuleReddit.fetchRandomSubmission('meme')
        let message = this.buildMemeMessage(object.data.url, 'Random r/meme meme')

        return message
    }

    static async fetchCustomMeme(params, topic: string) {
        let templateId: string

        for (const meme of REFS_IMGFLIP.memes)
            if (topic == meme.name) {
                templateId = meme.id
                break
            }
        if (!templateId)
            return null

        let image: any

        try {
            if (params.length !== 0 && !params.match(/".+?"/g)) {
                return 'invalid'
            } else if (params.match(/".+?"/g)) {
                params = params.match(/".+?"/g).map((a: string) => {
                    return a.replace(/"/g, '')
                })

                image = await this.ImgFlip.meme(templateId, {
                    captions: params,
                    //? path: `${topic}.png`
                })
            } else {
                image = await this.ImgFlip.meme(templateId, {
                    captions: params
                    //? path: `${topic}.png`
                })
            }
        } catch (err) {
            throw new err
        }

        return this.buildMemeMessage(image, topic)
    }

    static buildMemeMessage(imageUrl, name?: string) {
        let message = new Discord.MessageEmbed()
            .setColor('LUMINOUS_VIVID_PINK')
            .setFooter('ImgFlip Mega-Meme Generator 😂👌')
            .setImage(imageUrl)

        if (name)
            message.setTitle(name)

        return message
    }
}