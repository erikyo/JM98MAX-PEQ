# 🎛️ JM98MAX Hardware PEQ Controller

A browser-based tool to configure the **hardware-level Parametric Equalizer (PEQ)** on the **JCALLY JM98MAX** and other Savitech-based USB DACs.

**🔗 [Launch the Web App](https://erikyo.github.io/JM98MAX-PEQ/)**

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Platform](https://img.shields.io/badge/platform-WebHID-green.svg)

---

## 🚀 Why this tool?

Most dongle DACs like the JM98MAX contain powerful DSP chips (Cirrus Logic CS43198) capable of high-precision equalization. However, manufacturers rarely provide software to control them. Users are often forced to use software EQs (like Wavelet or Equalizer APO) which:
1.  Consume CPU/Battery on the host device.
2.  Can introduce latency.
3.  Don't work system-wide on all OSs (e.g., iOS or gaming consoles).

**This tool unlocks the internal DSP.** Once you save your profile to the dongle's flash memory, the EQ is applied by the hardware itself. You can plug the DAC into a PS5, an iPhone, or a PC without any drivers, and your EQ will still be active.

## ✨ Features

* **8-Band Parametric EQ**: Full control over Frequency, Gain, and Q-Factor.
* **Filter Types**: Support for Peaking, Low Shelf, and High Shelf filters.
* **Hardware Processing**: Zero CPU usage on your playback device.
* **Per-Band Bypass**: Toggle individual bands On/Off to compare changes.
* **Persistent Memory**: Save your tuning to the DAC's internal Flash memory (`Save to Flash`).
* **Cross-Platform**: Works on Windows, macOS, Linux, and Android (via Chrome/Edge).
* **Import/Export**: Share your EQ profiles via JSON files.

## 🎧 Supported Devices

This tool communicates via **HID** with the **Savitech SA9312** USB bridge controller.

* ✅ **Tested & Confirmed:**
    * **JCALLY JM98MAX** (CS43198)

* 🧪 **Experimental / Likely Compatible:**
    * JCALLY JM7MAX
    * Moondrop Dawn Pro
    * Tanchjim Space / Space Lite
    * Shanling UA Mini
    * *Any other Savitech SA9312 + Cirrus Logic based dongle.*

> **Note:** If you have one of the "Experimental" devices, please test it and open an Issue/PR to let us know if it works!

## 📖 How to Use

1.  **Open the App**: Go to [https://erikyo.github.io/JM98MAX-PEQ/](https://erikyo.github.io/JM98MAX-PEQ/) using a browser that supports WebHID (Chrome, Edge, Opera).
2.  **Connect**: Plug in your DAC and click the **CONNECT** button. Select your device (often listed as "JM98MAX" or generic "Savitech").
3.  **Configure**:
    * Adjust the sliders or type values for **Freq**, **Gain**, and **Q**.
    * Use the **Global Pre-Amp** to prevent clipping if you boost frequencies.
4.  **Sync**:
    * **SYNC TO RAM**: Applies changes instantly. These are temporary and will reset if you unplug the device.
    * **SAVE TO FLASH**: Writes the current configuration to the dongle's permanent memory. Use this once you are happy with your tuning.

## 🛠️ Technical Details (For Nerds)

This application uses the **WebHID API** to send raw bytes to the USB Interface.

* **Bridge Chip**: Savitech SA9312 / SA9312L.
* **DAC Chip**: Cirrus Logic CS43198 / CS43131.
* **Communication Protocol**:
    * The browser sends 63-byte HID reports to **Report ID 75 (0x4B)**.
    * It calculates 5 Biquad coefficients (b0, b1, b2, a1, a2) for each band.
    * **Math**: The firmware expects coefficients calculated for a fixed sample rate of **96kHz**, converted to 32-bit fixed-point integers (Q2.30 format).
    * **I2C Tunneling**: The HID commands are translated by the Savitech bridge into I2C writes to the Cirrus Logic registers (specifically the *Programmable Filter* block starting at address `0x090000`).

## 📚 Credits & Resources

This project wouldn't be possible without the following resources:

1.  **Cirrus Logic CS43198 Datasheet**: Essential for understanding the Programmable Filter coefficients, register maps, and the Biquad IIR structure.
    * [Link to PDF](https://statics.cirrus.com/pubs/proDatasheet/CS43198_DS1156F2.pdf)

2.  **Walkplay HID Handler (HarutoHiroki)**: Provided crucial insights into the specific HID Report IDs, the 96kHz fixed-rate math requirement, and the Savitech handshake protocol.
    * [Link to Source](https://github.com/HarutoHiroki/PublicGraphTool/blob/squiglink-(main)/assets/js/devicePEQ/walkplayHidHandler.js)

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. While writing to the EQ registers is generally safe, flashing firmware or modifying hardware settings always carries a small risk. The author is not responsible for any damage to your hearing or audio equipment. Always test with the volume low!

---

*Built with ❤️ for the Audio Community.*
