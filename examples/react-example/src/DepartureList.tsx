import { IMonitor, monitor } from 'dvbjs';
import * as React from 'react';

export interface IDepartureListProps {
    stop: string;
}

interface IDepartureListState {
    departures: IMonitor[];
    timer?: number;
}

function replaceUmlauts(str: string): string {
    str = str.replace(/ä/g, 'ae');
    str = str.replace(/ö/g, 'oe');
    str = str.replace(/ü/g, 'ue');
    str = str.replace(/Ä/g, 'Ae');
    str = str.replace(/Ö/g, 'Oe');
    str = str.replace(/Ü/g, 'Ue');
    str = str.replace(/ß/g, 'ss');
    str = str.replace(/,/g, '');
    return str;
}

export default class DepartureList extends React.Component<IDepartureListProps, IDepartureListState> {
    constructor(props: IDepartureListProps) {
        super(props);
        this.state = { departures: [] }
    }
    public componentDidMount() {
        const timer = setInterval(this.update.bind(this), 10000);
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
                        <th colSpan={2} className="align-left">Linie</th>
                        <th className="align-left">Richtung</th>
                        <th className="align-right">in Min</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.departures.map(departure => (
                        <tr key={departure.id}>
                            <td><img src={departure.mode.icon_url} /></td>
                            <td className="align-left">{departure.line}</td>
                            <td className="align-left">{replaceUmlauts(departure.direction)}</td>
                            <td className="align-right">{departure.arrivalTimeRelative}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    }

    private update() {
        monitor(this.props.stop)
            .then((departures) => {
                this.setState({ departures })
            })
    }
}
