const triggers = require(`./bot-knowledge/phrases/triggers/triggers.json`)
const phrases_sing = require(`./bot-knowledge/phrases/phrases_sing.json`)


phrases_sing.songs_to_sing.forEach(thing => {
    console.log(thing.title);
});
console.log(triggers.singing_triggers.forEach())