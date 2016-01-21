'use strict';

var dvb = require('../index');
var utils = require('./utils');
var assert = require('assert');

describe('dvb.pins', function () {
    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, stop"', function () {
        utils.mockRequest('pins-stop.json');

        it('should resolve into an array', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.STOP, {})
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert.notEqual(0, data.length);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should contain objects with id, name, coords, type and connections', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.STOP, {})
                .then(function (data) {
                    data.forEach(function (elem) {
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert(elem.type);
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
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'stop', {}, function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });

        describe('test options', function () {

            it('default: connections, not groued, only title of line type', function (done) {
                var hasConnections = false;
                dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.STOP, {})
                    .then(function (data) {
                        assert.notEqual(0, data.length);
                        data.forEach(function (elem) {
                            assert(elem.connections);
                            if (elem.connections.length > 0) {
                                hasConnections = true;
                            }
                            elem.connections.forEach(function (connection) {
                                assert(connection.type);
                                assert(connection.line);
                                assert.equal(Array.isArray(connection.line), false);
                            });
                        });
                        assert(hasConnections);
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    });
            });

            it('showLines: false', function (done) {
                dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.STOP, {showLines: false})
                    .then(function (data) {
                        assert.notEqual(0, data.length);
                        data.forEach(function (elem) {
                            assert.equal(elem.connections, undefined);
                        });
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    });
            });

            it('groupByType: true', function (done) {
                dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.STOP, {groupByType: true})
                    .then(function (data) {
                        assert.notEqual(0, data.length);
                        data.forEach(function (elem) {
                            assert(elem.connections);
                            elem.connections.forEach(function (connection) {
                                assert(connection.type);
                                assert(connection.lines);
                                assert(Array.isArray(connection.lines));
                            });
                        });
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    });
            });

            it('fullLineType: true', function (done) {
                dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.STOP, {fullLineType: true})
                    .then(function (data) {
                        assert.notEqual(0, data.length);
                        data.forEach(function (elem) {
                            assert(elem.connections);
                            elem.connections.forEach(function (connection) {
                                assert(connection.type);
                                assert(connection.type.name);
                                assert(connection.type.title);
                                assert(connection.type.icon_url);
                            });
                        });
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    });
            });

        });
    });

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, platform"', function () {
        utils.mockRequest('pins-platform.json');

        it('should contain objects with name, coords, type and platform_nr', function (done) {
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.pins.type.PLATFORM, {})
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert(elem.name);
                        assert(elem.coords);
                        assert(elem.type);
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
        utils.mockRequest('pins-poi.json');

        it('should contain objects with name, coords, type and id', function (done) {
            var pinType = dvb.pins.type.POI;
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinType, {})
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert(elem.type);
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

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, TICKET_MACHINE"', function () {
        utils.mockRequest('pins-ticket-machine.json');

        it('should contain objects with name, coords, type and id', function (done) {
            var pinType = dvb.pins.type.TICKET_MACHINE;
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinType, {})
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert(elem.type);
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

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, CAR_SHARING"', function () {
        utils.mockRequest('pins-car-sharing.json');

        it('should contain objects with name, coords, type and id', function (done) {
            var pinType = dvb.pins.type.CAR_SHARING;
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinType, {})
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert(elem.type);
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

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, PARK_AND_RIDE"', function () {
        utils.mockRequest('pins-park-and-ride.json');

        it('should contain objects with name, coords, type and id', function (done) {
            var pinType = dvb.pins.type.PARK_AND_RIDE;
            dvb.pins(51.005211, 13.736066, 51.067603, 13.598394, pinType, {})
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert(elem.type);
                        assert.strictEqual(2, elem.coords.length);
                        assert.strictEqual(13, Math.floor(elem.coords[1]));
                        assert.strictEqual(51, Math.round(elem.coords[0]));
                    });
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, RENT_A_BIKE"', function () {
        utils.mockRequest('pins-rent-a-bike.json');

        it('should contain objects with name, coords, type and id', function (done) {
            var pinType = dvb.pins.type.RENT_A_BIKE;
            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinType, {})
                .then(function (data) {
                    assert.notEqual(0, data.length);
                    data.forEach(function (elem) {
                        assert(elem.id);
                        assert(elem.name);
                        assert(elem.coords);
                        assert(elem.type);
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

    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, POI+PLATFORM"', function () {
        utils.mockRequest('pins-poi-pf.json');

        it('should contain objects with pinType of RENT_A_BIKE or PLATFORM', function (done) {
            var hasPOI = false, hasSTOP = false;

            dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, [dvb.pins.type.POI, dvb.pins.type.PLATFORM])
                .then(function (data) {
                    data.forEach(function (elem) {
                        if (elem.type == dvb.pins.type.POI)
                            hasPOI = true;
                        else if (elem.type == dvb.pins.type.PLATFORM)
                            hasSTOP = true;
                        else
                            assert.fail(elem.type, dvb.pins.type.POI + " || " + dvb.pins.type.PLATFORM, "pinType should be '" + dvb.pins.type.POI + " or '" + dvb.pins.type.PLATFORM + "'");
                    });
                    assert(hasPOI && hasSTOP, "pinTypes should be '" + dvb.pins.type.POI + " and '" + dvb.pins.type.PLATFORM + "'");

                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('dvb.pins "0, 0, 0, 0, stop"', function () {
        utils.mockRequest('empty.json');

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