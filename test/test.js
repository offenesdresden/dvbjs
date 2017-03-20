'use strict';

var fs = require('fs');
var assert = require('chai').assert;
var mockery = require('mockery');
var bluebird = require('bluebird');
var requestP = require('request-promise');

var utils = require('../lib/utils');
var dvb;

function mockRequest(filename) {
    before(function (done) {
        var index = 0;

        if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('live') == -1) {
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

                if (process.env.NODE_ENV == 'test_update') {
                    return requestP(request).then(function (data) {
                        fs.writeFileSync(file_path, data + "\n", 'utf8');
                        return data;
                    });
                } else {
                    var result = fs.readFileSync(file_path, 'utf8');
                    return bluebird.resolve(result.trim())
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
        assert.isString(transport.line);
        assert.isString(transport.direction);

        assert.isNumber(transport.arrivalTimeRelative);
        assert.isNumber(transport.scheduledTimeRelative);
        assert.isNumber(transport.delayTime);

        assert.instanceOf(transport.arrivalTime, Date);
        assert.instanceOf(transport.scheduledTime, Date);

        assert.property(transport, 'state');

        assertMode(transport.mode);
        assertDiva(transport.diva);
        assertPlatform(transport.platform);
    }

    describe('dvb.monitor 33000037 (Postplatz)', function () {
        mockRequest('monitor-33000037.json');

        it('should return an array with elements', function (done) {
            dvb.monitor(33000037, 10, 5)
                .then(function (data) {
                    assert.isArray(data);
                    assert.lengthOf(data, 5);
                    done()
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should contain all five fields', function (done) {
            dvb.monitor(33000037, 0, 5)
                .then(function (data) {
                    data.forEach(assertTransport);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function () {
            dvb.monitor(33000037, 0, 5, function (err, data) {
                assert(data);
            }).then(assert)
        });
    });

    describe('dvb.monitor "Postplatz"', function () {
        mockRequest(['find-Postplatz.json', 'monitor-33000037.json']);

        it('should return an array with elements', function (done) {
            dvb.monitor('Postplatz', 10, 5)
                .then(function (data) {
                    assert.isArray(data);
                    assert.lengthOf(data, 5);
                    done()
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should contain all five fields', function (done) {
            dvb.monitor('Postplatz', 0, 5)
                .then(function (data) {
                    data.forEach(assertTransport);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function () {
            dvb.monitor('Postplatz', 0, 5, function (err, data) {
                assert(data);
            }).then(assert)
        });
    });

    describe('dvb.monitor "xyz"', function () {
        mockRequest('monitor-xyz.json');

        it('should return an empty array', function (done) {
            dvb.monitor('xyz', 0, 5)
                .then(function (data) {
                    assert.isArray(data);
                    assert.lengthOf(data, 0);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    })
});

describe('dvb.route', function () {
    describe('dvb.route "Helmholtzstraße -> Postplatz"', function () {
        mockRequest('route-helmholtzstraße-postplatz.json');

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

            if (node.mode.name != 'Footpath') {
                assertDiva(node.diva);

                assertStopWithTimes(node.departure);
                assertStopWithTimes(node.arrival);

                assert.isArray(node.stops);
                node.stops.forEach(assertStopWithTimes);
            }

            assert.isArray(node.path);
            assert.isAbove(node.path.length, 0);
            node.path.forEach(assertCoords);
        }

        it('should return the correct origin and destination', function (done) {
            dvb.route(33000742, 33000037, new Date(), false)
                .then(function (data) {
                    assert.isObject(data, 'origin');
                    assert.strictEqual(data.origin.name, 'Helmholtzstraße');
                    assert.strictEqual(data.origin.city, 'Dresden');

                    assert.property(data, 'destination');
                    assert.strictEqual(data.destination.name, 'Postplatz');
                    assert.strictEqual(data.destination.city, 'Dresden');

                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return an array of trips', function (done) {
            dvb.route(33000742, 33000037, new Date(), false)
                .then(function (data) {
                    assertNonEmptyArray(data.trips);
                    data.trips.forEach(assertTrip);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
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

        it('should return null', function (done) {
            dvb.route(0, 0)
                .then(function (data) {
                    assert.isNull(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});

describe('dvb.findStop', function () {
    describe('dvb.findStop "Postplatz"', function () {
        mockRequest('find-Postpl.json');

        it('should return an array', function (done) {
            dvb.findStop('Postpl')
                .then(function (data) {
                    assertNonEmptyArray(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should contain objects with name, city, coords and type', function (done) {
            dvb.findStop('Postpl')
                .then(function (data) {
                    assertNonEmptyArray(data);
                    data.forEach(assertStop);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should find the correct stop', function (done) {
            dvb.findStop('Postpl')
                .then(function (data) {
                    assert.strictEqual('Postplatz', data[0].name);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
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

        it('should return an empty array', function (done) {
            dvb.findStop('0')
                .then(function (data) {
                    assertEmptyArray(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('dvb.findStop "xyz"', function () {
        mockRequest('find-xyz.json');

        it('should return an empty array', function (done) {
            dvb.findStop('xyz')
                .then(function (data) {
                    assertEmptyArray(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    })
});

describe('dvb.findPOI', function () {
    describe('dvb.findPOI "Frauenkirche Dresden"', function () {
        mockRequest('find-Frauenkirche.json');

        it('should return an array', function (done) {
            dvb.findPOI('Frauenkirche Dresden')
                .then(function (data) {
                    assertNonEmptyArray(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should find the correct POIS', function (done) {
            dvb.findPOI('Frauenkirche Dresden')
                .then(function (data) {
                    data.forEach(function (data) {
                        assert.include(data.name, 'Frauenkirche');
                        assert.strictEqual(data.city, 'Dresden');
                        assert.isString(data.id);
                        assertCoords(data.coords);
                        assert.oneOf(data.type, [utils.POI_TYPE.STOP, utils.POI_TYPE.COORDS, utils.POI_TYPE.ADDRESS, utils.POI_TYPE.POI]);
                    });

                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.findPOI('Frauenkirche Dresden', function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });
});

describe('dvb.pins', function () {
    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, stop"', function () {
        mockRequest('pins-stop.json');

        it('should resolve into an array', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'stop')
                .then(function (data) {
                    assertNonEmptyArray(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should contain objects with id, name, coords and connections', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'stop')
                .then(function (data) {
                    data.forEach(function (elem) {
                        assert.isString(elem.id);
                        assert.isString(elem.name);
                        assertCoords(elem.coords);

                        assertNonEmptyArray(elem.connections);
                        elem.connections.forEach(function (con) {
                            assert.isString(con.line);
                            assert.isString(con.type);
                        });
                    });
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
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

        it('should contain objects with name, coords and platform_nr', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'platform')
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert.isString(elem.name);
                        assertCoords(elem.coords);
                        assert.isString(elem.platform_nr);
                    });
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, POI"', function () {
        mockRequest('pins-poi.json');

        it('should contain objects with name, coords and id', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.POI)
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert.isString(elem.id);
                        assert.isString(elem.name);
                        assertCoords(elem.coords);
                    });
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('dvb.pins "0, 0, 0, 0, stop"', function () {
        mockRequest('pins-empty.json');

        it('should resolve into an empty array', function (done) {
            dvb.pins(0, 0, 0, 0, dvb.pins.type.STOP)
                .then(function (data) {
                    assert.isArray(data);
                    assert.lengthOf(data, 0);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});

describe('dvb.address', function () {
    describe('dvb.address "51.025451, 13.722943"', function () {
        mockRequest('address-51-13.json');

        var lat = 51.025451;
        var lng = 13.722943;

        it('should resolve into an object with city, address and coords properties', function (done) {
            dvb.address(lat, lng)
                .then(function (address) {
                    assert.strictEqual(address.name, "Nöthnitzer Straße 46");
                    assert.strictEqual(address.city, "Dresden");
                    assert.strictEqual(address.type, utils.POI_TYPE.COORDS);
                    assert.isString(address.id);
                    assertCoords(address.coords);
                    assert.approximately(address.coords[0], lat, 0.01);
                    assert.approximately(address.coords[1], lng, 0.01);
                    done()
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should contain nearby stops', function (done) {
            dvb.address(lat, lng)
                .then(function (address) {
                    assertNonEmptyArray(address.stops);
                    address.stops.forEach(assertStop);
                    done()
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.address(lat, lng, function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.address "0, 0"', function () {
        mockRequest('address-0.json');

        it('should return null', function (done) {
            dvb.address(0, 0)
                .then(function (data) {
                    assert.isNull(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});

describe('dvb.coords', function () {
    describe('dvb.coords "33000755"', function () {
        mockRequest('coords-33000755.json');

        it('should resolve into a coordinate array [lat, lng]', function (done) {
            dvb.coords('33000755')
                .then(function (data) {
                    assertCoords(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
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

        it('should return null', function (done) {
            dvb.coords("123")
                .then(function (data) {
                    assert.isNull(data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});

describe('dvb.coords for id from dvb.pins', function () {
    mockRequest(['pins-poi.json', 'coords-poi.json']);

    it('coordinates should be equal for first pin', function (done) {
        dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.POI)
            .then(function (pins) {
                assertNonEmptyArray(pins);
                pins.forEach(function (elem) {
                    assert.isString(elem.id);
                    assertCoords(elem.coords);
                });

                dvb.coords(pins[0].id)
                    .then(function (coords) {
                        assert.deepEqual(coords, pins[0].coords);
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    });
            })
            .catch(function (err) {
                done(err);
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
});

function assertEmptyArray(array) {
    assert.isArray(array);
    assert.equal(array.length, 0, 'array should be empty')
}

function assertNonEmptyArray(array) {
    assert.isArray(array);
    assert.isAbove(array.length, 0, 'array should not be empty')
}

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