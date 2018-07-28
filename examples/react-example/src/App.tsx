// tslint:disable:jsx-no-lambda

import { findStop, IPoint } from 'dvbjs';
import * as React from 'react';
import * as Autocomplete from 'react-autocomplete';
import DepartureList from "./DepartureList";

const stopSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Ebene_1" x="0px" y="0px" viewBox="-133 134.5 16 16" className="stop-svg">
    <g id="IPhone">
      <g id="Icon_20_" transform="translate(0.000000, -2.000000)">
        <path id="Shape" d="M-125,136.5c-4.4,0-8,3.6-8,8c0,4.4,3.6,8,8,8s8-3.6,8-8C-117,140.1-120.6,136.5-125,136.5L-125,136.5z     M-125,150.9c-3.5,0-6.4-2.9-6.4-6.4c0-3.5,2.9-6.4,6.4-6.4c3.5,0,6.4,2.9,6.4,6.4C-118.6,148-121.5,150.9-125,150.9L-125,150.9z" />
        <g>
          <path d="M-126.4,140.9v2.7h2.9v-2.7h1.6v7.1h-1.6V145h-2.9v3.1h-1.6v-7.1H-126.4z" />
        </g>
      </g>
    </g>
  </svg>
)

interface IAppState {
  selectedStop?: IPoint;
  autocompleteValue: string;
  autocompleteItems: IPoint[];
}


class App extends React.Component<{}, IAppState> {
  private static SELECTED_STOP_KEY = "SELECTED_STOP_KEY";

  constructor(props: {}) {
    super(props);

    const stopString = localStorage.getItem(App.SELECTED_STOP_KEY);
    const selectedStop = stopString ? JSON.parse(stopString) : undefined;

    this.state = {
      autocompleteItems: [],
      autocompleteValue: "",
      selectedStop,
    }
  }
  public render() {
    return (
      <div className="App">
        {this.state.selectedStop ?
          <div>
            <h3
              style={{ cursor: "pointer" }}
              onClick={() => this.setState({ selectedStop: undefined })}>
              {stopSvg}
              {this.state.selectedStop.name}
            </h3>
            <DepartureList stop={this.state.selectedStop.id} />
          </div>
          :
          <Autocomplete
            inputProps={{ autoFocus: true }}
            items={this.state.autocompleteItems}
            value={this.state.autocompleteValue}
            getItemValue={(item: IPoint) => item.id}
            renderItem={(item: IPoint, isHighlighted) => (
              <div
                className={`item ${isHighlighted ? 'item-highlighted' : ''}`}
                key={item.id}>
                {item.name}, {item.city}
              </div>
            )}
            onSelect={(_, selectedStop: IPoint) => {
              localStorage.setItem(App.SELECTED_STOP_KEY, JSON.stringify(selectedStop));
              this.setState({ selectedStop })
            }}
            onChange={(_, autocompleteValue) => {
              this.setState({ autocompleteValue })
              findStop(autocompleteValue)
                .then(autocompleteItems => {
                  this.setState({ autocompleteItems })
                })
            }}
          />
        }
      </div>
    );
  }
}

export default App;
