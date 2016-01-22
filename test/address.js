'use strict';

var Utils = require('./utils');
var utils = new Utils();
var assert = require('assert');

describe('dvb.address', function () {
    describe('dvb.address "51.025451, 13.722943"', function () {
        utils.mockRequest('address-51-13.json');

        it('should resolve into an object with city and address properties', function (done) {
            utils.dvb.address(51.025451, 13.722943)
                .then(function (data) {
                    assert.strictEqual("Nöthnitzer Straße 46", data.address);
                    assert.strictEqual("Dresden", data.city);
                    done()
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function (done) {
            utils.dvb.address(51.025451, 13.722943, function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.address "0, 0"', function () {
        utils.mockRequest('empty.json');

        it('should return null', function (done) {
            utils.dvb.address(0, 0)
                .then(function (data) {
                    assert.equal(null, data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});