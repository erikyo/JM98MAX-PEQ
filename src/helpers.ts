import type {EQ} from "./main.ts";
import {defaultEqState, getDevice, renderUI} from "./fn.ts";
import {sendPacket} from "./dsp.ts";
import {CMD} from "./constants.ts";

const c = document.getElementById("logConsole") as HTMLElement;

/**
 * Refresh strip UI
 * @param eqState The EQ state to refresh
 * @param i The band index
 */
export function refreshStripUI(eqState: EQ, i: number) {
    // Only updates values, does not re-create DOM (prevents focus loss)
    const band = eqState[i];
    (document.querySelector(`#num-gain-${i}`) as HTMLInputElement)!.value = band.gain.toString();
    (document.querySelector(
        `.eq-strip:nth-child(${i + 1}) input[type=range]`,
    ) as HTMLInputElement).value = band.gain.toString();
    (document.querySelector(`#num-freq-${i}`) as HTMLInputElement).value = band.freq.toString();
    (document.querySelector(`#num-q-${i}`) as HTMLInputElement).value = band.q.toString();
    (document.querySelector(`#sel-type-${i}`) as HTMLSelectElement).value = band.type;

    // Checkbox update
    (document.querySelector(
        `.eq-strip:nth-child(${i + 1}) input[type=checkbox]`,
    ) as HTMLInputElement).checked = band.enabled;
}

/**
 * Update global gain UI
 * @param val The new global gain value
 */
export function updateGlobalGainUI(val: number) {
    const globalGainSlider = document.getElementById("globalGainSlider") as HTMLInputElement;
    globalGainSlider!.value = val.toString();
    const globalGainDisplay = document.getElementById("globalGainDisplay") as HTMLInputElement;
    globalGainDisplay!.innerText = `${val} dB`;
}

/**
 * Update global gain and send to device
 * @param newGlobalGainState The new global gain value
 */
export async function updateGlobalGain(newGlobalGainState: number) {
    const device = getDevice();
    updateGlobalGainUI(newGlobalGainState);
    if (device)
        await sendPacket(device, [CMD.WRITE, CMD.GAIN, 0x02, 0x00, newGlobalGainState]);
}

/**
 * Set global gain and send to device
 * @param e The event object
 */
export async function setGlobalGain(e: Event) {
    const globalGainEl = e.target as HTMLInputElement;

    const newGlobalGainState = Number(globalGainEl.value);
    await updateGlobalGain(newGlobalGainState);
}

/**
 * Enable/Disable controls
 * @param enabled
 */
export function enableControls(enabled: boolean) {
    const els: NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLButtonElement> = document.querySelectorAll(
        "input, select, button.action, button.reset, button#btnExport",
    );
    for (const el of els) el.disabled = !enabled;
    // Re-render to update disabled attributes in template
    renderUI(defaultEqState());
}

/**
 * Log message to the app console
 *
 * @param msg
 */
export function log(msg: string) {
    c.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
    c.scrollTop = c.scrollHeight;
}

/**
 * Delay for a specified number of milliseconds
 * @param ms | Number of milliseconds to delay
 */
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
