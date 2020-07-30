import { findStop, IPoint } from "dvbjs";
import * as React from "react";
import Autocomplete from "react-autocomplete";
import DepartureList from "./DepartureList";
import { useState } from "react";
import { useEffect } from "react";

const stopSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    id="Ebene_1"
    x="0px"
    y="0px"
    viewBox="-133 134.5 16 16"
    className="stop-svg"
  >
    <g id="IPhone">
      <g id="Icon_20_" transform="translate(0.000000, -2.000000)">
        <path
          id="Shape"
          d="M-125,136.5c-4.4,0-8,3.6-8,8c0,4.4,3.6,8,8,8s8-3.6,8-8C-117,140.1-120.6,136.5-125,136.5L-125,136.5z     M-125,150.9c-3.5,0-6.4-2.9-6.4-6.4c0-3.5,2.9-6.4,6.4-6.4c3.5,0,6.4,2.9,6.4,6.4C-118.6,148-121.5,150.9-125,150.9L-125,150.9z"
        />
        <g>
          <path d="M-126.4,140.9v2.7h2.9v-2.7h1.6v7.1h-1.6V145h-2.9v3.1h-1.6v-7.1H-126.4z" />
        </g>
      </g>
    </g>
  </svg>
);

const SELECTED_STOP_KEY = "SELECTED_STOP_KEY";

export const App: React.FunctionComponent = () => {
  const [autocompleteValue, setAutocompleteValue] = useState("");
  const [autocompleteItems, setAutocompleteItems] = useState<IPoint[]>([]);
  const [selectedStop, setSelectedStop] = useState<IPoint>();

  useEffect(() => {
    const stopString = localStorage.getItem(SELECTED_STOP_KEY);
    if (stopString) {
      setSelectedStop(JSON.parse(stopString));
    }
  }, [setSelectedStop]);

  const autocompleteChanged = (_: any, autocompleteValue: string) => {
    setAutocompleteValue(autocompleteValue);
    findStop(autocompleteValue)
      .then((autocompleteItems) => {
        setAutocompleteItems(autocompleteItems);
      })
      .catch(console.error);
  };

  const selectItem = (_: any, selectedStop: IPoint) => {
    localStorage.setItem(SELECTED_STOP_KEY, JSON.stringify(selectedStop));
    setSelectedStop(selectedStop);
  };

  return (
    <div className="App">
      {selectedStop ? (
        <div>
          <h3
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedStop(undefined)}
          >
            {stopSvg}
            {selectedStop.name}
          </h3>
          <DepartureList stop={selectedStop.id} />
        </div>
      ) : (
        <Autocomplete
          inputProps={{ autoFocus: true }}
          items={autocompleteItems}
          value={autocompleteValue}
          getItemValue={(item: IPoint) => item.id}
          renderItem={(item: IPoint, isHighlighted) => (
            <div
              className={`item ${isHighlighted ? "item-highlighted" : ""}`}
              key={item.id}
            >
              {item.name}, {item.city}
            </div>
          )}
          onSelect={selectItem}
          onChange={autocompleteChanged}
        />
      )}
    </div>
  );
};

export default App;
