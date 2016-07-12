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

        /**
         * @method isMobile
         * @memberof helpers.Utils
         * @description Detects if a browser resides on mobile handset.
         *
         * @param {string} uaString Pass userAgent string for test purposes
         * @returns {boolean} True if a browser probably resides on mobile.
         */
        this.isMobile = function (uaString) {
            const mobile = {
                Android: function () {
                    return uaString.match(/Android/i);
                },
                BlackBerry: function () {
                    return uaString.match(/BlackBerry/i);
                },
                iOS: function () {
                    return uaString.match(/iPhone|iPad|iPod/i);
                },
                Opera: function () {
                    return uaString.match(/Opera Mini/i);
                },
                Windows: function () {
                    return uaString.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
                },
                any: function () {
                    return (mobile.Android() || mobile.BlackBerry() || mobile.iOS() || mobile.Opera() || mobile.Windows());
                }
            };

            if (mobile.any() || (window.innerWidth <= 800 && window.innerHeight <= 600) || typeof window.orientation !== 'undefined') {
                return true;
            }

            return false;
        };

        /**
         * @method browserDetails
         * @memberof helpers.Utils
         * @description Detection of the browser details.
         *
         * @param {string} uaString Pass userAgent string for test proposes
         * @returns {object} Returns an object with the following browser details:
         *   <ul>
         *   <li><code>OS</code> returns Windows/MacOS/Other
         *   <li><code>isOnWinRT</code> returns boolean
         *   <li><code>isOnWin8</code> returns boolean
         *   <li><code>name</code> returns the browser name
         *   <li><code>version</code> returns the browser version
         *   <li><code>hasActiveXEnabled</code> returns boolean
         *   <li><code>isIE64bits</code> returns boolean
         *   <li><code>isIE10</code> returns boolean
         *   <li><code>isIE10modern</code> returns boolean
         *   <li><code>isOnMobile</code> returns boolean
         *   <li><code>isAndroidNativeBrowser</code> returns boolean
         *   </ul>
         *
         */
        this.browserDetails = function (uaString) {
            const ua = (uaString || window.navigator.userAgent).toLowerCase(),
                check = function (r) {
                    return r.test(ua);
                },
                matches = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i),
                detected = {};

            let version, tridentVersion;

            // OS detection
            if (check(/windows|win32/i)) {
                detected.OS = 'Windows';
            } else if (check(/macintosh|mac os x/i)) {
                detected.OS = 'MacOS';
            } else if (check(/android/i)) {
                detected.OS = 'Android';
            } else {
                detected.OS = 'Other';
            }

            detected.isOnWinRT = check(/ arm;/i);
            detected.isOnWin8 = check(/windows nt 6\.2;/i);
            detected.isOnMobile = this.isMobile(ua);

            // browser name and version
            if (matches) {
                version = ua.match(/version\/([\.\d]+)/i);

                detected.name = matches[1];
                detected.version = parseFloat(version ? version[1] : matches[2]);

                // using trident version to check/correct IE version in compatibility mode
                // http://msdn.microsoft.com/en-us/library/ie/hh869301(v=vs.85).aspx
                if (detected.name === 'msie' && check(/trident/)) {
                    tridentVersion = parseFloat(ua.match(/trident\/([\.\d]+)/i)[1]);
                    if (detected.version - tridentVersion < 4) {
                        detected.version = tridentVersion + 4;
                    }
                }
            } else {
                detected.name = window.navigator.appName;
                detected.version = parseFloat(window.navigator.appVersion);
            }

            detected.isAndroidNativeBrowser = ((ua.indexOf('Mozilla/5.0') > -1 && ua.indexOf('Android ') > -1 && ua.indexOf('AppleWebKit') > -1) && (ua.indexOf('Version') > -1));

            detected.isIE11 = check(/trident\/7\.0;/i) && check(/ rv:11\.0/i);
            // IE11 has appName of Netscape and version of 5 - manually fix when isIE11 true
            if (detected.isIE11) {
                detected.name = 'msie';
                detected.version = 11;
            }

            // activeX enabled
            try {
                detected.hasActiveXEnabled = Boolean(new window.ActiveXObject('htmlfile'));
            } catch (e) {
                detected.hasActiveXEnabled = false;
            }

            detected.isIE64bits = check(/win64/i);
            detected.isIE10 = check(/trident\/6\.0/i) && check(/msie/i);
            detected.isIE10modern = detected.isIE10 && detected.isOnWin8 && !detected.hasActiveXEnabled;

            return detected;
        };
    }
}

export default new Utils();
