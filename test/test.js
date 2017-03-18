'use strict';

var fs = require('fs');
var assert = require('chai').assert;
var mockery = require('mockery');
var bluebird = require('bluebird');
var requestP = require('request-promise');

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
            assertStop(trip.departure);
            assertStop(trip.arrival);
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

                assertStop(node.departure);
                assertStop(node.arrival);

                assert.isArray(node.stops);
                node.stops.forEach(assertStop);
            }

            assert.isArray(node.path);
            assert.isAbove(node.path.length, 0);
            node.path.forEach(assertCoords);
        }

        function assertStop(stop) {
            assert.isString(stop.stop);
            assert.isString(stop.city);
            assertCoords(stop.coords);

            if (stop.platform) {
                // workaround for station without platform
                // eg Lennéplatz
                assertPlatform(stop.platform);
            }

            if (stop.time) {
                assert.instanceOf(stop.time, Date);
            } else {
                assert.instanceOf(stop.arrival, Date);
                assert.instanceOf(stop.departure, Date);
            }
        }

        it('should return the correct origin and destination', function (done) {
            dvb.route(33000742, 33000037, new Date(), false)
                .then(function (data) {
                    assert.property(data, 'origin');
                    assert.strictEqual(data.origin.stop, 'Helmholtzstraße');
                    assert.strictEqual(data.origin.city, 'Dresden');

                    assert.property(data, 'destination');
                    assert.strictEqual(data.destination.stop, 'Postplatz');
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
                    assert.isArray(data.trips);
                    assert.isAbove(data.trips.length, 0);
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

describe('dvb.find', function () {
    describe('dvb.find "Postplatz"', function () {
        mockRequest('find-Postpl.json');

        function assertStop(stop) {
            assert(stop.stop);
            assert(stop.id);
            assert(stop.city);
            assert(Array.isArray(stop.coords));
            assert.strictEqual(2, stop.coords.length);
        }

        it('should return an array', function (done) {
            dvb.find('Postpl')
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
            dvb.find('Postpl')
                .then(function (data) {
                    assert.strictEqual('Postplatz', data[0].stop);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function (done) {
            dvb.find('Postpl', function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.find "0"', function () {
        mockRequest('find-0.json');

        it('should return an empty array', function (done) {
            dvb.find('0')
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert.equal(data.length, 0);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('dvb.find "xyz"', function () {
        mockRequest('find-xyz.json');

        it('should return an empty array', function (done) {
            dvb.find('xyz')
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

describe('dvb.pins', function () {
    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, stop"', function () {
        mockRequest('pins-stop.json');

        it('should resolve into an array', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'stop')
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert.notEqual(0, data.length);
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
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert.strictEqual(2, elem.coords.length);
                        assert.strictEqual(13, Math.floor(elem.coords[1]));
                        assert.strictEqual(51, Math.floor(elem.coords[0]));
                        assert.strictEqual(13, Math.floor(elem.coords[1]));
                        assert(Array.isArray(elem.connections));
                        elem.connections.forEach(function (con) {
                            assert(con.line);
                            assert(con.type);
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
                        assert(elem.name);
                        assert(elem.coords);
                        assert.strictEqual(2, elem.coords.length);
                        assert.strictEqual(13, Math.floor(elem.coords[1]));
                        assert.strictEqual(51, Math.floor(elem.coords[0]));
                        assert(elem.platform_nr);
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
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert.strictEqual(2, elem.coords.length);
                        assert.strictEqual(13, Math.floor(elem.coords[1]));
                        assert.strictEqual(51, Math.floor(elem.coords[0]));
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
                    assert(Array.isArray(data));
                    assert.equal(0, data.length);
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

        it('should resolve into an object with city and address properties', function (done) {
            dvb.address(51.025451, 13.722943)
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
            dvb.address(51.025451, 13.722943, function (err, data) {
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
                    assert.equal(null, data);
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
        mockRequest('pins-poi.json');

        it('should contain objects with name, coords and id', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.POI)
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
        mockRequest('coords-poi.json');

        it('coordinates should be equal', function (done) {
            dvb.coords(pins[0].id)
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

describe('internal utils', function () {
    var utils = require('../lib/utils');

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

function assertCoords(coords) {
    assert.isArray(coords);
    assert.lengthOf(coords, 2);
    assert.approximately(coords[0], 51, 1);
    assert.approximately(coords[1], 13, 1);
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