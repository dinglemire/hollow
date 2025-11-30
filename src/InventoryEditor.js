import React from "react";

// Added Notches, Health, and Soul
const INVENTORY_ITEMS = [
    { key: "geo",        name: "Geo",          img: "Geo.png",        min: 0, max: 9999999 },
    { key: "charmSlots", name: "Notches",      img: "Notch.png",      min: 0, max: 120 }, // You can go crazy here
    { key: "maxHealth",  name: "Masks (HP)",   img: "Mask.png",       min: 0, max: 99 },
    { key: "MPReserveMax", name: "Soul (Max)", img: "Soul.png",       min: 0, max: 198 }, // 33 per vessel usually
    { key: "ore",        name: "Pale Ore",     img: "Pale_Ore.png",   min: 0, max: 6 },
    { key: "simpleKeys", name: "Simple Keys",  img: "Simple_Key.png", min: 0, max: 4 },
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

                        {/* Helper for PlayTime */}
                        {item.key === "playTime" && (
                            <div className="sub-text">{(value / 3600).toFixed(1)} Hours</div>
                        )}
                        {/* Helper for Soul */}
                        {item.key === "MPReserveMax" && (
                            <div className="sub-text">{(value / 33).toFixed(1)} Vessels</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
