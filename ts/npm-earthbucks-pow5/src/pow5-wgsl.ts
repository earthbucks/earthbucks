import wgslCode from "./pow5.wgsl?raw";
import { WebBuf, Hash, FixedBuf } from "@earthbucks/ebx-lib";

const HEADER_SIZE: number = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: number = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: number = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: number = 32;
const COMPRESSED_HASH_SIZE: number = 32 / 4; // 8
const WORKGROUP_SIZE: number = 256;
const MAX_GRID_SIZE: number = 32768; // max size

interface Pow5State {
  device: GPUDevice | null;
  module: GPUShaderModule | null;
  bindGroupLayout: GPUBindGroupLayout | null;
  pipelineLayout: GPUPipelineLayout | null;
  computePipelines: Record<string, GPUComputePipeline | null>;
  headerBuffer: GPUBuffer | null;
  targetBuffer: GPUBuffer | null;
  finalResultBuffer: GPUBuffer | null;
  bindGroup: GPUBindGroup | null;
}

type GridSize = 32768 | 2048 | 128;

export class Pow5 {
  private header: FixedBuf<217>;
  private target: FixedBuf<32>;
  private gridSize: GridSize;
  private state: Pow5State;

  constructor(
    header: FixedBuf<217>,
    target: FixedBuf<32>,
    gridSize: GridSize = 128,
  ) {
    this.header = header;
    this.target = target;
    this.gridSize = gridSize;
    this.state = {
      device: null,
      module: null,
      bindGroupLayout: null,
      pipelineLayout: null,
      computePipelines: {},
      headerBuffer: null,
      targetBuffer: null,
      finalResultBuffer: null,
      bindGroup: null,
    };
  }

  async init(debug = false): Promise<void> {
    if (this.state.device) {
      console.log("pow5 already initialized");
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
            type: "read-only-storage",
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

    const computePipelineNamesDebug = [
      "debug_hash_header",
      "debug_double_hash_header",
      "debug_hash_header_128",
      "debug_hash_header_32",
      "debug_get_work_par",
      "debug_elementary_iteration",
      "workgroup_reduce",
    ];

    const computePipelineNamesProd = ["workgroup_reduce"];

    const computePipelineNames = debug
      ? computePipelineNamesDebug
      : computePipelineNamesProd;

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

    const targetBuffer = device.createBuffer({
      size: HASH_SIZE,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
    this.state.targetBuffer = targetBuffer;

    const finalResultBuffer = device.createBuffer({
      size: 4 + 32,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    this.state.finalResultBuffer = finalResultBuffer;

    device.queue.writeBuffer(headerBuffer, 0, headerUint32Array.buffer);
    // now for the target buffer, we need to take the hash 4 bytes at a time,
    // and in *big-endian* order convert them into a Uint32Array and write that
    // to the buffer
    const targetUint8Array = this.target.buf;
    const targetUint32Array = new Uint32Array(8);
    let byteIndex = 0;
    for (let i = 0; i < 8; i++) {
      targetUint32Array[i] =
        ((targetUint8Array[byteIndex++] as number) << 24) |
        ((targetUint8Array[byteIndex++] as number) << 16) |
        ((targetUint8Array[byteIndex++] as number) << 8) |
        (targetUint8Array[byteIndex++] as number);
    }
    device.queue.writeBuffer(
      this.state.targetBuffer,
      0,
      targetUint32Array.buffer,
    );

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
            buffer: targetBuffer,
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

  async setInput(
    header: FixedBuf<217>,
    target: FixedBuf<32>,
    gridSize: GridSize,
  ): Promise<void> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.targetBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow5 not initialized");
    }

    this.header = header;
    this.gridSize = gridSize;

    const device = this.state.device;

    const headerUint8Array = header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    device.queue.writeBuffer(
      this.state.headerBuffer,
      0,
      headerUint32Array.buffer,
    );

    // now for the target buffer, we need to take the hash 4 bytes at a time,
    // and in *big-endian* order convert them into a Uint32Array and write that
    // to the buffer
    const targetUint8Array = target.buf;
    const targetUint32Array = new Uint32Array(8);
    let byteIndex = 0;
    for (let i = 0; i < 8; i++) {
      targetUint32Array[i] =
        ((targetUint8Array[byteIndex++] as number) << 24) |
        ((targetUint8Array[byteIndex++] as number) << 16) |
        ((targetUint8Array[byteIndex++] as number) << 8) |
        (targetUint8Array[byteIndex++] as number);
    }
    device.queue.writeBuffer(
      this.state.targetBuffer,
      0,
      targetUint32Array.buffer,
    );
  }

  async debugHashHeader(): Promise<{
    hash: FixedBuf<32>;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.targetBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow5 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    const pipelineNames = [
      "debug_hash_header",
      // "debug_elementary_iteration",
      // "workgroup_reduce",
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

  async debugDoubleHashHeader(): Promise<{
    hash: FixedBuf<32>;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.targetBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow5 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    const pipelineNames = [
      // "debug_hash_header",
      "debug_double_hash_header",
      // "debug_elementary_iteration",
      // "workgroup_reduce",
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

  async debugHashHeader128(): Promise<{
    hash: FixedBuf<32>;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.targetBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow5 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    const pipelineNames = [
      // "debug_hash_header",
      "debug_hash_header_128",
      // "debug_elementary_iteration",
      // "workgroup_reduce",
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

  async debugHashHeader32(): Promise<{
    hash: FixedBuf<32>;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.targetBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow5 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    const pipelineNames = [
      // "debug_hash_header",
      // "debug_hash_header_128",
      "debug_hash_header_32",
      // "debug_elementary_iteration",
      // "workgroup_reduce",
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

  async debugGetWorkPar(): Promise<{
    hash: FixedBuf<32>;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.targetBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow5 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    const pipelineNames = [
      // "debug_hash_header",
      "debug_get_work_par",
      // "debug_elementary_iteration",
      // "workgroup_reduce",
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
      !this.state.targetBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow5 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    const pipelineNames = [
      // "debug_hash_header",
      "debug_elementary_iteration",
      // "workgroup_reduce",
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
      !this.state.targetBuffer ||
      !this.state.finalResultBuffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow5 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    const pipelineNames = [
      // "debug_hash_header",
      // "debug_elementary_iteration",
      "workgroup_reduce",
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
      passEncoder.dispatchWorkgroups(1, this.gridSize);
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
