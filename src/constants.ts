/**
 * CONSTANTS
 */
export const REPORT_ID = 75;
export const PACKET_SIZE = 63;
export const NUM_BANDS = 8;

// Command Codes
export const CMD = {
	PEQ: 0x09,
	VERSION: 0x0c,
	TEMP: 0x0a,
	FLASH: 0x01,
	GAIN: 0x03,
	READ: 0x80,
	WRITE: 0x01,
	END: 0x00,
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
