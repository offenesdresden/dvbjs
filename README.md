# dvbjs

[![npmversion](http://img.shields.io/npm/v/dvbjs.svg?style=flat)](https://www.npmjs.org/package/dvbjs)
[![Downloads](https://img.shields.io/npm/dm/dvbjs.svg)](https://www.npmjs.com/package/dvbjs)

This is an unofficial node module, giving you a few options to query Dresden's public transport system for current bus- and tramstop data.

Want something like this for another language, look [no further](https://github.com/kiliankoe/vvo#libraries) 🙂

## Getting Started

```sh
npm install dvbjs
```

```js
import * as dvb from "dvbjs";
```

Requires Node.js 18+ (uses native `fetch`).

## Example Usage

### Find stops by name

```js
import * as dvb from "dvbjs";

const data = await dvb.findStop("zellesch");
console.dir({ data }, { depth: 7, maxArrayLength: 2 });
```

```js
{
  data: [
    {
      city: "Dresden",
      coords: [13.745859050200034, 51.0283698098441],
      name: "Zellescher Weg",
      id: "33000312",
      type: "Stop",
    },
    // ...
  ];
}
```

### Monitor a single stop

```js
import * as dvb from "dvbjs";

const stopID = "33000037"; // Postplatz
const timeOffset = 5;
const numResults = 2;

const data = await dvb.monitor(stopID, timeOffset, numResults);
console.dir(data, { depth: 7, maxArrayLength: 2 });
```

```js
[
  {
    arrivalTime: 2020-08-28T17:47:00.000Z,
    scheduledTime: 2020-08-28T17:47:00.000Z,
    id: 'voe:11012: :R:j20',
    line: '12',
    direction: 'Striesen',
    platform: { name: '3', type: 'Platform' },
    arrivalTimeRelative: 5,
    scheduledTimeRelative: 5,
    delayTime: 0,
    state: 'InTime',
    mode: {
      title: 'Straßenbahn',
      name: 'Tram',
      iconUrl: 'https://www.dvb.de/assets/img/trans-icon/transport-tram.svg'
    },
    diva: { number: 11012, network: 'voe' }
  },
  // ...
]
```

### Find routes

```js
import * as dvb from "dvbjs";

const origin = "33000742"; // Helmholtzstraße
const destination = "33000037"; // Postplatz
const startTime = new Date();
const isArrivalTime = false;

const data = await dvb.route(origin, destination, startTime, isArrivalTime);
console.dir(data, { depth: 7, maxArrayLength: 2 });
```

## API Documentation

### Functions

#### `findStop(searchString, timeout?): Promise<Point[]>`

Search for a single stop in the network of the DVB.

#### `findPOI(searchString, timeout?): Promise<Point[]>`

Search for POI in the network of the DVB.

#### `findAddress(lng, lat, timeout?): Promise<Address | undefined>`

Lookup address and nearby stops by coordinate.

#### `findNearbyStops(searchString, timeout?): Promise<Point[]>`

Search for nearby stops assigned to an address.

#### `monitor(stopID, offset?, amount?, timeout?): Promise<Monitor[]>`

Monitor a single stop to see every bus or tram leaving after the specified time offset.

| Parameter | Type   | Default | Description                      |
| --------- | ------ | ------- | -------------------------------- |
| stopID    | string |         | ID of the stop                   |
| offset    | number | 0       | how many minutes in the future   |
| amount    | number | 0       | number of results (0 for all)    |
| timeout   | number | 15000   | the timeout of the request in ms |

#### `route(originID, destinationID, time?, isArrivalTime?, timeout?, via?): Promise<Route>`

Query the server for possible routes from one stop to another.

| Parameter     | Type    | Default    | Description                          |
| ------------- | ------- | ---------- | ------------------------------------ |
| originID      | string  |            | the id of the origin stop            |
| destinationID | string  |            | the id of the destination stop       |
| time          | Date    | new Date() | starting at what time                |
| isArrivalTime | boolean | true       | is time the arrival time             |
| timeout       | number  | 15000      | the timeout of the request in ms     |
| via           | string  |            | the id of a stop the route must pass |

#### `lines(stopID, timeout?): Promise<Line[]>`

Get a list of available tram/bus lines for a stop.

#### `pins(swlng, swlat, nelng, nelat, pinTypes?, timeout?): Promise<Pin[]>`

Search for different kinds of POIs inside a given bounding box.

| Parameter | Type       | Default         | Description                            |
| --------- | ---------- | --------------- | -------------------------------------- |
| swlng     | number     |                 | longitude of the south-west coordinate |
| swlat     | number     |                 | latitude of the south-west coordinate  |
| nelng     | number     |                 | longitude of the north-east coordinate |
| nelat     | number     |                 | latitude of the north-east coordinate  |
| pinTypes  | PIN_TYPE[] | [PIN_TYPE.stop] | array of pin types to search for       |
| timeout   | number     | 15000           | the timeout of the request in ms       |

### Interfaces

#### `Monitor`

```typescript
interface Monitor {
  arrivalTime: Date;
  scheduledTime: Date;
  id: string;
  line: string;
  direction: string;
  platform?: Platform;
  arrivalTimeRelative: number;
  scheduledTimeRelative: number;
  delayTime: number;
  state: string;
  mode?: Mode;
  diva?: Diva;
}
```

#### `Route`

```typescript
interface Route {
  origin?: Location;
  destination?: Location;
  trips: Trip[];
}
```

#### `Trip`

```typescript
interface Trip {
  departure?: StopLocation;
  arrival?: StopLocation;
  duration: number;
  interchanges: number;
  nodes: Node[];
}
```

#### `Node`

```typescript
interface Node {
  stops: Stop[];
  departure?: StopLocation;
  arrival?: StopLocation;
  mode?: Mode;
  line: string;
  direction: string;
  diva?: Diva;
  dlid?: string;
  duration: number;
  path: coord[];
}
```

#### `Stop`

```typescript
interface Stop extends Location {
  type: string;
  platform?: Platform;
  arrival: Date;
  departure: Date;
  dhid: string;
}
```

#### `Point`

```typescript
interface Point extends Location {
  type: POI_TYPE;
}
```

#### `Address`

```typescript
interface Address extends Point {
  stops: Point[];
}
```

#### `Location`

```typescript
interface Location {
  id: string;
  name: string;
  city: string;
  coords: coord;
}
```

#### `StopLocation`

```typescript
interface StopLocation extends Location {
  platform?: Platform;
  time: Date;
  type: string;
}
```

#### `Line`

```typescript
interface Line {
  name: string;
  mode?: Mode;
  diva?: Diva;
  directions: string[];
}
```

#### `Pin`

```typescript
interface Pin {
  id: string;
  type: PIN_TYPE;
  name: string;
  coords: coord;
  platformNr?: string;
  connections?: Connection[];
  info?: string;
}
```

#### `Connection`

```typescript
interface Connection {
  line: string;
  mode?: Mode;
}
```

#### `Mode`

```typescript
interface Mode {
  title: string;
  name: string;
  iconUrl?: string;
}
```

#### `Diva`

```typescript
interface Diva {
  number: number;
  network?: string;
}
```

#### `Platform`

```typescript
interface Platform {
  name: string;
  type: string;
}
```

### Types

#### `coord`

```typescript
type coord = [number, number]; // [lng, lat] in WGS84
```

### Enums

#### `POI_TYPE`

```typescript
enum POI_TYPE {
  Address = "Address",
  Coords = "Coords",
  POI = "POI",
  Stop = "Stop",
}
```

#### `PIN_TYPE`

```typescript
enum PIN_TYPE {
  stop = "stop",
  platform = "platform",
  poi = "poi",
  rentabike = "rentabike",
  ticketmachine = "ticketmachine",
  carsharing = "carsharing",
  parkandride = "parkandride",
  unknown = "unknown",
}
```
