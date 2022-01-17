export type Options = {
    id: string;
    title: string;
};

export type ListContentsResponse<T> = {
    contents: T[];
    totalCount: number;
    offset: number;
    limit: number;
}