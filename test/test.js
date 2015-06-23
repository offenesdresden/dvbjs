'use strict';

var assert = require('assert');
var dvb = require('../index.js');

describe('dvb.monitor "Postplatz"', function() {
    it('should return an array', function(done) {
        dvb.monitor('postplatz', 0, 5, function(err, data) {
            assert.ifError(err);
            assert(Array.isArray(data));
            done();
        });
    });

    it('should contain all three fields', function(done) {
        dvb.monitor('postplatz', 0, 5, function(err, data) {
            assert.ifError(err);
            assert(data[0].line);
            assert(data[0].direction);
            assert(typeof data[0].arrivaltime !== 'undefined');
            done();
        });
    });
});

describe('dvb.route "Prager Straße -> Postplatz"', function() {
    it('should return the correct origin and destination', function(done) {
        dvb.route('pragerstrasse', 'postplatz', new Date(), dvb.route.DEPATURE, function(err, data) {
            assert.ifError(err);
            assert(data.origin === 'Dresden, Prager Straße');
            assert(data.destination === 'Dresden, Postplatz');
            done();
        });
    });
});

describe('dvb.find "Zellescher Weg"', function() {
    it('should return an array', function(done) {
        dvb.find('zellesch',function(err, data) {
            assert.ifError(err);
            assert(Array.isArray(data));
            done();
        });
    });

    it('should find the correct stop', function(done) {
        dvb.find('zellesch', function(err, data) {
            assert.ifError(err);
            assert(data[0].stop === 'Zellescher Weg');
            done();
        });
    });
});
