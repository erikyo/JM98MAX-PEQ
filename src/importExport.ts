import {getDevice, getEqState, getGlobalGainState, renderUI, setEqState, setGlobalGainState} from "./fn.ts";
import {log, updateGlobalGain} from "./helpers.ts";

/**
 * Export profile to JSON file
 */
export async function exportProfile() {
    const device = getDevice();
    const globalGainState = getGlobalGainState();
    const eqState = getEqState();
    if (!device) return;
    const data = {
        device: "JM98MAX",
        timestamp: new Date().toISOString(),
        globalGain: globalGainState,
        bands: eqState,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "eq_profile.json";
    a.click();
}

/**
 * Import profile from JSON file
 * @param e The event object
 */
export async function importProfile(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files) return;
    const file = target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string);
            if (data.bands) {
                // Update internal state
                setEqState(data.bands);

                const globalGain = data.globalGain || 0;
                // Update global gain state
                setGlobalGainState(globalGain);

                updateGlobalGain(globalGain); // Update UI and send gain packet
                renderUI(data.bands); // Update EQ UI

                log("Profile imported. Click 'SYNC' to apply.");
            }
        } catch (err) {
            log(`JSON Error: ${(err as Error).message}`);
        }
    };
    reader.readAsText(file);
}
