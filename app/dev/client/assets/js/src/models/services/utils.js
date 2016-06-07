class Utils {
    constructor() {
        this.windowResize = {
            subscribe: function (callback) {
                console.log('[Utils] Subscribing to window resize.');
                if (window.attachEvent) {
                    window.attachEvent('onresize', callback);
                } else if (window.addEventListener) {
                    window.addEventListener('resize', callback, true);
                }
            },
            unsubscribe: function (callback) {
                if (window.detachEvent) {
                    window.detachEvent('onresize', callback);
                } else if (window.removeEventListener) {
                    window.removeEventListener('resize', callback);
                }
            }
        };
    }
}

export default new Utils();
