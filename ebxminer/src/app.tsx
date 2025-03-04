import React, { useEffect, useRef } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { useSignals } from "@preact/signals-react/runtime";
import {
  accepted,
  blocks,
  currentDifficulty,
  found,
  gpu,
  hashRate,
  messages,
  rejected,
} from "./signals.js";
import { miningLoop } from "./miner.js";
import { g } from "./utils.js";
import { BlockchainClient } from "./blockchain.js";

const formatNumber = new Intl.NumberFormat().format;

const GpuRow = ({
  name,
  hashRate,
  found,
  accepted,
  rejected,
  blocks,
  enabled,
}: {
  n?: number;
  name: string;
  hashRate: number;
  found: number;
  accepted: number;
  rejected: number;
  blocks: number;
  enabled: boolean;
}) => {
  return (
    <Box gap={1}>
      <Box height={1} overflow="hidden" marginRight={2}>
        <Text> {name}</Text>
      </Box>
      <Box minWidth="9" height={1} marginRight={2}>
        <Text>{hashRate.toFixed(2)} H/s</Text>
      </Box>
      <Box minWidth="12" height={1}>
        <Text>Found: {found}</Text>
      </Box>
      <Box minWidth="12" height={1}>
        <Text>Accept: {accepted}</Text>
      </Box>
      <Box minWidth="12" height={1}>
        <Text>Reject: {rejected}</Text>
      </Box>
      <Box minWidth="12" height={1}>
        <Text>Block: {blocks}</Text>
      </Box>
      <Box flexGrow={1} height={1} justifyContent="flex-end"></Box>
    </Box>
  );
};

export default function App({ session }: { session: string }) {
  useSignals();
  const ref = useRef(null);

  const app = useApp();
  useInput((input) => {
    if (input === "q") {
      app.exit();
    }
  });

  useEffect(() => {
    console.log(g("Welcome to EBX Miner"));
    const blockchain = new BlockchainClient(session);
    miningLoop(blockchain);
  }, []);

  return (
    <>
      <Box flexGrow={1} flexDirection="column">
        <Box
          borderStyle="bold"
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
        >
          <Text>Difficulty: {formatNumber(currentDifficulty.value)}</Text>
        </Box>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
        >
          <GpuRow
            n={0}
            name={gpu.value}
            hashRate={hashRate.value}
            found={found.value}
            accepted={accepted.value}
            rejected={rejected.value}
            blocks={blocks.value}
            enabled
          />
        </Box>
        <Box
          ref={ref}
          flexGrow={1}
          overflow="hidden"
          flexDirection="column"
          justifyContent="flex-end"
        >
          <Box flexShrink={0} flexDirection="column">
            {messages.value.map((item, index) => (
              <Box borderColor="yellow" key={index}>
                <Text>{item}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
