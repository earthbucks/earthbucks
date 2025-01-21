import wgslCode from "./pow4.wgsl?raw";
import { WebBuf, Hash, FixedBuf } from "@earthbucks/lib";

const HEADER_SIZE: number = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: number = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: number = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: number = 32;
const COMPRESSED_HASH_SIZE: number = 32 / 4; // 8
const WORKGROUP_SIZE: number = 256;
const GRID_SIZE: number = 32768;

interface Pow4State {
  device: GPUDevice | null;
  module: GPUShaderModule | null;
  bindGroupLayout: GPUBindGroupLayout | null;
  pipelineLayout: GPUPipelineLayout | null;
  computePipelines: Record<string, GPUComputePipeline | null>;
  headerBuffer: GPUBuffer | null;
  gridResultsBuffer: GPUBuffer | null;
  finalResultBuffer: GPUBuffer | null;
  bindGroup: GPUBindGroup | null;
}

export class Pow4 {
  private header: FixedBuf<217>;
  private state: Pow4State;

  constructor(header: FixedBuf<217>) {
    this.header = header;
    this.state = {
      device: null,
      module: null,
      bindGroupLayout: null,
      pipelineLayout: null,
      computePipelines: {},
      headerBuffer: null,
      gridResultsBuffer: null,
      finalResultBuffer: null,
      bindGroup: null,
    };
  }

  async init(): Promise<void> {
    if (this.state.device) {
      console.log("pow4 already initialized");
      return;
    }

    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();
    this.state.device = device;

    const module = device.createShaderModule({ code: wgslCode });
    this.state.module = module;

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "read-only-storage",
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage",
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage",
          },
        },
      ],
    });
    this.state.bindGroupLayout = bindGroupLayout;

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });
    this.state.pipelineLayout = pipelineLayout;

    const computePipelineNames = [
      "debug_hash_header",
      "debug_elementary_iteration",
      "pow4_workgroup_reduce",
      "pow4_grid_reduce",
    ];

    for (const name of computePipelineNames) {
      const pipeline = device.createComputePipeline({
        layout: pipelineLayout,
        compute: {
          module,
          entryPoint: name,
        },
      });
      this.state.computePipelines[name] = pipeline;
    }

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
    this.state.headerBuffer = headerBuffer;

    const gridResultsBuffer = device.createBuffer({
      size: (4 + 32) * GRID_SIZE,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    this.state.gridResultsBuffer = gridResultsBuffer;

    const finalResultBuffer = device.createBuffer({
      size: 4 + 32,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    this.state.finalResultBuffer = finalResultBuffer;

    device.queue.writeBuffer(headerBuffer, 0, headerUint32Array.buffer);

    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: headerBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: gridResultsBuffer,
          },
        },
        {
          binding: 2,
          resource: {
            buffer: finalResultBuffer,
          },
        },
      ],
    });

    this.state.bindGroup = bindGroup;
  }

  async debugGetHeaderHash(): Promise<{
    hash: FixedBuf<32>;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.gridResultsBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow4 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    // const pipelineNames = ["main"];
    const pipelineNames = [
      // "set_working_header",
      // "hash_working_header",
      // "fill_many_hash_1",
      // "create_m1_from_many_hash_1",
      // "create_m2_from_many_hash_1",
      // "multiply_m1_times_m2_equals_m3",
      // "multiply_m3_by_pi_to_get_m4",
      // "create_many_hash_2_from_m4",
      // "create_final_hash_from_many_hash_2",
      // "check_final_hash_starts_with_11_zeros",
      // "increment_nonce",
      "debug_hash_header",
    ];

    // now run all compute pipelines except set_nonce_from_header
    for (const name of pipelineNames) {
      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginComputePass();
      if (!this.state.computePipelines[name]) {
        throw new Error(`compute pipeline ${name} not found`);
      }
      passEncoder.setPipeline(this.state.computePipelines[name]);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.dispatchWorkgroups(1, 1, 1);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    }

    // read the output data. we are reading the final hash plus two integers.
    const READ_START = 0;
    const READ_LENGTH = 4 + 32; // nonce plus compressed hash
    const readBuffer = device.createBuffer({
      size: READ_LENGTH,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      this.state.finalResultBuffer,
      READ_START,
      readBuffer,
      0,
      READ_LENGTH,
    );
    device.queue.submit([copyEncoder.finish()]);

    // wait for the GPU to finish, then read the data
    await readBuffer.mapAsync(GPUMapMode.READ);
    const readData = new Uint32Array(readBuffer.getMappedRange().slice());
    readBuffer.unmap();

    const nonce = readData[0] as number;
    const compressedHash = readData.slice(1);

    const hashUint8Array = new Uint8Array(32);
    let byteIndex = 0;
    for (const value of compressedHash) {
      // Extract bytes in big-endian order
      hashUint8Array[byteIndex++] = (value >> 24) & 0xff;
      hashUint8Array[byteIndex++] = (value >> 16) & 0xff;
      hashUint8Array[byteIndex++] = (value >> 8) & 0xff;
      hashUint8Array[byteIndex++] = value & 0xff;
    }

    const hashWebBuf = WebBuf.fromUint8Array(hashUint8Array);
    const hashFixedBuf = FixedBuf.fromBuf(32, hashWebBuf);
    return {
      nonce,
      hash: hashFixedBuf,
    };
  }

  async debugElementaryIteration(): Promise<{
    hash: FixedBuf<32>;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.gridResultsBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow4 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    // const pipelineNames = ["main"];
    const pipelineNames = [
      "debug_elementary_iteration",
      // "pow4_workgroup_reduce",
      // "pow4_grid_reduce",
    ];

    // now run all compute pipelines except set_nonce_from_header
    for (const name of pipelineNames) {
      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginComputePass();
      if (!this.state.computePipelines[name]) {
        throw new Error(`compute pipeline ${name} not found`);
      }
      passEncoder.setPipeline(this.state.computePipelines[name]);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.dispatchWorkgroups(GRID_SIZE, 1, 1);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    }

    // read the output data. we are reading the final hash plus two integers.
    const READ_START = 0;
    const READ_LENGTH = 4 + 32; // nonce plus compressed hash
    const readBuffer = device.createBuffer({
      size: READ_LENGTH,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      this.state.finalResultBuffer,
      READ_START,
      readBuffer,
      0,
      READ_LENGTH,
    );
    device.queue.submit([copyEncoder.finish()]);

    // wait for the GPU to finish, then read the data
    await readBuffer.mapAsync(GPUMapMode.READ);
    const readData = new Uint32Array(readBuffer.getMappedRange().slice());
    readBuffer.unmap();

    const nonce = readData[0] as number;
    const compressedHash = readData.slice(1);

    const hashUint8Array = new Uint8Array(32);
    let byteIndex = 0;
    for (const value of compressedHash) {
      // Extract bytes in big-endian order
      hashUint8Array[byteIndex++] = (value >> 24) & 0xff;
      hashUint8Array[byteIndex++] = (value >> 16) & 0xff;
      hashUint8Array[byteIndex++] = (value >> 8) & 0xff;
      hashUint8Array[byteIndex++] = value & 0xff;
    }

    const hashWebBuf = WebBuf.fromUint8Array(hashUint8Array);
    const hashFixedBuf = FixedBuf.fromBuf(32, hashWebBuf);
    return {
      nonce,
      hash: hashFixedBuf,
    };
  }

  async work(): Promise<{
    hash: FixedBuf<32>;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.gridResultsBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow4 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    // const pipelineNames = ["main"];
    const pipelineNames = ["pow4_workgroup_reduce", "pow4_grid_reduce"];

    // now run all compute pipelines except set_nonce_from_header
    for (const name of pipelineNames) {
      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginComputePass();
      if (!this.state.computePipelines[name]) {
        throw new Error(`compute pipeline ${name} not found`);
      }
      passEncoder.setPipeline(this.state.computePipelines[name]);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.dispatchWorkgroups(GRID_SIZE, 1, 1);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    }

    // read the output data. we are reading the final hash plus two integers.
    const READ_START = 0;
    const READ_LENGTH = 4 + 32; // nonce plus compressed hash
    const readBuffer = device.createBuffer({
      size: READ_LENGTH,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      this.state.finalResultBuffer,
      READ_START,
      readBuffer,
      0,
      READ_LENGTH,
    );
    device.queue.submit([copyEncoder.finish()]);

    // wait for the GPU to finish, then read the data
    await readBuffer.mapAsync(GPUMapMode.READ);
    const readData = new Uint32Array(readBuffer.getMappedRange().slice());
    readBuffer.unmap();

    const nonce = readData[0] as number;
    const compressedHash = readData.slice(1);

    const hashUint8Array = new Uint8Array(32);
    let byteIndex = 0;
    for (const value of compressedHash) {
      // Extract bytes in big-endian order
      hashUint8Array[byteIndex++] = (value >> 24) & 0xff;
      hashUint8Array[byteIndex++] = (value >> 16) & 0xff;
      hashUint8Array[byteIndex++] = (value >> 8) & 0xff;
      hashUint8Array[byteIndex++] = value & 0xff;
    }

    const hashWebBuf = WebBuf.fromUint8Array(hashUint8Array);
    const hashFixedBuf = FixedBuf.fromBuf(32, hashWebBuf);
    return {
      nonce,
      hash: hashFixedBuf,
    };
  }
}
