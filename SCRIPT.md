# Script for demo

## Install everything, copy boilerplate

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

Turn on first:
```ts
await node.commandClasses["Binary Switch"].set(true);
```

## React to reports

```ts
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