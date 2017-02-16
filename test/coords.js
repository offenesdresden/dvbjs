'use strict';

var Utils = require('./utils');
var utils = new Utils();
var assert = require('assert');
var pinTypes = require('../lib/pins').type;

describe('dvb.coords', function () {
    describe('dvb.coords "33000755"', function () {
        utils.mockRequest('coords-33000755.json');

        it('should resolve into a coordinate array [lat, lng]', function (done) {
            utils.dvb.coords('33000755')
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert.equal(data.length, 2);
                    assert.strictEqual(13, Math.floor(data[1]));
                    assert.strictEqual(51, Math.floor(data[0]));
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function (done) {
            utils.dvb.coords('33000755', function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.coords "123"', function () {
        utils.mockRequest('empty.json');

        it('should return null', function (done) {
            utils.dvb.coords("123")
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

describe('dvb.coords for id from dvb.pins', function () {

    var pins = [];

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, POI"', function () {
        utils.mockRequest('pins-poi.json');

        it('should contain objects with name, coords and id', function (done) {
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinTypes.POI)
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert.strictEqual(2, elem.coords.length);
                        assert.strictEqual(13, Math.floor(elem.coords[1]));
                        assert.strictEqual(51, Math.floor(elem.coords[0]));
                    });
                    pins = data;
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('dvb.coords should be equal to first pin coords', function () {
        utils.mockRequest('coords-poi.json');

        it('coordinates should be equal', function (done) {
            utils.dvb.coords(pins[0].id)
                .then(function (coords) {
                    assert.deepEqual(coords, pins[0].coords);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});