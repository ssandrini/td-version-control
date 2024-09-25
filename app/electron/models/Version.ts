export class Version {
    name: string;
    author: Author;
    id: string
    description?: string;
    date: Date;

    constructor(name: string, author: Author, id: string, date: Date, description?: string) {
        this.name = name;
        this.author = author;
        this.description = description;
        this.date = date;
        this.id = id;
    }
}