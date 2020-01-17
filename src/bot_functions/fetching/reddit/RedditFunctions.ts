import Discord from 'discord.js'

import Bot from "../../../Bot"

export default class BotModuleReddit {
    static async fetchSomeCopypasta(trigger?: string) {
        let bot: Bot = globalThis.bot

        if (trigger) bot.preliminary(trigger, 'reddit copypasta fetch', true)

        let topPastaUrl = 'https://www.reddit.com/r/copypasta/top.json?limit=1'

        let pastaObject = await bot.fetchJSONFromURL(topPastaUrl)
            .catch((error: any) => {
                bot.textChannel.send(`Could not fetch. Error: ${error}`)
            })

        let delivery = new Discord.MessageEmbed()

        //  References reddit post
        delivery.setTitle(`From r/${pastaObject.data.children[0].data.subreddit}`)
        delivery.setAuthor(`Courtesy of u/${pastaObject.data.children[0].data.author}`)
        delivery.setURL(pastaObject.data.children[0].data.url)
        delivery.setColor('#FF5700')
        delivery.setFooter('Copypasta Fetcher - reddit',
            'https://icons-for-free.com/iconfiles/png/512/reddit+round+icon+icon-1320190507793599697.png')
        //  Replies back 'currently best' copypasta
        if (pastaObject.data.children[0].data.selftext == '')
            //  Replies by title if it's not in the subtext of the post.
            delivery.setDescription(pastaObject.data.children[0].data.title)
        else {

            let pasta = pastaObject.data.children[0].data.selftext

            if (pasta.length >= 2000) {
                console.log("Copypasta exceeds 2000 characters. 🔥🍝 Splitting...")

                delivery.setDescription(pasta)

                pasta = pasta.match(/(?!&amp;#x200B;)[\s\S]{1,2000}/g)

                pasta.forEach((chunk: any) => {
                    bot.textChannel.send(chunk)
                });
            } else delivery.setDescription(pastaObject.data.children[0].data.selftext)

        }

        bot.textChannel.send(delivery)
    }

    static async fetchImageFromSubmission(redditObject: any) {
        let bot: Bot = globalThis.bot

        // @see https://www.reddit.com/dev/api/ for more info.
        let image = await bot.fetchImageFromURL(redditObject.data.children[0].data.url)
        return image
    }
}