import chai = require("chai");
import chaiAsPromised from "chai-as-promised";
import * as DVB from "../src/index";
import * as utils from "../src/utils";

chai.use(chaiAsPromised);
const assert = chai.assert;

const dvb = DVB;

function mockRequest(filename: string | string[]): void {
  // before((done) => {
  //   let index = 0;

  //   if (!process.env.NODE_ENV ||
  //     (process.env.NODE_ENV && process.env.NODE_ENV.indexOf("live") === -1)) {

  //     mockery.enable({
  //       warnOnReplace: true,
  //       warnOnUnregistered: false,
  //       useCleanCache: true,
  //     });

  //     mockery.registerMock("request-promise", (request: any) => {
  //       let filePath: string;

  //       if (filename instanceof Array) {
  //         filePath = path.join("ts", "test", "data", filename[index % filename.length]);
  //         index += 1;
  //       } else {
  //         filePath = path.join("ts", "test", "data", filename);
  //       }

  //       if (process.env.NODE_ENV === "test_update") {
  //         return requestP(request)
  //           .catch((err) => {
  //             try {
  //               utils.convertError(err);
  //             } catch (error) {
  //               const data = {
  //                 Error: {
  //                   name: error.name,
  //                   message: error.message,
  //                 },
  //               };
  //               fs.writeJSONSync(filePath, data);
  //               throw error;
  //             }
  //           })
  //           .then((data) => {
  //             return fs.writeJSONAsync(filePath, data, { encoding: "utf8" })
  //               .then(() => {
  //                 return data;
  //               });
  //           });
  //       } else {
  //         return fs.readJSONAsync(filePath)
  //           .then((data: any) => {
  //             if (data.Error) {
  //               throw utils.constructError(data.Error.name, data.Error.message);
  //             }

  //             return data;
  //           });
  //       }
  //     });
  //   }

  //   dvb = require("../lib/index");
  //   done();
  // });

  // after((done) => {
  //   mockery.disable();
  //   mockery.deregisterAll();
  //   done();
  // });
}

describe("dvb.monitor", () => {
  function assertTransport(transport: DVB.IMonitor) {
    assert.isString(transport.id);
    assert.isString(transport.line);
    assert.isString(transport.direction);

    assert.isNumber(transport.arrivalTimeRelative);
    assert.isNumber(transport.scheduledTimeRelative);
    assert.isNumber(transport.delayTime);

    assert.instanceOf(transport.arrivalTime, Date);
    assert.instanceOf(transport.scheduledTime, Date);

    assert.property(transport, "state");

    assertMode(transport.mode);

    if (transport.line[0] !== "E") {
      assertDiva(transport.diva);
    } else {
      assert.isUndefined(transport.diva);
    }
    assert.isDefined(transport.platform);
    assertPlatform(transport.platform!);
  }

  describe("dvb.monitor 33000037 (Postplatz)", () => {
    mockRequest("monitor-33000037.json");

    it("should return an array with elements", () => dvb.monitor("33000037", 10, 5)
      .then((data) => {
        assert.isArray(data);
        assert.lengthOf(data, 5);
      }));

    it("should contain all fields", () => dvb.monitor("33000037", 0, 5)
      .then((data) => {
        data.forEach(assertTransport);
      }));
  });

  describe('dvb.monitor "xyz"', () => {
    mockRequest("monitor-xyz.json");

    it("should reject with ValidationError", () => assert.isRejected(
      dvb.monitor("xyz"), "stopid has to be not null and must be a number"));
  });

  describe("dvb.monitor 123 (invalid id)", () => {
    mockRequest("monitor-123.json");

    it("should reject with ServiceError",
      () => assert.isRejected(dvb.monitor("1242142343"), "stop invalid"));
  });
});

describe("dvb.route", () => {
  describe('dvb.route "33000742 (Helmholtzstraße) -> 33000037 (Postplatz)"', () => {
    mockRequest("route-33000742-33000037.json");

    function assertTrip(trip: DVB.ITrip) {
      assert.isDefined(trip.departure);
      assertLocation(trip.departure!);
      assert.isDefined(trip.arrival);
      assertLocation(trip.arrival!);
      assert.isNumber(trip.duration);
      assert.isNumber(trip.interchanges);

      assert.isArray(trip.nodes);
      trip.nodes.forEach(assertNode);
    }

    function assertNode(node: DVB.INode) {
      assert.isString(node.line);
      assert.isString(node.direction);
      assert.isNumber(node.duration);

      assertMode(node.mode);

      if (node.mode.name !== "Footpath" && node.mode.name !== "StayForConnection") {
        assert.isDefined(node.diva);
        assertDiva(node.diva!);
      } else {
        assert.isUndefined(node.diva);
      }

      if (node.mode.name !== "Footpath" || node.line === "Fussweg") {
        assert.isDefined(node.departure);
        assertStopLocation(node.departure!);
        assert.isDefined(node.arrival);
        assertStopLocation(node.arrival!);

        assert.isArray(node.stops);
        assert.isNotEmpty(node.stops);
        node.stops.forEach(assertStop);
      } else {
        assert.isUndefined(node.departure);
        assert.isUndefined(node.arrival);
        assert.isArray(node.stops);
        assert.isEmpty(node.stops);
      }

      assert.isArray(node.path);
      if (node.mode.name !== "StayForConnection") {
        assert.isNotEmpty(node.path);
        node.path.forEach(assertCoords);
      } else {
        assert.strictEqual(node.path.length, 0);
      }
    }

    it("should return the correct origin and destination",
      () => dvb.route("33000742", "33000037", new Date(), false)
        .then((data) => {
          assert.isObject(data, "origin");
          assert.strictEqual(data.origin!.name, "Helmholtzstraße");
          assert.strictEqual(data.origin!.city, "Dresden");

          assert.property(data, "destination");
          assert.strictEqual(data.destination!.name, "Postplatz");
          assert.strictEqual(data.destination!.city, "Dresden");
        }));

    it("should return an array of trips",
      () => dvb.route("33000742", "33000037", new Date(), false)
        .then((data) => {
          assert.isNotEmpty(data.trips);
          data.trips.forEach(assertTrip);
        }));
  });

  describe('dvb.route "0 -> 0"', () => {
    mockRequest("route-0-0.json");

    it("should return empty trips", () => dvb.route("0", "0")
      .then((data) => {
        assert.isObject(data);
        assert.isUndefined(data.origin);
        assert.isUndefined(data.destination);
        assert.isEmpty(data.trips);
      }));
  });

  describe('dvb.route "Helmholtzstraße -> Postplatz"', () => {
    mockRequest("route-Helmholtzstrasse-Postplatz.json");

    it("should return empty trips", () => dvb.route("Helmholtzstraße", "Postplatz")
      .then((data) => {
        assert.isObject(data);
        assert.isUndefined(data.origin);
        assert.isUndefined(data.destination);
        assert.isEmpty(data.trips);
      }));
  });
});

describe("dvb.findStop", () => {
  describe('dvb.findStop "Postplatz"', () => {
    mockRequest("find-Postpl.json");

    it("should return an array", () => dvb.findStop("Postpl")
      .then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should contain objects with name, city, coords and type", () => dvb.findStop("Postpl")
      .then((data) => {
        assert.isNotEmpty(data);
        data.forEach((point) => {
          assertPoint(point);
          assert.strictEqual(point.type, dvb.POI_TYPE.Stop);
        });
      }));

    it("should find the correct stop", () => dvb.findStop("Postpl")
      .then((data) => {
        assert.strictEqual("Postplatz", data[0].name);
      }));
  });

  describe('dvb.findStop "0"', () => {
    mockRequest("find-0.json");

    it("should return an empty array", () => dvb.findStop("0")
      .then((data) => {
        assert.isEmpty(data);
      }));
  });

  describe('dvb.findStop "xyz"', () => {
    mockRequest("find-xyz.json");

    it("should return an empty array", () => dvb.findStop("xyz")
      .then((data) => {
        assert.isEmpty(data);
      }));
  });

  describe('dvb.findStop "123"', () => {
    mockRequest("find-123.json");

    it("should reject with ServiceError",
      () => assert.isRejected(dvb.findStop("123"), "stop invalid"));
  });
});

describe("dvb.findPOI", () => {
  describe('dvb.findPOI "Frauenkirche Dresden"', () => {
    mockRequest("find-Frauenkirche.json");

    it("should return an array", () => dvb.findPOI("Frauenkirche Dresden")
      .then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should find the correct POIS", () => dvb.findPOI("Frauenkirche Dresden")
      .then((response) => {
        response.forEach((data) => {
          assertPoint(data);
          assert.include(data.name, "Frauenkirche");
          assert.strictEqual(data.city, "Dresden");
          assert.isString(data.id);
          assertCoords(data.coords);
          assert.oneOf(data.type, Object.keys(dvb.POI_TYPE));
        });
      }));
  });

  describe('dvb.findPOI "xyz"', () => {
    mockRequest("findPOI-xyz.json");

    it("should return an empty array", () => dvb.findPOI("xyz")
      .then((data) => {
        assert.isEmpty(data);
      }));
  });

  describe('dvb.findPOI "123"', () => {
    mockRequest("findPOI-0.json");

    it("should reject with SeviceError",
      () => assert.isRejected(dvb.findPOI("123"), "stop invalid"));
  });
});

describe("dvb.pins", () => {
  describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, stop"', () => {
    mockRequest("pins-stop.json");

    it("should resolve into an array",
      () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.stop)
        .then((data) => {
          assert.isNotEmpty(data);
        }));

    it("should contain objects with id, name, coords and connections",
      () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.stop)
        .then((data) => {
          data.forEach((elem) => {
            assert.isString(elem.id);
            assert.isString(elem.name);
            assert.isDefined(elem.coords);
            assertCoords(elem.coords!);

            assert.isNotEmpty(elem.connections);
            assert.isArray(elem.connections);
            elem.connections!.forEach((con) => {
              assert.isString(con.line);
              assert.isString(con.type);
            });
          });
        }));
  });

  describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, platform"', () => {
    mockRequest("pins-platform.json");

    it("should contain objects with name, coords and platform_nr",
      () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.platform)
        .then((data) => {
          assert.notEqual(0, data.length);
          data.forEach((elem) => {
            assert.isString(elem.name);
            assert.isDefined(elem.coords);
            assertCoords(elem.coords!);
            assert.isString(elem.platform_nr);
          });
        }));
  });

  describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, POI"', () => {
    mockRequest("pins-poi.json");

    it("should contain objects with name, coords and id",
      () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.poi)
        .then((data) => {
          assert.notEqual(0, data.length);
          data.forEach((elem) => {
            assert.isString(elem.id);
            assert.isString(elem.name);
            assert.isDefined(elem.coords);
            assertCoords(elem.coords!);
          });
        }));
  });

  describe('dvb.pins "0, 0, 0, 0, stop"', () => {
    mockRequest("pins-empty.json");

    it("should resolve into an empty array",
      () => dvb.pins(0, 0, 0, 0, dvb.PIN_TYPE.stop)
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 0);
        }));
  });
});

describe("dvb.findAddress", () => {
  describe('dvb.findAddress "51.025451, 13.722943"', () => {
    mockRequest("address-51-13.json");

    const lat = 51.025451;
    const lng = 13.722943;

    it("should resolve into an object with city, address and coords properties",
      () => dvb.findAddress(lat, lng)
        .then((address) => {
          assert.isDefined(address);
          assert.strictEqual(address!.name, "Nöthnitzer Straße 46");
          assert.strictEqual(address!.city, "Dresden");
          assert.strictEqual(address!.type, dvb.POI_TYPE.Coords);
          assert.approximately(address!.coords[0], lat, 0.001);
          assert.approximately(address!.coords[1], lng, 0.001);
        }));

    it("should contain nearby stops", () => dvb.findAddress(lat, lng)
      .then((address) => {
        assert.isDefined(address);
        assertAddress(address!);
      }));
  });

  describe('dvb.findAddress "0, 0"', () => {
    mockRequest("address-0-0.json");

    it("should reject with ServiceError",
      () => assert.isRejected(dvb.findAddress(0, 0), "no it connection"));

  });
});

describe("dvb.coords", () => {
  describe('dvb.coords "33000755"', () => {
    mockRequest("coords-33000755.json");

    it("should resolve into a coordinate array [lat, lng]", () => dvb.coords("33000755")
      .then((data) => {
        assert.isDefined(data);
        assertCoords(data!);
      }));
  });

  describe('dvb.coords "123"', () => {
    mockRequest("coords-123.json");

    it("should return undefined", () => dvb.coords("123")
      .then((data) => {
        assert.isUndefined(data);
      }));
  });
});

describe("dvb.coords for id from dvb.pins", () => {
  mockRequest(["pins-poi.json", "coords-poi.json"]);

  it("coordinates should be equal for first pin",
    () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.poi)
      .then((pins) => {
        assert.isNotEmpty(pins);
        pins.forEach((elem) => {
          assert.isString(elem.id);
          assert.isDefined(elem.coords);
          assertCoords(elem.coords!);
        });

        return dvb.coords(pins[0].id)
          .then((coords) => {
            assert.deepEqual(coords, pins[0].coords);
          });
      }));
});

describe("dvb.lines", () => {
  describe('dvb.lines "33000037" (Postplatz)', () => {
    mockRequest("lines-33000037.json");

    it("should return an array", () => dvb.lines("33000037")
      .then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should contain objects with name, mode, diva and directions", () => dvb.lines("33000037")
      .then((data) => {
        data.forEach((line) => {
          assert.isString(line.name);
          assertMode(line.mode);
          assert.isDefined(line.diva);
          assertDiva(line.diva!);
          assert.isNotEmpty(line.directions);
          line.directions.forEach((direction) => {
            assert.isString(direction);
          });
        });
      }));
  });

  describe('dvb.lines "123"', () => {
    mockRequest("lines-123.json");

    it("should reject with ServiceError",
      () => assert.isRejected(dvb.lines("123"), "stop invalid"));
  });
});

describe("internal utils", () => {
  describe("parseMode", () => {
    const mots = [
      ["Tram", "Tram"],
      ["Bus", "Bus"],
      ["Citybus", "Bus"],
      ["Intercitybus", "Bus"],
      ["Suburbanrailway", "SuburbanRailway"],
      ["Train", "Train"],
      ["Rapidtransit", "Train"],
      ["Footpath", "Footpath"],
      ["Cableway", "Cableway"],
      ["Overheadrailway", "Cableway"],
      ["Ferry", "Ferry"],
      ["Hailedsharedtaxi", "HailedSharedTaxi"],
      ["Mobilitystairsup", "StairsUp"],
      ["Mobilitystairsdown", "StairsDown"],
      ["Mobilityescalatorup", "EscalatorUp"],
      ["Mobilityescalatordown", "EscalatorDown"],
      ["Mobilityelevatorup", "ElevatorUp"],
      ["Mobilityelevatordown", "ElevatorDown"],
    ];

    mots.forEach((mot) => {
      it("should parse `" + mot[0] + "` to `" + mot[1] + "`", (done) => {
        const mode = utils.parseMode(mot[0]);
        assertMode(mode);
        assert.strictEqual(mode.name, mot[1]);
        done();
      });
    });
  });

  describe("checkStatus", () => {
    it('should throw "unexpected error"', () => {
      assert.throws(utils.checkStatus, "unexpected error");
    });

    it('should throw error: "foo: bar"', () => {
      try {
        utils.checkStatus({ Status: { Code: "foo", Message: "bar" } });
        assert.fail("checkStatus did not throw an error");
      } catch (error) {
        assert.strictEqual(error.name, "foo");
        assert.strictEqual(error.message, "bar");
      }
    });
  });

  describe("construct error", () => {
    it('should throw error: "foo: bar"', () => {
      const error = utils.constructError("foo", "bar");

      assert.instanceOf(error, Error);
      assert.strictEqual(error.name, "foo");
      assert.strictEqual(error.message, "bar");
    });

    it('should throw error: "foo"', () => {
      const error = utils.constructError("foo");

      assert.instanceOf(error, Error);
      assert.strictEqual(error.name, "foo");
      assert.strictEqual(error.message, "");
    });

    it('should throw error: "Error: bar"', () => {
      const error = utils.constructError(undefined, "bar");

      assert.instanceOf(error, Error);
      assert.strictEqual(error.name, "Error");
      assert.strictEqual(error.message, "bar");
    });
  });

  describe("convert error", () => {
    it('should throw error: "foo: bar"', () => {
      try {
        const err: any = new Error("400 - foo: bar");
        err.response = { data: { Status: { Code: "foo", Message: "bar" } } };
        utils.convertError(err);
        assert.fail("checkStatus did not throw an error");
      } catch (error) {
        assert.strictEqual(error.name, "foo");
        assert.strictEqual(error.message, "bar");
      }
    });
  });
});

function assertCoords(coords: DVB.coord) {
  assert.isArray(coords);
  assert.lengthOf(coords, 2);

  if (coords[0] || coords[1]) {
    // workaround for stops without coordinates
    assert.approximately(coords[0], 51, 1);
    assert.approximately(coords[1], 13, 2);
  } else {
    assert.isUndefined(coords[0]);
    assert.isUndefined(coords[1]);
  }
}

function assertPlatform(platform: DVB.IPlatform) {
  assert.isObject(platform);

  assert.property(platform, "name");
  assert.isString(platform.name);

  assert.property(platform, "type");
  assert.isString(platform.type);
}

function assertDiva(diva: DVB.IDiva) {
  assert.isObject(diva);

  assert.property(diva, "number");
  assert.isNumber(diva.number);

  assert.property(diva, "network");
  assert.isString(diva.network);
}

function assertMode(mode: DVB.IMode) {
  assert.isObject(mode);

  assert.isString(mode.name);
  assert.isString(mode.title);

  assert.isString(mode.icon_url);
}

function assertLocation(stop: DVB.ILocation) {
  assert.isObject(stop);

  assert.isString(stop.name);
  assert.isString(stop.city);
  assertCoords(stop.coords);
}

function assertStop(stop: DVB.IStop) {
  assert.isObject(stop);

  assert.isString(stop.name);
  assert.isString(stop.city);
  assertCoords(stop.coords);
  assert.instanceOf(stop.arrival, Date);
  assert.instanceOf(stop.departure, Date);

  if (stop.platform) {
    // workaround for station without platform
    // eg Lennéplatz
    assertPlatform(stop.platform);
  }

  assert.strictEqual(stop.type, DVB.POI_TYPE.Stop);
}

function assertPoint(point: DVB.IPoint) {
  assert.isObject(point);

  assert.isString(point.id);
  assert.isString(point.name);
  assert.isString(point.city);
  assertCoords(point.coords);

  assert.oneOf(point.type, Object.keys(DVB.POI_TYPE));
}

function assertAddress(adress: DVB.IAddress) {
  assertPoint(adress);

  assert.isNotEmpty(adress.stops);
  adress.stops.forEach(assertPoint);
}

function assertStopLocation(stop: DVB.IStopLocation) {
  assert.isObject(stop);

  assert.isString(stop.name);
  assert.isString(stop.city);
  assertCoords(stop.coords);

  if (stop.platform) {
    // workaround for station without platform
    // eg Lennéplatz
    assertPlatform(stop.platform);
  }

  assert.strictEqual(stop.type, DVB.POI_TYPE.Stop);
}
