import { CMD } from "./constants.ts";
import { sendPacket } from "./dsp.ts";
import { getDevice, setGlobalGainState } from "./fn.ts";
import type { EQ } from "./main.ts";

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
	const device = getDevice();
	updateGlobalGainUI(newGlobalGainState);
	if (device)
		await sendPacket(device, [
			CMD.WRITE,
			CMD.GAIN,
			0x02,
			0x00,
			newGlobalGainState,
		]);
}

/**
 * Set global gain and send to device
 * @param e The event object
 */
export async function setGlobalGain(e: Event) {
	const globalGainEl = e.target as HTMLInputElement;
	const newGlobalGainState = Number(globalGainEl.value);

	setGlobalGainState(newGlobalGainState);

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
	els.forEach((el: any) => (el.disabled = !enabled));
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
