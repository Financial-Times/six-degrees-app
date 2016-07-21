import {Router} from 'aurelia-router';
import {ObserverLocator} from 'aurelia-framework';
import PeopleData from '../models/services/people.data.js';
import GraphSettings from '../models/services/graph.settings.js';
import Content from '../models/services/content.js';
import Utils from '../models/services/utils.js';

export class Connections {
    static inject() {
        return [Router, ObserverLocator];
    }

    constructor(router, observerLocator) {
        this.router = router;
        this.observerLocator = observerLocator;
        this.generateShareLink = function () {
            const port = window.location.port;
            return PeopleData.activePerson ? window.location.protocol + '//' + window.location.hostname + (port ? ':' + port : '') + '/#/connections/' + PeopleData.activePerson.id.replace('http://api.ft.com/things/', '') : window.location.href;
        };
        this.shareLink = this.generateShareLink();
        this.contentInProgress = true;
    }

    attached() {
        if (PeopleData.activePerson) {
            this.person = PeopleData.activePerson;
        } else if (!PeopleData.activePerson && this.connectionsUuid) {
            PeopleData.setActiveByUuid(this.connectionsUuid);
            this.person = PeopleData.activePerson;
        } else {
            this.router.navigate('/');
        }

        this.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(() => {
            this.contentData = [];
            this.person = PeopleData.activePerson;
        });

        this.observerLocator.getObserver(PeopleData, 'duoContent').subscribe((duoContent) => {
            this.duoContent = duoContent;
        });

        this.observerLocator.getObserver(GraphSettings, 'shareLinkState').subscribe((state) => {
            this.shareLinkState = state;
            if (state) {
                this.shareLink = this.generateShareLink();
            }
        });

        this.observerLocator.getObserver(Content, 'data').subscribe(() => {
            this.contentData = Content.get();
        });

        this.observerLocator.getObserver(Content, 'filteredData').subscribe(() => {
            this.filteredData = Content.getFiltered();
        });

        this.observerLocator.getObserver(Content, 'inProgress').subscribe(() => {
            this.contentInProgress = Content.inProgress;
        });

    }

    activate(params) {
        this.connectionsUuid = params.id;
    }

    resetContent() {
        Content.clearFiltered();
        PeopleData.duoContent = null;
    }

    changePerson(event, id) {
        event.preventDefault();
        event.stopPropagation();
        PeopleData.setActive(id);
        this.person = PeopleData.activePerson;
    }

    copyShareLink() {
        let result;
        try {
            document.getElementById('connectionsShareLink').select();
            const successful = document.execCommand('copy');
            result = successful ? 1 : 0;
        } catch (err) {
            console.warn('Unable to copy to clipboard!');
        }

        if (!result) {
            let shortcut = 'Ctrl+C';
            GraphSettings.toggleShareLinkState();
            if (Utils.browserDetails().OS === 'MacOS') {
                shortcut = 'Cmd+C';
            }
            window.prompt('Copy link to clipboard: \'' +  shortcut + '\'', this.generateShareLink());//eslint-disable-line no-alert
        } else {
            GraphSettings.toggleShareLinkState();
        }
    }

}
