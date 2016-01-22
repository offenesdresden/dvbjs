'use strict';

var Utils = require('./utils');
var utils = new Utils();
var assert = require('assert');

describe('dvb.find', function () {
    describe('dvb.find "Zellescher Weg"', function () {
        utils.mockRequest('find-zellescherweg.json');

        function assertStop(stop) {
            assert(stop.stop);
            assert(Array.isArray(stop.coords));
            assert.strictEqual(2, stop.coords.length);
            assert.strictEqual(51, Math.floor(stop.coords[0]));
            assert.strictEqual(13, Math.floor(stop.coords[1]));
        }

        it('should return an array', function (done) {
            utils.dvb.find('zellesch')
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert(data.length > 0);
                    data.forEach(assertStop);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should find the correct stop', function (done) {
            utils.dvb.find('zellesch')
                .then(function (data) {
                    assert.strictEqual('Zellescher Weg', data[0].stop);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function (done) {
            utils.dvb.find('zellesch', function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.find "0"', function () {
        utils.mockRequest('empty_json.json');

        it('should return an empty array', function (done) {
            utils.dvb.find('0#')
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert.equal(data.length, 0);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    })
});