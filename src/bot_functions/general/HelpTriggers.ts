import TriggerHandlers from '../TriggerHandlers';

import TRIGGERS from '../../bot_knowledge/triggers/triggers.json';

import PHRASES_FRONT from '../../bot_knowledge/phrases/phrases_front.json';
import PHRASES_SING from '../../bot_knowledge/phrases/phrases_sing.json';

export default class HelpTriggers {
    static checkForHelpInfoRequest(message = TriggerHandlers.message) {
        //  General Help
        for (const trigger of TRIGGERS.help_questions.actions)
            if (message.toString().toLowerCase().includes(trigger))
                return HelpTriggers.replyForGeneralInfo(message);
        //  SINGING HELP
        for (const trigger of TRIGGERS.help_questions.singing)
            if (message.toString().toLowerCase().includes(trigger))
                return HelpTriggers.replyForSingingInfo();
    }

    static replyForGeneralInfo(message = TriggerHandlers.message) {
        //  HELP //TODO: Add instructions for anime, twitter, inspirational quotes, etc. Convert to Rich Message.
        for (const trigger of TRIGGERS.help_questions.actions)
            if (message.toString().toLowerCase().includes(trigger)) {
                TriggerHandlers.bot.preliminary(trigger, 'Help with Actions', true);
                for (const x in PHRASES_FRONT) {
                    if (x.includes("help_secret"))
                        message.reply(PHRASES_FRONT.help_secret.main);
                    else if (x.includes("help_conversation"))
                        message.reply((PHRASES_FRONT.help_conversation.main +
                            PHRASES_FRONT.help_conversation.example.threat) +
                            '\n    ' +
                            PHRASES_FRONT.help_conversation.example.send_nudes);
                    else if (x.includes("help_"))
                        return message.reply(PHRASES_FRONT[x]);
                }
            }
    }

    static replyForSingingInfo(message = TriggerHandlers.message) {
        for (const trigger of TRIGGERS.help_questions.singing)
            if (message.toString().toLowerCase().includes(trigger)) {
                TriggerHandlers.bot.preliminary(trigger, 'Help with Singing', true);
                var songList = '';
                message.reply(PHRASES_SING.help_intro);
                message.reply(PHRASES_SING.help_url);
                PHRASES_SING.songs_to_sing.some(song => {
                    if (song.title != PHRASES_SING.songs_to_sing[0].title) {
                        songList += `\n ${song.title}`;
                        if (song.explicit == true) {
                            songList +=
                                PHRASES_SING.songs_to_sing[0].explicit_text;
                        }
                    }
                });
                return message.reply(songList);
            }
    }
}
