import React, { useState, FunctionComponent } from "react";
import { IMonitor, monitor } from "dvbjs";
import { useEffect } from "react";

export interface DepartureListProps {
  stop: string;
}

const DepartureList: FunctionComponent<DepartureListProps> = ({ stop }) => {
  const [departures, setDepartures] = useState<IMonitor[]>([]);

  useEffect(() => {
    const update = () => {
      monitor(stop).then((departures) => {
        setDepartures(departures);
      });
    };
    update();
    const timer = setInterval(() => {
      update();
    }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, [setDepartures, stop]);

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
        {departures.map((departure) => (
          <tr key={`${departure.id}${departure.scheduledTime}`}>
            <td>
              {departure.mode && (
                <img src={departure.mode.iconUrl} alt={departure.mode.name} />
              )}
            </td>
            <td className="align-left">{departure.line}</td>
            <td className="align-left">{departure.direction}</td>
            <td className="align-right">{departure.arrivalTimeRelative}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DepartureList;
