import { useState, useEffect } from "react";
import "./index.css";

function App() {
  // This is a test github commit
  // ===== 1. BASIC DATA & SETTINGS (No dependencies) =====

  // Racks data - the foundation
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

  // Simulation settings - controls
  const simulationSettings = {
    updateInterval: 2000, // Update every 2 seconds
    tempVariation: 1, // Maximum temperature change per update
    isRunning: true, // Whether simulation is active
  };

  // ===== 2. STATE DEFINITIONS =====

  // AC units with controllable temperatures
  const [acTemperatures, setAcTemperatures] = useState([
    { id: 1, name: "AC-1", temp: 20 },
    { id: 2, name: "AC-2", temp: 22 },
    { id: 3, name: "AC-3", temp: 21 },
    { id: 4, name: "AC-4", temp: 20 },
  ]);

  // Simulated rack temperatures
  const [simulatedRackTemps, setSimulatedRackTemps] = useState({});

  // ===== 3. HELPER FUNCTIONS (Use state but don't change it) =====

  // Warning Function
  const warningStatus = (rackType, temperature) => {
    if (rackType === "Server" && temperature > 30) return "WARNING";
    if (rackType === "Network" && temperature > 28) return "WARNING";
    if (rackType === "Storage" && temperature > 25) return "WARNING";
  };

  // Calculate base rack temperature (uses AC state)
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

  // ===== 4. STATE-CHANGING FUNCTIONS =====

  // Function to update AC temperature
  const updateAcTemp = (acId, newTemp) => {
    setAcTemperatures((prev) =>
      prev.map((ac) => (ac.id === acId ? { ...ac, temp: newTemp } : ac))
    );
  };

  // Temperature simulation function
  const simulateTemperatureChanges = () => {
    setSimulatedRackTemps((prevTemps) => {
      const newTemps = { ...prevTemps };

      rackData.forEach((rack) => {
        const baseTemp = calculateRacktemp(rack.id, rack.type);
        const currentSimulatedTemp = prevTemps[rack.id] || baseTemp;

        // Generate random temperature change
        const randomChange =
          (Math.random() - 0.5) * 2 * simulationSettings.tempVariation;
        let newTemp = currentSimulatedTemp + randomChange;

        // Keep temperature within reasonable bounds
        const minTemp = baseTemp - 3;
        const maxTemp = baseTemp + 5;
        newTemp = Math.max(minTemp, Math.min(maxTemp, newTemp));

        // Round to 1 decimal place
        newTemps[rack.id] = Math.round(newTemp * 10) / 10;
      });

      return newTemps;
    });
  };

  // ===== 5. EFFECTS (Use everything above) =====

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

  // ===== 6. COMPUTED VALUES (For rendering) =====

  // Add temperatures to each rack for display
  const racks = rackData.map((rack) => ({
    ...rack,
    temperature:
      simulatedRackTemps[rack.id] || calculateRacktemp(rack.id, rack.type),
  }));

  // ===== 7. RENDER UI =====

  return (
    <div className="data-center-room">
      <h1>2D Data Center Simulation</h1>

      <div className="main-layout">
        {/* AC Temperature Controls - Left Side */}
        <div className="ac-controls">
          <h3>AC Temperature Controls:</h3>
          {/* Simulation status indicator*/}
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

        {/* Main Content - Right Side */}
        <div className="main-content">
          {/* Legend section */}
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

          {/* Data Center Room Container */}
          <div className="room-container">
            {/* Air Conditioning Units - Top */}
            <div className="ac-row">
              {acTemperatures.slice(0, 2).map((ac) => (
                <div key={ac.id} className="ac-unit">
                  <div>{ac.name}</div>
                  <div className="ac-temp">: {ac.temp}°C</div>
                </div>
              ))}
            </div>

            {/* First row of racks */}
            <div className="rack-row">
              {racks.slice(0, 5).map((rack) => (
                <div
                  key={rack.id}
                  className={`rack rack-${rack.type.toLowerCase()}`}
                >
                  <div className="rack-name">{rack.name}</div>
                  <div className="rack-temp">{rack.temperature}°C</div>

                  {warningStatus(rack.type, rack.temperature) === "WARNING" && (
                    <div className="warning-sign"> HIGH TEMP!</div>
                  )}
                </div>
              ))}
            </div>

            {/* Walkway between rack rows */}
            <div className="walkway">
              <span className="walkway-label">Main Walkway</span>
            </div>

            {/* Second row of racks */}
            <div className="rack-row">
              {racks.slice(5, 10).map((rack) => (
                <div
                  key={rack.id}
                  className={`rack rack-${rack.type.toLowerCase()}`}
                >
                  <div className="rack-name">{rack.name}</div>
                  <div className="rack-temp">{rack.temperature}°C</div>

                  {warningStatus(rack.type, rack.temperature) === "WARNING" && (
                    <div className="warning-sign"> HIGH TEMP!</div>
                  )}
                </div>
              ))}
            </div>

            {/* Air Conditioning Units - Bottom */}
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
