export class OrigamiBusinesscard {
    constructor() {
        this.firstName = 'Lucy';
        this.lastName = 'Kellaway';
        this.email = 'lucy.kellaway@ft.com';
        this.ftComment = 'http://www.ft.com/comment/lucy-kellaway';
        this.imageUrl = 'http://image.webservices.ft.com/v1/images/raw/fthead:lucy-kellaway?source=docs&format=png&width=60';
        this.twitterUrl = '//twitter.com/LucyKellaway';
        this.twitterId = '@LucyKellaway';
        this.age = '54';
        this.nationality = 'British';
        this.background = 'Lucy Kellaway is an Associate Editor and management columnist of the FT. For the past 15 years her weekly Monday column has poked fun at management fads and jargon and celebrated the ups and downs of office life.';
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
