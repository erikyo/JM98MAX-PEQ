import "./style.css";
import { flashToFlash, syncToDevice } from "./dsp.ts";
import { connectToDevice, initState, resetToDefaults } from "./fn.ts";
import { setGlobalGain } from "./helpers.ts";
import { exportProfile, importProfile } from "./importExport.ts";

export type Band = {
	index: number;
	freq: number;
	gain: number;
	q: number;
	type: string;
	enabled: boolean;
};
export type EQ = Band[];

// Initialize immediately
initState();

/**
 * CONNECTION LOGIC
 */
const connectBtn = document.getElementById("btnConnect");
connectBtn?.addEventListener("click", async () => connectToDevice());

/**
 * RESET LOGIC
 */
const btnReset = document.getElementById("btnReset");
btnReset?.addEventListener("click", async () => resetToDefaults());

/**
 * SYNC LOGIC
 */
const btnSync = document.getElementById("btnSync");
btnSync!.addEventListener("click", syncToDevice);

/**
 * FLASH LOGIC
 */
const btnFlash = document.getElementById("btnFlash");
btnFlash!.addEventListener("click", async () => flashToFlash());

/**
 * GLOBAL GAIN LOGIC
 */
const globalSlider = document.getElementById("globalGainSlider");
globalSlider!.addEventListener("change", async (e) => setGlobalGain(e));

/**
 * IMPORT/EXPORT LOGIC
 */
const btnExport = document.getElementById("btnExport");
btnExport!.addEventListener("click", () => exportProfile());

const btnImport = document.getElementById("btnImport");
const fileInput = document.getElementById("fileInput");
btnImport!.addEventListener("click", () => fileInput!.click());
fileInput!.addEventListener("change", (e) => importProfile(e));
