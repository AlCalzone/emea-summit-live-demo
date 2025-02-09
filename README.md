# README

## First steps

1. Initialize project

    ```
    npm init -y
    ```

2. Install Z-Wave JS

    ```
    npm install zwave-js
    ```

3. Create a new script file `index.mjs`

4. Copy boilerplate

    ```ts
    // @ts-check

    import { Driver } from "zwave-js";

    // Tell the driver which serial port to use
    const driver = new Driver(
    	"/dev/serial/by-id/usb-Silicon_Labs_CP2102N_USB_to_UART_Bridge_Controller_900bdd31185bef11b46e41405e7370b6-if00-port0",
    	// and configure options like security keys
    	{
    		securityKeys: {
    			S0_Legacy: Buffer.from(
    				"0102030405060708090a0b0c0d0e0f10",
    				"hex"
    			),
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
    ```

5. Run the script

    ```
    node index.mjs
    ```

## Examples

## Figure out which CCs are supported

```ts
import { getCCName } from "@zwave-js/core";

const node = driver.controller.nodes.getOrThrow(6);

for (const [ccId, info] of node.getCCs()) {
	console.log(` - ${getCCName(ccId)}: ${info.version}`);
}
```

## Make LED blink with Basic CC

```ts
import { setTimeout } from "node:timers/promises";

for (let i = 0; i < 10; i++) {
	await node.commandClasses.Basic.set(i % 2 === 0 ? 255 : 0);
	await setTimeout(500);
}
```

## Change LED color

```ts
import { setTimeout } from "node:timers/promises";

const colors = [
	{ red: 255, green: 0, blue: 0 },
	{ red: 0, green: 255, blue: 0 },
	{ red: 0, green: 0, blue: 255 },
	{ red: 255, green: 255, blue: 0 },
	{ red: 0, green: 255, blue: 255 },
	{ red: 255, green: 0, blue: 255 },
];

for (let i = 0; i < 12; i++) {
	await node.commandClasses["Color Switch"].set(
		colors[i % colors.length]
	);
	await setTimeout(250);
}

await node.commandClasses["Color Switch"].set({
	red: 0,
	green: 4,
	blue: 0,
});
```

## Check state of light

```ts
const state = await node.commandClasses["Binary Switch"].get();
if (state) {
	if (state.currentValue) {
		console.log("Switch is ON");
	} else {
		console.log("Switch is OFF");
	}
} else {
	console.error("no response");
}
```

## React to reports

The power strip sample application on the DK2603 800 series devkit sends
an overload status notification when the right button is pressed.

```ts
import { CommandClasses } from "@zwave-js/core";

node.on("value updated", (node, args) => {
	if (
		args.commandClass === CommandClasses.Notification &&
		args.property === "Power Management" &&
		args.propertyKey === "Over-load status" &&
		args.newValue === 0x08
	) {
		console.log("BUTTON PRESSED");
	}
});
```