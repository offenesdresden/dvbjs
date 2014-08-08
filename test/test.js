var assert = require('assert');
var dvb = require('../index.js');


describe('dvb.monitor "Postplatz"', function(){
    it('should return an array', function(done){
        dvb.monitor('postplatz', 0, 5, function(data){
            if (Array.isArray(data)) done();
        });
    });
    it('should contain all three fields', function(done){
        dvb.monitor('postplatz', 0, 5, function(data){
            if (typeof(data[0].line) !== 'undefined' && typeof(data[0].direction) !== 'undefined' && typeof(data[0].arrivaltime) !== 'undefined') done();
        });
    });
});

var origin = "pragerstrasse";
var destination  = "postplatz";
var time = new Date();
var deparr = 0;

describe('dvb.route "Prager Straße -> Postplatz"', function(){
    it('should return the correct origin and destination', function(done){
        dvb.route(origin, destination, time, deparr, function(data){
            if (data.origin === 'Dresden, Prager Straße' && data.destination === 'Dresden, Postplatz') done();
        });
    });
});

describe('dvb.find "Zellescher Weg"', function(){
    it('should return an array', function(done){
        dvb.find('zellesch',function(data){
            if (Array.isArray(data.results)) done();
        });
    });
    it('should find the correct stop', function(done){
        dvb.find('zellesch', function(data){
            if (data.results[0].stop === 'Zellescher Weg') done();
        });
    });
});
