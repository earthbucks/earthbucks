import wgslCode from "./pow3.wgsl?raw";
import { WebBuf, Hash, FixedBuf } from "@earthbucks/lib";

const HEADER_SIZE: number = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: number = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: number = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: number = 32;
const MANY_HASH_1_SIZE: number = 32 * 32 * 4 * 2; // 8192
const MATRIX_SIZE_1D: number = 32 * 4; // 128
const MATRIX_SIZE_2D: number = 32 * 4 * (32 * 4); // 16384
const MANY_HASH_2_SIZE: number = (65536 / 256) * 32; // 8192
const FINAL_HASH_SIZE: number = 32;

interface Pow3State {
  device: GPUDevice | null;
  module: GPUShaderModule | null;
  bindGroupLayout: GPUBindGroupLayout | null;
  pipelineLayout: GPUPipelineLayout | null;
  computePipelines: Record<string, GPUComputePipeline | null>;
  headerBuffer: GPUBuffer | null;
  pow2Buffer: GPUBuffer | null;
  bindGroup: GPUBindGroup | null;
}

export class Pow3 {
  private header: FixedBuf<217>;
  private state: Pow3State;

  constructor(header: FixedBuf<217>) {
    this.header = header;
    this.state = {
      device: null,
      module: null,
      bindGroupLayout: null,
      pipelineLayout: null,
      computePipelines: {},
      headerBuffer: null,
      pow2Buffer: null,
      bindGroup: null,
    };
  }

  async init(): Promise<void> {
    if (this.state.device) {
      console.log("pow3 already initialized");
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
      ],
    });
    this.state.bindGroupLayout = bindGroupLayout;

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });
    this.state.pipelineLayout = pipelineLayout;

    const computePipelineNames = [
      "set_nonce_from_header",
      "set_working_header",
      "hash_working_header",
      "fill_many_hash_1",
      "create_m1_from_many_hash_1",
      "create_m2_from_many_hash_1",
      "multiply_m1_times_m2_equals_m3",
      "multiply_m3_by_pi_to_get_m4",
      "create_many_hash_2_from_m4",
      "create_final_hash_from_many_hash_2",
      "check_final_hash_starts_with_11_zeros",
      "increment_nonce",
      "main",
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

    const pow2Buffer = device.createBuffer({
      size:
        4 +
        HEADER_SIZE * 4 +
        HASH_SIZE * 4 +
        MANY_HASH_1_SIZE * 4 +
        MATRIX_SIZE_2D * 4 +
        MATRIX_SIZE_2D * 4 +
        MATRIX_SIZE_2D * 4 +
        MATRIX_SIZE_2D * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });
    this.state.pow2Buffer = pow2Buffer;

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
            buffer: pow2Buffer,
          },
        },
      ],
    });

    this.state.bindGroup = bindGroup;

    // run set_nonce_from_header compute pipeline only in the init function
    const commandEncoderInit = device.createCommandEncoder();
    const passEncoderInit = commandEncoderInit.beginComputePass();
    passEncoderInit.setPipeline(
      // biome-ignore lint:
      this.state.computePipelines["set_nonce_from_header"]!,
    );
    passEncoderInit.setBindGroup(0, bindGroup);
    passEncoderInit.dispatchWorkgroups(1, 1, 1);
    passEncoderInit.end();
    device.queue.submit([commandEncoderInit.finish()]);
  }

  async iterate(): Promise<{
    hash: FixedBuf<32>;
    check: boolean;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.pow2Buffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow3 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    // const pipelineNames = ["main"];
    const pipelineNames = [
      "set_working_header",
      "hash_working_header",
      "fill_many_hash_1",
      "create_m1_from_many_hash_1",
      "create_m2_from_many_hash_1",
      "multiply_m1_times_m2_equals_m3",
      "multiply_m3_by_pi_to_get_m4",
      "create_many_hash_2_from_m4",
      "create_final_hash_from_many_hash_2",
      "check_final_hash_starts_with_11_zeros",
      "increment_nonce",
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
      if (name === "multiply_m1_times_m2_equals_m3") {
        passEncoder.dispatchWorkgroups(1, 1, 1);
        // passEncoder.dispatchWorkgroups(256, 1, 1);
        // passEncoder.dispatchWorkgroups(16, 16, 1);
      } else {
        passEncoder.dispatchWorkgroups(1, 1, 1);
      }
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    }

    // read the output data. we are reading the final hash plus two integers.
    const READ_START =
      4 +
      HEADER_SIZE * 4 +
      HASH_SIZE * 4 +
      MANY_HASH_1_SIZE * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MANY_HASH_2_SIZE * 4;
    const READ_LENGTH = FINAL_HASH_SIZE * 4 + 4 + 4;
    const readBuffer = device.createBuffer({
      size: 32 * 4 + 4 + 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      this.state.pow2Buffer,
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

    // hash data is all bytes, and check value is only 1 or 0, but the nonce
    // might be any uint32, so we need to get all data
    const hasharr = new Uint8Array(readData.slice(0, 32));
    const hash = FixedBuf.fromBuf(32, WebBuf.fromUint8Array(hasharr));
    const check = !!readData[32];
    const nonce = readData[33] as number;
    return { hash, check, nonce };
  }

  async main(): Promise<{
    hash: FixedBuf<32>;
    check: boolean;
    nonce: number;
  }> {
    if (
      !this.state.device ||
      !this.state.module ||
      !this.state.bindGroupLayout ||
      !this.state.pipelineLayout ||
      !this.state.headerBuffer ||
      !this.state.pow2Buffer ||
      !this.state.bindGroup
    ) {
      throw new Error("pow3 not initialized");
    }

    const device = this.state.device;
    const bindGroup = this.state.bindGroup;

    const pipelineNames = ["main"];
    // const pipelineNames = [
    //   "set_working_header",
    //   "hash_working_header",
    //   "fill_many_hash_1",
    //   "create_m1_from_many_hash_1",
    //   "create_m2_from_many_hash_1",
    //   "multiply_m1_times_m2_equals_m3",
    //   "multiply_m3_by_pi_to_get_m4",
    //   "create_many_hash_2_from_m4",
    //   "create_final_hash_from_many_hash_2",
    //   "check_final_hash_starts_with_11_zeros",
    //   "increment_nonce",
    // ];

    // now run all compute pipelines except set_nonce_from_header
    for (const name of pipelineNames) {
      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginComputePass();
      if (!this.state.computePipelines[name]) {
        throw new Error(`compute pipeline ${name} not found`);
      }
      passEncoder.setPipeline(this.state.computePipelines[name]);
      passEncoder.setBindGroup(0, bindGroup);
      if (name === "multiply_m1_times_m2_equals_m3") {
        passEncoder.dispatchWorkgroups(1, 1, 1);
        // passEncoder.dispatchWorkgroups(256, 1, 1);
        // passEncoder.dispatchWorkgroups(16, 16, 1);
      } else {
        passEncoder.dispatchWorkgroups(1, 1, 1);
      }
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    }

    // read the output data. we are reading the final hash plus two integers.
    const READ_START =
      4 +
      HEADER_SIZE * 4 +
      HASH_SIZE * 4 +
      MANY_HASH_1_SIZE * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MANY_HASH_2_SIZE * 4;
    const READ_LENGTH = FINAL_HASH_SIZE * 4 + 4 + 4;
    const readBuffer = device.createBuffer({
      size: 32 * 4 + 4 + 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      this.state.pow2Buffer,
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

    // hash data is all bytes, and check value is only 1 or 0, but the nonce
    // might be any uint32, so we need to get all data
    const hasharr = new Uint8Array(readData.slice(0, 32));
    const hash = FixedBuf.fromBuf(32, WebBuf.fromUint8Array(hasharr));
    const check = !!readData[32];
    const nonce = readData[33] as number;
    return { hash, check, nonce };
  }
}
