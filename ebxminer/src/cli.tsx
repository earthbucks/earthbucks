#!/usr/bin/env node
import React from "react";
import meow from "meow";
import App from "./app.js";
import { render } from "ink";
import { initMiner } from "./miner.js";
import { globals, create } from "./dawn.js";
import { overrideNavigator } from "./navigator.js";

Object.assign(globalThis, globals);

const cli = meow(
  `
	Usage
	  $ ebxminer

	Options
		--device  Device
		--session earthbucks.com session
		--verbose, -v Verbose

	Examples
	  $ ebxminer --session=KaBpFKlmYzM2OazL4iN28qYyNRZi3WYaZTgaIn2iOi85Iz%3D%3D --device=0
`,
  {
    importMeta: import.meta,
    flags: {
      device: {
        type: "number",
        default: 0,
      },
      session: {
        type: "string",
        isRequired: true,
      },
      verbose: {
        type: "boolean",
        alias: "v",
        default: false,
      },
    },
  },
);

// devicenum requires a custom dawn-node build
const params = [`devicenum=${cli.flags.device}`];
if (cli.flags.verbose) params.push("verbose=1");

overrideNavigator({
  gpu: create(params),
} as Navigator);

initMiner(cli.flags.device);

render(<App session={cli.flags.session} />);
