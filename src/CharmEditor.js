import React from "react";
import { CHARM_MAP } from "./charmData";

export default class CharmEditor extends React.Component {
    handleChange = (key, value) => {
        const intVal = parseInt(value, 10);
        // If it's NaN (empty), don't update yet
        if (isNaN(intVal)) return;
        this.props.onUpdate(key, intVal);
    };

    render() {
        const { data } = this.props;

        return (
            <div className="charm-grid">
                {Object.keys(CHARM_MAP).map(key => {
                    const info = CHARM_MAP[key];
                    
                    // Logic: Check if 'charmCost_X' exists in the save file.
                    // If YES: Use that value.
                    // If NO: Use the standard default cost (so it doesn't look like 0).
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
        );
    }
}
