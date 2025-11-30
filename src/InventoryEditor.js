import React from "react";

// Configuration for the items we want to edit
const INVENTORY_ITEMS = [
    { key: "geo",        name: "Geo",          img: "Geo.png",        min: 0, max: 9999999 },
    { key: "ore",        name: "Pale Ore",     img: "Pale_Ore.png",   min: 0, max: 6 },
    { key: "simpleKeys", name: "Simple Keys",  img: "Simple_Key.png", min: 0, max: 4 },
    // PlayTime in save file is usually seconds (float)
    { key: "playTime",   name: "Play Time (s)", img: "Clock.png",     min: 0, max: 9999999, step: 100 },
];

export default function InventoryEditor({ data, onUpdate }) {
    
    const handleChange = (key, value) => {
        let numVal = parseFloat(value);
        if (isNaN(numVal)) numVal = 0;
        onUpdate(key, numVal);
    };

    return (
        <div className="charm-grid inventory-grid">
            {INVENTORY_ITEMS.map(item => {
                const value = data[item.key] || 0;
                
                return (
                    <div key={item.key} className="charm-card">
                        <img 
                            src={`icons/${item.img}`} 
                            alt={item.name}
                            // If image fails (like Clock.png missing), hide image and show text only
                            onError={(e) => {e.target.style.display='none'}} 
                        />
                        <div className="charm-name">{item.name}</div>
                        
                        <div className="charm-input-wrapper">
                            <input 
                                type="number" 
                                value={value}
                                min={item.min}
                                max={item.max}
                                step={item.step || 1}
                                onChange={(e) => handleChange(item.key, e.target.value)}
                            />
                        </div>
                        
                        {/* Helper for PlayTime to show hours */}
                        {item.key === "playTime" && (
                            <div style={{fontSize: "0.7em", color: "#888", marginTop: "5px"}}>
                                {(value / 3600).toFixed(1)} Hours
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
