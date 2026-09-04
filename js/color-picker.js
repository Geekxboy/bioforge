class CustomColorPicker {
	constructor(input) {
		this.input = input;

		this.h = 0;
		this.s = 1;
		this.v = 1;

		this.createPicker();
		this.bindInput();
		this.setColor(input.value);
	}

	createPicker() {
		this.picker = document.createElement("div");

		this.picker.className = "custom-color-picker";

		this.picker.innerHTML = `
          <div class="cp-sv">
            <div class="cp-white"></div>
            <div class="cp-black"></div>
            <div class="cp-cursor"></div>
          </div>

          <div class="cp-hue">
            <div class="cp-hue-cursor"></div>
          </div>

          <div class="cp-bottom">
            <div class="cp-preview"></div>

            <input
              class="cp-hex"
              type="text"
              maxlength="7"
              spellcheck="false"
            >
          </div>
        `;

		document.body.appendChild(this.picker);

		this.sv = this.picker.querySelector(".cp-sv");
		this.svCursor = this.picker.querySelector(".cp-cursor");

		this.hue = this.picker.querySelector(".cp-hue");
		this.hueCursor = this.picker.querySelector(".cp-hue-cursor");

		this.preview = this.picker.querySelector(".cp-preview");
		this.hex = this.picker.querySelector(".cp-hex");

		this.bindPicker();
	}

	bindInput() {
		// Prevent the browser's native color picker.
		this.input.addEventListener("click", (e) => {
			e.preventDefault();

			this.toggle();
		});

		// Also support keyboard interaction.
		this.input.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				this.toggle();
			}
		});
	}

	bindPicker() {
		// Saturation / value
		this.sv.addEventListener("pointerdown", (e) => {
			this.sv.setPointerCapture(e.pointerId);
			this.updateSV(e);
		});

		this.sv.addEventListener("pointermove", (e) => {
			if (e.buttons) {
				this.updateSV(e);
			}
		});

		// Hue
		this.hue.addEventListener("pointerdown", (e) => {
			this.hue.setPointerCapture(e.pointerId);
			this.updateHue(e);
		});

		this.hue.addEventListener("pointermove", (e) => {
			if (e.buttons) {
				this.updateHue(e);
			}
		});

		// HEX
		this.hex.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				this.applyHex();
			}
		});

		this.hex.addEventListener("blur", () => {
			this.applyHex();
		});
	}

	toggle() {
		if (this.picker.classList.contains("open")) {
			this.close();
		} else {
			this.open();
		}
	}

	open() {
		this.setColor(this.input.value);

		this.position();

		this.picker.classList.add("open");

		// Close when clicking outside.
		this.outsideHandler = (e) => {
			if (!this.picker.contains(e.target) && e.target !== this.input) {
				this.close();
			}
		};

		setTimeout(() => {
			document.addEventListener("pointerdown", this.outsideHandler);
		});
	}

	close() {
		this.picker.classList.remove("open");

		if (this.outsideHandler) {
			document.removeEventListener("pointerdown", this.outsideHandler);
		}
	}

	position() {
		const rect = this.input.getBoundingClientRect();

		const pickerWidth = 230;
		const pickerHeight = 280;

		let left = rect.right + 8;
		let top = rect.top;

		// If it would go off the right side,
		// put it on the left instead.
		if (left + pickerWidth > window.innerWidth - 8) {
			left = rect.left - pickerWidth - 8;
		}

		// Keep it inside the viewport vertically.
		if (top + pickerHeight > window.innerHeight - 8) {
			top = window.innerHeight - pickerHeight - 8;
		}

		top = Math.max(8, top);
		left = Math.max(8, left);

		this.picker.style.left = `${left}px`;
		this.picker.style.top = `${top}px`;
	}

	updateSV(e) {
		const rect = this.sv.getBoundingClientRect();

		let x = (e.clientX - rect.left) / rect.width;
		let y = (e.clientY - rect.top) / rect.height;

		x = Math.max(0, Math.min(1, x));
		y = Math.max(0, Math.min(1, y));

		this.s = x;
		this.v = 1 - y;

		this.update();
	}

	updateHue(e) {
		const rect = this.hue.getBoundingClientRect();

		let x = (e.clientX - rect.left) / rect.width;

		x = Math.max(0, Math.min(1, x));

		this.h = x * 360;

		this.update();
	}

	setColor(hex) {
		const rgb = this.hexToRgb(hex);

		if (!rgb) {
			return;
		}

		const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);

		this.h = hsv.h;
		this.s = hsv.s;
		this.v = hsv.v;

		this.update();
	}

	applyHex() {
		const value = this.hex.value.trim();

		const rgb = this.hexToRgb(value);

		if (!rgb) {
			this.hex.value = this.input.value;
			return;
		}

		this.setColor(value);
	}

	update() {
		const rgb = this.hsvToRgb(this.h, this.s, this.v);

		const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);

		/*
		 * Update the original color imput
		 */
		this.input.value = hex;

		/*
		 * IMPORTANT:
		 * Dispatch the normal change/input events so
		 * existing application code continues to work.
		 */
		this.input.dispatchEvent(
			new Event("input", {
				bubbles: true,
			}),
		);

		this.input.dispatchEvent(
			new Event("change", {
				bubbles: true,
			}),
		);

		// SV background
		this.sv.style.background = `hsl(${this.h} 100% 50%)`;

		// SV cursor
		this.svCursor.style.left = `${this.s * 100}%`;

		this.svCursor.style.top = `${(1 - this.v) * 100}%`;

		// Hue cursor
		this.hueCursor.style.left = `${(this.h / 360) * 100}%`;

		// Preview
		this.preview.style.background = hex;

		// HEX
		this.hex.value = hex;
	}

	hsvToRgb(h, s, v) {
		const c = v * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));

		const m = v - c;

		let r, g, b;

		if (h < 60) {
			[r, g, b] = [c, x, 0];
		} else if (h < 120) {
			[r, g, b] = [x, c, 0];
		} else if (h < 180) {
			[r, g, b] = [0, c, x];
		} else if (h < 240) {
			[r, g, b] = [0, x, c];
		} else if (h < 300) {
			[r, g, b] = [x, 0, c];
		} else {
			[r, g, b] = [c, 0, x];
		}

		return {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255),
		};
	}

	rgbToHsv(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;

		let h = 0;

		if (d !== 0) {
			if (max === r) {
				h = 60 * (((g - b) / d) % 6);
			} else if (max === g) {
				h = 60 * ((b - r) / d + 2);
			} else {
				h = 60 * ((r - g) / d + 4);
			}
		}

		if (h < 0) {
			h += 360;
		}

		return {
			h,
			s: max === 0 ? 0 : d / max,
			v: max,
		};
	}

	hexToRgb(hex) {
		hex = hex.replace("#", "").trim();

		if (hex.length === 3) {
			hex = hex
				.split("")
				.map((x) => x + x)
				.join("");
		}

		if (!/^[0-9a-f]{6}$/i.test(hex)) {
			return null;
		}

		return {
			r: parseInt(hex.substring(0, 2), 16),
			g: parseInt(hex.substring(2, 4), 16),
			b: parseInt(hex.substring(4, 6), 16),
		};
	}

	rgbToHex(r, g, b) {
		return (
			"#" +
			[r, g, b]
				.map((value) => value.toString(16).padStart(2, "0"))
				.join("")
		);
	}
}

// Automatically apply the custom color picker to every color input.
document.querySelectorAll('input[type="color"]').forEach((input) => {
	new CustomColorPicker(input);
});
