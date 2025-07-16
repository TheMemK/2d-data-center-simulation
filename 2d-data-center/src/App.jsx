import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const rackData = [
    { id: 1, name: "Rack 1", type: "Storage" },
    { id: 2, name: "Rack 2", type: "Network" },
    { id: 3, name: "Rack 3", type: "Server" },
    { id: 4, name: "Rack 4", type: "Server" },
    { id: 5, name: "Rack 5", type: "Network" },
    { id: 6, name: "Rack 6", type: "Server" },
    { id: 7, name: "Rack 7", type: "Server" },
    { id: 8, name: "Rack 8", type: "Network" },
    { id: 9, name: "Rack 9", type: "Server" },
    { id: 10, name: "Rack 10", type: "Storage" },
  ];

  const simulationSettings = {
    updateInterval: 2000, // Update every 2 seconds
    tempVariation: 1, // Maximum temperature change per update
    isRunning: true, // Whether simulation is active
  };

  const [acTemperatures, setAcTemperatures] = useState([
    { id: 1, name: "AC-1", temp: 20 },
    { id: 2, name: "AC-2", temp: 22 },
    { id: 3, name: "AC-3", temp: 21 },
    { id: 4, name: "AC-4", temp: 20 },
  ]);

  const [simulatedRackTemps, setSimulatedRackTemps] = useState({});

  const warningStatus = (rackType, temperature) => {
    if (rackType === "Server" && temperature > 30) return "WARNING";
    if (rackType === "Network" && temperature > 28) return "WARNING";
    if (rackType === "Storage" && temperature > 25) return "WARNING";
  };

  const calculateRacktemp = (rackPosition, rackType) => {
    const rackHeat = {
      Server: 8,
      Network: 5,
      Storage: 3,
    };

    let nearestACTemp;
    if (rackPosition <= 2) {
      nearestACTemp = acTemperatures[0].temp;
    } else if (rackPosition <= 5) {
      nearestACTemp = acTemperatures[1].temp;
    } else if (rackPosition <= 7) {
      nearestACTemp = acTemperatures[2].temp;
    } else {
      nearestACTemp = acTemperatures[3].temp;
    }

    return nearestACTemp + rackHeat[rackType];
  };

  const updateAcTemp = (acId, newTemp) => {
    setAcTemperatures((prev) =>
      prev.map((ac) => (ac.id === acId ? { ...ac, temp: newTemp } : ac))
    );
  };

  const simulateTemperatureChanges = () => {
    setSimulatedRackTemps((prevTemps) => {
      const newTemps = { ...prevTemps };

      rackData.forEach((rack) => {
        const baseTemp = calculateRacktemp(rack.id, rack.type);
        const currentSimulatedTemp = prevTemps[rack.id] || baseTemp;

        const randomChange =
          (Math.random() - 0.5) * 2 * simulationSettings.tempVariation;
        let newTemp = currentSimulatedTemp + randomChange;

        const minTemp = baseTemp - 3;
        const maxTemp = baseTemp + 5;
        newTemp = Math.max(minTemp, Math.min(maxTemp, newTemp));

        newTemps[rack.id] = Math.round(newTemp);
      });

      return newTemps;
    });
  };

  // Initialize temperatures when AC changes
  useEffect(() => {
    const initialTemps = {};
    rackData.forEach((rack) => {
      initialTemps[rack.id] = calculateRacktemp(rack.id, rack.type);
    });
    setSimulatedRackTemps(initialTemps);
  }, [acTemperatures]);

  // Start the temperature simulation timer
  useEffect(() => {
    if (!simulationSettings.isRunning) return;

    const interval = setInterval(() => {
      simulateTemperatureChanges();
    }, simulationSettings.updateInterval);

    return () => clearInterval(interval);
  }, [acTemperatures, simulationSettings.isRunning]);

  const racks = rackData.map((rack) => ({
    ...rack,
    temperature:
      simulatedRackTemps[rack.id] || calculateRacktemp(rack.id, rack.type),
  }));

  return (
    <div className="data-center-room">
      <h1>2D Data Center Simulation</h1>

      <div className="main-layout">
        <div className="ac-controls">
          <h3>AC Temperature Controls:</h3>
          <div className="simulation-status"></div>
          <div className="controls-grid">
            {acTemperatures.map((ac) => (
              <div key={ac.id} className="ac-control">
                <label>{ac.name}:</label>
                <span className="temp-display">{ac.temp}°C</span>
                <div className="temp-buttons">
                  <button
                    onClick={() => updateAcTemp(ac.id, ac.temp - 1)}
                    disabled={ac.temp === 15}
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateAcTemp(ac.id, ac.temp + 1)}
                    disabled={ac.temp === 30}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          <div className="legend">
            <h3>Equipment Types:</h3>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color rack-server"></div>
                <span>Server Racks</span>
              </div>
              <div className="legend-item">
                <div className="legend-color rack-network"></div>
                <span>Network Racks</span>
              </div>
              <div className="legend-item">
                <div className="legend-color rack-storage"></div>
                <span>Storage Racks</span>
              </div>
              <div className="legend-item">
                <div className="legend-color ac-unit"></div>
                <span>AC Units</span>
              </div>
            </div>
          </div>

          <div className="room-container">
            <div className="ac-row">
              {acTemperatures.slice(0, 2).map((ac) => (
                <div key={ac.id} className="ac-unit">
                  <div>{ac.name}</div>
                  <div className="ac-temp">: {ac.temp}°C</div>
                </div>
              ))}
            </div>

            <div className="rack-row">
              {racks.slice(0, 5).map((rack) => (
                <div
                  key={rack.id}
                  className={`rack rack-${rack.type.toLowerCase()}${
                    warningStatus(rack.type, rack.temperature) === "WARNING"
                      ? " overheating"
                      : ""
                  }`}
                >
                  <div className="rack-name">{rack.name}</div>
                  <div className="rack-temp">{rack.temperature}°C</div>

                  {warningStatus(rack.type, rack.temperature) === "WARNING" && (
                    <div className="warning-sign"> HIGH TEMP!</div>
                  )}
                </div>
              ))}
            </div>

            <div className="walkway">
              <span className="walkway-label">Main Walkway</span>
            </div>

            <div className="rack-row">
              {racks.slice(5, 10).map((rack) => (
                <div
                  key={rack.id}
                  className={`rack rack-${rack.type.toLowerCase()}${
                    warningStatus(rack.type, rack.temperature) === "WARNING"
                      ? " overheating"
                      : ""
                  }`}
                >
                  <div className="rack-name">{rack.name}</div>
                  <div className="rack-temp">{rack.temperature}°C</div>

                  {warningStatus(rack.type, rack.temperature) === "WARNING" && (
                    <div className="warning-sign"> HIGH TEMP!</div>
                  )}
                </div>
              ))}
            </div>

            <div className="ac-row">
              {acTemperatures.slice(2, 4).map((ac) => (
                <div key={ac.id} className="ac-unit">
                  <div>{ac.name}</div>
                  <div className="ac-temp">: {ac.temp}°C</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
