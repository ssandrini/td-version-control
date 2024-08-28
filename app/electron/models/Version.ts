export class Version {
    name: string;
    author: string;
    description?: string;
    date: Date;

    constructor(name: string, author: string, date: Date, description?: string) {
        this.name = name;
        this.author = author;
        this.description = description;
        this.date = date;
    }
}