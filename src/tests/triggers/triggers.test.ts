import Chai from 'chai'

import Bot from "../../Bot"
import TriggerHandlers from '../../bot_functions/TriggerHandlers'

globalThis.bot = new Bot()
let bot: Bot = globalThis.bot

bot.on('ready', () => {
    console.log(`Connected.`)
    console.log(`Please enter in a voice and text channel the bot can see before beginning.`)
    console.log(`then type 'test' with a following listed argument to run a test.`)
})

bot.on('message', message => {
    if (message.toString() === 'test everything') {
        testAllTriggersandFetchers
    }
})


//* TEST FUNCTIONS

export function testAllTriggersandFetchers(message = bot.context) {
    TriggerHandlers.validateMessage(message)
}

function printOptionsList() {
    console.group()
    console.log('   test everything - Does what it says.')
    console.error()
}
