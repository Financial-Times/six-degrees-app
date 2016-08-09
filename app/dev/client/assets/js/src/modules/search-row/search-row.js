import {Router} from 'aurelia-router';
import {ObserverLocator} from 'aurelia-framework';
import Search from '../../models/services/search.js';
import PeopleData from '../../models/services/people.data.js';

export class SearchRow {
    static inject() {
        return [Router, ObserverLocator];
    }
    constructor(router, observerLocator) {
        this.theRouter = router;
        this.observerLocator = observerLocator;
        this.searchPhrase = null;
        this.acceptedPhrase = null;
        this.people = [];
        this.activeIndex = -1;
        this.inputField = null;
        this.searchPending = false;
        this.searchServerIssue = false;

        this.handleKey = event => {
            const people = this.people || [];

            if (people.length && (event.keyCode === 40 || event.keyCode === 38)) {

                this.activeIndex = (event.keyCode === 40) ? this.activeIndex + 1 : this.activeIndex - 1;

                if (this.activeIndex < 0) {
                    this.activeIndex = -1;
                }
                if (this.activeIndex > people.length - 1) {
                    this.activeIndex = people.length - 1;
                }

                if (this.activeIndex >= 0) {
                    this.searchPhrase = people[this.activeIndex].name;
                }
            }
        };

        this.handleInput = event => {
            const self = this,
                value = event.target.value;

            if (!self.inputField) {
                self.inputField = event.target;
            }

            function isNotRegularSalutation(salutation) {
                return ['Mr.', 'Ms.', 'Mrs.'].indexOf(salutation) > -1;
            }

            function parse(response) {
                const people = [];

                self.searchPending = false;
                self.searchServerIssue = false;

                if (response.length) {
                    response.forEach(person => {
                        const source = person._source; //eslint-disable-line no-underscore-dangle
                        let parsedPerson = {}; //eslint-disable-line prefer-const

                        Object.assign(parsedPerson, {
                            name: source.name,
                            uuid: source.uuid
                        }, source);

                        if (source) {
                            people.push(parsedPerson);
                        }
                    });
                }

                if (people && people.length) {
                    people.forEach(person => {
                        const aliases = [];
                        if (person.aliases && person.aliases.length) {
                            person.aliases.forEach((alias) => {
                                if (alias !== person.name) {
                                    aliases.push(alias);
                                }
                            });
                            person.aliases = aliases;
                        }
                    });

                    people.forEach(person => {
                        if (person.salutation && isNotRegularSalutation(person.salutation)) {
                            person.salutation = null;
                        }
                    });
                }
                return people;
            }

            function update(people) {
                if (people && people.length) {
                    const peopleFirstMatch = [],
                        peopleNoFirstMatch = [];
                    let peopleFiltered = [];

                    people.forEach((person) => {
                        if (person.name.indexOf(self.searchPhrase) === 0) {
                            peopleFirstMatch.push(person);
                        } else {
                            peopleNoFirstMatch.push(person);
                        }
                    });

                    peopleFiltered = peopleFiltered.concat(peopleFirstMatch).concat(peopleNoFirstMatch);

                    self.people = peopleFiltered;

                    if (self.people.length) {
                        self.notFound = false;
                        document.getElementById('search-row').className += ' active';
                    } else {
                        self.notFound = true;
                    }
                }
            }

            if (value && value.length > 2) {
                self.searchPending = true;
                Search.findPeople({
                    'queryString': value
                })
                    .then(parse)
                    .then(update)
                    .catch(error => {
                        self.searchPending = false;
                        self.searchServerIssue = true;
                        console.warn('Search error', error);
                    });
            } else {
                self.searchPending = false;
                self.people = null;
            }
        };
    }

    submit(event) {
        this.people = [];
        this.searchPending = true;

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.searchPhrase && !this.searchServerIssue) {
            PeopleData.acceptedSearchPerson(this.searchPhrase);
            this.inputField.blur();

            this.observerLocator.getObserver(PeopleData, 'elasticSearchPerson').subscribe((person) => {
                this.elasticSearchPerson = person;
            });

            Search.findPerson({
                'queryString': this.searchPhrase
            }).then(response => {
                this.searchPending = false;
                this.searchServerIssue = false;
                this.response = response.length ? response : [];

                if (this.response.length) {
                    this.response.forEach((person) => {
                        /*eslint-disable */
                        if (person._source) {
                            person.id = 'http://api.ft.com/things/' + person._id,
                            person.prefLabel = person._source.name;
                            person.name = PeopleData.getAbbreviatedName(person.prefLabel);
                        }
                        /*eslint-enable */
                    });

                    PeopleData.storeMentioned(this.response);
                    PeopleData.setActiveByName(this.response[0].prefLabel);
                    this.theRouter.navigate('connections/' + this.response[0]._id); //eslint-disable-line no-underscore-dangle
                }
            });


            this.searchPhrase = null;
        }
    }
}
