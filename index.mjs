// @ts-check

import { Driver } from "zwave-js";

// Tell the driver which serial port to use
const driver = new Driver(
	"/dev/serial/by-id/usb-Silicon_Labs_CP2102N_USB_to_UART_Bridge_Controller_900bdd31185bef11b46e41405e7370b6-if00-port0",
	// and configure options like security keys
	{
		securityKeys: {
			S0_Legacy: Buffer.from("0102030405060708090a0b0c0d0e0f10", "hex"),
			S2_Unauthenticated: Buffer.from(
				"5369389EFA18EE2A4894C7FB48347FEA",
				"hex"
			),
			S2_AccessControl: Buffer.from(
				"31132050077310B6F7032F91C79C2EB8",
				"hex"
			),
			S2_Authenticated: Buffer.from(
				"656EF5C0F020F3C14238C04A1748B7E1",
				"hex"
			),
		},
		securityKeysLongRange: {
			S2_Authenticated: Buffer.from(
				"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
				"hex"
			),
			S2_AccessControl: Buffer.from(
				"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
				"hex"
			),
		},
	}
);

// Listen for the driver ready event before doing anything with the driver
driver.once("driver ready", () => {
	// Wait for all nodes to be ready (or dead)
	driver.on("all nodes ready", main);
});

// Start the driver
await driver.start();

// Stop the driver when the application gets a SIGINT or SIGTERM signal
for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, async () => {
		await driver.destroy();
		process.exit(0);
	});
}

// =================================================
// Main code

async function main() {
	// Main code goes here
	console.log("all nodes ready");
}
