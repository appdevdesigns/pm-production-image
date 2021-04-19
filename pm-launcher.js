/**
 * The `local.js` file may get updated by the api_sails process at startup.
 * We wait for that to happen before starting up process manager.
 * The `pm-launcher.js` name also helps to differentiate this process from
 * all the other `node app.js` ones that may be running at the same time.
 *
 * 1. Check that /app/config/local.js exists
 * 2. Wait for Docker to initialize `api_sails` domain
 * 3. Wait until Sails is accessible
 * 4. Launch process manager service
 */

const fs = require('fs');
const http = require('http');
const dns = require('dns');
const async = require('async3');

const SAILS_HOST = 'api_sails';
const SAILS_PORT = 1337;
const TIMEOUT_MS = 1000 * 60 * 2; // 2 minutes


/**
 * Step 1: Check local.js file
 */
if (!fs.existsSync('/app/config/local.js')) {
    console.error('Error: /app/config/local.js file not found.');
    process.exit(1);
}

async.series(
    [
        (done) => {
            // Wait 5 seconds
            setTimeout(() => {
                done();
            }, 5000);
        },

        /**
         * Step 2: Wait for Docker stack to initialize `api_sails` domain
         */
        (done) => {
            console.log('Looking for api_sails domain...');
            var isDomainThere = false;
            var startTime = Date.now();
            async.doUntil(
                // do iterations
                (next) => {
                    dns.lookup(SAILS_HOST, 4, (err, address, family) => {
                        if (err) {
                            isDomainThere = false;
                            setTimeout(() => {
                                next();
                            }, 500)
                        }
                        else {
                            isDomainThere = true;
                            next();
                        }
                    });
                },
                // terminating condition
                (until) => {
                    // Success
                    if (isDomainThere) {
                        until(null, true);
                    }
                    // Timed out
                    else if (Date.now() - startTime >= TIMEOUT_MS) {
                        console.error(`Timeout while waiting for domain`)
                        process.exit(1);
                    }
                    // Try again
                    else {
                        until(null, false);
                    }
                },
                // final
                (err) => {
                    done();
                }
            );
        },

        /**
         * Step 3: Wait until Sails is accessible
         */
        (done) => {
            var isSailsLifted = false;
            var startTime = Date.now();
            console.log('Waiting for Sails...');
            async.doUntil(
                // do iterations
                (next) => {
                    http.get(
                        `http://${SAILS_HOST}:${SAILS_PORT}/robots.txt`,
                        { timeout: 5 * 1000 },
                        (res) => {
                            isSailsLifted = true;
                            next();
                        }
                    )
                        .on('error', (err) => {
                            isSailsLifted = false;
                            setTimeout(() => {
                                next();
                            }, 500);
                        });
                },
                // terminating condition
                (until) => {
                    // Success
                    if (isSailsLifted) {
                        until(null, true);
                    }
                    // Timed out
                    else if (Date.now() - startTime >= TIMEOUT_MS) {
                        console.error(`Timeout while waiting for Sails to lift`)
                        process.exit(1);
                    }
                    // Keep trying
                    else {
                        until(null, false);
                    }
                },
                // final
                (err) => {
                    console.log('OK!');
                    done();
                }
            );
        },
    ],

    (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        else {
            /**
             * Step 4: Start Process Manager
             */
            console.log('Starting Process Manager');
            require(__dirname + '/app.js');
        }
    }
);

