import { IMonitor, monitor } from "dvbjs";
import * as React from "react";

export interface IDepartureListProps {
  stop: string;
}

interface IDepartureListState {
  departures: IMonitor[];
  timer?: number;
}

export default class DepartureList extends React.Component<
  IDepartureListProps,
  IDepartureListState
> {
  constructor(props: IDepartureListProps) {
    super(props);
    this.state = { departures: [] };
  }
  public componentDidMount() {
    const timer = window.setInterval(this.update.bind(this), 10000);
    this.setState({ timer });
    this.update();
  }

  public componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  public render() {
    return (
      <table className="DepartureList">
        <thead>
          <tr>
            <th colSpan={2} className="align-left">
              Linie
            </th>
            <th className="align-left">Richtung</th>
            <th className="align-right">in Min</th>
          </tr>
        </thead>
        <tbody>
          {this.state.departures.map((departure) => (
            <tr key={`${departure.id}${departure.scheduledTime}`}>
              <td>
                <img src={departure.mode.icon_url} alt={departure.mode.name} />
              </td>
              <td className="align-left">{departure.line}</td>
              <td className="align-left">{departure.direction}</td>
              <td className="align-right">{departure.arrivalTimeRelative}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  private update() {
    monitor(this.props.stop).then((departures) => {
      this.setState({ departures });
    });
  }
}
