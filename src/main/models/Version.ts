import { Author } from './Author';

export class Version {
    name: string;
    author: Author;
    id: string;
    description?: string;
    tag?: string;
    date: Date;

    constructor(
        name: string,
        author: Author,
        id: string,
        date: Date,
        description?: string,
        tag?: string
    ) {
        this.name = name;
        this.author = author;
        this.description = description;
        this.date = date;
        this.id = id;
        this.tag = tag;
    }
}
