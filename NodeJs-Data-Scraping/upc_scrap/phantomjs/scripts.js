// modules
var system = require('system');
var page = require('webpage').create();
var args = system.args;
var fs = require('fs');

// variables
var loadInProgress = false;
var testindex = 0;
var productId = args[1] || null;
var upc_code = (args[2]).split(',');
var itemindex = 0;
var productName = null;
var brandName = null;
var upcLoading = true;
var counter = 0;
var elementCounter = 0;

function saveExitLog(str) {
    var path = './logs/exit.txt';
    str = str.concat(' *** ').concat((new Date()).toISOString());
    fs.write(path, '\n' + str, 'a');
}

function saveUpcCode(data) {
    console.log(JSON.stringify(data));
}

function saveLog(data) {
    var path = './logs/product.txt';
    data = data.concat(' *** ').concat((new Date()).toISOString());
    fs.write(path, '\n' + data, 'a');
}

function saveErrorUpcCode(data) {
    console.log(JSON.stringify(data));
}

function hasHtmlContent(str) {
    return str.indexOf('<') > -1;
}

page.settings.userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36";

page.onConsoleMessage = function(data) {
    var path = './logs/console.txt';
    data = data.concat(' *** ').concat((new Date()).toISOString());
    fs.write(path, '\n' + data, 'a');
};

page.onResourceError = function(resourceError) {
};

page.onAlert = function (data) {
    var path = './logs/alert.txt';
    data = data.concat(' *** ').concat((new Date()).toISOString());
    fs.write(path, '\n' + data, 'a');
};

page.onLoadStarted = function() {
    loadInProgress = true;
};

page.onLoadFinished = function(status) {
    loadInProgress = false;
    if (status !== 'success') {
        saveExitLog('PAGE LOAD FAILURE: ' + productId);
        phantom.exit();
    }
};

page.onCallback = function(data, loadingStatus, processStatus) {
    upcLoading = loadingStatus;
    loadInProgress = false;

    if (data && data.message === 'SERVER_ERROR') {
        saveExitLog('ABB SERVER ERROR 500');
        saveErrorUpcCode({message: 'SERVER_ERROR', productId: productId});
        phantom.exit();
    }

    if (processStatus) {
        counter = 0;
        var isHtml = hasHtmlContent(data.product_name);

        if (isHtml) {
            var htmlObj = {
                mismatch: JSON.stringify(data),
                product_upc_code: data.product_upc_code,
                maxReached: true,
                reason: 'PRODUCT NAME HAS HTML CONTENT'
            };

            saveErrorUpcCode(htmlObj);
            saveExitLog('PRODUCT NAME HTML CONTENT PRODUCT ID: ' + productId + ' UPC CODE: ' + data.product_upc_code);
            phantom.exit();
        } else if (productName === null && brandName === null) {
            productName = data.product_name;
            brandName = data.brand_name;
            saveUpcCode(data);
            saveLog('PRODUCT AND BRANDNAME: ' + productName + ' === ' + brandName);
        } else if (productName && brandName) {
            if (productName === data.product_name && brandName === data.brand_name) {
                saveLog('PHANTOM PROCESS VALID PRODUCT AND BRANDNAME: ' + productName + ' === ' + brandName);
                saveUpcCode(data);
            } else {
                saveLog('PHANTOM EXIT: PRODUCT AND BRANDNAME MISMATCH');
                saveLog('OLD PRODUCT AND BRANDNAME: ' + productName + '===' + brandName);
                saveLog('NEW PRODUCT AND BRANDNAME: ' + data.product_name + '===' + data.brand_name);
                var obj = {
                    mismatch: JSON.stringify(data),
                    product_upc_code: data.product_upc_code,
                    maxReached: true,
                    reason: 'PRODUCT AND BRANDNAME MISMATCH'
                };
                saveErrorUpcCode(obj);
                phantom.exit();
            }
        } else {
            saveExitLog('SOMETHING WENT WRONG PRODUCT ID: ' + productId);
            phantom.exit();
        }
    } else {
        saveLog('PHANTOM CATCH BLOCK UPC CODE: ' + data.product_upc_code);
        ++counter;
        if (counter > 10) {
            data.maxReached = true;
            data.reason = 'REACHED 10 CONTINOUS INVALID UPC CODE';
            saveErrorUpcCode(data);
            saveExitLog('REACHED 10 CONTINOUS INVALID UPC CODE PRODUCT ID: ' + productId);
            phantom.exit();
        } else {
            saveErrorUpcCode(data);
        }
    }
}

// setvalues
function setValues(index) {
    page.evaluate(function(upc_code) {
        // Right Eye
        document.getElementById('upc_r').value = upc_code;

        // search button
        var upcSearchBtn = document.getElementById('upcBtn_r');
        var event = document.createEvent( 'MouseEvents' );
        event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
        upcSearchBtn.dispatchEvent(event);
    }, upc_code[index]);
}

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    condition = true;
                    // phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
}

// get Values
function getValues() {
    waitFor(function() {
        return page.evaluate(function() {
            return $('#fmOptions_r div').length;
        });
    }, function() {
        page.evaluate(function() {
            try {
                // right eye
                var right_bc = document.getElementById('bc_r');
                var right_d = document.getElementById('d_r');
                var right_p = document.getElementById('p_r');
                var right_ot = document.getElementById('ot_r');
                var right_c = document.getElementById('c_r');
                var right_ax = document.getElementById('ax_r');
                var right_ad_r = document.getElementById('ad_r');
                // product details
                var product = document.querySelectorAll('#fmOptions_r div');

                var data = {
                    product_upc_code: document.getElementById('upc_r').value,
                    product_name: (typeof product[1].innerHTML !== 'undefined') ? product[1].innerHTML : null,
                    brand_name: (typeof product[0].innerHTML !== 'undefined') ? product[0].innerHTML : null,
                    specification: {
                        bc: (right_bc !== null) ? right_bc.value : null,
                        d: (right_d !== null) ? right_d.value : null,
                        p: (right_p !== null) ? right_p.value : null,
                        ot: (right_ot !== null) ? right_ot.options[right_ot.selectedIndex].innerHTML : null,
                        ot_v: (right_ot !== null) ? right_ot.options[right_ot.selectedIndex].value : null,
                        c: (right_c !== null) ? right_c.options[right_c.selectedIndex].innerHTML : null,
                        ax: (right_ax !== null) ? right_ax.value : null,
                        ad_r: (right_ad_r !== null) ? right_ad_r.options[right_ad_r.selectedIndex].innerHTML : null
                    }
                };

                window.callPhantom(data, true, true);
            } catch(e) {
                var upcCode = document.getElementById('upc_r').value;
                var data = {product_upc_code: upcCode};
                window.callPhantom(data, true, false);
            }
        });
    });
}

// execution steps
var steps = [

    // Open the url - 1
    function() {
        page.open('https://secure.abbconcise.com/login.aspx');
    },

    // login funcionality - 2
    function() {
        page.evaluate(function () {
            document.getElementById('txtaccountnumber').value = '80036643';
            document.getElementById('txtpassword').value = 'Env1$10n';

            var submitLogin = document.getElementById('btnLogin');
            var event = document.createEvent( 'MouseEvents' );
            event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
            submitLogin.dispatchEvent( event );
        });
    },

    // Home Page - 3
    function () {
        page.evaluate(function() {
            var status = document.getElementById('header');
            var msg = status !== null ? status.value : null;
            if (status === '<h1>Server Error</h1>') {
                var obj = {
                    message: 'SERVER_ERROR'
                };

                window.callPhantom(obj, true, false);
                phantom.exit();
            }
        });
        // page.evaluate(function () {
        // });
    },
    // Navigate to login page - 4
    function () {
        page.open('https://secure.abbconcise.com/Order/order_NewOrder.aspx');
    },

    // Click the UPC Code Tab - 5
    function() {
        page.evaluate(function() {
            var upcTab = document.getElementById('upcTab');
            var event = document.createEvent( 'MouseEvents' );
            event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
            upcTab.dispatchEvent(event);
        });
    },

    // UPC Code Search view - 6
    function() {
    },

    // Right Eye & Left Eye UPC Code - 7
    function() {
        setValues(itemindex);
    },

    // Right Eye Result - 8
    function() {
        getValues();
        if (upc_code[++itemindex]) {
            testindex = 6;
        } else {
            setTimeout(function() {
                saveExitLog('PRODUCT EXIT FROM FUNCTION: ' + productId);
                phantom.exit();
            }, 6000);
        }
    },

    // UPC Code Result
    function() {
    },
];

var intervalStart = setInterval( function() {
    var index = (itemindex < upc_code.length);

    if (!loadInProgress && typeof steps[testindex] == "function" && index) {
        if (testindex === 7 && upcLoading) {
            steps[testindex]();
            upcLoading = false;
            loadInProgress = true;
        } else if(testindex < 7) {
            steps[testindex]();
            testindex++;
        } else {
        }
    } else if(!index) {
        setTimeout(function() {
            saveExitLog('PRODUCT COMPLETE EXIT: ' + productId);
            phantom.exit();
        }, 10000);
        clearInterval(intervalStart);
    }
}, 1500);
