'use strict';

var Utils = require('./utils');
var utils = new Utils();
var assert = require('assert');
var pinTypes = require('../lib/pins').type;

describe('dvb.pins', function () {
    describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, stop"', function () {
        utils.mockRequest('pins-stop.json');

        it('should resolve into an array', function (done) {
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinTypes.STOP, {})
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
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinTypes.STOP, {})
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
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 'stop', {}, function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });

        describe('test options', function () {

            it('default: connections, not groued, only title of line type', function (done) {
                var hasConnections = false;
                utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinTypes.STOP, {})
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
                utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinTypes.STOP, {showLines: false})
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
                utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinTypes.STOP, {groupByType: true})
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
                utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinTypes.STOP, {fullLineType: true})
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
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinTypes.PLATFORM, {})
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
            var pinType = pinTypes.POI;
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinType, {})
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
            var pinType = pinTypes.TICKET_MACHINE;
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinType, {})
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
            var pinType = pinTypes.CAR_SHARING;
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinType, {})
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
            var pinType = pinTypes.PARK_AND_RIDE;
            utils.dvb.pins(51.005211, 13.736066, 51.067603, 13.598394, pinType, {})
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
            var pinType = pinTypes.RENT_A_BIKE;
            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, pinType, {})
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

            utils.dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, [pinTypes.POI, pinTypes.PLATFORM])
                .then(function (data) {
                    data.forEach(function (elem) {
                        if (elem.type == pinTypes.POI)
                            hasPOI = true;
                        else if (elem.type == pinTypes.PLATFORM)
                            hasSTOP = true;
                        else
                            assert.fail(elem.type, pinTypes.POI + " || " + pinTypes.PLATFORM, "pinType should be '" + pinTypes.POI + " or '" + pinTypes.PLATFORM + "'");
                    });
                    assert(hasPOI && hasSTOP, "pinTypes should be '" + pinTypes.POI + " and '" + pinTypes.PLATFORM + "'");

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
            utils.dvb.pins(0, 0, 0, 0, pinTypes.STOP)
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