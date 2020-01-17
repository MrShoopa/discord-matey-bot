export module Song {
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
}