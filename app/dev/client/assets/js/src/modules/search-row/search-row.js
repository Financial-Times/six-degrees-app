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

                return people;
            }

            function update(people) {
                if (people && people.length) {
                    const peopleFiltered = [];

                    people.forEach((person) => {
                        if (person.name.indexOf(self.searchPhrase) === 0) {
                            peopleFiltered.push(person);
                        }
                    });
                    self.people = peopleFiltered;

                    document.getElementById('search-row').className += ' active';
                }
            }

            if (value && value.length > 2) {
                Search.findPeople({
                    'queryString': value
                }).then(parse).then(update);
            } else {
                self.people = null;
            }
        };
    }

    submit(event) {
        this.people = [];

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.searchPhrase) {
            PeopleData.acceptedSearchPerson(this.searchPhrase);
            this.inputField.blur();

            this.observerLocator.getObserver(PeopleData, 'elasticSearchPerson').subscribe((person) => {
                this.elasticSearchPerson = person;
            });

            console.warn('this.searchPhrase', this.searchPhrase);

            Search.findPerson({
                'queryString': this.searchPhrase
            }).then(response => {
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
                    this.theRouter.navigate('connections');
                }
            });


            this.searchPhrase = null;
        }
    }
}
