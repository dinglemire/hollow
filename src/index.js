import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Encode, Decode, Hash, DownloadData, HumanTime } from "./functions.js";
import CharmEditor from "./CharmEditor.js";
import InventoryEditor from "./InventoryEditor.js";
import "./style.css";

function useDragDrop(onDrop) {
    const [isDragging, setIsDragging] = useState(false);
    useEffect(() => {
        const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
        const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
        const handleDrop = (e) => {
            e.preventDefault(); setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onDrop(e.dataTransfer.files[0]);
            }
        };
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("drop", handleDrop);
        return () => {
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("drop", handleDrop);
        };
    }, [onDrop]);
    return isDragging;
}

function App() {
    const [fileData, setFileData] = useState("");
    const [fileName, setFileName] = useState("");
    const [originalData, setOriginalData] = useState("");
    const [isSwitchMode, setIsSwitchMode] = useState(false);
    const [activeTab, setActiveTab] = useState("charms");
    const [history, setHistory] = useState([]);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("hollow_history");
            if (saved) setHistory(JSON.parse(saved));
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        localStorage.setItem("hollow_history", JSON.stringify(history));
    }, [history]);

    const addToHistory = (json, name) => {
        const hash = Hash(json);
        const newItem = { hash, fileName: name, date: new Date().toISOString(), jsonString: json };
        setHistory(prev => [newItem, ...prev.filter(i => i.hash !== hash)].slice(0, 5));
    };

    const processFile = (file) => {
        const reader = new FileReader();
        if (isSwitchMode) reader.readAsText(file);
        else reader.readAsArrayBuffer(file);

        reader.onload = () => {
            try {
                let decrypted = isSwitchMode ? reader.result : Decode(new Uint8Array(reader.result));
                // Ensure it is pretty printed
                const jsonString = JSON.stringify(JSON.parse(decrypted), null, 2);
                setFileData(jsonString);
                setOriginalData(jsonString);
                setFileName(file.name);
                addToHistory(jsonString, file.name);
            } catch (err) {
                alert("Failed to decrypt. Is this a valid save file?");
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const isDragging = useDragDrop(processFile);

    const handleDownload = (type) => {
        try {
            const obj = JSON.parse(fileData);
            const str = JSON.stringify(obj);
            if (type === 'switch') {
                DownloadData(JSON.stringify(obj, null, 2), "plain.dat");
            } else {
                const encrypted = Encode(str);
                DownloadData(encrypted, "user1.dat");
            }
        } catch (e) {
            alert("Invalid JSON. Please fix errors in Text Mode before saving.");
        }
    };

    // --- HELPER TO FIND THE REAL DATA ---
    const getEditingContext = (fullJson) => {
        if (fullJson.playerData) return fullJson.playerData;
        return fullJson;
    };

    const handleVisualUpdate = (key, value) => {
        try {
            const fullJson = JSON.parse(fileData);
            
            // Auto-detect where to save (Root or PlayerData)
            if (fullJson.playerData) {
                fullJson.playerData[key] = value;
            } else {
                fullJson[key] = value;
            }

            setFileData(JSON.stringify(fullJson, null, 2));
        } catch (e) { console.error("Error updating JSON", e); }
    };

    let parsedData = {};
    let editingData = {};
    let isValidJson = true;
    
    if (fileData) {
        try { 
            parsedData = JSON.parse(fileData);
            // This is the magic fix: We send the INNER object to the editors
            editingData = getEditingContext(parsedData);
        } catch (e) { isValidJson = false; }
    }

    return (
        <div id="wrapper">
            {isDragging && <div id="cover">Drop file to load</div>}
            <header>
                <h1>Hollow Knight Save Editor</h1>
                <p>Modify your save. Works for PC and Switch.</p>
            </header>

            <div className="controls">
                <button id="file-button" onClick={() => fileInputRef.current.click()}>Open Save File</button>
                <label className="switch-toggle">
                    <input type="checkbox" checked={isSwitchMode} onChange={() => setIsSwitchMode(!isSwitchMode)} />
                    Switch Mode (Plain Text)
                </label>
            </div>

            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files.length > 0 && processFile(e.target.files[0])} style={{display: 'none'}} />

            {fileData && (
                <div id="editor-wrapper">
                    <div id="editor-header">
                        <span>Editing: <strong>{fileName}</strong></span>
                        <div className="view-toggles">
                            <button className={activeTab === 'charms' ? 'active' : ''} onClick={() => setActiveTab('charms')}>Charms</button>
                            <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>Inventory</button>
                            <button className={activeTab === 'json' ? 'active' : ''} onClick={() => setActiveTab('json')}>JSON</button>
                        </div>
                    </div>

                    {activeTab === 'json' || !isValidJson ? (
                        <textarea id="editor" value={fileData} onChange={(e) => setFileData(e.target.value)} spellCheck={false} />
                    ) : (
                        <div id="visual-editor">
                            {activeTab === 'charms' && (
                                <CharmEditor data={editingData} onUpdate={handleVisualUpdate} />
                            )}
                            {activeTab === 'inventory' && (
                                <InventoryEditor data={editingData} onUpdate={handleVisualUpdate} />
                            )}
                        </div>
                    )}

                    <div id="editor-buttons">
                        <button onClick={() => setFileData(originalData)}>Reset</button>
                        <button onClick={() => handleDownload('switch')}>Download (Decrypted)</button>
                        <button onClick={() => handleDownload('pc')}>Download (Encrypted)</button>
                    </div>
                </div>
            )}

            {history.length > 0 && (
                <div id="history">
                    <h3>Recent Files</h3>
                    <ul>
                        {history.map((item) => (
                            <li key={item.hash} onClick={() => { setFileData(item.jsonString); setFileName(item.fileName); }}>
                                {item.fileName} <small>({HumanTime(new Date(item.date))})</small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
