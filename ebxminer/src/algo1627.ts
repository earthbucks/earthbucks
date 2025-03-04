import { WebBuf } from "webbuf";
import { blake3 } from "@noble/hashes/blake3";
import swapShader from "./shaders/swap.js";
import powShader from "./shaders/pow.js";
import expandShader from "./shaders/expand.js";
import reduceShader from "./shaders/reduce.js";
import { getNavigator } from "./navigator.js";

export type Algo1627 = (
  inputData: BufferSource,
) => Promise<Uint8Array<ArrayBufferLike>>;

async function reducedHash(e: [WebBuf, WebBuf, WebBuf, WebBuf]) {
  const s = blake3(e[0]),
    r = blake3(e[1]),
    o = blake3(e[2]),
    a = blake3(e[3]),
    i = WebBuf.concat([s, r, o, a]);
  return blake3(i);
}

export default async function createAlgo1627(): Promise<Algo1627> {
  const nav = getNavigator();
  const adapter = await nav.gpu?.requestAdapter({
    powerPreference: "high-performance",
  });
  const device = await adapter?.requestDevice();
  if (!device) {
    throw new Error("No GPU device found.");
  }

  device.pushErrorScope("validation");
  device.pushErrorScope("out-of-memory");
  device.pushErrorScope("internal");

  const inputBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage" },
      },
    ],
  });

  const outputBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage" },
      },
    ],
  });

  const rowBuffer = device.createBuffer({
    size: 384,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  const colBuffer = device.createBuffer({
    size: 384,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  const readBytes = 1627 * 16;
  const outputBuffer = device.createBuffer({
    size: readBytes,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  const matrixBuffer = device.createBuffer({
    size: 1627 * 1627 * 4,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  const gpuReadBuffer = device.createBuffer({
    size: readBytes,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const swapModule = device.createShaderModule({
    label: "swap module",
    code: swapShader,
  });

  const expandModule = device.createShaderModule({
    label: "expand module",
    code: expandShader,
  });

  const powModule = device.createShaderModule({
    label: "pow module",
    code: powShader,
  });

  const reduceModule = device.createShaderModule({
    label: "reduce module",
    code: reduceShader,
  });

  const swapPipeline = await device.createComputePipelineAsync({
    label: "swap pipeline",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [inputBindGroupLayout],
    }),
    compute: {
      module: swapModule,
      entryPoint: "main",
    },
  });

  const expandPipeline = await device.createComputePipelineAsync({
    label: "expand pipeline",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [inputBindGroupLayout],
    }),
    compute: {
      module: expandModule,
      entryPoint: "main",
    },
  });

  const powPipeline = await device.createComputePipelineAsync({
    label: "pow pipeline",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [inputBindGroupLayout, outputBindGroupLayout],
    }),
    compute: {
      module: powModule,
      entryPoint: "main",
    },
  });

  const reducePipeline = await device.createComputePipelineAsync({
    label: "reduce pipeline",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [outputBindGroupLayout],
    }),
    compute: {
      module: reduceModule,
      entryPoint: "main",
    },
  });

  const expandBindGroup = device.createBindGroup({
    layout: inputBindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: rowBuffer } },
      { binding: 1, resource: { buffer: colBuffer } },
    ],
  });

  const powBindGroup = device.createBindGroup({
    layout: outputBindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: outputBuffer } },
      { binding: 1, resource: { buffer: matrixBuffer } },
    ],
  });

  return async (inputData: BufferSource) => {
    device.queue.writeBuffer(rowBuffer, 0, inputData);

    const encoder = device.createCommandEncoder({
      label: "pow encoder",
    });

    const swapPass = encoder.beginComputePass({
      label: "swap compute pass",
    });
    swapPass.setPipeline(swapPipeline);
    swapPass.setBindGroup(0, expandBindGroup);

    swapPass.dispatchWorkgroups(96);
    swapPass.end();

    const expandPass = encoder.beginComputePass({
      label: "expand compute pass",
    });
    expandPass.setPipeline(expandPipeline);
    expandPass.setBindGroup(0, expandBindGroup);

    expandPass.dispatchWorkgroups(96);
    expandPass.end();

    const powPass = encoder.beginComputePass({
      label: "pow compute pass",
    });
    powPass.setPipeline(powPipeline);
    powPass.setBindGroup(0, expandBindGroup);
    powPass.setBindGroup(1, powBindGroup);

    powPass.dispatchWorkgroups(208, 208);
    powPass.end();

    const reducePass = encoder.beginComputePass({
      label: "reduce compute pass",
    });
    reducePass.setPipeline(reducePipeline);
    reducePass.setBindGroup(0, powBindGroup);

    reducePass.dispatchWorkgroups(1, 1627);
    reducePass.end();

    const gpuRead = gpuReadBuffer;
    encoder.copyBufferToBuffer(outputBuffer, 0, gpuRead, 0, readBytes);
    device.queue.submit([encoder.finish()]);

    await gpuRead.mapAsync(GPUMapMode.READ);
    const result = new Uint32Array(gpuRead.getMappedRange()).slice();
    gpuRead.unmap();

    const bytes = 1627;
    const bufs: [WebBuf, WebBuf, WebBuf, WebBuf] = [
      WebBuf.from(result.subarray(0, bytes)),
      WebBuf.from(result.subarray(bytes, bytes * 2)),
      WebBuf.from(result.subarray(bytes * 2, bytes * 3)),
      WebBuf.from(result.subarray(bytes * 3, bytes * 4)),
    ];
    return reducedHash(bufs);
  };
}
