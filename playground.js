const triggers = require(`./bot_knowledge/phrases/triggers/triggers.json`)
const phrases_sing = require(`./bot_knowledge/phrases/phrases_sing.json`)


phrases_sing.songs_to_sing.forEach(thing => {
    console.log(thing.title);
});
console.log(triggers.singing_triggers.forEach())