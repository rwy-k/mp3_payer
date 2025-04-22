export type Track = {
    id: string;
    title: string;
    artist: string;
    album: string;
    genres: string[];
    audioFile?: string;
    slug?: string;
    coverImage?: string;
    createdAt?: string;
    updatedAt?: string;
};

export enum SortOptions {
    DESC = false,
    ASC = true,
}