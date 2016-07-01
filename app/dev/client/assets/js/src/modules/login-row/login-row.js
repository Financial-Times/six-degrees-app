import {ObserverLocator} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import Cookies from '../../models/services/cookies.js';
import UserData from '../../models/services/user.data.js';

export class LoginRow {
    static inject() {
        return [ObserverLocator, Router];
    }
    constructor(observerLocator, router) {
        this.observerLocator = observerLocator;
        this.router = router;
        this.signedIn = Cookies.read('FTSession');
        this.loginRedirectUrl = encodeURIComponent(window.location.href);
    }

    attached() {
        this.signedIn = Cookies.read('FTSession');
        if (this.signedIn) {
            this.userDetails = UserData.getUserDetails();
            console.warn('userDetails', this.userDetails);
        } else {
            this.userDetails = null;
        }
    }
}
