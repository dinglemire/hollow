import React from "react";
import { CHARM_MAP } from "./charmData";

// IDs for the "Balanced" Preset
const BALANCED_IDS = [
    "charmCost_2",  // Wayward Compass
    "charmCost_1",  // Gathering Swarm
    "charmCost_15", // Heavy Blow
    "charmCost_6",  // Fury of the Fallen
    "charmCost_27", // Joni's Blessing
    "charmCost_21", // Soul Eater
    "charmCost_34", // Deep Focus
    "charmCost_29", // Hiveblood
    "charmCost_11", // Flukenest
    "charmCost_35"  // Grubberfly's Elegy
];

export default class CharmEditor extends React.Component {
    handleChange = (key, value) => {
        const intVal = parseInt(value, 10);
        if (isNaN(intVal)) return;
        this.props.onUpdate(key, intVal);
    };

    applyPreset = (mode) => {
        const updates = {};
        
        Object.keys(CHARM_MAP).forEach(key => {
            const info = CHARM_MAP[key];
            const defaultCost = info.default;

            if (mode === 'minus_one') {
                // Formula: Default Cost - 1 (Minimum 0)
                // We use Default Cost as base so it doesn't keep going down if you click twice.
                let newCost = defaultCost - 1;
                if (newCost < 0) newCost = 0;
                updates[key] = newCost;
            } 
            else if (mode === 'balanced') {
                // If this charm is in our "Balanced List", reduce it by 1
                if (BALANCED_IDS.includes(key)) {
                    let newCost = defaultCost - 1;
                    if (newCost < 0) newCost = 0;
                    updates[key] = newCost;
                }
            }
        });

        // Send all changes to App
        this.props.onBulkUpdate(updates);
    };

    render() {
        const { data } = this.props;

        return (
            <div>
                {/* PRESET BUTTONS */}
                <div style={{marginBottom: "20px", display: "flex", gap: "10px", justifyContent: "center"}}>
                    <button onClick={() => this.applyPreset('minus_one')} title="Reduces every charm cost by 1">
                        📉 Global -1 Cost
                    </button>
                    <button onClick={() => this.applyPreset('balanced')} title="Reduces weak charms by 1 (Compass, Swarm, Hiveblood, etc)">
                        ⚖️ Balanced Mode
                    </button>
                </div>

                <div className="charm-grid">
                    {Object.keys(CHARM_MAP).map(key => {
                        const info = CHARM_MAP[key];
                        const exists = data.hasOwnProperty(key);
                        const currentCost = exists ? data[key] : info.default;
                        const isModified = exists && data[key] !== info.default;

                        return (
                            <div key={key} className={`charm-card ${isModified ? 'modified' : ''}`}>
                                <img 
                                    src={`icons/${info.img}`} 
                                    alt={info.name} 
                                    onError={(e) => {e.target.style.display='none'}}
                                />
                                <div className="charm-name">{info.name}</div>
                                <div className="charm-input-wrapper">
                                    <label>Cost:</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={currentCost} 
                                        onChange={(e) => this.handleChange(key, e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
