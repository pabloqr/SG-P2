// Extracting more detailed GPU information in a browser.
// NOTE: This won't work with some privacy settings enabled
// and has only been tested with the following return values

// Could be used to guess at a GPUs power using existing benchmarks here:
// https://www.videocardbenchmark.net/GPU_mega_page.html
// https://www.techpowerup.com/gpu-specs/
// http://codeflow.org/entries/2016/feb/10/webgl_debug_renderer_info-extension-survey-results/
// http://www.gpuzoo.com/
// https://docs.google.com/spreadsheets/d/1wGRZ-5sl7G9DhIgwW36g2KnrwVfZqBW7GDKHOd2vbaM/edit#gid=0
// https://www.3dmark.com/search#/?mode=basic
    // https://www.3dmark.com/calico/report/hw/productlist?apikey=O5DI546IODAQDWAKJEU3IU2A&format=jsonp&callbackfunction=SearchUi.instantSearchDataCallback&callback=jQuery1113045522468099583757_1546550788902&_=1546550788903

// UNMASKED_RENDERER_WEBGL values
// ANGLE (Intel(R) HD Graphics 4600 Direct3D11 vs_5_0 ps_5_0)
// ANGLE (NVIDIA GeForce GTX 770 Direct3D11 vs_5_0 ps_5_0)
// Intel(R) HD Graphics 6000
// AMD Radeon Pro 460 OpenGL Engine
// ANGLE (Intel(R) HD Graphics 4600 Direct3D11 vs_5_0 ps_5_0)

function extractValue(reg, str) {
    const matches = str.match(reg);
    return matches && matches[0];
}

// WebGL Context Setup
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

// Full card description and webGL layer (if present)
const layer = extractValue(/(ANGLE)/g, renderer);
const card = extractValue(/((NVIDIA|AMD|Intel)[^\d]*[^\s]+)/, renderer);

const tokens = card.split(' ');
tokens.shift();

// Split the card description up into pieces
// with brand, manufacturer, card version
const manufacturer = extractValue(/(NVIDIA|AMD|Intel)/g, card);
const cardVersion = tokens.pop();
const brand = tokens.join(' ');
const integrated = manufacturer === 'Intel';

console.log({
  card,
  manufacturer,
  cardVersion,
  brand,
  integrated,
  vendor,
  renderer
});