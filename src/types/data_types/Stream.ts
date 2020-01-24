export module Stream {
    export interface SongInfo {
        source: string;
        url?: any;
        localFolder?: string
        name?: any;
        author?: string;
        authorImgUrl?: string;
        genre?: string
        platform?: string;
        length?: string;
        thumbnailUrl?: string;

        botPhrase?: string;
    }
}