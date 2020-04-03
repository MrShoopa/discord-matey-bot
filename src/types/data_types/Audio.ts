export module Audio {
    export interface SongObject {
        category: string,
        file: string,
        title: string,
        explicit?: boolean,
        play_phrase?: string,
        explicit_text?: string,
    }

    export function isSongObject(object: any): object is SongObject {
        return (object.file.toString() && object.title.toString() && object.category.toString())
    }

    export interface SFX {
        filePath: string,
        name: string
    }

    export class SFX {
        static MusicJoin: SFX = {
            filePath: `src/bot_knowledge/audio/sfx/music_join.mp3`,
            name: "music_join"
        }
        static MusicLeave: SFX = {
            filePath: `src/bot_knowledge/audio/sfx/music_leave.mp3`,
            name: "music_leave"
        }
    }
}