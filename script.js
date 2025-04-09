// Global color variables (HSV model)
let hue = 0, saturation = 1, value = 1; // hue: 0-360, sat & val: 0-1

// Element references
const preview = document.getElementById('preview');
const contrastText = document.getElementById('contrast-text');
const hexInput = document.getElementById('hex');
const rgbInput = document.getElementById('rgb');
const hslInput = document.getElementById('hsl');
const cmykInput = document.getElementById('cmyk');
const hueSlider = document.getElementById('hue-slider');
const hueHandle = document.getElementById('hue-handle');
const colorPicker = document.getElementById('color-picker');
const pickerHandle = document.getElementById('picker-handle');
const savedColorsContainer = document.getElementById('saved-colors-container');
const copyButtons = document.querySelectorAll('.copy-btn');
// Error display elements
const hexError = document.getElementById('hex-error');
const rgbError = document.getElementById('rgb-error');
const hslError = document.getElementById('hsl-error');
const cmykError = document.getElementById('cmyk-error');

// Update UI: preview, input fields, handle positions, and contrast text color
function updateUI() {
	// Set the 2D picker background based on the current hue
	colorPicker.style.background = `hsl(${hue}, 100%, 50%)`;
	colorPicker.style.backgroundImage =
	`linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)),
	linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))`;
	
	const rgb = hsvToRgb(hue, saturation, value);
	const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
	const hslObj = rgbToHsl(rgb.r, rgb.g, rgb.b);
	const cmykObj = rgbToCmyk(rgb.r, rgb.g, rgb.b);
	
	// Update preview & contrast text color based on brightness
	preview.style.backgroundColor = hex;
	if(getBrightness(rgb) < 128) {
		contrastText.style.color = "#fff";
	} else {
		contrastText.style.color = "#000";
	}
	
	// Update input fields
	hexInput.value = hex;
	rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
	hslInput.value = `hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`;
	cmykInput.value = `cmyk(${cmykObj.c}%, ${cmykObj.m}%, ${cmykObj.y}%, ${cmykObj.k}%)`;
	
	clearErrors();
	
	// Update handle positions
	const huePos = (hue / 360) * hueSlider.offsetWidth;
	hueHandle.style.left = (huePos - hueHandle.offsetWidth/2) + "px";
	
	const pickerX = saturation * colorPicker.offsetWidth;
	const pickerY = (1 - value) * colorPicker.offsetHeight;
	pickerHandle.style.left = (pickerX - pickerHandle.offsetWidth/2) + "px";
	pickerHandle.style.top = (pickerY - pickerHandle.offsetHeight/2) + "px";
}
function clearErrors(){
	hexError.innerText = "";
	rgbError.innerText = "";
	hslError.innerText = "";
	cmykError.innerText = "";
}
// Calculate brightness for contrast checking
function getBrightness({r, g, b}) {
	return (r * 299 + g * 587 + b * 114) / 1000;
}

// Conversion Functions

// HSV → RGB
function hsvToRgb(h, s, v) {
	let c = v * s;
	let x = c * (1 - Math.abs((h / 60) % 2 - 1));
	let m = v - c;
	let r1, g1, b1;
	if (h < 60) { r1 = c; g1 = x; b1 = 0; }
	else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
	else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
	else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
	else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
	else { r1 = c; g1 = 0; b1 = x; }
	return {
		r: Math.round((r1 + m) * 255),
		g: Math.round((g1 + m) * 255),
		b: Math.round((b1 + m) * 255)
	};
}
// RGB → HEX
function componentToHex(c) {
	let hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
// RGB → HSL
function rgbToHsl(r, g, b) {
	r /= 255; g /= 255; b /= 255;
	let max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;
	if(max === min){
		h = s = 0;
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h *= 60;
	}
	return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
// RGB → CMYK
function rgbToCmyk(r, g, b) {
	let rPrime = r / 255, gPrime = g / 255, bPrime = b / 255;
	let k = 1 - Math.max(rPrime, gPrime, bPrime);
	let c = k === 1 ? 0 : (1 - rPrime - k) / (1 - k);
	let m = k === 1 ? 0 : (1 - gPrime - k) / (1 - k);
	let y = k === 1 ? 0 : (1 - bPrime - k) / (1 - k);
	return {
		c: Math.round(c * 100),
		m: Math.round(m * 100),
		y: Math.round(y * 100),
		k: Math.round(k * 100)
	};
}
// RGB → HSV (for input conversions)
function rgbToHsv(r, g, b) {
	r /= 255; g /= 255; b /= 255;
	let cmax = Math.max(r, g, b), cmin = Math.min(r, g, b);
	let delta = cmax - cmin;
	let h = 0;
	if (delta === 0) h = 0;
	else if (cmax === r) h = 60 * (((g - b) / delta) % 6);
	else if (cmax === g) h = 60 * (((b - r) / delta) + 2);
	else h = 60 * (((r - g) / delta) + 4);
	if (h < 0) h += 360;
	let s = cmax === 0 ? 0 : delta / cmax;
	let v = cmax;
	return { h, s, v };
}
// HSL → RGB (for input conversions)
function hslToRgb(h, s, l) {
	let c = (1 - Math.abs(2 * l - 1)) * s;
	let x = c * (1 - Math.abs((h / 60) % 2 - 1));
	let m = l - c/2;
	let r1, g1, b1;
	if (h < 60) { r1 = c; g1 = x; b1 = 0; }
	else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
	else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
	else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
	else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
	else { r1 = c; g1 = 0; b1 = x; }
	return {
		r: Math.round((r1 + m) * 255),
		g: Math.round((g1 + m) * 255),
		b: Math.round((b1 + m) * 255)
	};
}

// Event Handlers for Hue Slider
function handleHueEvent(e) {
	const rect = hueSlider.getBoundingClientRect();
	let x = (e.clientX || e.touches[0].clientX) - rect.left;
	x = Math.max(0, Math.min(x, rect.width));
	hue = (x / rect.width) * 360;
	hueHandle.style.left = (x - hueHandle.offsetWidth/2) + "px";
	updateUI();
}
hueSlider.addEventListener("mousedown", function(e){
	handleHueEvent(e);
	function onMouseMove(e) {
		handleHueEvent(e);
	}
	function onMouseUp() {
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("mouseup", onMouseUp);
	}
	window.addEventListener("mousemove", onMouseMove);
	window.addEventListener("mouseup", onMouseUp);
});
hueSlider.addEventListener("touchstart", function(e){
	handleHueEvent(e);
});
hueSlider.addEventListener("touchmove", function(e){
	handleHueEvent(e);
	e.preventDefault();
});

// Event Handlers for 2D Color Picker
function handlePickerEvent(e) {
	const rect = colorPicker.getBoundingClientRect();
	let x = (e.clientX || e.touches[0].clientX) - rect.left;
	let y = (e.clientY || e.touches[0].clientY) - rect.top;
	x = Math.max(0, Math.min(x, rect.width));
	y = Math.max(0, Math.min(y, rect.height));
	saturation = x / rect.width;
	value = 1 - (y / rect.height);
	pickerHandle.style.left = (x - pickerHandle.offsetWidth/2) + "px";
	pickerHandle.style.top = (y - pickerHandle.offsetHeight/2) + "px";
	updateUI();
}
colorPicker.addEventListener("mousedown", function(e){
	handlePickerEvent(e);
	function onMouseMove(e) {
		handlePickerEvent(e);
	}
	function onMouseUp() {
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("mouseup", onMouseUp);
	}
	window.addEventListener("mousemove", onMouseMove);
	window.addEventListener("mouseup", onMouseUp);
});
colorPicker.addEventListener("touchstart", function(e){
	handlePickerEvent(e);
});
colorPicker.addEventListener("touchmove", function(e){
	handlePickerEvent(e);
	e.preventDefault();
});

// Input field handlers for manual input with validation

// HEX input handler
function handleHexInput(e) {
	let val = e.target.value.trim();
	if(val[0] === "#") { val = val.slice(1); }
	if(!/^[0-9A-Fa-f]{6}$/.test(val)) {
		hexError.innerText = "Invalid HEX. Use format #RRGGBB.";
		updateUI();
		return;
	}
	let r = parseInt(val.substring(0,2), 16);
	let g = parseInt(val.substring(2,4), 16);
	let b = parseInt(val.substring(4,6), 16);
	const hsv = rgbToHsv(r, g, b);
	hue = hsv.h;
	saturation = hsv.s;
	value = hsv.v;
	updateUI();
}
hexInput.addEventListener("change", handleHexInput);
hexInput.addEventListener("blur", handleHexInput);

// RGB input handler (expects format: rgb(255, 0, 0) or 255,0,0)
function handleRgbInput(e) {
	let val = e.target.value.trim();
	const nums = val.match(/(\d+(\.\d+)?)/g);
	if(!nums || nums.length < 3) {
		rgbError.innerText = "Invalid RGB. Use format rgb(255, 0, 0).";
		updateUI();
		return;
	}
	let r = parseInt(nums[0]), g = parseInt(nums[1]), b = parseInt(nums[2]);
	if(r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
		rgbError.innerText = "RGB values must be 0-255.";
		updateUI();
		return;
	}
	const hsv = rgbToHsv(r, g, b);
	hue = hsv.h;
	saturation = hsv.s;
	value = hsv.v;
	updateUI();
}
rgbInput.addEventListener("change", handleRgbInput);
rgbInput.addEventListener("blur", handleRgbInput);

// HSL input handler (expects format: hsl(0, 100%, 50%) or 0,100,50)
function handleHslInput(e) {
	let val = e.target.value.trim();
	const nums = val.match(/(\d+(\.\d+)?)/g);
	if(!nums || nums.length < 3) {
		hslError.innerText = "Invalid HSL. Use format hsl(0, 100%, 50%).";
		updateUI();
		return;
	}
	let h = parseFloat(nums[0]),
	s = parseFloat(nums[1]),
	l = parseFloat(nums[2]);
	if(h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
		hslError.innerText = "HSL values out of range.";
		updateUI();
		return;
	}
	const rgb = hslToRgb(h, s / 100, l / 100);
	const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
	hue = hsv.h;
	saturation = hsv.s;
	value = hsv.v;
	updateUI();
}
hslInput.addEventListener("change", handleHslInput);
hslInput.addEventListener("blur", handleHslInput);

// CMYK input handler (expects format: cmyk(0, 100, 100, 0) or 0,100,100,0)
function handleCmykInput(e) {
	let val = e.target.value.trim();
	const nums = val.match(/(\d+(\.\d+)?)/g);
	if(!nums || nums.length < 4) {
		cmykError.innerText = "Invalid CMYK. Use format cmyk(0, 100, 100, 0).";
		updateUI();
		return;
	}
	let c = parseFloat(nums[0]),
	m = parseFloat(nums[1]),
	y = parseFloat(nums[2]),
	k = parseFloat(nums[3]);
	if(c < 0 || c > 100 || m < 0 || m > 100 || y < 0 || y > 100 || k < 0 || k > 100) {
		cmykError.innerText = "CMYK values must be 0-100.";
		updateUI();
		return;
	}
	let r = Math.round(255 * (1 - c/100) * (1 - k/100));
	let g = Math.round(255 * (1 - m/100) * (1 - k/100));
	let b = Math.round(255 * (1 - y/100) * (1 - k/100));
	const hsv = rgbToHsv(r, g, b);
	hue = hsv.h;
	saturation = hsv.s;
	value = hsv.v;
	updateUI();
}
cmykInput.addEventListener("change", handleCmykInput);
cmykInput.addEventListener("blur", handleCmykInput);

// Copy to clipboard functionality for fields
copyButtons.forEach(button => {
	button.addEventListener("click", function() {
		const targetId = this.getAttribute("data-target");
		const inputField = document.getElementById(targetId);
		if(navigator.clipboard) {
			navigator.clipboard.writeText(inputField.value)
			.then(() => alert(`${targetId.toUpperCase()} copied to clipboard!`))
			.catch(() => alert("Copy failed."));
		} else {
			alert("Clipboard API not supported.");
		}
	});
});

// Saved Colors: Click preview to save current color swatch
preview.addEventListener("click", function() {
	const swatch = document.createElement("div");
	swatch.classList.add("saved-swatch");
	swatch.style.backgroundColor = hexInput.value;
	savedColorsContainer.appendChild(swatch);
});
// When a saved swatch is clicked, load that color
savedColorsContainer.addEventListener("click", function(e) {
	if(e.target.classList.contains("saved-swatch")){
		const style = window.getComputedStyle(e.target);
		const bgColor = style.backgroundColor; // expected format: "rgb(r, g, b)"
		const rgbMatch = bgColor.match(/(\d+),\s*(\d+),\s*(\d+)/);
		if(rgbMatch){
			let r = parseInt(rgbMatch[1]), g = parseInt(rgbMatch[2]), b = parseInt(rgbMatch[3]);
			const hsv = rgbToHsv(r, g, b);
			hue = hsv.h;
			saturation = hsv.s;
			value = hsv.v;
			updateUI();
		}
	}
});
// On double click of a saved swatch, remove the swatch
savedColorsContainer.addEventListener("dblclick", function(e) {
	if(e.target.classList.contains("saved-swatch")){
		e.target.remove();
	}
});

// Initialize UI on page load
window.addEventListener("load", function(){
	updateUI();
});