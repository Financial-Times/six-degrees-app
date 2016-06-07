(function () {

    const enhancedOrigami = ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);

    function dispatchOrigamiEvents() {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
        }
        document.addEventListener('DOMContentLoaded', function () {
            document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
        });
    }

    (function init() {
        dispatchOrigamiEvents();
        if (enhancedOrigami) {
            document.documentElement.className = document.documentElement.className.replace(/\bcore\b/g, 'enhanced');
        }
    }());
}());

export class App {
    configureRouter(config, router) {
        config.map([{
            route: ['', 'home'],
            name: 'home',
            moduleId: './pages/home',
            nav: true
        }, {
            route: ['connections'],
            name: 'connections',
            moduleId: './pages/connections'
        }]);

        this.router = router;
    }
}
