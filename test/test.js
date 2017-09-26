'use strict';
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;

var mockery = require('mockery');
var bluebird = require('bluebird');
var requestP = require('request-promise');
var fs = bluebird.promisifyAll(require('fs'));


var utils = require('../lib/utils');
var dvb;

function mockRequest(filename) {
    before(function (done) {
        var index = 0;

        if (!process.env.NODE_ENV || (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('live') === -1)) {
            mockery.enable({
                warnOnReplace: true,
                warnOnUnregistered: false,
                useCleanCache: true
            });

            mockery.registerMock('request-promise', function (request) {
                var file_path;

                if (filename instanceof Array) {
                    file_path = __dirname + "/data/" + filename[index % filename.length];
                    index++;
                } else {
                    file_path = __dirname + "/data/" + filename;
                }

                if (process.env.NODE_ENV === 'test_update') {
                    return requestP(request)
                        .catch(function (err) {
                            try {
                                utils.convertError(err);
                            } catch (error) {
                                var data = {
                                    Error: {
                                        name: error.name,
                                        message: error.message
                                    }
                                };
                                fs.writeFileSync(file_path, JSON.stringify(data) + "\n", 'utf8');
                                throw error;
                            }
                        })
                        .then(function (data) {
                            return fs.writeFileAsync(file_path, JSON.stringify(data) + "\n", 'utf8')
                                .then(function () {
                                    return data
                                });
                        })
                } else {
                    return fs.readFileAsync(file_path, 'utf8')
                        .then(JSON.parse)
                        .then(function (data) {
                            if (data.Error) {
                                throw utils.constructError(data.Error.name, data.Error.message);
                            }

                            return data;
                        })
                }
            });
        }

        dvb = require('../index');
        done();
    });

    after(function (done) {
        mockery.disable();
        mockery.deregisterAll();
        done();
    });
}

describe('dvb.monitor', function () {

    function assertTransport(transport) {
        assert.isString(transport.id);
        assert.isString(transport.line);
        assert.isString(transport.direction);

        assert.isNumber(transport.arrivalTimeRelative);
        assert.isNumber(transport.scheduledTimeRelative);
        assert.isNumber(transport.delayTime);

        assert.instanceOf(transport.arrivalTime, Date);
        assert.instanceOf(transport.scheduledTime, Date);

        assert.property(transport, 'state');

        assertMode(transport.mode);

        if (transport.line !== "E") {
            assertDiva(transport.diva);
        } else {
            assert.isUndefined(transport.diva);
        }
        assertPlatform(transport.platform);
    }

    describe('dvb.monitor 33000037 (Postplatz)', function () {
        mockRequest('monitor-33000037.json');

        it('should return an array with elements', function () {
            return dvb.monitor(33000037, 10, 5)
                .then(function (data) {
                    assert.isArray(data);
                    assert.lengthOf(data, 5);
                })
        });

        it('should contain all fields', function () {
            return dvb.monitor(33000037, 0, 5)
                .then(function (data) {
                    data.forEach(assertTransport);
                })
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.monitor(33000037, 0, 5, function (err, data) {
                assert(data);
                done();
            }).then(assert)
        });
    });

    describe('dvb.monitor "xyz"', function () {
        mockRequest('monitor-xyz.json');

        it('should reject with ValidationError', function () {
            return assert.isRejected(dvb.monitor('xyz'), 'stopid has to be not null and must be a number');
        });

        it('should return ValidationError with callback', function (done) {
            dvb.monitor('xyz', 0, 5, function (err, data) {
                assert.isUndefined(data);
                assert.instanceOf(err, Error);
                assert.strictEqual(err.message, 'stopid has to be not null and must be a number');
                assert.strictEqual(err.name, 'ValidationError');
                done();
            })
        });
    });

    describe('dvb.monitor 123 (invalid id)', function () {
        mockRequest('monitor-123.json');

        it('should reject with ServiceError', function () {
            return assert.isRejected(dvb.monitor(1242142343), 'stop invalid');
        });

        it('should return ServiceError with callback', function (done) {
            dvb.monitor(123, 0, 5, function (err, data) {
                assert.isUndefined(data);
                assert.instanceOf(err, Error);
                assert.strictEqual(err.name, 'ServiceError');
                assert.strictEqual(err.message, 'stop invalid');
                done();
            })
        });
    });
});

describe('dvb.route', function () {
    describe('dvb.route "33000742 (Helmholtzstraße) -> 33000037 (Postplatz)"', function () {
        mockRequest('route-33000742-33000037.json');

        function assertTrip(trip) {
            assertStopWithTimes(trip.departure);
            assertStopWithTimes(trip.arrival);
            assert.isNumber(trip.duration);
            assert.isNumber(trip.interchanges);

            assert.isArray(trip.nodes);
            trip.nodes.forEach(assertNode);
        }

        function assertNode(node) {
            assert.isString(node.line);
            assert.isString(node.direction);
            assert.isNumber(node.duration);

            assertMode(node.mode);

            if (node.mode.name !== 'Footpath' && node.mode.name !== 'StayForConnection') {
                assertDiva(node.diva);
            } else {
                assert.isUndefined(node.diva);
            }

            if (node.mode.name !== 'Footpath' || node.line === 'Fussweg') {
                assertStopWithTimes(node.departure);
                assertStopWithTimes(node.arrival);

                assert.isArray(node.stops);
                node.stops.forEach(assertStopWithTimes);
            } else {
                assert.isUndefined(node.departure);
                assert.isUndefined(node.arrival);
                assert.isUndefined(node.stops);
            }

            assert.isArray(node.path);
            if (node.mode.name !== 'StayForConnection') {
                assert.isNotEmpty(node.path);
                node.path.forEach(assertCoords);
            } else {
                assert.strictEqual(node.path.length, 0);
            }
        }

        it('should return the correct origin and destination', function () {
            return dvb.route(33000742, 33000037, new Date(), false)
                .then(function (data) {
                    assert.isObject(data, 'origin');
                    assert.strictEqual(data.origin.name, 'Helmholtzstraße');
                    assert.strictEqual(data.origin.city, 'Dresden');

                    assert.property(data, 'destination');
                    assert.strictEqual(data.destination.name, 'Postplatz');
                    assert.strictEqual(data.destination.city, 'Dresden');
                })
        });

        it('should return an array of trips', function () {
            return dvb.route(33000742, 33000037, new Date(), false)
                .then(function (data) {
                    assert.isNotEmpty(data.trips);
                    data.trips.forEach(assertTrip);
                })
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.route(33000742, 33000037, new Date(), true, function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.route "0 -> 0"', function () {
        mockRequest('route-0-0.json');

        it('should return empty trips', function () {
            return dvb.route(0, 0)
                .then(function (data) {
                    assert.isObject(data);
                    assert.isUndefined(data.origin);
                    assert.isUndefined(data.destination);
                    assert.isEmpty(data.trips);
                });
        });

        it('should return empty trips with callback', function (done) {
            dvb.route(0, 0, new Date(), true, function (err, data) {
                assert.isObject(data);
                assert.isUndefined(data.origin);
                assert.isUndefined(data.destination);
                assert.isEmpty(data.trips);
                assert.isNull(err);
                done();
            })
        });
    });

    describe('dvb.route "Helmholtzstraße -> Postplatz"', function () {
        mockRequest('route-Helmholtzstrasse-Postplatz.json');

        it('should return empty trips', function () {
            return dvb.route("Helmholtzstraße", "Postplatz")
                .then(function (data) {
                    assert.isObject(data);
                    assert.isUndefined(data.origin);
                    assert.isUndefined(data.destination);
                    assert.isEmpty(data.trips);
                });
        });

        it('should return empty trips with callback', function (done) {
            dvb.route("Helmholtzstraße", "Postplatz", new Date(), true, function (err, data) {
                assert.isObject(data);
                assert.isUndefined(data.origin);
                assert.isUndefined(data.destination);
                assert.isEmpty(data.trips);
                assert.isNull(err);
                done();
            })
        });
    });

    describe('dvb.route "123 -> 1234"', function () {
        mockRequest('route-123-1234.json');

        it('should reject with ServiceError', function () {
            return assert.isRejected(dvb.route(123, 1234), 'stop invalid');
        });

        it('should return ServiceError with callback', function (done) {
            dvb.route(123, 1234, new Date(), true, function (err, data) {
                assert.isUndefined(data);
                assert.instanceOf(err, Error);
                assert.strictEqual(err.message, 'stop invalid');
                assert.strictEqual(err.name, 'ServiceError');
                done();
            })
        });
    });
});

describe('dvb.findStop', function () {
    describe('dvb.findStop "Postplatz"', function () {
        mockRequest('find-Postpl.json');

        it('should return an array', function () {
            return dvb.findStop('Postpl')
                .then(function (data) {
                    assert.isNotEmpty(data);
                })
        });

        it('should contain objects with name, city, coords and type', function () {
            return dvb.findStop('Postpl')
                .then(function (data) {
                    assert.isNotEmpty(data);
                    data.forEach(assertStop);
                })
        });

        it('should find the correct stop', function () {
            return dvb.findStop('Postpl')
                .then(function (data) {
                    assert.strictEqual('Postplatz', data[0].name);
                })
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.findStop('Postpl', function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.findStop "0"', function () {
        mockRequest('find-0.json');

        it('should return an empty array', function () {
            return dvb.findStop('0')
                .then(function (data) {
                    assert.isEmpty(data);
                })
        });
    });

    describe('dvb.findStop "xyz"', function () {
        mockRequest('find-xyz.json');

        it('should return an empty array', function () {
            return dvb.findStop("xyz")
                .then(function (data) {
                    assert.isEmpty(data);
                })
        });
    });

    describe('dvb.findStop "123"', function () {
        mockRequest('find-123.json');

        it('should reject with ServiceError', function () {
            return assert.isRejected(dvb.findStop("123"), 'stop invalid');
        });

        it('should return ServiceError with callback', function (done) {
            dvb.findStop("123", function (err, data) {
                assert.isUndefined(data);
                assert.strictEqual(err.message, 'stop invalid');
                assert.strictEqual(err.name, 'ServiceError');
                done();
            })
        });
    });

    describe('dvb.findStop 123 (as number)', function () {
        mockRequest('find-123-number.json');

        it('should reject with ValidationError', function () {
            return assert.isRejected(dvb.findStop(123), 'query has to be a string');
        });

        it('should return ValidationError with callback', function (done) {
            dvb.findStop(123, function (err, data) {
                assert.isUndefined(data);
                assert.strictEqual(err.message, 'query has to be a string');
                assert.strictEqual(err.name, 'ValidationError');
                done();
            })
        });
    });
});

describe('dvb.findPOI', function () {
    describe('dvb.findPOI "Frauenkirche Dresden"', function () {
        mockRequest('find-Frauenkirche.json');

        it('should return an array', function () {
            return dvb.findPOI('Frauenkirche Dresden')
                .then(function (data) {
                    assert.isNotEmpty(data);
                })
        });

        it('should find the correct POIS', function () {
            return dvb.findPOI('Frauenkirche Dresden')
                .then(function (data) {
                    data.forEach(function (data) {
                        assert.include(data.name, 'Frauenkirche');
                        assert.strictEqual(data.city, 'Dresden');
                        assert.isString(data.id);
                        assertCoords(data.coords);
                        assert.oneOf(data.type, [utils.POI_TYPE.STOP, utils.POI_TYPE.COORDS, utils.POI_TYPE.ADDRESS, utils.POI_TYPE.POI]);
                    });
                })
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.findPOI('Frauenkirche Dresden', function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.findPOI "xyz"', function () {
        mockRequest('findPOI-xyz.json');

        it('should return an empty array', function () {
            return dvb.findPOI('xyz')
                .then(function (data) {
                    assert.isEmpty(data);
                })
        });
    });

    describe('dvb.findPOI "123"', function () {
        mockRequest('findPOI-0.json');

        it('should reject with SeviceError', function () {
            return assert.isRejected(dvb.findPOI('123'), 'stop invalid');
        });

        it('should return ServiceError with callback', function (done) {
            dvb.findPOI("123", function (err, data) {
                assert.isUndefined(data);
                assert.strictEqual(err.message, 'stop invalid');
                assert.strictEqual(err.name, 'ServiceError');
                done();
            })
        });
    })
});

describe('dvb.pins', function () {
    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, stop"', function () {
        mockRequest('pins-stop.json');

        it('should resolve into an array', function () {
            return dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'stop')
                .then(function (data) {
                    assert.isNotEmpty(data);
                })
        });

        it('should contain objects with id, name, coords and connections', function () {
            return dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'stop')
                .then(function (data) {
                    data.forEach(function (elem) {
                        assert.isString(elem.id);
                        assert.isString(elem.name);
                        assertCoords(elem.coords);

                        assert.isNotEmpty(elem.connections);
                        elem.connections.forEach(function (con) {
                            assert.isString(con.line);
                            assert.isString(con.type);
                        });
                    });
                })
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'stop', function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, platform"', function () {
        mockRequest('pins-platform.json');

        it('should contain objects with name, coords and platform_nr', function () {
            return dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'platform')
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert.isString(elem.name);
                        assertCoords(elem.coords);
                        assert.isString(elem.platform_nr);
                    });
                })
        });
    });

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, POI"', function () {
        mockRequest('pins-poi.json');

        it('should contain objects with name, coords and id', function () {
            return dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.POI)
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert.isString(elem.id);
                        assert.isString(elem.name);
                        assertCoords(elem.coords);
                    });
                })
        });
    });

    describe('dvb.pins "0, 0, 0, 0, stop"', function () {
        mockRequest('pins-empty.json');

        it('should resolve into an empty array', function () {
            return dvb.pins(0, 0, 0, 0, dvb.pins.type.STOP)
                .then(function (data) {
                    assert.isArray(data);
                    assert.lengthOf(data, 0);
                })
        });
    });
});

describe('dvb.findAddress', function () {
    describe('dvb.findAddress "51.025451, 13.722943"', function () {
        mockRequest('address-51-13.json');

        var lat = 51.025451;
        var lng = 13.722943;

        it('should resolve into an object with city, address and coords properties', function () {
            return dvb.findAddress(lat, lng)
                .then(function (address) {
                    assert.strictEqual(address.name, "Nöthnitzer Straße 46");
                    assert.strictEqual(address.city, "Dresden");
                    assert.strictEqual(address.type, utils.POI_TYPE.COORDS);
                    assert.isString(address.id);
                    assertCoords(address.coords);
                    assert.approximately(address.coords[0], lat, 0.01);
                    assert.approximately(address.coords[1], lng, 0.01);
                })
        });

        it('should contain nearby stops', function () {
            return dvb.findAddress(lat, lng)
                .then(function (address) {
                    assert.isNotEmpty(address.stops);
                    address.stops.forEach(assertStop);
                })
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.findAddress(lat, lng, function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.findAddress "0, 0"', function () {
        mockRequest('address-0-0.json');

        it('should reject with ServiceError', function () {
            return assert.isRejected(dvb.findAddress(0, 0), 'no it connection');
        });

        it('should return ServiceError with callback', function (done) {
            dvb.findAddress(0, 0, function (err, data) {
                assert.isUndefined(data);
                assert.strictEqual(err.message, 'no it connection');
                assert.strictEqual(err.name, 'ServiceError');
                done();
            })
        });
    });
});

describe('dvb.coords', function () {
    describe('dvb.coords "33000755"', function () {
        mockRequest('coords-33000755.json');

        it('should resolve into a coordinate array [lat, lng]', function () {
            return dvb.coords('33000755')
                .then(function (data) {
                    assertCoords(data);
                })
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.coords('33000755', function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.coords "123"', function () {
        mockRequest('coords-123.json');

        it('should return null', function () {
            return dvb.coords("123")
                .then(function (data) {
                    assert.isNull(data);
                })
        });
    });
});

describe('dvb.coords for id from dvb.pins', function () {
    mockRequest(['pins-poi.json', 'coords-poi.json']);

    it('coordinates should be equal for first pin', function () {
        return dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.POI)
            .then(function (pins) {
                assert.isNotEmpty(pins);
                pins.forEach(function (elem) {
                    assert.isString(elem.id);
                    assertCoords(elem.coords);
                });

                return dvb.coords(pins[0].id)
                    .then(function (coords) {
                        assert.deepEqual(coords, pins[0].coords);
                    })
            })
    });
});

describe('dvb.lines', function () {
    describe('dvb.lines "33000037" (Postplatz)', function () {
        mockRequest('lines-33000037.json');

        it('should return an array', function () {
            return dvb.lines(33000037)
                .then(function (data) {
                    assert.isNotEmpty(data);
                })
        });

        it('should contain objects with name, mode, diva and directions', function () {
            return dvb.lines(33000037)
                .then(function (data) {
                    data.forEach(function (line) {
                        assert.isString(line.name);
                        assertMode(line.mode);
                        assertDiva(line.diva);
                        assert.isNotEmpty(line.directions);
                        line.directions.forEach(function (direction) {
                            assert.isString(direction);
                        })
                    });
                })
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.lines(33000037, function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.lines "123"', function () {
        mockRequest('lines-123.json');

        it('should reject with ServiceError', function () {
            return assert.isRejected(dvb.lines(123), 'stop invalid');
        });

        it('should return ServiceError with callback', function (done) {
            dvb.lines(123, function (err, data) {
                assert.isUndefined(data);
                assert.strictEqual(err.message, 'stop invalid');
                assert.strictEqual(err.name, 'ServiceError');
                done();
            })
        });
    });
});

describe('internal utils', function () {

    describe('parseMode', function () {
        var mots = [
            ['Tram', 'Tram'],
            ['Bus', 'Bus'],
            ['Citybus', 'Bus'],
            ['Intercitybus', 'Bus'],
            ['Suburbanrailway', 'SuburbanRailway'],
            ['Train', 'Train'],
            ['Rapidtransit', 'Train'],
            ['Footpath', 'Footpath'],
            ['Cableway', 'Cableway'],
            ['Overheadrailway', 'Cableway'],
            ['Ferry', 'Ferry'],
            ['Hailedsharedtaxi', 'HailedSharedTaxi'],
            ['Mobilitystairsup', 'StairsUp'],
            ['Mobilitystairsdown', 'StairsDown'],
            ['Mobilityescalatorup', 'EscalatorUp'],
            ['Mobilityescalatordown', 'EscalatorDown'],
            ['Mobilityelevatorup', 'ElevatorUp'],
            ['Mobilityelevatordown', 'ElevatorDown']
        ];

        mots.forEach(function (mot) {
            it('should parse `' + mot[0] + '` to `' + mot[1] + '`', function (done) {
                var mode = utils.parseMot(mot[0]);
                assertMode(mode);
                assert.strictEqual(mode.name, mot[1]);
                done();
            })
        });
    });

    describe('checkStatus', function () {
        it('should throw "unexpected error"', function () {
            assert.throws(utils.checkStatus, 'unexpected error');
        });

        it('should throw error: "foo: bar"', function () {
            try {
                utils.checkStatus({Status: {Code: 'foo', Message: 'bar'}});
                assert.fail('checkStatus did not throw an error');
            } catch (error) {
                assert.strictEqual(error.name, 'foo');
                assert.strictEqual(error.message, 'bar');
            }
        });
    });

    describe('construct error', function () {
        it('should throw error: "foo: bar"', function () {
            var error = utils.constructError("foo", "bar");

            assert.instanceOf(error, Error);
            assert.strictEqual(error.name, 'foo');
            assert.strictEqual(error.message, 'bar');
        });

        it('should throw error: "foo"', function () {
            var error = utils.constructError("foo");

            assert.instanceOf(error, Error);
            assert.strictEqual(error.name, 'foo');
            assert.strictEqual(error.message, '');
        });

        it('should throw error: "Error: bar"', function () {
            var error = utils.constructError(undefined, "bar");

            assert.instanceOf(error, Error);
            assert.strictEqual(error.name, 'Error');
            assert.strictEqual(error.message, 'bar');
        });
    });

    describe('convert error', function () {
        it('should throw error: "foo: bar"', function () {
            try {
                var err = new Error('400 - foo: bar');
                err.error = {Status: {Code: 'foo', Message: 'bar'}};
                utils.convertError(err);
                assert.fail('checkStatus did not throw an error');
            } catch (error) {
                assert.strictEqual(error.name, 'foo');
                assert.strictEqual(error.message, 'bar');
            }
        });
    });
});

function assertCoords(coords, delta) {
    delta = delta ? delta : 75;

    assert.isArray(coords);
    assert.lengthOf(coords, 2);

    if (coords[0] || coords[1]) {
        // workaround for stops without coordinates
        assert.approximately(coords[0], 51, delta);
        assert.approximately(coords[1], 13, delta);
    } else {
        assert.isUndefined(coords[0]);
        assert.isUndefined(coords[1]);
    }
}

function assertPlatform(platform) {
    assert.isObject(platform);

    assert.property(platform, 'name');
    assert.isString(platform.name);

    assert.property(platform, 'type');
    assert.isString(platform.type);
}

function assertDiva(diva) {
    assert.isObject(diva);

    assert.property(diva, 'number');
    assert.isNumber(diva.number);

    assert.property(diva, 'network');
    assert.isString(diva.network);
}

function assertMode(mode) {
    assert.isObject(mode);

    assert.isString(mode.name);
    assert.isString(mode.title);

    assert.isString(mode.icon_url);
}

function assertStop(stop) {
    assert.isObject(stop);

    assert.isString(stop.name);
    assert.isString(stop.city);
    assertCoords(stop.coords);

    if (stop.platform) {
        // workaround for station without platform
        // eg Lennéplatz
        assertPlatform(stop.platform);
    }

    assert.strictEqual(stop.type, utils.POI_TYPE.STOP);
}

function assertStopWithTimes(stop) {
    assertStop(stop);

    if (stop.time) {
        assert.instanceOf(stop.time, Date);
    } else {
        assert.instanceOf(stop.arrival, Date);
        assert.instanceOf(stop.departure, Date);
    }
}
