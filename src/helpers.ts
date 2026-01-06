import { setDeviceGlobalGain } from "./dsp.ts";
import type { EQ } from "./main.ts";

/**
 * Console element
 */
const c = document.getElementById("logConsole") as HTMLElement;

/**
 * Refresh strip UI
 * @param eqState The EQ state to refresh
 * @param i The band index
 */
export function refreshStripUI(eqState: EQ, i: number) {
	// Only updates values, does not re-create DOM (prevents focus loss)
	const band = eqState[i];
	const gainInput = document.querySelector(
		`#num-gain-${i}`,
	) as HTMLInputElement;
	const rangeInput = document.querySelector(
		`.eq-strip:nth-child(${i + 1}) input[type=range]`,
	) as HTMLInputElement;
	const freqInput = document.querySelector(
		`#num-freq-${i}`,
	) as HTMLInputElement;
	const qInput = document.querySelector(`#num-q-${i}`) as HTMLInputElement;
	const typeSelect = document.querySelector(
		`#sel-type-${i}`,
	) as HTMLSelectElement;
	const checkInput = document.querySelector(
		`.eq-strip:nth-child(${i + 1}) input[type=checkbox]`,
	) as HTMLInputElement;

	if (gainInput) gainInput.value = band.gain.toString();
	if (rangeInput) rangeInput.value = band.gain.toString();
	if (freqInput) freqInput.value = band.freq.toString();
	if (qInput) qInput.value = band.q.toString();
	if (typeSelect) typeSelect.value = band.type;
	if (checkInput) checkInput.checked = band.enabled;
}

/**
 * Update global gain UI
 * @param val The new global gain value
 */
export function updateGlobalGainUI(val: number) {
	const globalGainSlider = document.getElementById(
		"globalGainSlider",
	) as HTMLInputElement;
	if (globalGainSlider) globalGainSlider.value = val.toString();

	const globalGainDisplay = document.getElementById(
		"globalGainDisplay",
	) as HTMLElement;
	if (globalGainDisplay) globalGainDisplay.innerText = `${val} dB`;
}

/**
 * Update global gain and send to device
 * @param newGlobalGainState The new global gain value
 */
export async function updateGlobalGain(newGlobalGainState: number) {
	updateGlobalGainUI(newGlobalGainState);
	await setDeviceGlobalGain(newGlobalGainState);
}

/**
 * Set global gain and send to device
 * @param e The event object
 */
export async function setGlobalGain(e: Event) {
	const globalGainEl = e.target as HTMLInputElement;
	// We import setGlobalGainState from fn.ts to update state,
	// but circular deps might be annoying.
	// Assuming fn.ts handles state update via its own export or we call it here.
	// Ideally, fn.ts should expose a setter that calls helpers.ts/dsp.ts.
	// For now, let's assume the event listener in fn.ts/main.ts calls the state setter.

	const newGlobalGainState = Number(globalGainEl.value);
	// Note: State update should happen in fn.ts setGlobalGain() which calls this.
	// If this is the event handler directly:
	await updateGlobalGain(newGlobalGainState);
}

/**
 * Enable/Disable controls
 * @param enabled
 */
export function enableControls(enabled: boolean) {
	const els = document.querySelectorAll(
		"input, select, button.action, button.reset, button#btnExport",
	);
	for (const el of els) {
		(el as HTMLInputElement | HTMLSelectElement | HTMLButtonElement).disabled =
			!enabled;
	}
}

/**
 * Log message to the app console
 *
 * @param msg
 */
export function log(msg: string) {
	if (!c) return;
	c.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
	c.scrollTop = c.scrollHeight;
}

/**
 * Delay for a specified number of milliseconds
 * @param ms | Number of milliseconds to delay
 */
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
