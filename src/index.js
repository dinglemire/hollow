// src/index.js
import React, { Fragment } from "react"
import ReactDOM from "react-dom"
import { Encode, Decode, Hash, DownloadData, HumanTime } from "./functions.js"
import History from "./history.js"
import WindowDrag from "./windowDrag.js"
import CharmEditor from "./CharmEditor.js" // <--- Import the new component
import "./style.css"

var history = new History()
var windowDrag = new WindowDrag()

class App extends React.Component {
    constructor(){
        super()
        this.fileInputRef = React.createRef()
        // Event listeners for drag and drop
        windowDrag.onDrop = e => this.handleFileChange(e.dataTransfer.files) 
        windowDrag.onDragEnter = () => this.setState({ dragging: true })
        windowDrag.onDragLeave = () => this.setState({ dragging: false })
    }

    state = {
        gameFile: "", 
        gameFileOriginal: "",
        editing: false,
        dragging: false,
        switchMode: false,
        viewMode: "visual" // "visual" or "text"
    }

    handleFileClick = () => {
        this.fileInputRef.current.click()
    }

    handleFileChange = files => {
        if (files.length == 0) return 
        
        let file = files[0]
        let reader = new FileReader()

        if (this.state.switchMode){
            reader.readAsText(file)
        } else {
            reader.readAsArrayBuffer(file)
        }

        reader.addEventListener("load", () => {
            var result = reader.result
            try {
                let decrypted = ""
                if (this.state.switchMode) {
                    decrypted = result
                } else {
                    decrypted = Decode(new Uint8Array(result))
                }
                
                // Format JSON nicely
                var jsonString = JSON.stringify(JSON.parse(decrypted), undefined, 2)
                
                const hash = Hash(jsonString)
                history.removeFromHistory(hash)
                history.addToHistory(jsonString, file.name, hash)
                history.syncToLocalStorage()
                
                this.setGameFile(jsonString, file.name)
            } catch (err){
                window.alert("The file could not be decrypted. Ensure it is a valid save.")
                console.warn(err)
            } 
            this.fileInputRef.current.value = null
        })
    }

    handleTextEditorChange = e => {
        this.setState({gameFile: e.target.value})
    }

    // New method to handle updates from the Visual Editor
    handleVisualUpdate = (key, value) => {
        try {
            const data = JSON.parse(this.state.gameFile);
            data[key] = value;
            this.setState({ gameFile: JSON.stringify(data, undefined, 2) });
        } catch (e) {
            console.error("Error updating JSON", e);
        }
    }

    handleReset = e => {
        this.setState({
            gameFile: this.state.gameFileOriginal
        }) 
    }

    handleDownload = (type) => {
        try {
            var data = JSON.stringify(JSON.parse(this.state.gameFile))
            if(type === 'switch') {
                DownloadData(data, "plain.dat")
            } else {
                var encrypted = Encode(data)
                DownloadData(encrypted, "user1.dat")
            }
        } catch (err){
            window.alert("Could not parse valid JSON. Reset or fix syntax errors.")
        }
    }

    setGameFile = (jsonString, name) => {
        // Ensure consistent formatting
        jsonString = JSON.stringify(JSON.parse(jsonString), undefined, 2)
        this.setState({
            gameFile: jsonString,
            gameFileOriginal: jsonString,
            gameFileName: name, 
            editing: true 
        })
    }

    render(){
        let parsedData = {};
        let isValidJson = true;
        
        if (this.state.editing) {
            try {
                parsedData = JSON.parse(this.state.gameFile);
            } catch (e) {
                isValidJson = false;
            }
        }

        return <div id="wrapper">
            {this.state.dragging && <div id="cover"></div>}
            
            <p id="description">Hollow Knight Save Editor & Visual Charm Manager</p>
            <p id="source">Source on <a href="https://github.com/bloodorca/hollow">github</a>.</p>
            
            <div className="controls-row">
                <button id="file-button" onClick={this.handleFileClick}>Open Save File</button>
                <div className="checkbox-wrapper">
                    <input 
                        checked={this.state.switchMode} 
                        onClick={() => this.setState({switchMode: !this.state.switchMode})} 
                        type="checkbox" 
                        id="switch-save"
                    />
                    <label htmlFor="switch-save">Nintendo Switch Mode</label>
                </div>
            </div>

            <input 
                onChange={e => this.handleFileChange(this.fileInputRef.current.files)} 
                id="file-input" 
                ref={this.fileInputRef} 
                type="file"
            />

            {this.state.editing && (
                <div id="editor-wrapper">
                    <div id="editor-header">
                        <span id="editor-name">{this.state.gameFileName}</span>
                        <div className="view-toggles">
                            <button 
                                className={this.state.viewMode === 'visual' ? 'active' : ''}
                                onClick={() => this.setState({viewMode: 'visual'})}
                            >Charm Editor</button>
                            <button 
                                className={this.state.viewMode === 'text' ? 'active' : ''}
                                onClick={() => this.setState({viewMode: 'text'})}
                            >Raw JSON</button>
                        </div>
                    </div>

                    {/* RENDER LOGIC */}
                    {this.state.viewMode === 'text' ? (
                        <textarea 
                            id="editor" 
                            onChange={this.handleTextEditorChange} 
                            value={this.state.gameFile} 
                            spellCheck={false}
                        />
                    ) : (
                        isValidJson ? (
                            <div id="visual-editor">
                                <CharmEditor 
                                    data={parsedData} 
                                    onUpdate={this.handleVisualUpdate} 
                                />
                            </div>
                        ) : (
                            <div className="error-box">Invalid JSON. Please fix syntax in Text Mode.</div>
                        )
                    )}

                    <div id="editor-buttons">
                        <button onClick={this.handleReset}>Reset Changes</button>
                        <button onClick={() => this.handleDownload('switch')}>Download (Switch/Plain)</button>
                        <button onClick={() => this.handleDownload('pc')}>Download (PC/Encrypted)</button>
                    </div>
                </div>
            )}

            <HistoryComponent 
                handleClick={(jsonString, fileName) => this.setGameFile(jsonString, fileName)}
            />
        </div>
    }
}

class HistoryComponent extends React.Component {
    componentDidMount() {
        history.onChange = () => this.forceUpdate()
    }
    render(){
        if (history.count() == 0) return null 
        return (
            <div id="history">
                <div className="history-header">Recent Files</div>
                <ul>
                    {history.history.map(item => (
                        <li 
                            key={item.hash}
                            onClick={() => {
                                this.props.handleClick(item.jsonString, item.fileName)
                                window.scrollTo(0, 0)
                            }} 
                            onContextMenu={e => { 
                                history.removeFromHistory(item.hash); 
                                e.preventDefault(); 
                                history.syncToLocalStorage()
                            }} 
                            className="history-item"
                        >
                            <div className="history-name">{item.fileName} <small>(Hash: {item.hash})</small></div>
                            <div className="history-date">{HumanTime(item.date)}</div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector("#root"))
