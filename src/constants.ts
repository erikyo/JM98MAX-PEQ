/**
 * CONSTANTS
 */
export const PACKET_SIZE = 63;
export const NUM_BANDS = 8;

export const REPORT_ID_DEFAULT = 75; // 0x4B
export const REPORT_ID_FIIO = 7; // FiiO usually uses ID 7

// Vendor IDs
export const VID_SAVITECH = 0x661; // JCally, generic Savitech
export const VID_SAVITECH_OFFICIAL = 0x262a; // Fosi, iBasso, FiiO (older)
export const VID_COMTRUE = 0x2fc6; // Moondrop, Tanchjim (Comtrue CT7601)
export const VID_FIIO = 0x2972; // FiiO (Newer devices like JA11, KA17)

// --- WALKPLAY (SAVITECH) COMMANDS ---
export const CMD_SAVI = {
	PEQ: 0x09,
	VERSION: 0x0c,
	TEMP: 0x0a,
	FLASH: 0x01,
	GAIN: 0x03,
	READ: 0x80,
	WRITE: 0x01,
	END: 0x00,
};

// --- MOONDROP / COMTRUE COMMANDS ---
export const CMD_MOON = {
	WRITE: 1,
	READ: 128,
	UPDATE_EQ: 9, // COMMAND_UPDATE_EQ
	UPDATE_EQ_COEFF: 10, // COMMAND_UPDATE_EQ_COEFF_TO_REG
	SAVE_FLASH: 1, // COMMAND_SAVE_EQ_TO_FLASH
	PRE_GAIN: 35,
	VER: 12,
};

// --- FIIO COMMANDS ---
export const CMD_FIIO = {
	HEADER_SET_1: 0xaa,
	HEADER_SET_2: 0x0a,
	HEADER_GET_1: 0xbb,
	HEADER_GET_2: 0x0b,
	FILTER_PARAMS: 0x15,
	GLOBAL_GAIN: 0x17,
	FILTER_COUNT: 0x18,
	SAVE: 0x19,
	END: 0xee,
};

/**
 * DEFAULT SETTINGS (Based on user request)
 */
export const DEFAULT_FREQS = [40, 100, 250, 500, 1000, 3000, 8000, 16000];
export const DEFAULT_LABELS = [
	"Sub-Bass",
	"Bass",
	"Low-Mids",
	"Mids",
	"Mids",
	"High-Mids",
	"Presence",
	"Air",
];
