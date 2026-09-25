# Volume Booster

A Firefox extension that allows you to boost the volume of audio and video content up to 1000% of the browser's native volume limit.

# Features

- Boost audio volume up to 1000%.
- Works with <video> and <audio> elements on web pages.
- No data is sent outside the browser.

# How It Works

- The content script connects <video> and <audio> elements on the page to a GainNode using the Web Audio API. This allows the extension to amplify audio beyond the browser's native volume limit.
- The popup reads and stores the selected volume level in browser.storage.local, using the active tab's ID as the key.
- All configuration is stored locally in the browser. Nothing is transmitted externally. For this reason, the extension manifest declares data_collection_permissions: { required: ["none"] }.

# Installation

## Install Locally in Developer Mode
- Clone or download this repository.
- Open Firefox and navigate to about:debugging#/runtime/this-firefox.
- Click "Load Temporary Add-on...".
- Select the manifest.json file from the project directory.

The extension will be loaded temporarily into Firefox for testing and development.

# License

This project is distributed under the MIT License. See the LICENSE file for more information.
