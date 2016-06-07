import {LogManager} from 'aurelia-framework';
import {ConsoleAppender} from 'aurelia-logging-console';
import 'fetch';

LogManager.addAppender(new ConsoleAppender());
LogManager.setLevel(LogManager.logLevel.error);

export function configure(aurelia) {
    aurelia.use
        .defaultBindingLanguage()
        .defaultResources()
        .history()
        .router()
        .eventAggregator();

    aurelia.start().then(a => a.setRoot('main', document.body));
}
