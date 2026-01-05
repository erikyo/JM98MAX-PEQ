import {CMD, DEFAULT_FREQS, NUM_BANDS, PACKET_SIZE, REPORT_ID} from "./constants.ts";
import {getDevice, getEqState, getGlobalGainState, setGlobalGain} from "./fn.ts";
import {delay, log, refreshStripUI} from "./helpers.ts";
import type {Band} from "./main.ts";

/**
 * CORE FUNCTIONS: READ/WRITE
 */
export async function readDeviceParams(device: HIDDevice) {
    if (!device) return;
    log("Reading device configuration...");

    // Read Version
    await sendPacket(device, [CMD.READ, CMD.VERSION, CMD.END]);
    await delay(50);
    // Read Gain
    await sendPacket(device, [CMD.READ, CMD.GAIN, CMD.END]);
    await delay(50);

    // Request all bands
    for (let i = 0; i < NUM_BANDS; i++) {
        await sendPacket(device, [CMD.READ, CMD.PEQ, 0x00, 0x00, i, CMD.END]);
        await delay(40);
    }
    log("Configuration loaded.");
}

export function setupListener(device: HIDDevice) {
    const eqState = getEqState();
    device.addEventListener("inputreport", (event) => {
        const versionEl = document.getElementById("fwVersion");
        const data = new Uint8Array(event.data.buffer);
        const cmd = data[1];

        if (cmd === CMD.VERSION) {
            let ver = "";
            for (let i = 3; i < 10; i++) {
                if (data[i] === 0) break;
                ver += String.fromCharCode(data[i]);
            }
            versionEl!.innerText = `FW: ${ver}`;
        } else if (cmd === CMD.GAIN) {
            const gain = new Int8Array([data[4]])[0];
            setGlobalGain(gain);
        } else if (cmd === CMD.PEQ && data.byteLength >= 34) {
            const idx = data[4];
            if (idx < NUM_BANDS) {
                const view = new DataView(data.buffer);
                const freq = view.getUint16(27, true);
                const q = Math.round((view.getUint16(29, true) / 256) * 100) / 100;
                const gain = Math.round((view.getInt16(31, true) / 256) * 10) / 10;
                const typeCode = data[33];

                let typeStr = "PK";
                if (typeCode === 1) typeStr = "LSQ";
                else if (typeCode === 3) typeStr = "HSQ";

                // Update State from Device
                eqState[idx].freq = freq ?? DEFAULT_FREQS[idx]; // Fallback if 0
                eqState[idx].q = q ?? 1.0;
                eqState[idx].gain = gain;
                eqState[idx].type = typeStr;
                // Note: Hardware doesn't store an "enabled" state, assume enabled if gain != 0 or default
                eqState[idx].enabled = true;

                refreshStripUI(eqState, idx);
            }
        }
    });
}

export async function syncToDevice() {
    const device = getDevice();
    const eqState = getEqState();
    if (!device || !eqState) return;

    log("Syncing to RAM...");

    // Write Global Gain
    await sendPacket(device, [CMD.WRITE, CMD.GAIN, 0x02, 0x00, getGlobalGainState()]);

    // Write Bands
    for (const band of eqState) {
        await writeBand(device, band);
        await delay(30);
    }

    // Commit
    await sendPacket(device, [
        CMD.WRITE,
        CMD.TEMP,
        0x04,
        0x00,
        0x00,
        0xff,
        0xff,
        CMD.END,
    ]);
    log("Sync Complete.");
}


export async function flashToFlash() {
    const device = getDevice();
    if (!device) return;
    if (!confirm("Save to permanent memory?")) return;
    await sendPacket(device, [CMD.WRITE, CMD.FLASH, 0x01, 0x00, CMD.END]);
    log("Saved to Flash.");
}

export async function writeBand(device: HIDDevice, band: Band) {
    if (!device) return;

    // LOGIC FOR BYPASS:
    // If band is enabled, use real gain.
    // If band is disabled/bypassed, force Gain to 0 for DSP calculation,
    // but DO NOT change the 'band.gain' state property (so UI keeps value).
    const effectiveGain = band.enabled ? band.gain : 0;

    const bArr = computeIIRFilter(band.freq, effectiveGain, band.q);

    const typeMap = { PK: 2, LSQ: 1, HSQ: 3 };
    const freqBytes = toBytes(band.freq, 2);
    const qBytes = toBytes(Math.round(band.q * 256), 2);
    const gainBytes = toBytes(Math.round(effectiveGain * 256), 2);

    const packet = [
        CMD.WRITE,
        CMD.PEQ,
        0x18,
        0x00,
        band.index,
        0x00,
        0x00,
        ...bArr,
        ...freqBytes,
        ...qBytes,
        ...gainBytes,
        typeMap[band.type as keyof typeof typeMap],
        0x00,
        0x00,
        CMD.END,
    ];
    await sendPacket(device, packet);
}

/**
 * Send a packet to the device
 * @param device HIDDevice
 * @param bytes Array of bytes
 */
export async function sendPacket(device: HIDDevice, bytes: number[]) {
    if (!device) return;
    try {
        const p = new Uint8Array(PACKET_SIZE);
        for (let i = 0; i < bytes.length; i++) p[i] = bytes[i];
        await device.sendReport(REPORT_ID, p);
    } catch (err) {
        log(`TX Error: ${(err as Error).message}`);
    }
}

/**
 * Convert a number to an array of bytes
 * @param n |umber to convert
 * @param c Number of bytes
 */
export function toBytes(n: number, c: number) {
    return [...Array(c)].map((_, i) => (n >> (8 * i)) & 0xff);
}

/**
 * DSP Math
 */

/**
 * @var s Scale factor for Q30
 */
const s = 1073741824;

/**
 * Convert a number to a Q30 value
 * @param n Number to convert
 */
const q30 = (n: number) => Math.round(n * s);

/**
 * Compute IIR filter coefficients
 * @param freq Frequency in Hz
 * @param gain Gain in dB
 * @param q Q factor
 */
export function computeIIRFilter(freq: number, gain: number, q: number) {
    const fs = 96000;
    const A = 10 ** (gain / 20);
    const w0 = (freq * 2 * Math.PI) / fs;
    const alpha = Math.sin(w0) / (2 * q);
    const sqrtA = Math.sqrt(A);
    const d4 = alpha * sqrtA;
    const d5 = alpha / sqrtA;
    const inv_a0 = 1 / (d5 + 1);

    // Coeffs: b0, b1, b2, -a1, -a2
    return [
        q30((1 + d4) * inv_a0),
        q30(-2 * Math.cos(w0) * inv_a0),
        q30((1 - d4) * inv_a0),
        q30(-(-2 * Math.cos(w0) * inv_a0)),
        q30(-((1 - d5) * inv_a0)),
    ].flatMap((v) => [
        v & 0xff,
        (v >> 8) & 0xff,
        (v >> 16) & 0xff,
        (v >> 24) & 0xff,
    ]);
}
