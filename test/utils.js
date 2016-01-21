'use strict';

var fs = require('fs');
var mockery = require('mockery');
var bluebird = require('bluebird');

var mockRequest = function mockRequest(filename) {
    before(function (done) {
        if (process.env.NODE_ENV != 'test_live') {
            mockery.enable({
                warnOnReplace: true,
                warnOnUnregistered: false,
                useCleanCache: true
            });
            mockery.registerMock('request-promise', function () {
                var response = fs.readFileSync(__dirname + '/data/' + filename, 'utf8');
                return bluebird.resolve(response.trim());
            });
        }
        done();
    });

    after(function (done) {
        mockery.disable();
        mockery.deregisterAll();
        done();
    });
};

exports.mockRequest = mockRequest;