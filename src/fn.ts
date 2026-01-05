import { DEFAULT_FREQS, DEFAULT_LABELS, } from "./constants.ts";
import type { Band, EQ } from "./main.ts";
import { readDeviceParams, setupListener, syncToDevice } from "./dsp.ts";
import { enableControls, log, updateGlobalGainUI } from "./helpers.ts";

/**
 * STATE
 */
let device: HIDDevice | null = null;
let globalGainState: number = 0;
let eqState: EQ = defaultEqState();

/**
 * INITIALIZATION
 */
export function initState() {
    renderUI(eqState);
}

export function setGlobalGain(gain: number) {
    globalGainState = gain;
    updateGlobalGainUI(gain);
}

export function getDevice() {
    return device;
}

export function getEqState() {
    return eqState;
}

export function setEqState(eq: EQ) {
    eqState = eq;
}

export function setEQ(index: number, key: keyof Band, value: number | boolean | string) {
    eqState[index][key] = value;
}

export function getGlobalGainState() {
    return globalGainState;
}

export function setGlobalGainState(gainState: number) {
    globalGainState = gainState;
}

/**
 * DEFAULT EQ STATE
 */
export function defaultEqState(): EQ {
    // Create an initial state based on default frequencies
    return DEFAULT_FREQS.map((freq, i) => ({
        index: i,
        freq: freq,
        gain: 0,
        q: 0.75,
        type: "PK",
        enabled: true,
    })) as EQ;
}

/**
 * Render UI
 * @param eqState The EQ state to render
 */
export function renderUI(eqState: EQ) {
    const container: HTMLElement | null = document.getElementById("eqContainer");
    if (!container) {
        alert("Sorry something went wrong!");
        return;
    }
    container.innerHTML = "";

    eqState.forEach((band, i) => {
        const div = document.createElement("div");
        // Add a 'bypassed' class if disabled for visual graying out
        div.className = `eq-strip ${band.enabled ? "" : "bypassed"}`;
        div.innerHTML = `
                <h3>BAND ${i + 1}</h3>
                <div class="freq-label">${DEFAULT_LABELS[i]}</div>
                
                <label class="switch">
                    <input type="checkbox" ${band.enabled ? "checked" : ""} onchange="toggleBand(${i}, this.checked)" ${device ? "" : "disabled"}>
                    <span class="slider"></span>
                </label>

                <label>Gain (dB)</label>
                <input type="range" orient="vertical" min="-12" max="12" step="0.5" value="${band.gain}" 
                       oninput="updateState(${i}, 'gain', this.value)" ${device ? "" : "disabled"}>
                
                <input type="number" value="${band.gain}" step="0.5" 
                       onchange="updateState(${i}, 'gain', this.value)" id="num-gain-${i}" ${device ? "" : "disabled"}>

                <label>Freq (Hz)</label>
                <input type="number" value="${band.freq}" min="20" max="20000" 
                       onchange="updateState(${i}, 'freq', this.value)" id="num-freq-${i}" ${device ? "" : "disabled"}>

                <label>Q Factor</label>
                <input type="number" value="${band.q}" min="0.1" max="10" step="0.1" 
                       onchange="updateState(${i}, 'q', this.value)" id="num-q-${i}" ${device ? "" : "disabled"}>

                <label>Type</label>
                <select onchange="updateState(${i}, 'type', this.value)" id="sel-type-${i}" ${device ? "" : "disabled"}>
                    <option value="PK" ${band.type === "PK" ? "selected" : ""}>Peak</option>
                    <option value="LSQ" ${band.type === "LSQ" ? "selected" : ""}>Low Shelf</option>
                    <option value="HSQ" ${band.type === "HSQ" ? "selected" : ""}>High Shelf</option>
                </select>
            `;
        container.appendChild(div);
    });
}

/**
 * Connect to device
 */
export async function connectToDevice() {
    try {
        const devices = await navigator.hid.requestDevice({
            filters: [{ vendorId: 0x661 }],
        });
        if (devices.length === 0) return;

        device = devices[0];
        await device.open();

        log("Connected.");
        const statusBadge = document.getElementById("statusBadge");
        if (statusBadge) {
            statusBadge.innerText = "ONLINE";
            statusBadge.classList.add("connected");
        }
        const btnConnect = document.getElementById("btnConnect");
        if (btnConnect) {
            btnConnect.style.display = "none";
        }

        enableControls(true);
        setupListener(device);
        await readDeviceParams(device);
    } catch (err) {
        log(`Error: ${(err as Error).message}`);
    }
}

/**
 * Reset to factory defaults
 */
export async function resetToDefaults() {
    if (
        !confirm(
            "Reset all bands to Defaults (0dB, Q=1.0) and optimal frequencies?",
        )
    )
        return;

    log("Resetting to factory defaults...");

    // Reset State object
    const eqState = defaultEqState();

    globalGainState = 0;
    updateGlobalGainUI(0);

    // Re-render
    renderUI(eqState);

    // Auto-sync to device
    await syncToDevice();
    log("Defaults applied and synced.");
}

/**
 * STATE & UI UPDATES
 */

/**
 * Update state object and sync slider <-> number input
 * @param {number} index - Band index
 * @param {string} key - Property to update
 * @param {number} value - New value
 */
export function updateState(index: number, key: string, value: string | number | boolean) {
    if (key === "freq" || key === "gain" || key === "q")
        value = parseFloat(value as string);
    else if (key === "enabled")
        value = Boolean(value);
    else
        value = value.toString();
    setEQ(index, key as keyof Band, value);

    // Sync Slider <-> Number Input
    if (key === "gain") {
        // Set the current Gain Slider
        const currentRange: HTMLInputElement | null = document.querySelector(
            `.eq-strip:nth-child(${index + 1}) input[type=range]`,
        );
        if (currentRange) currentRange.value = value.toString();
        // Set the current Gain Number Input
        const currentGain: HTMLInputElement | null = document.querySelector(`#num-gain-${index}`);
        if (currentGain) currentGain.value = value.toString();
    }
}

/**
 * Handle Enable/Disable Toggle
 * @param index
 * @param isEnabled
 */
export function toggleBand(index: number, isEnabled: boolean) {
    eqState[index].enabled = isEnabled;

    // Update visual style
    const strip = document.querySelector(`.eq-strip:nth-child(${index + 1})`);
    if (isEnabled) {
        strip?.classList.remove("bypassed");
    } else {
        strip?.classList.add("bypassed")
    }

    log(`Band ${index + 1} ${isEnabled ? "Enabled" : "Bypassed"}`);
}

// Expose functions to global window object for inline event handlers
(window as any).updateState = updateState;
(window as any).toggleBand = toggleBand;

