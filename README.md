# dvbjs

[![travis-ci](http://img.shields.io/travis/kiliankoe/dvbjs.svg?style=flat)](https://travis-ci.org/kiliankoe/dvbjs)
[![Coverage Status](https://coveralls.io/repos/kiliankoe/dvbjs/badge.svg?branch=master&service=github)](https://coveralls.io/github/kiliankoe/dvbjs?branch=master)
[![npmversion](http://img.shields.io/npm/v/dvbjs.svg?style=flat)](https://www.npmjs.org/package/dvbjs)
[![Downloads](https://img.shields.io/npm/dm/dvbjs.svg)](https://www.npmjs.com/package/dvbjs)

[![NPM](https://nodei.co/npm/dvbjs.png?downloads=true)](https://nodei.co/npm/dvbjs/)

This is an unofficial node module, giving you a few options to query Dresden's public transport system for current bus- and tramstop data.

Want something like this for another language, look [no further](https://github.com/kiliankoe/vvo#libraries) 🙂

## Getting Started

Install the module using npm

```sh
$ yarn install dvbjs
```

and require it in your project

```js
import * as dvb from "dvbjs";
```

HTTP request are handled by [axios](https://github.com/axios/axios) that supports all modern browsers.
See [react-example](examples/react-example/README.md) for a browser departure monitor example.

## Example Usage

### Find stops by name
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./examples/findStop.js) -->
<!-- The below code snippet is automatically added from ./examples/findStop.js -->
```js
const dvb = require("dvbjs");

dvb.findStop("zellesch").then(function (data) {
    console.log(JSON.stringify(data, null, 4));
})
```
<!-- AUTO-GENERATED-CONTENT:END -->
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./examples/findStop.output.json) -->
<!-- The below code snippet is automatically added from ./examples/findStop.output.json -->
```json
[
    {
        "city": "Dresden",
        "coords": [
            13.745858712566005,
            51.02836082515807
        ],
        "name": "Zellescher Weg",
        "id": "33000312",
        "type": "Stop"
    }
]
```
<!-- AUTO-GENERATED-CONTENT:END -->

### Monitor a single stop
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./examples/monitor.js) -->
<!-- The below code snippet is automatically added from ./examples/monitor.js -->
```js
const dvb = require("dvbjs");

const stopID = "33000037"; // Postplatz
var timeOffset = 5;
var numResults = 2;

dvb.monitor(stopID, timeOffset, numResults).then(function (data) {
    console.log(JSON.stringify(data, null, 4));
})
```
<!-- AUTO-GENERATED-CONTENT:END -->
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./examples/monitor.output.json) -->
<!-- The below code snippet is automatically added from ./examples/monitor.output.json -->
```json
[
    {
        "arrivalTime": "2018-07-29T22:00:00.000Z",
        "scheduledTime": "2018-07-29T22:00:00.000Z",
        "id": "76185070",
        "line": "EV4",
        "direction": "Postplatz",
        "platform": {
            "name": "2",
            "type": "Platform"
        },
        "arrivalTimeRelative": 8,
        "scheduledTimeRelative": 8,
        "delayTime": 0,
        "state": "InTime",
        "mode": {
            "title": "Bus",
            "name": "CityBus",
            "icon_url": "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg"
        },
        "diva": {
            "number": 27004,
            "network": "voe"
        }
    },
    {
        "arrivalTime": "2018-07-29T22:00:00.000Z",
        "scheduledTime": "2018-07-29T22:00:00.000Z",
        "id": "76185196",
        "line": "EV4",
        "direction": "Tolkewitz",
        "platform": {
            "name": "1",
            "type": "Platform"
        },
        "arrivalTimeRelative": 8,
        "scheduledTimeRelative": 8,
        "delayTime": 0,
        "state": "InTime",
        "mode": {
            "title": "Bus",
            "name": "CityBus",
            "icon_url": "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg"
        },
        "diva": {
            "number": 27004,
            "network": "voe"
        }
    }
]
```
<!-- AUTO-GENERATED-CONTENT:END -->

### Find routes
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./examples/route.js) -->
<!-- The below code snippet is automatically added from ./examples/route.js -->
```js
const dvb = require("dvbjs");

const origin = "33000742"; // Helmholtzstraße
const destination = "33000037"; // Postplatz
var startTime = new Date();

dvb.route(origin, destination, startTime).then(function (data) {
    console.log(JSON.stringify(data, null, 4));
})
```
<!-- AUTO-GENERATED-CONTENT:END -->
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./examples/route.output.json) -->
<!-- The below code snippet is automatically added from ./examples/route.output.json -->
```json
{
    "origin": {
        "name": "Helmholtzstraße",
        "city": "Dresden",
        "coords": [
            13.725468471273134,
            51.0255443264448
        ]
    },
    "destination": {
        "name": "Postplatz",
        "city": "Dresden",
        "coords": [
            13.732548433606716,
            51.049882551705295
        ]
    },
    "trips": [
        {
            "nodes": [
                {
                    "stops": [
                        {
                            "name": "Helmholtzstraße",
                            "city": "Dresden",
                            "type": "Stop",
                            "coords": [
                                13.725468471273134,
                                51.0255443264448
                            ],
                            "arrival": "2018-07-29T20:53:00.000Z",
                            "departure": "2018-07-29T20:53:00.000Z"
                        },
                        {
                            "name": "Mommsenstraße",
                            "city": "Dresden",
                            "type": "Stop",
                            "platform": {
                                "name": "1",
                                "type": "Platform"
                            },
                            "coords": [
                                13.731503998392713,
                                51.02761256018972
                            ],
                            "arrival": "2018-07-29T21:02:00.000Z",
                            "departure": "2018-07-29T21:02:00.000Z"
                        }
                    ],
                    "departure": {
                        "name": "Helmholtzstraße",
                        "city": "Dresden",
                        "time": "2018-07-29T20:53:00.000Z",
                        "coords": [
                            13.725468471273134,
                            51.0255443264448
                        ],
                        "type": "Stop"
                    },
                    "arrival": {
                        "name": "Mommsenstraße",
                        "city": "Dresden",
                        "platform": {
                            "name": "1",
                            "type": "Platform"
                        },
                        "time": "2018-07-29T21:02:00.000Z",
                        "coords": [
                            13.731503998392713,
                            51.02761256018972
                        ],
                        "type": "Stop"
                    },
                    "mode": {
                        "title": "Fussweg",
                        "name": "Footpath",
                        "icon_url": "https://m.dvb.de/img/walk.svg"
                    },
                    "line": "Fussweg",
                    "direction": "",
                    "duration": 1,
                    "path": [
                        [
                            13.725468471273134,
                            51.0255443264448
                        ],
                        {...}
                        [
                            13.731503998392713,
                            51.02761256018972
                        ]
                    ]
                },
                {
                    "stops": [
                        {
                            "name": "Mommsenstraße",
                            "city": "Dresden",
                            "type": "Stop",
                            "platform": {
                                "name": "1",
                                "type": "Platform"
                            },
                            "coords": [
                                13.731503998392713,
                                51.02761256018972
                            ],
                            "arrival": "2018-07-29T21:02:00.000Z",
                            "departure": "2018-07-29T21:02:00.000Z"
                        },
                        {...}
                        {
                            "name": "Postplatz",
                            "city": "Dresden",
                            "type": "Stop",
                            "platform": {
                                "name": "8",
                                "type": "Platform"
                            },
                            "coords": [
                                13.732548433606716,
                                51.049882551705295
                            ],
                            "arrival": "2018-07-29T21:11:00.000Z",
                            "departure": "2018-07-29T21:11:00.000Z"
                        }
                    ],
                    "departure": {
                        "name": "Mommsenstraße",
                        "city": "Dresden",
                        "platform": {
                            "name": "1",
                            "type": "Platform"
                        },
                        "time": "2018-07-29T21:02:00.000Z",
                        "coords": [
                            13.731503998392713,
                            51.02761256018972
                        ],
                        "type": "Stop"
                    },
                    "arrival": {
                        "name": "Postplatz",
                        "city": "Dresden",
                        "platform": {
                            "name": "8",
                            "type": "Platform"
                        },
                        "time": "2018-07-29T21:11:00.000Z",
                        "coords": [
                            13.732548433606716,
                            51.049882551705295
                        ],
                        "type": "Stop"
                    },
                    "mode": {
                        "title": "Bus",
                        "name": "CityBus",
                        "icon_url": "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg"
                    },
                    "line": "360",
                    "direction": "Dresden Postplatz",
                    "diva": {
                        "number": 23360,
                        "network": "voe"
                    },
                    "duration": 1,
                    "path": [
                        [
                            13.73146092123584,
                            51.02760420891756
                        ],
                        {...}
                        [
                            13.732534179344674,
                            51.0498827630612
                        ]
                    ]
                }
            ],
            "departure": {
                "name": "Helmholtzstraße",
                "city": "Dresden",
                "time": "2018-07-29T20:53:00.000Z",
                "coords": [
                    13.725468471273134,
                    51.0255443264448
                ],
                "type": "Stop"
            },
            "arrival": {
                "name": "Postplatz",
                "city": "Dresden",
                "platform": {
                    "name": "8",
                    "type": "Platform"
                },
                "time": "2018-07-29T21:11:00.000Z",
                "coords": [
                    13.732548433606716,
                    51.049882551705295
                ],
                "type": "Stop"
            },
            "duration": 1,
            "interchanges": 0
        },
        {...}
    ]
}
```
<!-- AUTO-GENERATED-CONTENT:END -->

## API Documentation
<!-- AUTO-GENERATED-CONTENT:START (RENDERDOCS:path=./docs/api/index.md) -->
### Table of contents

* [index.ts][SourceFile-0]
    * Functions
        * [coords][FunctionDeclaration-0]
        * [findAddress][FunctionDeclaration-1]
        * [findPOI][FunctionDeclaration-2]
        * [findStop][FunctionDeclaration-3]
        * [lines][FunctionDeclaration-4]
        * [monitor][FunctionDeclaration-5]
        * [pins][FunctionDeclaration-6]
        * [route][FunctionDeclaration-7]
    * Interfaces
        * [IDiva][InterfaceDeclaration-12]
        * [IPlatform][InterfaceDeclaration-13]
        * [IPin][InterfaceDeclaration-5]
        * [IConnection][InterfaceDeclaration-6]
        * [IMode][InterfaceDeclaration-3]
        * [IPoint][InterfaceDeclaration-1]
        * [IAddress][InterfaceDeclaration-0]
        * [ILine][InterfaceDeclaration-2]
        * [IMonitor][InterfaceDeclaration-4]
        * [ILocation][InterfaceDeclaration-11]
        * [IStop][InterfaceDeclaration-10]
        * [IStopLocation][InterfaceDeclaration-14]
        * [INode][InterfaceDeclaration-9]
        * [ITrip][InterfaceDeclaration-8]
        * [IRoute][InterfaceDeclaration-7]
    * Types
        * [coord][TypeAliasDeclaration-0]
    * Enums
        * [POI_TYPE][EnumDeclaration-0]
        * [PIN_TYPE][EnumDeclaration-1]

### index.ts

#### Functions

##### coords

Find the coordinates for a given POI id.

```typescript
function coords(id: string): Promise<number[] | undefined>;
```

**Parameters**

| Name | Type   | Description |
| ---- | ------ | ----------- |
| id   | string | the POI ID  |

**Return type**

Promise<number[] | undefined>

----------

##### findAddress

Lookup address and nearby stops by coordinate.

```typescript
function findAddress(lng: number, lat: number): Promise<IAddress | undefined>;
```

**Parameters**

| Name | Type   | Description                 |
| ---- | ------ | --------------------------- |
| lng  | number | longitude of the coordinate |
| lat  | number | latitude of the coordinate  |

**Return type**

Promise<[IAddress][InterfaceDeclaration-0] | undefined>

----------

##### findPOI

Search for POI in the network of the DVB.

```typescript
function findPOI(searchString: string): Promise<IPoint[]>;
```

**Parameters**

| Name         | Type   | Description          |
| ------------ | ------ | -------------------- |
| searchString | string | the name of the stop |

**Return type**

Promise<[IPoint][InterfaceDeclaration-1][]>

----------

##### findStop

Search for a single stop in the network of the DVB.

```typescript
function findStop(searchString: string): Promise<IPoint[]>;
```

**Parameters**

| Name         | Type   | Description          |
| ------------ | ------ | -------------------- |
| searchString | string | the name of the stop |

**Return type**

Promise<[IPoint][InterfaceDeclaration-1][]>

----------

##### lines

get a list of availible tram/bus lines for a stop.

```typescript
function lines(stopID: string): Promise<ILine[]>;
```

**Parameters**

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| stopID | string | the stop ID |

**Return type**

Promise<[ILine][InterfaceDeclaration-2][]>

----------

##### monitor

Monitor a single stop to see every bus or tram leaving this stop after the specified time offset.

```typescript
function monitor(stopID: string, offset: number = 0, amount: number = 0): Promise<IMonitor[]>;
```

**Parameters**

| Name   | Type   | Default value | Description                               |
| ------ | ------ | ------------- | ----------------------------------------- |
| stopID | string |               | ID of the stop                            |
| offset | number | 0             | how many minutes in the future, 0 for now |
| amount | number | 0             | number of results                         |

**Return type**

Promise<[IMonitor][InterfaceDeclaration-4][]>

----------

##### pins

Search for different kinds of POIs inside a given bounding box.

```typescript
function pins(swlng: number, swlat: number, nelng: number, nelat: number, pinTypes: PIN_TYPE[] = [PIN_TYPE.stop]): Promise<IPin[]>;
```

**Parameters**

| Name     | Type                            | Default value   | Description                                |
| -------- | ------------------------------- | --------------- | ------------------------------------------ |
| swlng    | number                          |                 | the longitude of the south west coordinate |
| swlat    | number                          |                 | the latitude of the south west coordinate  |
| nelng    | number                          |                 | the longitude of the north east coordinate |
| nelat    | number                          |                 | the latitude of the north east coordinate  |
| pinTypes | [PIN_TYPE][EnumDeclaration-1][] | [PIN_TYPE.stop] | array of pin types                         |

**Return type**

Promise<[IPin][InterfaceDeclaration-5][]>

----------

##### route

Query the server for possible routes from one stop to another.

```typescript
function route(originID: string, destinationID: string, time: Date = new Date(), isArrivalTime: boolean = true): Promise<IRoute>;
```

**Parameters**

| Name          | Type    | Default value | Description                    |
| ------------- | ------- | ------------- | ------------------------------ |
| originID      | string  |               | the id of the origin stop      |
| destinationID | string  |               | the id of the destination stop |
| time          | Date    | new Date()    | starting at what time          |
| isArrivalTime | boolean | true          | is time the arrival time       |

**Return type**

Promise<[IRoute][InterfaceDeclaration-7]>

#### Interfaces

##### IDiva

```typescript
interface IDiva {
    number: number;
    network?: string | undefined;
}
```

**Properties**

| Name    | Type                    | Optional |
| ------- | ----------------------- | -------- |
| number  | number                  | false    |
| network | string &#124; undefined | true     |

----------

##### IPlatform

```typescript
interface IPlatform {
    name: string;
    type: string;
}
```

**Properties**

| Name | Type   | Optional |
| ---- | ------ | -------- |
| name | string | false    |
| type | string | false    |

----------

##### IPin

- The id for PIN_TYPE.platform is always an empty string.
- PIN_TYPE.platform conatins platform_nr.
- PIN_TYPE.stop contains connections.
- PIN_TYPE.parkandride contains info.

```typescript
interface IPin {
    id: string;
    type: PIN_TYPE;
    name: string;
    coords: Array<number>;
    platform_nr?: string | undefined;
    connections?: IConnection[];
    info?: string | undefined;
}
```

**Properties**

| Name        | Type                                    | Optional |
| ----------- | --------------------------------------- | -------- |
| id          | string                                  | false    |
| type        | [PIN_TYPE][EnumDeclaration-1]           | false    |
| name        | string                                  | false    |
| coords      | Array<number>                           | false    |
| platform_nr | string &#124; undefined                 | true     |
| connections | [IConnection][InterfaceDeclaration-6][] | true     |
| info        | string &#124; undefined                 | true     |

----------

##### IConnection

```typescript
interface IConnection {
    line: string;
    mode: IMode;
}
```

**Properties**

| Name | Type                            | Optional |
| ---- | ------------------------------- | -------- |
| line | string                          | false    |
| mode | [IMode][InterfaceDeclaration-3] | false    |

----------

##### IMode

```typescript
interface IMode {
    title: string;
    name: string;
    icon_url?: string | undefined;
}
```

**Properties**

| Name     | Type                    | Optional |
| -------- | ----------------------- | -------- |
| title    | string                  | false    |
| name     | string                  | false    |
| icon_url | string &#124; undefined | true     |

----------

##### IPoint

```typescript
interface IPoint {
    city: string;
    name: string;
    id: string;
    coords: Array<number>;
    type: POI_TYPE;
}
```

**Properties**

| Name   | Type                          | Optional |
| ------ | ----------------------------- | -------- |
| city   | string                        | false    |
| name   | string                        | false    |
| id     | string                        | false    |
| coords | Array<number>                 | false    |
| type   | [POI_TYPE][EnumDeclaration-0] | false    |

----------

##### IAddress

```typescript
interface IAddress extends IPoint {
    stops: IPoint[];
}
```

**Extends**

[IPoint][InterfaceDeclaration-1]

**Properties**

| Name  | Type                               | Optional |
| ----- | ---------------------------------- | -------- |
| stops | [IPoint][InterfaceDeclaration-1][] | false    |

----------

##### ILine

```typescript
interface ILine {
    name: string;
    mode: IMode;
    diva?: IDiva | undefined;
    directions: string[];
}
```

**Properties**

| Name       | Type                            | Optional |
| ---------- | ------------------------------- | -------- |
| name       | string                          | false    |
| mode       | [IMode][InterfaceDeclaration-3] | false    |
| diva       | IDiva &#124; undefined          | true     |
| directions | string[]                        | false    |

----------

##### IMonitor

```typescript
interface IMonitor {
    arrivalTime: Date;
    scheduledTime: Date;
    id: string;
    line: string;
    direction: string;
    platform?: IPlatform | undefined;
    arrivalTimeRelative: number;
    scheduledTimeRelative: number;
    delayTime: number;
    state: string;
    mode: IMode;
    diva?: IDiva | undefined;
}
```

**Properties**

| Name                  | Type                            | Optional |
| --------------------- | ------------------------------- | -------- |
| arrivalTime           | Date                            | false    |
| scheduledTime         | Date                            | false    |
| id                    | string                          | false    |
| line                  | string                          | false    |
| direction             | string                          | false    |
| platform              | IPlatform &#124; undefined      | true     |
| arrivalTimeRelative   | number                          | false    |
| scheduledTimeRelative | number                          | false    |
| delayTime             | number                          | false    |
| state                 | string                          | false    |
| mode                  | [IMode][InterfaceDeclaration-3] | false    |
| diva                  | IDiva &#124; undefined          | true     |

----------

##### ILocation

```typescript
interface ILocation {
    name: string;
    city: string;
    coords: Array<number>;
}
```

**Properties**

| Name   | Type          | Optional |
| ------ | ------------- | -------- |
| name   | string        | false    |
| city   | string        | false    |
| coords | Array<number> | false    |

----------

##### IStop

```typescript
interface IStop extends ILocation {
    type: string;
    platform?: IPlatform | undefined;
    arrival: Date;
    departure: Date;
}
```

**Extends**

[ILocation][InterfaceDeclaration-11]

**Properties**

| Name      | Type                       | Optional |
| --------- | -------------------------- | -------- |
| type      | string                     | false    |
| platform  | IPlatform &#124; undefined | true     |
| arrival   | Date                       | false    |
| departure | Date                       | false    |

----------

##### IStopLocation

```typescript
interface IStopLocation extends ILocation {
    platform?: IPlatform | undefined;
    time: Date;
    type: string;
}
```

**Extends**

[ILocation][InterfaceDeclaration-11]

**Properties**

| Name     | Type                       | Optional |
| -------- | -------------------------- | -------- |
| platform | IPlatform &#124; undefined | true     |
| time     | Date                       | false    |
| type     | string                     | false    |

----------

##### INode

```typescript
interface INode {
    stops: IStop[];
    departure?: IStopLocation | undefined;
    arrival?: IStopLocation | undefined;
    mode: IMode;
    line: string;
    direction: string;
    diva?: IDiva | undefined;
    duration: number;
    path: Array<number>[];
}
```

**Properties**

| Name      | Type                               | Optional |
| --------- | ---------------------------------- | -------- |
| stops     | [IStop][InterfaceDeclaration-10][] | false    |
| departure | IStopLocation &#124; undefined     | true     |
| arrival   | IStopLocation &#124; undefined     | true     |
| mode      | [IMode][InterfaceDeclaration-3]    | false    |
| line      | string                             | false    |
| direction | string                             | false    |
| diva      | IDiva &#124; undefined             | true     |
| duration  | number                             | false    |
| path      | Array<number>[]                    | false    |

----------

##### ITrip

```typescript
interface ITrip {
    departure?: IStopLocation | undefined;
    arrival?: IStopLocation | undefined;
    duration: number;
    interchanges: number;
    nodes: INode[];
}
```

**Properties**

| Name         | Type                              | Optional |
| ------------ | --------------------------------- | -------- |
| departure    | IStopLocation &#124; undefined    | true     |
| arrival      | IStopLocation &#124; undefined    | true     |
| duration     | number                            | false    |
| interchanges | number                            | false    |
| nodes        | [INode][InterfaceDeclaration-9][] | false    |

----------

##### IRoute

```typescript
interface IRoute {
    origin?: ILocation | undefined;
    destination?: ILocation | undefined;
    trips: ITrip[];
}
```

**Properties**

| Name        | Type                              | Optional |
| ----------- | --------------------------------- | -------- |
| origin      | ILocation &#124; undefined        | true     |
| destination | ILocation &#124; undefined        | true     |
| trips       | [ITrip][InterfaceDeclaration-8][] | false    |

#### Types

##### coord

WGS84 coordinates [lng, lat]

```typescript
type coord = number[];
```

**Type**

number[]

#### Enums

##### POI_TYPE


```typescript
enum POI_TYPE {
     Address = "Address",
     Coords = "Coords",
     POI = "POI",
     Stop = "Stop"
}
```

**Members**

| Name    | Value     |
| ------- | --------- |
| Address | "Address" |
| Coords  | "Coords"  |
| POI     | "POI"     |
| Stop    | "Stop"    |

----------

##### PIN_TYPE


```typescript
enum PIN_TYPE {
     stop = "stop",
     platform = "platform",
     poi = "poi",
     rentabike = "rentabike",
     ticketmachine = "ticketmachine",
     carsharing = "carsharing",
     parkandride = "parkandride",
     unknown = "unknown"
}
```

**Members**

| Name          | Value           |
| ------------- | --------------- |
| stop          | "stop"          |
| platform      | "platform"      |
| poi           | "poi"           |
| rentabike     | "rentabike"     |
| ticketmachine | "ticketmachine" |
| carsharing    | "carsharing"    |
| parkandride   | "parkandride"   |
| unknown       | "unknown"       |

[SourceFile-0]: README.md#indexts
[FunctionDeclaration-0]: README.md#coords
[FunctionDeclaration-1]: README.md#findaddress
[InterfaceDeclaration-0]: README.md#iaddress
[FunctionDeclaration-2]: README.md#findpoi
[InterfaceDeclaration-1]: README.md#ipoint
[FunctionDeclaration-3]: README.md#findstop
[InterfaceDeclaration-1]: README.md#ipoint
[FunctionDeclaration-4]: README.md#lines
[InterfaceDeclaration-2]: README.md#iline
[FunctionDeclaration-5]: README.md#monitor
[InterfaceDeclaration-4]: README.md#imonitor
[FunctionDeclaration-6]: README.md#pins
[EnumDeclaration-1]: README.md#pin_type
[InterfaceDeclaration-5]: README.md#ipin
[FunctionDeclaration-7]: README.md#route
[InterfaceDeclaration-7]: README.md#iroute
[InterfaceDeclaration-12]: README.md#idiva
[InterfaceDeclaration-13]: README.md#iplatform
[InterfaceDeclaration-5]: README.md#ipin
[EnumDeclaration-1]: README.md#pin_type
[InterfaceDeclaration-6]: README.md#iconnection
[InterfaceDeclaration-6]: README.md#iconnection
[InterfaceDeclaration-3]: README.md#imode
[InterfaceDeclaration-3]: README.md#imode
[InterfaceDeclaration-1]: README.md#ipoint
[EnumDeclaration-0]: README.md#poi_type
[InterfaceDeclaration-0]: README.md#iaddress
[InterfaceDeclaration-1]: README.md#ipoint
[InterfaceDeclaration-1]: README.md#ipoint
[InterfaceDeclaration-2]: README.md#iline
[InterfaceDeclaration-3]: README.md#imode
[InterfaceDeclaration-4]: README.md#imonitor
[InterfaceDeclaration-3]: README.md#imode
[InterfaceDeclaration-11]: README.md#ilocation
[InterfaceDeclaration-10]: README.md#istop
[InterfaceDeclaration-11]: README.md#ilocation
[InterfaceDeclaration-14]: README.md#istoplocation
[InterfaceDeclaration-11]: README.md#ilocation
[InterfaceDeclaration-9]: README.md#inode
[InterfaceDeclaration-10]: README.md#istop
[InterfaceDeclaration-3]: README.md#imode
[InterfaceDeclaration-8]: README.md#itrip
[InterfaceDeclaration-9]: README.md#inode
[InterfaceDeclaration-7]: README.md#iroute
[InterfaceDeclaration-8]: README.md#itrip
[TypeAliasDeclaration-0]: README.md#coord
[EnumDeclaration-0]: README.md#poi_type
[EnumDeclaration-1]: README.md#pin_type
<!-- AUTO-GENERATED-CONTENT:END -->
