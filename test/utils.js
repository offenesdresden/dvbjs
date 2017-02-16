var fs = require('fs');
var mockery = require('mockery');
var requestP = require('request-promise');

function Utils() {
    this.dvb = undefined;
}

Utils.prototype.mockRequest = function mockRequest(filename) {
    var self = this;
    before(function (done) {
        if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('test_live')) {
            var file_path = __dirname + '/data/' + filename;
            mockery.enable({
                warnOnReplace: true,
                warnOnUnregistered: false,
                useCleanCache: true
            });
            mockery.registerMock('request-promise', function (request) {
                if (process.env.NODE_ENV == 'test_live_update') {
                    return requestP(request).then(function (data) {
                        fs.writeFileSync(file_path, data + "\n", 'utf8');
                        return data;
                    });
                } else {
                    return fs.readFileSync(file_path, 'utf8').trim();
                }
            });
        }
        self.dvb = require('../index');
        done();
    });

    after(function (done) {
        mockery.disable();
        mockery.deregisterAll();
        done();
    });
};

module.exports = Utils;