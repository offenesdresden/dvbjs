import { describe, expect, it } from "vitest";
import { PIN_TYPE } from "../src/interfaces";
import * as utils from "../src/utils";
import { assertCoords, assertMode, assertPin } from "./helper";

describe("internal utils", () => {
  describe("parseMode", () => {
    const mots: [string | undefined, string | undefined][] = [
      ["Tram", "Tram"],
      ["Bus", "CityBus"],
      ["Citybus", "CityBus"],
      ["Intercitybus", "IntercityBus"],
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
      ["PlusBus", "PlusBus"],
      ["stayforconnection", "StayForConnection"],
      [undefined, undefined],
    ];

    mots.forEach((mot) => {
      it(`should parse \`${mot[0]}\` to \`${mot[1]}\``, () => {
        const mode = utils.parseMode(mot[0]);
        if (mot[0]) {
          assertMode(mode!);
          expect(mode?.name).toBe(mot[1]);
        } else {
          expect(mode).toBeUndefined();
        }
      });
    });

    it("should parse unknown type", () => {
      const name = "Default";
      const mode = utils.parseMode(name);
      expect(mode).toBeDefined();
      expect(mode?.name).toBe(name);
      expect(mode?.title).toBe("default");
      expect(mode?.iconUrl).toBeUndefined();
    });
  });

  describe("checkStatus", () => {
    it('should throw "unexpected error"', () => {
      expect(() => utils.checkStatus(null as never)).toThrow("unexpected error");
    });

    it('should throw error: "foo: bar"', () => {
      expect(() => {
        utils.checkStatus({ Status: { Code: "foo", Message: "bar" } });
      }).toThrow(/bar/);
    });
  });

  describe("construct error", () => {
    it('should throw error: "foo: bar"', () => {
      const error = utils.constructError("foo", "bar");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("foo");
      expect(error.message).toBe("bar");
    });

    it('should throw error: "foo"', () => {
      const error = utils.constructError("foo");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("foo");
      expect(error.message).toBe("");
    });

    it('should throw error: "Error: bar"', () => {
      const error = utils.constructError(undefined, "bar");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("Error");
      expect(error.message).toBe("bar");
    });
  });

  describe("transform coords", () => {
    const wgs84 = [13.722766, 51.025835];
    const gk4 = [4620969, 5655929];
    const wm = [1527611.323, 6625864.908];

    function expectApproximately(actual: number, expected: number, delta: number): void {
      expect(Math.abs(actual - expected)).toBeLessThanOrEqual(delta);
    }

    it("WGS84toGK4", () => {
      const point = utils.WGS84toGK4(wgs84[0], wgs84[1]);
      expectApproximately(point[0], gk4[0], 3);
      expectApproximately(point[1], gk4[1], 3);
    });

    it("WGS84toWm", () => {
      const point = utils.WGS84toWm(wgs84[0], wgs84[1]);
      expectApproximately(point[0], wm[0], 3);
      expectApproximately(point[1], wm[1], 3);
    });

    it("WmOrGK4toWGS84 Wm", () => {
      const point = utils.WmOrGK4toWGS84(`${wm[0]}`, `${wm[1]}`);
      expect(Array.isArray(point)).toBe(true);
      expectApproximately(point![0], wgs84[0], 0.0001);
      expectApproximately(point![1], wgs84[1], 0.0001);
    });

    it("WmOrGK4toWGS84 GK4", () => {
      const point = utils.WmOrGK4toWGS84(`${gk4[0]}`, `${gk4[1]}`);
      expect(Array.isArray(point)).toBe(true);
      expectApproximately(point![0], wgs84[0], 0.0001);
      expectApproximately(point![1], wgs84[1], 0.0001);
    });

    it("WmOrGK4toWGS84 should return undefined", () => {
      let point = utils.WmOrGK4toWGS84("", "");
      expect(point).toBeUndefined();

      point = utils.WmOrGK4toWGS84("0", "0");
      expect(point).toBeUndefined();
    });

    it("convertCoordinates", () => {
      const points = utils.convertCoordinates(`${gk4[0]}|${gk4[1]}|${gk4[0]}|${gk4[1]}|`);
      expect(points.length).toBeGreaterThan(0);
      points.forEach(assertCoords);
    });
  });

  it("parseDate", () => {
    const date = utils.parseDate("/Date(1532818920000-0000)/");
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).toBe(1532818920000);
  });

  describe("parsePin", () => {
    it("stop", () => {
      const pin = utils.parsePin(
        "33000028|||Hauptbahnhof|5657516|4621644||1:3~6~7~8~9~10~11#2:66~H/S#3:261~333~352~360" +
          "~366~400~424~672~Fernbus#4:EC~IC~ICE~RB~RE~TL~TLX#5:S1~S2~S3",
      );
      assertPin(pin, PIN_TYPE.stop);
      expect(pin.id).toBe("33000028");
      expect(pin.name).toBe("Hauptbahnhof");
      expect(pin.connections!).toHaveLength(28);
    });

    it("platform", () => {
      const pin = utils.parsePin("|pf||Nürnberger Platz|5656555|4621180|1|");
      assertPin(pin, PIN_TYPE.platform);
      expect(pin.id).toBe("");
      expect(pin.name).toBe("Nürnberger Platz");
      expect(pin.platformNr).toBe("1");
    });

    it("poi", () => {
      const pin = utils.parsePin(
        "poiID:2104107042:14612000:|p||Helmholtz-Apotheke|5656699|4621216||",
      );
      assertPin(pin, PIN_TYPE.poi);
    });

    it("rentabike", () => {
      const pin = utils.parsePin(
        "poiID:2104108009:14612000:|r||SZ-Bike Station - Nürnberger Platz|5656570|4621200||",
      );
      assertPin(pin, PIN_TYPE.rentabike);
      expect(pin.id).toBe("poiID:2104108009:14612000:");
      expect(pin.name).toBe("SZ-Bike Station - Nürnberger Platz");
    });

    it("ticketmachine", () => {
      const pin = utils.parsePin(
        "poiID:2104108217:14612000:|t||Ticketautomat Dresden, Fetscherplatz -|5658310|4624283||",
      );
      assertPin(pin, PIN_TYPE.ticketmachine);
      expect(pin.id).toBe("poiID:2104108217:14612000:");
      expect(pin.name).toBe("Ticketautomat Dresden, Fetscherplatz -");
    });

    it("carsharing", () => {
      const pin = utils.parsePin(
        "poiID:2104108159:14612000:|c||teilAuto Station Stresemannplatz - (STR)|5657940|4624508||",
      );
      assertPin(pin, PIN_TYPE.carsharing);
      expect(pin.id).toBe("poiID:2104108159:14612000:");
      expect(pin.name).toBe("teilAuto Station Stresemannplatz - (STR)");
    });

    it("parkandride", () => {
      const pin = utils.parsePin(
        "poiID:2104107859:14612000:|pr||P+R Dresden Reick|5655506|4625718|21 Stellplätze, kostenfrei, 24h|",
      );
      assertPin(pin, PIN_TYPE.parkandride);
      expect(pin.id).toBe("poiID:2104107859:14612000:");
      expect(pin.name).toBe("P+R Dresden Reick");
      expect(pin.info).toBe("21 Stellplätze, kostenfrei, 24h");
    });

    it("unknown", () => {
      const pin = utils.parsePin(
        "poiID:2104107859:14612000:|uk||P+R Dresden Reick|5655506|4625718|21 Stellplätze, kostenfrei, 24h|",
      );
      assertPin(pin, PIN_TYPE.unknown);
      expect(pin.id).toBe("poiID:2104107859:14612000:");
      expect(pin.name).toBe("P+R Dresden Reick");
    });
  });

  describe("parseConnections", () => {
    it("should parse empty", () => {
      expect(utils.parseConnections("")).toEqual([]);
    });
    it("should return undefined mode", () => {
      expect(utils.parseConnections("0:3")).toEqual([{ line: "3", mode: undefined }]);
    });
  });
});
