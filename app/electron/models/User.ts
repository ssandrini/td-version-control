export class User {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;

    constructor(id: number, username: string, email: string, avatarUrl: string) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.avatarUrl = avatarUrl;
    }
}
