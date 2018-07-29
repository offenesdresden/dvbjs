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

[SourceFile-0]: index.md#indexts
[FunctionDeclaration-0]: index.md#coords
[FunctionDeclaration-1]: index.md#findaddress
[InterfaceDeclaration-0]: index.md#iaddress
[FunctionDeclaration-2]: index.md#findpoi
[InterfaceDeclaration-1]: index.md#ipoint
[FunctionDeclaration-3]: index.md#findstop
[InterfaceDeclaration-1]: index.md#ipoint
[FunctionDeclaration-4]: index.md#lines
[InterfaceDeclaration-2]: index.md#iline
[FunctionDeclaration-5]: index.md#monitor
[InterfaceDeclaration-4]: index.md#imonitor
[FunctionDeclaration-6]: index.md#pins
[EnumDeclaration-1]: index.md#pin_type
[InterfaceDeclaration-5]: index.md#ipin
[FunctionDeclaration-7]: index.md#route
[InterfaceDeclaration-7]: index.md#iroute
[InterfaceDeclaration-12]: index.md#idiva
[InterfaceDeclaration-13]: index.md#iplatform
[InterfaceDeclaration-5]: index.md#ipin
[EnumDeclaration-1]: index.md#pin_type
[InterfaceDeclaration-6]: index.md#iconnection
[InterfaceDeclaration-6]: index.md#iconnection
[InterfaceDeclaration-3]: index.md#imode
[InterfaceDeclaration-3]: index.md#imode
[InterfaceDeclaration-1]: index.md#ipoint
[EnumDeclaration-0]: index.md#poi_type
[InterfaceDeclaration-0]: index.md#iaddress
[InterfaceDeclaration-1]: index.md#ipoint
[InterfaceDeclaration-1]: index.md#ipoint
[InterfaceDeclaration-2]: index.md#iline
[InterfaceDeclaration-3]: index.md#imode
[InterfaceDeclaration-4]: index.md#imonitor
[InterfaceDeclaration-3]: index.md#imode
[InterfaceDeclaration-11]: index.md#ilocation
[InterfaceDeclaration-10]: index.md#istop
[InterfaceDeclaration-11]: index.md#ilocation
[InterfaceDeclaration-14]: index.md#istoplocation
[InterfaceDeclaration-11]: index.md#ilocation
[InterfaceDeclaration-9]: index.md#inode
[InterfaceDeclaration-10]: index.md#istop
[InterfaceDeclaration-3]: index.md#imode
[InterfaceDeclaration-8]: index.md#itrip
[InterfaceDeclaration-9]: index.md#inode
[InterfaceDeclaration-7]: index.md#iroute
[InterfaceDeclaration-8]: index.md#itrip
[TypeAliasDeclaration-0]: index.md#coord
[EnumDeclaration-0]: index.md#poi_type
[EnumDeclaration-1]: index.md#pin_type
<!-- AUTO-GENERATED-CONTENT:END -->
