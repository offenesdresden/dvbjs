# dvbjs

[![travis-ci](http://img.shields.io/travis/kiliankoe/dvbjs.svg?style=flat)](https://travis-ci.org/kiliankoe/dvbjs)
[![Coverage Status](https://coveralls.io/repos/kiliankoe/dvbjs/badge.svg?branch=master&service=github)](https://coveralls.io/github/kiliankoe/dvbjs?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![npmversion](http://img.shields.io/npm/v/dvbjs.svg?style=flat)](https://www.npmjs.org/package/dvbjs)
[![Downloads](https://img.shields.io/npm/dm/dvbjs.svg)](https://www.npmjs.com/package/dvbjs)

[![NPM](https://nodei.co/npm/dvbjs.png?downloads=true)](https://nodei.co/npm/dvbjs/)

This is an unofficial node module, giving you a few options to query Dresden's public transport system for current bus- and tramstop data.

Want something like this for another language, look [no further](https://github.com/kiliankoe/vvo#libraries) 🙂

## Getting Started

Install the module using npm or yarn

```sh
$ npm install dvbjs
or
$ yarn add dvbjs
```

and require it in your project

```js
import * as dvb from "dvbjs";
```

HTTP request are handled by [axios](https://github.com/axios/axios) that supports all modern browsers.
See [packages/react-example](packages/react-example/README.md) for a browser departure monitor example.

## Example Usage

### Find stops by name
<!-- AUTO-GENERATED-CONTENT:START (EXAMPLE_CODE:src=./packages/examples/src/findStop.ts) -->
```ts
import * as dvb from "dvbjs"; // OR const dvb = require("dvbjs");

dvb.findStop("zellesch").then((data) => {
  console.dir({ data }, { depth: 7, maxArrayLength: 2 });
});
```
<!-- AUTO-GENERATED-CONTENT:END -->
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./packages/examples/dist/findStop.js.yml) -->
<!-- The below code snippet is automatically added from ./packages/examples/dist/findStop.js.yml -->
```yml
{
  data: [
    {
      city: 'Dresden',
      coords: [ 13.745859050200034, 51.0283698098441 ],
      name: 'Zellescher Weg',
      id: '33000312',
      type: 'Stop'
    },
    {
      city: 'Clausthal-Zellerfeld',
      coords: [ 10.347333308428196, 51.80899839555576 ],
      name: 'Eschenbacher Straße',
      id: '26005221',
      type: 'Stop'
    }
  ]
}
```
<!-- AUTO-GENERATED-CONTENT:END -->

### Monitor a single stop
<!-- AUTO-GENERATED-CONTENT:START (EXAMPLE_CODE:src=./packages/examples/src/monitor.ts) -->
```ts
import * as dvb from "dvbjs"; // OR const dvb = require("dvbjs");

const stopID = "33000037"; // Postplatz
const timeOffset = 5;
const numResults = 2;

dvb.monitor(stopID, timeOffset, numResults).then((data) => {
  console.dir(data, { depth: 7, maxArrayLength: 2 });
});
```
<!-- AUTO-GENERATED-CONTENT:END -->
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./packages/examples/dist/monitor.js.yml) -->
<!-- The below code snippet is automatically added from ./packages/examples/dist/monitor.js.yml -->
```yml
[
  {
    arrivalTime: 2019-10-07T21:04:00.000Z,
    scheduledTime: 2019-10-07T21:04:00.000Z,
    id: 'voe:11001: :R:j19',
    line: '1',
    direction: 'Prohlis',
    platform: { name: '1', type: 'Platform' },
    arrivalTimeRelative: 4,
    scheduledTimeRelative: 4,
    delayTime: 0,
    state: 'InTime',
    mode: {
      title: 'Straßenbahn',
      name: 'Tram',
      iconUrl: 'https://www.dvb.de/assets/img/trans-icon/transport-tram.svg'
    },
    diva: { number: 11001, network: 'voe' }
  },
  {
    arrivalTime: 2019-10-07T21:15:00.000Z,
    scheduledTime: 2019-10-07T21:15:00.000Z,
    id: 'voe:11002: :R:j19',
    line: '2',
    direction: 'Kleinzschachwitz',
    platform: { name: '1', type: 'Platform' },
    arrivalTimeRelative: 15,
    scheduledTimeRelative: 15,
    delayTime: 0,
    state: 'InTime',
    mode: {
      title: 'Straßenbahn',
      name: 'Tram',
      iconUrl: 'https://www.dvb.de/assets/img/trans-icon/transport-tram.svg'
    },
    diva: { number: 11002, network: 'voe' }
  }
]
```
<!-- AUTO-GENERATED-CONTENT:END -->

### Find routes
<!-- AUTO-GENERATED-CONTENT:START (EXAMPLE_CODE:src=./packages/examples/src/route.ts) -->
```ts
import * as dvb from "dvbjs"; // OR const dvb = require("dvbjs");

const origin = "33000742"; // Helmholtzstraße
const destination = "33000037"; // Postplatz
const startTime = new Date();
const isArrivalTime = false;

dvb.route(origin, destination, startTime, isArrivalTime).then((data) => {
  console.dir(data, { depth: 7, maxArrayLength: 2 });
});
```
<!-- AUTO-GENERATED-CONTENT:END -->
<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./packages/examples/dist/route.js.yml) -->
<!-- The below code snippet is automatically added from ./packages/examples/dist/route.js.yml -->
```yml
{
  origin: {
    id: '33000742',
    name: 'Helmholtzstraße',
    city: 'Dresden',
    coords: [ 13.725468471273134, 51.0255443264448 ]
  },
  destination: {
    id: '33000037',
    name: 'Postplatz',
    city: 'Dresden',
    coords: [ 13.733966669186017, 51.05081442107084 ]
  },
  trips: [
    {
      nodes: [
        {
          stops: [
            {
              id: '33000742',
              name: 'Helmholtzstraße',
              city: 'Dresden',
              type: 'Stop',
              platform: undefined,
              coords: [ 13.725468471273134, 51.0255443264448 ],
              arrival: 2019-10-07T21:12:00.000Z,
              departure: 2019-10-07T21:12:00.000Z
            },
            {
              id: '33000135',
              name: 'Plauen Nöthnitzer Straße',
              city: 'Dresden',
              type: 'Stop',
              platform: { name: '1', type: 'Platform' },
              coords: [ 13.716492082528102, 51.02796893475141 ],
              arrival: 2019-10-07T21:24:00.000Z,
              departure: 2019-10-07T21:24:00.000Z
            }
          ],
          departure: {
            id: '33000742',
            name: 'Helmholtzstraße',
            city: 'Dresden',
            platform: undefined,
            time: 2019-10-07T21:12:00.000Z,
            coords: [ 13.725468471273134, 51.0255443264448 ],
            type: 'Stop'
          },
          arrival: {
            id: '33000135',
            name: 'Plauen Nöthnitzer Straße',
            city: 'Dresden',
            platform: { name: '1', type: 'Platform' },
            time: 2019-10-07T21:24:00.000Z,
            coords: [ 13.716492082528102, 51.02796893475141 ],
            type: 'Stop'
          },
          mode: {
            title: 'Fussweg',
            name: 'Footpath',
            iconUrl: 'https://m.dvb.de/img/walk.svg'
          },
          line: 'Fussweg',
          direction: '',
          diva: undefined,
          duration: 12,
          path: [
            [ 13.725468471273134, 51.0255443264448 ],
            [ 13.725454558079187, 51.025553521653286 ],
            ... 47 more items
          ]
        },
        {
          stops: [
            {
              id: '33000135',
              name: 'Plauen Nöthnitzer Straße',
              city: 'Dresden',
              type: 'Stop',
              platform: { name: '1', type: 'Platform' },
              coords: [ 13.716492082528102, 51.02796893475141 ],
              arrival: 2019-10-07T21:24:00.000Z,
              departure: 2019-10-07T21:24:00.000Z
            },
            {
              id: '33000134',
              name: 'Münchner Platz',
              city: 'Dresden',
              type: 'Stop',
              platform: { name: '1', type: 'Platform' },
              coords: [ 13.721883037345886, 51.02995723597058 ],
              arrival: 2019-10-07T21:25:00.000Z,
              departure: 2019-10-07T21:25:00.000Z
            },
            ... 6 more items
          ],
          departure: {
            id: '33000135',
            name: 'Plauen Nöthnitzer Straße',
            city: 'Dresden',
            platform: { name: '1', type: 'Platform' },
            time: 2019-10-07T21:24:00.000Z,
            coords: [ 13.716492082528102, 51.02796893475141 ],
            type: 'Stop'
          },
          arrival: {
            id: '33000005',
            name: 'Pirnaischer Platz',
            city: 'Dresden',
            platform: { name: '4', type: 'Platform' },
            time: 2019-10-07T21:33:00.000Z,
            coords: [ 13.743735436306865, 51.04888908670104 ],
            type: 'Stop'
          },
          mode: {
            title: 'Straßenbahn',
            name: 'Tram',
            iconUrl: 'https://www.dvb.de/assets/img/trans-icon/transport-tram.svg'
          },
          line: '3',
          direction: 'Bf. Neustadt',
          diva: { number: 11003, network: 'voe' },
          duration: 9,
          path: [
            [ 13.71646358720785, 51.02796935341722 ],
            [ 13.71649241447995, 51.02797791957738 ],
            ... 56 more items
          ]
        },
        ... 2 more items
      ],
      departure: {
        id: '33000742',
        name: 'Helmholtzstraße',
        city: 'Dresden',
        platform: undefined,
        time: 2019-10-07T21:12:00.000Z,
        coords: [ 13.725468471273134, 51.0255443264448 ],
        type: 'Stop'
      },
      arrival: {
        id: '33000037',
        name: 'Postplatz',
        city: 'Dresden',
        platform: { name: '2', type: 'Platform' },
        time: 2019-10-07T21:39:00.000Z,
        coords: [ 13.733966669186017, 51.05081442107084 ],
        type: 'Stop'
      },
      duration: 27,
      interchanges: 1
    },
    {
      nodes: [
        {
          stops: [
            {
              id: '33000742',
              name: 'Helmholtzstraße',
              city: 'Dresden',
              type: 'Stop',
              platform: undefined,
              coords: [ 13.725468471273134, 51.0255443264448 ],
              arrival: 2019-10-07T21:23:00.000Z,
              departure: 2019-10-07T21:23:00.000Z
            },
            {
              id: '33000135',
              name: 'Plauen Nöthnitzer Straße',
              city: 'Dresden',
              type: 'Stop',
              platform: { name: '1', type: 'Platform' },
              coords: [ 13.716492082528102, 51.02796893475141 ],
              arrival: 2019-10-07T21:35:00.000Z,
              departure: 2019-10-07T21:35:00.000Z
            }
          ],
          departure: {
            id: '33000742',
            name: 'Helmholtzstraße',
            city: 'Dresden',
            platform: undefined,
            time: 2019-10-07T21:23:00.000Z,
            coords: [ 13.725468471273134, 51.0255443264448 ],
            type: 'Stop'
          },
          arrival: {
            id: '33000135',
            name: 'Plauen Nöthnitzer Straße',
            city: 'Dresden',
            platform: { name: '1', type: 'Platform' },
            time: 2019-10-07T21:35:00.000Z,
            coords: [ 13.716492082528102, 51.02796893475141 ],
            type: 'Stop'
          },
          mode: {
            title: 'Fussweg',
            name: 'Footpath',
            iconUrl: 'https://m.dvb.de/img/walk.svg'
          },
          line: 'Fussweg',
          direction: '',
          diva: undefined,
          duration: 12,
          path: [
            [ 13.725468471273134, 51.0255443264448 ],
            [ 13.725454558079187, 51.025553521653286 ],
            ... 47 more items
          ]
        },
        {
          stops: [
            {
              id: '33000135',
              name: 'Plauen Nöthnitzer Straße',
              city: 'Dresden',
              type: 'Stop',
              platform: { name: '1', type: 'Platform' },
              coords: [ 13.716492082528102, 51.02796893475141 ],
              arrival: 2019-10-07T21:35:00.000Z,
              departure: 2019-10-07T21:35:00.000Z
            },
            {
              id: '33000134',
              name: 'Münchner Platz',
              city: 'Dresden',
              type: 'Stop',
              platform: { name: '1', type: 'Platform' },
              coords: [ 13.721883037345886, 51.02995723597058 ],
              arrival: 2019-10-07T21:36:00.000Z,
              departure: 2019-10-07T21:36:00.000Z
            },
            ... 6 more items
          ],
          departure: {
            id: '33000135',
            name: 'Plauen Nöthnitzer Straße',
            city: 'Dresden',
            platform: { name: '1', type: 'Platform' },
            time: 2019-10-07T21:35:00.000Z,
            coords: [ 13.716492082528102, 51.02796893475141 ],
            type: 'Stop'
          },
          arrival: {
            id: '33000005',
            name: 'Pirnaischer Platz',
            city: 'Dresden',
            platform: { name: '4', type: 'Platform' },
            time: 2019-10-07T21:44:00.000Z,
            coords: [ 13.743735436306865, 51.04888908670104 ],
            type: 'Stop'
          },
          mode: {
            title: 'Straßenbahn',
            name: 'Tram',
            iconUrl: 'https://www.dvb.de/assets/img/trans-icon/transport-tram.svg'
          },
          line: '3',
          direction: 'Wilder Mann',
          diva: { number: 11003, network: 'voe' },
          duration: 9,
          path: [
            [ 13.71646358720785, 51.02796935341722 ],
            [ 13.71649241447995, 51.02797791957738 ],
            ... 56 more items
          ]
        },
        ... 2 more items
      ],
      departure: {
        id: '33000742',
        name: 'Helmholtzstraße',
        city: 'Dresden',
        platform: undefined,
        time: 2019-10-07T21:23:00.000Z,
        coords: [ 13.725468471273134, 51.0255443264448 ],
        type: 'Stop'
      },
      arrival: {
        id: '33000037',
        name: 'Postplatz',
        city: 'Dresden',
        platform: { name: '2', type: 'Platform' },
        time: 2019-10-07T21:53:00.000Z,
        coords: [ 13.733966669186017, 51.05081442107084 ],
        type: 'Stop'
      },
      duration: 30,
      interchanges: 1
    },
    ... 2 more items
  ]
}
```
<!-- AUTO-GENERATED-CONTENT:END -->

## API Documentation
<!-- AUTO-GENERATED-CONTENT:START (RENDERDOCS:path=./packages/dvbjs/docs/api/index.md) -->
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
        * [IDiva][InterfaceDeclaration-11]
        * [IPlatform][InterfaceDeclaration-12]
        * [IPin][InterfaceDeclaration-5]
        * [IConnection][InterfaceDeclaration-6]
        * [IMode][InterfaceDeclaration-13]
        * [IAddress][InterfaceDeclaration-0]
        * [ILine][InterfaceDeclaration-3]
        * [IMonitor][InterfaceDeclaration-4]
        * [ILocation][InterfaceDeclaration-2]
        * [IPoint][InterfaceDeclaration-1]
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
function coords(id: string, timeout: number = 5000): Promise<number[]>;
```

**Parameters**

| Name    | Type   | Default value | Description                |
| ------- | ------ | ------------- | -------------------------- |
| id      | string |               | the POI ID                 |
| timeout | number | 5000          | the timeout of the request |

**Return type**

Promise<number[] | undefined>

----------

##### findAddress

Lookup address and nearby stops by coordinate.

```typescript
function findAddress(lng: number, lat: number, timeout: number = 5000): Promise<IAddress>;
```

**Parameters**

| Name    | Type   | Default value | Description                 |
| ------- | ------ | ------------- | --------------------------- |
| lng     | number |               | longitude of the coordinate |
| lat     | number |               | latitude of the coordinate  |
| timeout | number | 5000          | the timeout of the request  |

**Return type**

Promise<[IAddress][InterfaceDeclaration-0] | undefined>

----------

##### findPOI

Search for POI in the network of the DVB.

```typescript
function findPOI(searchString: string, timeout: number = 5000): Promise<IPoint[]>;
```

**Parameters**

| Name         | Type   | Default value | Description                |
| ------------ | ------ | ------------- | -------------------------- |
| searchString | string |               | the name of the stop       |
| timeout      | number | 5000          | the timeout of the request |

**Return type**

Promise<[IPoint][InterfaceDeclaration-1][]>

----------

##### findStop

Search for a single stop in the network of the DVB.

```typescript
function findStop(searchString: string, timeout: number = 5000): Promise<IPoint[]>;
```

**Parameters**

| Name         | Type   | Default value | Description                |
| ------------ | ------ | ------------- | -------------------------- |
| searchString | string |               | the name of the stop       |
| timeout      | number | 5000          | the timeout of the request |

**Return type**

Promise<[IPoint][InterfaceDeclaration-1][]>

----------

##### lines

get a list of availible tram/bus lines for a stop.

```typescript
function lines(stopID: string, timeout: number = 5000): Promise<ILine[]>;
```

**Parameters**

| Name    | Type   | Default value | Description                |
| ------- | ------ | ------------- | -------------------------- |
| stopID  | string |               | the stop ID                |
| timeout | number | 5000          | the timeout of the request |

**Return type**

Promise<[ILine][InterfaceDeclaration-3][]>

----------

##### monitor

Monitor a single stop to see every bus or tram leaving this stop after the specified time offset.

```typescript
function monitor(stopID: string, offset: number = 0, amount: number = 0, timeout: number = 5000): Promise<IMonitor[]>;
```

**Parameters**

| Name    | Type   | Default value | Description                               |
| ------- | ------ | ------------- | ----------------------------------------- |
| stopID  | string |               | ID of the stop                            |
| offset  | number | 0             | how many minutes in the future, 0 for now |
| amount  | number | 0             | number of results                         |
| timeout | number | 5000          | the timeout of the request                |

**Return type**

Promise<[IMonitor][InterfaceDeclaration-4][]>

----------

##### pins

Search for different kinds of POIs inside a given bounding box.

```typescript
function pins(swlng: number, swlat: number, nelng: number, nelat: number, pinTypes: PIN_TYPE[] = [PIN_TYPE.stop], timeout: number = 5000): Promise<IPin[]>;
```

**Parameters**

| Name     | Type                            | Default value   | Description                                |
| -------- | ------------------------------- | --------------- | ------------------------------------------ |
| swlng    | number                          |                 | the longitude of the south west coordinate |
| swlat    | number                          |                 | the latitude of the south west coordinate  |
| nelng    | number                          |                 | the longitude of the north east coordinate |
| nelat    | number                          |                 | the latitude of the north east coordinate  |
| pinTypes | [PIN_TYPE][EnumDeclaration-1][] | [PIN_TYPE.stop] | array of pin types                         |
| timeout  | number                          | 5000            | the timeout of the request                 |

**Return type**

Promise<[IPin][InterfaceDeclaration-5][]>

----------

##### route

Query the server for possible routes from one stop to another.

```typescript
function route(originID: string, destinationID: string, time: Date = new Date(), isArrivalTime: boolean = true, timeout: number = 15000): Promise<IRoute>;
```

**Parameters**

| Name          | Type    | Default value | Description                    |
| ------------- | ------- | ------------- | ------------------------------ |
| originID      | string  |               | the id of the origin stop      |
| destinationID | string  |               | the id of the destination stop |
| time          | Date    | new Date()    | starting at what time          |
| isArrivalTime | boolean | true          | is time the arrival time       |
| timeout       | number  | 15000         | the timeout of the request     |

**Return type**

Promise<[IRoute][InterfaceDeclaration-7]>

#### Interfaces

##### IDiva

```typescript
interface IDiva {
    number: number;
    network?: string;
}
```

**Properties**

| Name    | Type                    | Optional |
| ------- | ----------------------- | -------- |
| number  | number                  | false    |
| network | string  | true     |

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
    platformNr?: string;
    connections?: IConnection[];
    info?: string;
}
```

**Properties**

| Name        | Type                                    | Optional |
| ----------- | --------------------------------------- | -------- |
| id          | string                                  | false    |
| type        | [PIN_TYPE][EnumDeclaration-1]           | false    |
| name        | string                                  | false    |
| coords      | Array<number>                           | false    |
| platformNr  | string                  | true     |
| connections | [IConnection][InterfaceDeclaration-6][] | true     |
| info        | string                  | true     |

----------

##### IConnection

```typescript
interface IConnection {
    line: string;
    mode?: IMode;
}
```

**Properties**

| Name | Type                   | Optional |
| ---- | ---------------------- | -------- |
| line | string                 | false    |
| mode | [IMode][InterfaceDeclaration-13]  | true     |

----------

##### IMode

```typescript
interface IMode {
    title: string;
    name: string;
    iconUrl?: string;
}
```

**Properties**

| Name    | Type                    | Optional |
| ------- | ----------------------- | -------- |
| title   | string                  | false    |
| name    | string                  | false    |
| iconUrl | string  | true     |

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
    mode?: IMode;
    diva?: IDiva;
    directions: string[];
}
```

**Properties**

| Name       | Type                   | Optional |
| ---------- | ---------------------- | -------- |
| name       | string                 | false    |
| mode       | [IMode][InterfaceDeclaration-13]  | true     |
| diva       | [IDiva][InterfaceDeclaration-11]  | true     |
| directions | string[]               | false    |

----------

##### IMonitor

```typescript
interface IMonitor {
    arrivalTime: Date;
    scheduledTime: Date;
    id: string;
    line: string;
    direction: string;
    platform?: IPlatform;
    arrivalTimeRelative: number;
    scheduledTimeRelative: number;
    delayTime: number;
    state: string;
    mode?: IMode;
    diva?: IDiva;
}
```

**Properties**

| Name                  | Type                       | Optional |
| --------------------- | -------------------------- | -------- |
| arrivalTime           | Date                       | false    |
| scheduledTime         | Date                       | false    |
| id                    | string                     | false    |
| line                  | string                     | false    |
| direction             | string                     | false    |
| platform              | [IPlatform][InterfaceDeclaration-12]  | true     |
| arrivalTimeRelative   | number                     | false    |
| scheduledTimeRelative | number                     | false    |
| delayTime             | number                     | false    |
| state                 | string                     | false    |
| mode                  | [IMode][InterfaceDeclaration-13]      | true     |
| diva                  | [IDiva][InterfaceDeclaration-11]      | true     |

----------

##### ILocation

```typescript
interface ILocation {
    id: string;
    name: string;
    city: string;
    coords: Array<number>;
}
```

**Properties**

| Name   | Type          | Optional |
| ------ | ------------- | -------- |
| id     | string        | false    |
| name   | string        | false    |
| city   | string        | false    |
| coords | Array<number> | false    |

----------

##### IPoint

```typescript
interface IPoint extends ILocation {
    type: POI_TYPE;
}
```

**Extends**

[ILocation][InterfaceDeclaration-2]

**Properties**

| Name | Type                          | Optional |
| ---- | ----------------------------- | -------- |
| type | [POI_TYPE][EnumDeclaration-0] | false    |

----------

##### IStop

```typescript
interface IStop extends ILocation {
    type: string;
    platform?: IPlatform;
    arrival: Date;
    departure: Date;
}
```

**Extends**

[ILocation][InterfaceDeclaration-2]

**Properties**

| Name      | Type                       | Optional |
| --------- | -------------------------- | -------- |
| type      | string                     | false    |
| platform  | [IPlatform][InterfaceDeclaration-12]  | true     |
| arrival   | Date                       | false    |
| departure | Date                       | false    |

----------

##### IStopLocation

```typescript
interface IStopLocation extends ILocation {
    platform?: IPlatform;
    time: Date;
    type: string;
}
```

**Extends**

[ILocation][InterfaceDeclaration-2]

**Properties**

| Name     | Type                       | Optional |
| -------- | -------------------------- | -------- |
| platform | [IPlatform][InterfaceDeclaration-12]  | true     |
| time     | Date                       | false    |
| type     | string                     | false    |

----------

##### INode

```typescript
interface INode {
    stops: IStop[];
    departure?: IStopLocation;
    arrival?: IStopLocation;
    mode?: IMode;
    line: string;
    direction: string;
    diva?: IDiva;
    duration: number;
    path: Array<number>[];
}
```

**Properties**

| Name      | Type                               | Optional |
| --------- | ---------------------------------- | -------- |
| stops     | [IStop][InterfaceDeclaration-10][] | false    |
| departure | [IStopLocation][InterfaceDeclaration-14]      | true     |
| arrival   | [IStopLocation][InterfaceDeclaration-14]      | true     |
| mode      | [IMode][InterfaceDeclaration-13]              | true     |
| line      | string                             | false    |
| direction | string                             | false    |
| diva      | [IDiva][InterfaceDeclaration-11]              | true     |
| duration  | number                             | false    |
| path      | Array<number>[]                    | false    |

----------

##### ITrip

```typescript
interface ITrip {
    departure?: IStopLocation;
    arrival?: IStopLocation;
    duration: number;
    interchanges: number;
    nodes: INode[];
}
```

**Properties**

| Name         | Type                              | Optional |
| ------------ | --------------------------------- | -------- |
| departure    | [IStopLocation][InterfaceDeclaration-14]     | true     |
| arrival      | [IStopLocation][InterfaceDeclaration-14]     | true     |
| duration     | number                            | false    |
| interchanges | number                            | false    |
| nodes        | [INode][InterfaceDeclaration-9][] | false    |

----------

##### IRoute

```typescript
interface IRoute {
    origin?: ILocation;
    destination?: ILocation;
    trips: ITrip[];
}
```

**Properties**

| Name        | Type                              | Optional |
| ----------- | --------------------------------- | -------- |
| origin      | [ILocation][InterfaceDeclaration-2]         | true     |
| destination | [ILocation][InterfaceDeclaration-2]         | true     |
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
[InterfaceDeclaration-3]: README.md#iline
[FunctionDeclaration-5]: README.md#monitor
[InterfaceDeclaration-4]: README.md#imonitor
[FunctionDeclaration-6]: README.md#pins
[EnumDeclaration-1]: README.md#pin_type
[InterfaceDeclaration-5]: README.md#ipin
[FunctionDeclaration-7]: README.md#route
[InterfaceDeclaration-7]: README.md#iroute
[InterfaceDeclaration-11]: README.md#idiva
[InterfaceDeclaration-12]: README.md#iplatform
[InterfaceDeclaration-5]: README.md#ipin
[EnumDeclaration-1]: README.md#pin_type
[InterfaceDeclaration-6]: README.md#iconnection
[InterfaceDeclaration-6]: README.md#iconnection
[InterfaceDeclaration-13]: README.md#imode
[InterfaceDeclaration-0]: README.md#iaddress
[InterfaceDeclaration-1]: README.md#ipoint
[InterfaceDeclaration-1]: README.md#ipoint
[InterfaceDeclaration-3]: README.md#iline
[InterfaceDeclaration-4]: README.md#imonitor
[InterfaceDeclaration-2]: README.md#ilocation
[InterfaceDeclaration-1]: README.md#ipoint
[InterfaceDeclaration-2]: README.md#ilocation
[EnumDeclaration-0]: README.md#poi_type
[InterfaceDeclaration-10]: README.md#istop
[InterfaceDeclaration-2]: README.md#ilocation
[InterfaceDeclaration-14]: README.md#istoplocation
[InterfaceDeclaration-2]: README.md#ilocation
[InterfaceDeclaration-9]: README.md#inode
[InterfaceDeclaration-10]: README.md#istop
[InterfaceDeclaration-8]: README.md#itrip
[InterfaceDeclaration-9]: README.md#inode
[InterfaceDeclaration-7]: README.md#iroute
[InterfaceDeclaration-8]: README.md#itrip
[TypeAliasDeclaration-0]: README.md#coord
[EnumDeclaration-0]: README.md#poi_type
[EnumDeclaration-1]: README.md#pin_type
<!-- AUTO-GENERATED-CONTENT:END -->
