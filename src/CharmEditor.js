// src/CharmEditor.js
import React from "react";
import { CHARM_MAP } from "./charmData";

export default class CharmEditor extends React.Component {
    handleChange = (key, value) => {
        // Parse the value to int, default to 0 if empty
        const intVal = parseInt(value, 10) || 0;
        this.props.onUpdate(key, intVal);
    };

    render() {
        const { data } = this.props;
        
        // We filter the map to only show charms that actually exist in the save file
        const availableCharms = Object.keys(CHARM_MAP).filter(key => data.hasOwnProperty(key));

        if (availableCharms.length === 0) {
            return <div className="no-charms">No charm data found in this save file.</div>;
        }

        return (
            <div className="charm-grid">
                {availableCharms.map(key => {
                    const info = CHARM_MAP[key];
                    const currentCost = data[key];

                    return (
                        <div key={key} className="charm-card">
                            <img 
                                src={`icons/${info.img}`} 
                                alt={info.name} 
                                onError={(e) => {e.target.style.display='none'}} // Hide if image missing
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
        );
    }
}
