import wgslCode from "./pow2.wgsl?raw";
import { WebBuf, Hash, FixedBuf } from "@earthbucks/lib";

async function webGpuSha256(input: Uint8Array): Promise<Uint8Array> {
  // Request the GPU adapter and device
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Failed to get GPU adapter. Ensure WebGPU is supported.");
  }
  const device = await adapter.requestDevice();

  // Create a shader module from the imported WGSL
  const module = device.createShaderModule({ code: wgslCode });

  // const inputByteLength = input.byteLength;
  const outputByteLength = 32 * 4; // SHA-256 produces 32 bytes, but the output is uint32 values

  // // Ensure input length is multiple of 4
  // if (input.length % 4 !== 0) {
  //   throw new Error("Input length must be a multiple of 4");
  // }

  const inputUint32 = new Uint32Array(input.length); // Note: length is same as input
  for (let i = 0; i < input.length; i++) {
    inputUint32[i] = input[i] as number; // Each byte becomes its own uint32
  }

  // Create GPU buffer with the correct size for Uint32Array
  const inputBuffer = device.createBuffer({
    size: inputUint32.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  // Write the Uint32Array to the buffer
  device.queue.writeBuffer(inputBuffer, 0, inputUint32);
  const inputSizeBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const outputBuffer = device.createBuffer({
    size: outputByteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const dataSizeUint32 = new Uint32Array([input.length]); // Use original length
  device.queue.writeBuffer(inputSizeBuffer, 0, dataSizeUint32);

  // Create bind group layout and pipeline
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage", // Change from default "uniform"
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage", // Change from default "uniform"
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage", // Change from default "uniform"
        },
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const computePipeline = device.createComputePipeline({
    layout: pipelineLayout,
    compute: {
      module,
      entryPoint: "main_sha256",
    },
  });

  // Create a bind group to connect buffers to the shader
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: inputBuffer } },
      { binding: 1, resource: { buffer: inputSizeBuffer } },
      { binding: 2, resource: { buffer: outputBuffer } },
    ],
  });

  // Encode commands for computing SHA-256
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  // We only need 1 workgroup since the shader's @workgroup_size is (1,1)
  passEncoder.dispatchWorkgroups(1, 1, 1);
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);

  // Read the output data
  const gpuReadBuffer = device.createBuffer({
    size: outputByteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  // Copy from outputBuffer to a CPU-visible gpuReadBuffer
  const copyEncoder = device.createCommandEncoder();
  copyEncoder.copyBufferToBuffer(
    outputBuffer,
    0,
    gpuReadBuffer,
    0,
    outputByteLength,
  );
  device.queue.submit([copyEncoder.finish()]);

  // Wait for the GPU to finish the copy, then map and read result
  await gpuReadBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = gpuReadBuffer.getMappedRange();
  const uint32Array = new Uint32Array(arrayBuffer.slice());
  gpuReadBuffer.unmap();

  // Create the final byte array with correct ordering
  const result = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    // Each uint32 in the shader output contains one byte of the hash
    result[i] = (uint32Array[i] as number) & 0xff;
  }

  return result;
}

export async function sha256(data: WebBuf): Promise<FixedBuf<32>> {
  const arr = await webGpuSha256(data);
  return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
}

