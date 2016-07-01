class Cookies {
    constructor() {

    }

    set(cookieName, cookieValue, cookieExpirationTime) {
        document.cookie = cookieName + '=' + cookieValue + '; expires=' + cookieExpirationTime;
    }

    read(cookieName) {
        const name = cookieName + '=',
            cookiesArray = document.cookie.split(';');

        let cookieValue = '';

        cookiesArray.forEach(cookie => {
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                cookieValue = cookie.substring(name.length, cookie.length);
            }
        });

        return cookieValue;
    }

    remove(cookieName) {
        document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}

export default new Cookies();
