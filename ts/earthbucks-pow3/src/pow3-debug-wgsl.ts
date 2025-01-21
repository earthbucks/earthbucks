import wgslCode from "./pow3-debug.wgsl?raw";
import { WebBuf, Hash, FixedBuf } from "@earthbucks/lib";

const HEADER_SIZE: number = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: number = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: number = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: number = 32;
const MANY_HASH_1_SIZE: number = 32 * 32 * 4 * 2; // 8192
const MATRIX_SIZE_1D: number = 32 * 4; // 128
const MATRIX_SIZE_2D: number = 32 * 4 * (32 * 4); // 16384
const M4_BYTES_SIZE: number = MATRIX_SIZE_2D * 4; // 65536
const MANY_HASH_2_SIZE: number = (65536 / 256) * 32; // 8192
const FINAL_HASH_SIZE: number = 32;

export class Pow3 {
  private header: FixedBuf<217>;

  constructor(header: FixedBuf<217>) {
    this.header = header;
  }

  async debugGetHeaderHash(): Promise<FixedBuf<32>> {
    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();

    const module = device.createShaderModule({ code: wgslCode });

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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    const computePipeline1 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_nonce_from_header",
      },
    });
    const computePipeline2 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_working_header",
      },
    });
    const computePipeline3 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "hash_working_header",
      },
    });

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
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
        M4_BYTES_SIZE * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

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

    // now run all three compute pipelines

    const commandEncoder1 = device.createCommandEncoder();
    const passEncoder1 = commandEncoder1.beginComputePass();
    passEncoder1.setPipeline(computePipeline1);
    passEncoder1.setBindGroup(0, bindGroup);
    passEncoder1.dispatchWorkgroups(1, 1, 1);
    passEncoder1.end();
    device.queue.submit([commandEncoder1.finish()]);

    const commandEncoder2 = device.createCommandEncoder();
    const passEncoder2 = commandEncoder2.beginComputePass();
    passEncoder2.setPipeline(computePipeline2);
    passEncoder2.setBindGroup(0, bindGroup);
    passEncoder2.dispatchWorkgroups(1, 1, 1);
    passEncoder2.end();
    device.queue.submit([commandEncoder2.finish()]);

    const commandEncoder3 = device.createCommandEncoder();
    const passEncoder3 = commandEncoder3.beginComputePass();
    passEncoder3.setPipeline(computePipeline3);
    passEncoder3.setBindGroup(0, bindGroup);
    passEncoder3.dispatchWorkgroups(1, 1, 1);
    passEncoder3.end();
    device.queue.submit([commandEncoder3.finish()]);

    // read the output data
    // in this case, we are reading the hash of the header only
    const READ_START = 4 + HEADER_SIZE * 4;
    const READ_LENGTH = HASH_SIZE * 4;
    const readBuffer = device.createBuffer({
      size: 32 * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      pow2Buffer,
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

    // hash data is all bytes, so we can copy directly into a Uint8Array
    const dataUint8Array = new Uint8Array(readData);
    const dataFixedBuf = FixedBuf.fromBuf(
      32,
      WebBuf.fromUint8Array(dataUint8Array),
    );
    return dataFixedBuf;
  }

  async debugGetManyHash1(): Promise<FixedBuf<8192>> {
    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();

    const module = device.createShaderModule({ code: wgslCode });

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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // this.pow3.set_nonce_from_header();
    // this.pow3.set_working_header();
    // this.pow3.hash_working_header();
    // this.pow3.fill_many_hash_1();
    // this.pow3.create_m1_from_many_hash_1();
    // this.pow3.create_m2_from_many_hash_1();
    // this.pow3.multiply_m1_times_m2_equals_m3();
    // this.pow3.multiply_m3_by_pi_to_get_m4();
    // this.pow3.convert_m4_to_bytes();
    // this.pow3.create_many_hash_2_from_m4_bytes();
    // this.pow3.create_final_hash_from_many_hash_2();
    const computePipeline1 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_nonce_from_header",
      },
    });
    const computePipeline2 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_working_header",
      },
    });
    const computePipeline3 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "hash_working_header",
      },
    });
    const computePipeline4 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "fill_many_hash_1",
      },
    });
    const computePipeline5 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m1_from_many_hash_1",
      },
    });
    const computePipeline6 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m2_from_many_hash_1",
      },
    });
    const computePipeline7 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m1_times_m2_equals_m3",
      },
    });
    const computePipeline8 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m3_by_pi_to_get_m4",
      },
    });
    const computePipeline9 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "convert_m4_to_bytes",
      },
    });
    const computePipeline10 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_many_hash_2_from_m4_bytes",
      },
    });
    const computePipeline11 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_final_hash_from_many_hash_2",
      },
    });

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
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
        M4_BYTES_SIZE * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

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

    // now run all three compute pipelines

    const commandEncoder1 = device.createCommandEncoder();
    const passEncoder1 = commandEncoder1.beginComputePass();
    passEncoder1.setPipeline(computePipeline1);
    passEncoder1.setBindGroup(0, bindGroup);
    passEncoder1.dispatchWorkgroups(1, 1, 1);
    passEncoder1.end();
    device.queue.submit([commandEncoder1.finish()]);

    const commandEncoder2 = device.createCommandEncoder();
    const passEncoder2 = commandEncoder2.beginComputePass();
    passEncoder2.setPipeline(computePipeline2);
    passEncoder2.setBindGroup(0, bindGroup);
    passEncoder2.dispatchWorkgroups(1, 1, 1);
    passEncoder2.end();
    device.queue.submit([commandEncoder2.finish()]);

    const commandEncoder3 = device.createCommandEncoder();
    const passEncoder3 = commandEncoder3.beginComputePass();
    passEncoder3.setPipeline(computePipeline3);
    passEncoder3.setBindGroup(0, bindGroup);
    passEncoder3.dispatchWorkgroups(1, 1, 1);
    passEncoder3.end();
    device.queue.submit([commandEncoder3.finish()]);

    const commandEncoder4 = device.createCommandEncoder();
    const passEncoder4 = commandEncoder4.beginComputePass();
    passEncoder4.setPipeline(computePipeline4);
    passEncoder4.setBindGroup(0, bindGroup);
    passEncoder4.dispatchWorkgroups(1, 1, 1);
    passEncoder4.end();
    device.queue.submit([commandEncoder4.finish()]);

    const commandEncoder5 = device.createCommandEncoder();
    const passEncoder5 = commandEncoder5.beginComputePass();
    passEncoder5.setPipeline(computePipeline5);
    passEncoder5.setBindGroup(0, bindGroup);
    passEncoder5.dispatchWorkgroups(1, 1, 1);
    passEncoder5.end();
    device.queue.submit([commandEncoder5.finish()]);

    const commandEncoder6 = device.createCommandEncoder();
    const passEncoder6 = commandEncoder6.beginComputePass();
    passEncoder6.setPipeline(computePipeline6);
    passEncoder6.setBindGroup(0, bindGroup);
    passEncoder6.dispatchWorkgroups(1, 1, 1);
    passEncoder6.end();
    device.queue.submit([commandEncoder6.finish()]);

    const commandEncoder7 = device.createCommandEncoder();
    const passEncoder7 = commandEncoder7.beginComputePass();
    passEncoder7.setPipeline(computePipeline7);
    passEncoder7.setBindGroup(0, bindGroup);
    passEncoder7.dispatchWorkgroups(1, 1, 1);
    passEncoder7.end();
    device.queue.submit([commandEncoder7.finish()]);

    const commandEncoder8 = device.createCommandEncoder();
    const passEncoder8 = commandEncoder8.beginComputePass();
    passEncoder8.setPipeline(computePipeline8);
    passEncoder8.setBindGroup(0, bindGroup);
    passEncoder8.dispatchWorkgroups(1, 1, 1);
    passEncoder8.end();
    device.queue.submit([commandEncoder8.finish()]);

    const commandEncoder9 = device.createCommandEncoder();
    const passEncoder9 = commandEncoder9.beginComputePass();
    passEncoder9.setPipeline(computePipeline9);
    passEncoder9.setBindGroup(0, bindGroup);
    passEncoder9.dispatchWorkgroups(1, 1, 1);
    passEncoder9.end();
    device.queue.submit([commandEncoder9.finish()]);

    const commandEncoder10 = device.createCommandEncoder();
    const passEncoder10 = commandEncoder10.beginComputePass();
    passEncoder10.setPipeline(computePipeline10);
    passEncoder10.setBindGroup(0, bindGroup);
    passEncoder10.dispatchWorkgroups(1, 1, 1);
    passEncoder10.end();
    device.queue.submit([commandEncoder10.finish()]);

    const commandEncoder11 = device.createCommandEncoder();
    const passEncoder11 = commandEncoder11.beginComputePass();
    passEncoder11.setPipeline(computePipeline11);
    passEncoder11.setBindGroup(0, bindGroup);
    passEncoder11.dispatchWorkgroups(1, 1, 1);
    passEncoder11.end();
    device.queue.submit([commandEncoder11.finish()]);

    // read the output data
    // in this case, we are reading the final hash only
    const READ_START = 4 + HEADER_SIZE * 4 + HASH_SIZE * 4;
    const READ_LENGTH = MANY_HASH_1_SIZE * 4;
    const readBuffer = device.createBuffer({
      size: 8192 * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      pow2Buffer,
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

    // hash data is all bytes, so we can copy directly into a Uint8Array
    const dataUint8Array = new Uint8Array(readData);
    const dataFixedBuf = FixedBuf.fromBuf(
      8192,
      WebBuf.fromUint8Array(dataUint8Array),
    );
    return dataFixedBuf;
  }

  async debugGetM1(): Promise<Uint32Array> {
    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();

    const module = device.createShaderModule({ code: wgslCode });

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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // this.pow3.set_nonce_from_header();
    // this.pow3.set_working_header();
    // this.pow3.hash_working_header();
    // this.pow3.fill_many_hash_1();
    // this.pow3.create_m1_from_many_hash_1();
    // this.pow3.create_m2_from_many_hash_1();
    // this.pow3.multiply_m1_times_m2_equals_m3();
    // this.pow3.multiply_m3_by_pi_to_get_m4();
    // this.pow3.convert_m4_to_bytes();
    // this.pow3.create_many_hash_2_from_m4_bytes();
    // this.pow3.create_final_hash_from_many_hash_2();
    const computePipeline1 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_nonce_from_header",
      },
    });
    const computePipeline2 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_working_header",
      },
    });
    const computePipeline3 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "hash_working_header",
      },
    });
    const computePipeline4 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "fill_many_hash_1",
      },
    });
    const computePipeline5 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m1_from_many_hash_1",
      },
    });
    const computePipeline6 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m2_from_many_hash_1",
      },
    });
    const computePipeline7 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m1_times_m2_equals_m3",
      },
    });
    const computePipeline8 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m3_by_pi_to_get_m4",
      },
    });
    const computePipeline9 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "convert_m4_to_bytes",
      },
    });
    const computePipeline10 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_many_hash_2_from_m4_bytes",
      },
    });
    const computePipeline11 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_final_hash_from_many_hash_2",
      },
    });

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
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
        M4_BYTES_SIZE * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

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

    // now run all three compute pipelines

    const commandEncoder1 = device.createCommandEncoder();
    const passEncoder1 = commandEncoder1.beginComputePass();
    passEncoder1.setPipeline(computePipeline1);
    passEncoder1.setBindGroup(0, bindGroup);
    passEncoder1.dispatchWorkgroups(1, 1, 1);
    passEncoder1.end();
    device.queue.submit([commandEncoder1.finish()]);

    const commandEncoder2 = device.createCommandEncoder();
    const passEncoder2 = commandEncoder2.beginComputePass();
    passEncoder2.setPipeline(computePipeline2);
    passEncoder2.setBindGroup(0, bindGroup);
    passEncoder2.dispatchWorkgroups(1, 1, 1);
    passEncoder2.end();
    device.queue.submit([commandEncoder2.finish()]);

    const commandEncoder3 = device.createCommandEncoder();
    const passEncoder3 = commandEncoder3.beginComputePass();
    passEncoder3.setPipeline(computePipeline3);
    passEncoder3.setBindGroup(0, bindGroup);
    passEncoder3.dispatchWorkgroups(1, 1, 1);
    passEncoder3.end();
    device.queue.submit([commandEncoder3.finish()]);

    const commandEncoder4 = device.createCommandEncoder();
    const passEncoder4 = commandEncoder4.beginComputePass();
    passEncoder4.setPipeline(computePipeline4);
    passEncoder4.setBindGroup(0, bindGroup);
    passEncoder4.dispatchWorkgroups(1, 1, 1);
    passEncoder4.end();
    device.queue.submit([commandEncoder4.finish()]);

    const commandEncoder5 = device.createCommandEncoder();
    const passEncoder5 = commandEncoder5.beginComputePass();
    passEncoder5.setPipeline(computePipeline5);
    passEncoder5.setBindGroup(0, bindGroup);
    passEncoder5.dispatchWorkgroups(1, 1, 1);
    passEncoder5.end();
    device.queue.submit([commandEncoder5.finish()]);

    const commandEncoder6 = device.createCommandEncoder();
    const passEncoder6 = commandEncoder6.beginComputePass();
    passEncoder6.setPipeline(computePipeline6);
    passEncoder6.setBindGroup(0, bindGroup);
    passEncoder6.dispatchWorkgroups(1, 1, 1);
    passEncoder6.end();
    device.queue.submit([commandEncoder6.finish()]);

    const commandEncoder7 = device.createCommandEncoder();
    const passEncoder7 = commandEncoder7.beginComputePass();
    passEncoder7.setPipeline(computePipeline7);
    passEncoder7.setBindGroup(0, bindGroup);
    passEncoder7.dispatchWorkgroups(1, 1, 1);
    passEncoder7.end();
    device.queue.submit([commandEncoder7.finish()]);

    const commandEncoder8 = device.createCommandEncoder();
    const passEncoder8 = commandEncoder8.beginComputePass();
    passEncoder8.setPipeline(computePipeline8);
    passEncoder8.setBindGroup(0, bindGroup);
    passEncoder8.dispatchWorkgroups(1, 1, 1);
    passEncoder8.end();
    device.queue.submit([commandEncoder8.finish()]);

    const commandEncoder9 = device.createCommandEncoder();
    const passEncoder9 = commandEncoder9.beginComputePass();
    passEncoder9.setPipeline(computePipeline9);
    passEncoder9.setBindGroup(0, bindGroup);
    passEncoder9.dispatchWorkgroups(1, 1, 1);
    passEncoder9.end();
    device.queue.submit([commandEncoder9.finish()]);

    const commandEncoder10 = device.createCommandEncoder();
    const passEncoder10 = commandEncoder10.beginComputePass();
    passEncoder10.setPipeline(computePipeline10);
    passEncoder10.setBindGroup(0, bindGroup);
    passEncoder10.dispatchWorkgroups(1, 1, 1);
    passEncoder10.end();
    device.queue.submit([commandEncoder10.finish()]);

    const commandEncoder11 = device.createCommandEncoder();
    const passEncoder11 = commandEncoder11.beginComputePass();
    passEncoder11.setPipeline(computePipeline11);
    passEncoder11.setBindGroup(0, bindGroup);
    passEncoder11.dispatchWorkgroups(1, 1, 1);
    passEncoder11.end();
    device.queue.submit([commandEncoder11.finish()]);

    // read the output data
    // in this case, we are reading the final hash only
    const READ_START =
      4 + HEADER_SIZE * 4 + HASH_SIZE * 4 + MANY_HASH_1_SIZE * 4;
    const READ_LENGTH = MATRIX_SIZE_2D * 4;
    const readBuffer = device.createBuffer({
      size: MATRIX_SIZE_2D * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      pow2Buffer,
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

    return readData;
  }

  async debugGetM2(): Promise<Uint32Array> {
    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();

    const module = device.createShaderModule({ code: wgslCode });

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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // this.pow3.set_nonce_from_header();
    // this.pow3.set_working_header();
    // this.pow3.hash_working_header();
    // this.pow3.fill_many_hash_1();
    // this.pow3.create_m1_from_many_hash_1();
    // this.pow3.create_m2_from_many_hash_1();
    // this.pow3.multiply_m1_times_m2_equals_m3();
    // this.pow3.multiply_m3_by_pi_to_get_m4();
    // this.pow3.convert_m4_to_bytes();
    // this.pow3.create_many_hash_2_from_m4_bytes();
    // this.pow3.create_final_hash_from_many_hash_2();
    const computePipeline1 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_nonce_from_header",
      },
    });
    const computePipeline2 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_working_header",
      },
    });
    const computePipeline3 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "hash_working_header",
      },
    });
    const computePipeline4 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "fill_many_hash_1",
      },
    });
    const computePipeline5 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m1_from_many_hash_1",
      },
    });
    const computePipeline6 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m2_from_many_hash_1",
      },
    });
    const computePipeline7 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m1_times_m2_equals_m3",
      },
    });
    const computePipeline8 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m3_by_pi_to_get_m4",
      },
    });
    const computePipeline9 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "convert_m4_to_bytes",
      },
    });
    const computePipeline10 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_many_hash_2_from_m4_bytes",
      },
    });
    const computePipeline11 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_final_hash_from_many_hash_2",
      },
    });

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
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
        M4_BYTES_SIZE * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

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

    // now run all three compute pipelines

    const commandEncoder1 = device.createCommandEncoder();
    const passEncoder1 = commandEncoder1.beginComputePass();
    passEncoder1.setPipeline(computePipeline1);
    passEncoder1.setBindGroup(0, bindGroup);
    passEncoder1.dispatchWorkgroups(1, 1, 1);
    passEncoder1.end();
    device.queue.submit([commandEncoder1.finish()]);

    const commandEncoder2 = device.createCommandEncoder();
    const passEncoder2 = commandEncoder2.beginComputePass();
    passEncoder2.setPipeline(computePipeline2);
    passEncoder2.setBindGroup(0, bindGroup);
    passEncoder2.dispatchWorkgroups(1, 1, 1);
    passEncoder2.end();
    device.queue.submit([commandEncoder2.finish()]);

    const commandEncoder3 = device.createCommandEncoder();
    const passEncoder3 = commandEncoder3.beginComputePass();
    passEncoder3.setPipeline(computePipeline3);
    passEncoder3.setBindGroup(0, bindGroup);
    passEncoder3.dispatchWorkgroups(1, 1, 1);
    passEncoder3.end();
    device.queue.submit([commandEncoder3.finish()]);

    const commandEncoder4 = device.createCommandEncoder();
    const passEncoder4 = commandEncoder4.beginComputePass();
    passEncoder4.setPipeline(computePipeline4);
    passEncoder4.setBindGroup(0, bindGroup);
    passEncoder4.dispatchWorkgroups(1, 1, 1);
    passEncoder4.end();
    device.queue.submit([commandEncoder4.finish()]);

    const commandEncoder5 = device.createCommandEncoder();
    const passEncoder5 = commandEncoder5.beginComputePass();
    passEncoder5.setPipeline(computePipeline5);
    passEncoder5.setBindGroup(0, bindGroup);
    passEncoder5.dispatchWorkgroups(1, 1, 1);
    passEncoder5.end();
    device.queue.submit([commandEncoder5.finish()]);

    const commandEncoder6 = device.createCommandEncoder();
    const passEncoder6 = commandEncoder6.beginComputePass();
    passEncoder6.setPipeline(computePipeline6);
    passEncoder6.setBindGroup(0, bindGroup);
    passEncoder6.dispatchWorkgroups(1, 1, 1);
    passEncoder6.end();
    device.queue.submit([commandEncoder6.finish()]);

    const commandEncoder7 = device.createCommandEncoder();
    const passEncoder7 = commandEncoder7.beginComputePass();
    passEncoder7.setPipeline(computePipeline7);
    passEncoder7.setBindGroup(0, bindGroup);
    passEncoder7.dispatchWorkgroups(1, 1, 1);
    passEncoder7.end();
    device.queue.submit([commandEncoder7.finish()]);

    const commandEncoder8 = device.createCommandEncoder();
    const passEncoder8 = commandEncoder8.beginComputePass();
    passEncoder8.setPipeline(computePipeline8);
    passEncoder8.setBindGroup(0, bindGroup);
    passEncoder8.dispatchWorkgroups(1, 1, 1);
    passEncoder8.end();
    device.queue.submit([commandEncoder8.finish()]);

    const commandEncoder9 = device.createCommandEncoder();
    const passEncoder9 = commandEncoder9.beginComputePass();
    passEncoder9.setPipeline(computePipeline9);
    passEncoder9.setBindGroup(0, bindGroup);
    passEncoder9.dispatchWorkgroups(1, 1, 1);
    passEncoder9.end();
    device.queue.submit([commandEncoder9.finish()]);

    const commandEncoder10 = device.createCommandEncoder();
    const passEncoder10 = commandEncoder10.beginComputePass();
    passEncoder10.setPipeline(computePipeline10);
    passEncoder10.setBindGroup(0, bindGroup);
    passEncoder10.dispatchWorkgroups(1, 1, 1);
    passEncoder10.end();
    device.queue.submit([commandEncoder10.finish()]);

    const commandEncoder11 = device.createCommandEncoder();
    const passEncoder11 = commandEncoder11.beginComputePass();
    passEncoder11.setPipeline(computePipeline11);
    passEncoder11.setBindGroup(0, bindGroup);
    passEncoder11.dispatchWorkgroups(1, 1, 1);
    passEncoder11.end();
    device.queue.submit([commandEncoder11.finish()]);

    // read the output data
    const READ_START =
      4 +
      HEADER_SIZE * 4 +
      HASH_SIZE * 4 +
      MANY_HASH_1_SIZE * 4 +
      MATRIX_SIZE_2D * 4;
    const READ_LENGTH = MATRIX_SIZE_2D * 4;
    const readBuffer = device.createBuffer({
      size: MATRIX_SIZE_2D * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      pow2Buffer,
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

    return readData;
  }

  async debugGetM3(): Promise<Uint32Array> {
    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();

    const module = device.createShaderModule({ code: wgslCode });

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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // this.pow3.set_nonce_from_header();
    // this.pow3.set_working_header();
    // this.pow3.hash_working_header();
    // this.pow3.fill_many_hash_1();
    // this.pow3.create_m1_from_many_hash_1();
    // this.pow3.create_m2_from_many_hash_1();
    // this.pow3.multiply_m1_times_m2_equals_m3();
    // this.pow3.multiply_m3_by_pi_to_get_m4();
    // this.pow3.convert_m4_to_bytes();
    // this.pow3.create_many_hash_2_from_m4_bytes();
    // this.pow3.create_final_hash_from_many_hash_2();
    const computePipeline1 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_nonce_from_header",
      },
    });
    const computePipeline2 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_working_header",
      },
    });
    const computePipeline3 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "hash_working_header",
      },
    });
    const computePipeline4 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "fill_many_hash_1",
      },
    });
    const computePipeline5 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m1_from_many_hash_1",
      },
    });
    const computePipeline6 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m2_from_many_hash_1",
      },
    });
    const computePipeline7 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m1_times_m2_equals_m3",
      },
    });
    const computePipeline8 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m3_by_pi_to_get_m4",
      },
    });
    const computePipeline9 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "convert_m4_to_bytes",
      },
    });
    const computePipeline10 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_many_hash_2_from_m4_bytes",
      },
    });
    const computePipeline11 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_final_hash_from_many_hash_2",
      },
    });

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
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
        M4_BYTES_SIZE * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

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

    // now run all three compute pipelines

    const commandEncoder1 = device.createCommandEncoder();
    const passEncoder1 = commandEncoder1.beginComputePass();
    passEncoder1.setPipeline(computePipeline1);
    passEncoder1.setBindGroup(0, bindGroup);
    passEncoder1.dispatchWorkgroups(1, 1, 1);
    passEncoder1.end();
    device.queue.submit([commandEncoder1.finish()]);

    const commandEncoder2 = device.createCommandEncoder();
    const passEncoder2 = commandEncoder2.beginComputePass();
    passEncoder2.setPipeline(computePipeline2);
    passEncoder2.setBindGroup(0, bindGroup);
    passEncoder2.dispatchWorkgroups(1, 1, 1);
    passEncoder2.end();
    device.queue.submit([commandEncoder2.finish()]);

    const commandEncoder3 = device.createCommandEncoder();
    const passEncoder3 = commandEncoder3.beginComputePass();
    passEncoder3.setPipeline(computePipeline3);
    passEncoder3.setBindGroup(0, bindGroup);
    passEncoder3.dispatchWorkgroups(1, 1, 1);
    passEncoder3.end();
    device.queue.submit([commandEncoder3.finish()]);

    const commandEncoder4 = device.createCommandEncoder();
    const passEncoder4 = commandEncoder4.beginComputePass();
    passEncoder4.setPipeline(computePipeline4);
    passEncoder4.setBindGroup(0, bindGroup);
    passEncoder4.dispatchWorkgroups(1, 1, 1);
    passEncoder4.end();
    device.queue.submit([commandEncoder4.finish()]);

    const commandEncoder5 = device.createCommandEncoder();
    const passEncoder5 = commandEncoder5.beginComputePass();
    passEncoder5.setPipeline(computePipeline5);
    passEncoder5.setBindGroup(0, bindGroup);
    passEncoder5.dispatchWorkgroups(1, 1, 1);
    passEncoder5.end();
    device.queue.submit([commandEncoder5.finish()]);

    const commandEncoder6 = device.createCommandEncoder();
    const passEncoder6 = commandEncoder6.beginComputePass();
    passEncoder6.setPipeline(computePipeline6);
    passEncoder6.setBindGroup(0, bindGroup);
    passEncoder6.dispatchWorkgroups(1, 1, 1);
    passEncoder6.end();
    device.queue.submit([commandEncoder6.finish()]);

    const commandEncoder7 = device.createCommandEncoder();
    const passEncoder7 = commandEncoder7.beginComputePass();
    passEncoder7.setPipeline(computePipeline7);
    passEncoder7.setBindGroup(0, bindGroup);
    passEncoder7.dispatchWorkgroups(1, 1, 1);
    passEncoder7.end();
    device.queue.submit([commandEncoder7.finish()]);

    const commandEncoder8 = device.createCommandEncoder();
    const passEncoder8 = commandEncoder8.beginComputePass();
    passEncoder8.setPipeline(computePipeline8);
    passEncoder8.setBindGroup(0, bindGroup);
    passEncoder8.dispatchWorkgroups(1, 1, 1);
    passEncoder8.end();
    device.queue.submit([commandEncoder8.finish()]);

    const commandEncoder9 = device.createCommandEncoder();
    const passEncoder9 = commandEncoder9.beginComputePass();
    passEncoder9.setPipeline(computePipeline9);
    passEncoder9.setBindGroup(0, bindGroup);
    passEncoder9.dispatchWorkgroups(1, 1, 1);
    passEncoder9.end();
    device.queue.submit([commandEncoder9.finish()]);

    const commandEncoder10 = device.createCommandEncoder();
    const passEncoder10 = commandEncoder10.beginComputePass();
    passEncoder10.setPipeline(computePipeline10);
    passEncoder10.setBindGroup(0, bindGroup);
    passEncoder10.dispatchWorkgroups(1, 1, 1);
    passEncoder10.end();
    device.queue.submit([commandEncoder10.finish()]);

    const commandEncoder11 = device.createCommandEncoder();
    const passEncoder11 = commandEncoder11.beginComputePass();
    passEncoder11.setPipeline(computePipeline11);
    passEncoder11.setBindGroup(0, bindGroup);
    passEncoder11.dispatchWorkgroups(1, 1, 1);
    passEncoder11.end();
    device.queue.submit([commandEncoder11.finish()]);

    // read the output data
    // in this case, we are reading the final hash only
    const READ_START =
      4 +
      HEADER_SIZE * 4 +
      HASH_SIZE * 4 +
      MANY_HASH_1_SIZE * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4;
    const READ_LENGTH = MATRIX_SIZE_2D * 4;
    const readBuffer = device.createBuffer({
      size: MATRIX_SIZE_2D * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      pow2Buffer,
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

    return readData;
  }

  async debugGetM4(): Promise<Float32Array> {
    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();

    const module = device.createShaderModule({ code: wgslCode });

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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // this.pow3.set_nonce_from_header();
    // this.pow3.set_working_header();
    // this.pow3.hash_working_header();
    // this.pow3.fill_many_hash_1();
    // this.pow3.create_m1_from_many_hash_1();
    // this.pow3.create_m2_from_many_hash_1();
    // this.pow3.multiply_m1_times_m2_equals_m3();
    // this.pow3.multiply_m3_by_pi_to_get_m4();
    // this.pow3.convert_m4_to_bytes();
    // this.pow3.create_many_hash_2_from_m4_bytes();
    // this.pow3.create_final_hash_from_many_hash_2();
    const computePipeline1 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_nonce_from_header",
      },
    });
    const computePipeline2 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_working_header",
      },
    });
    const computePipeline3 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "hash_working_header",
      },
    });
    const computePipeline4 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "fill_many_hash_1",
      },
    });
    const computePipeline5 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m1_from_many_hash_1",
      },
    });
    const computePipeline6 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m2_from_many_hash_1",
      },
    });
    const computePipeline7 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m1_times_m2_equals_m3",
      },
    });
    const computePipeline8 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m3_by_pi_to_get_m4",
      },
    });
    const computePipeline9 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "convert_m4_to_bytes",
      },
    });
    const computePipeline10 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_many_hash_2_from_m4_bytes",
      },
    });
    const computePipeline11 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_final_hash_from_many_hash_2",
      },
    });

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
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
        M4_BYTES_SIZE * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

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

    // now run all three compute pipelines

    const commandEncoder1 = device.createCommandEncoder();
    const passEncoder1 = commandEncoder1.beginComputePass();
    passEncoder1.setPipeline(computePipeline1);
    passEncoder1.setBindGroup(0, bindGroup);
    passEncoder1.dispatchWorkgroups(1, 1, 1);
    passEncoder1.end();
    device.queue.submit([commandEncoder1.finish()]);

    const commandEncoder2 = device.createCommandEncoder();
    const passEncoder2 = commandEncoder2.beginComputePass();
    passEncoder2.setPipeline(computePipeline2);
    passEncoder2.setBindGroup(0, bindGroup);
    passEncoder2.dispatchWorkgroups(1, 1, 1);
    passEncoder2.end();
    device.queue.submit([commandEncoder2.finish()]);

    const commandEncoder3 = device.createCommandEncoder();
    const passEncoder3 = commandEncoder3.beginComputePass();
    passEncoder3.setPipeline(computePipeline3);
    passEncoder3.setBindGroup(0, bindGroup);
    passEncoder3.dispatchWorkgroups(1, 1, 1);
    passEncoder3.end();
    device.queue.submit([commandEncoder3.finish()]);

    const commandEncoder4 = device.createCommandEncoder();
    const passEncoder4 = commandEncoder4.beginComputePass();
    passEncoder4.setPipeline(computePipeline4);
    passEncoder4.setBindGroup(0, bindGroup);
    passEncoder4.dispatchWorkgroups(1, 1, 1);
    passEncoder4.end();
    device.queue.submit([commandEncoder4.finish()]);

    const commandEncoder5 = device.createCommandEncoder();
    const passEncoder5 = commandEncoder5.beginComputePass();
    passEncoder5.setPipeline(computePipeline5);
    passEncoder5.setBindGroup(0, bindGroup);
    passEncoder5.dispatchWorkgroups(1, 1, 1);
    passEncoder5.end();
    device.queue.submit([commandEncoder5.finish()]);

    const commandEncoder6 = device.createCommandEncoder();
    const passEncoder6 = commandEncoder6.beginComputePass();
    passEncoder6.setPipeline(computePipeline6);
    passEncoder6.setBindGroup(0, bindGroup);
    passEncoder6.dispatchWorkgroups(1, 1, 1);
    passEncoder6.end();
    device.queue.submit([commandEncoder6.finish()]);

    const commandEncoder7 = device.createCommandEncoder();
    const passEncoder7 = commandEncoder7.beginComputePass();
    passEncoder7.setPipeline(computePipeline7);
    passEncoder7.setBindGroup(0, bindGroup);
    passEncoder7.dispatchWorkgroups(1, 1, 1);
    passEncoder7.end();
    device.queue.submit([commandEncoder7.finish()]);

    const commandEncoder8 = device.createCommandEncoder();
    const passEncoder8 = commandEncoder8.beginComputePass();
    passEncoder8.setPipeline(computePipeline8);
    passEncoder8.setBindGroup(0, bindGroup);
    passEncoder8.dispatchWorkgroups(1, 1, 1);
    passEncoder8.end();
    device.queue.submit([commandEncoder8.finish()]);

    const commandEncoder9 = device.createCommandEncoder();
    const passEncoder9 = commandEncoder9.beginComputePass();
    passEncoder9.setPipeline(computePipeline9);
    passEncoder9.setBindGroup(0, bindGroup);
    passEncoder9.dispatchWorkgroups(1, 1, 1);
    passEncoder9.end();
    device.queue.submit([commandEncoder9.finish()]);

    const commandEncoder10 = device.createCommandEncoder();
    const passEncoder10 = commandEncoder10.beginComputePass();
    passEncoder10.setPipeline(computePipeline10);
    passEncoder10.setBindGroup(0, bindGroup);
    passEncoder10.dispatchWorkgroups(1, 1, 1);
    passEncoder10.end();
    device.queue.submit([commandEncoder10.finish()]);

    const commandEncoder11 = device.createCommandEncoder();
    const passEncoder11 = commandEncoder11.beginComputePass();
    passEncoder11.setPipeline(computePipeline11);
    passEncoder11.setBindGroup(0, bindGroup);
    passEncoder11.dispatchWorkgroups(1, 1, 1);
    passEncoder11.end();
    device.queue.submit([commandEncoder11.finish()]);

    // read the output data
    const READ_START =
      4 +
      HEADER_SIZE * 4 +
      HASH_SIZE * 4 +
      MANY_HASH_1_SIZE * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4;
    const READ_LENGTH = MATRIX_SIZE_2D * 4;
    const readBuffer = device.createBuffer({
      size: MATRIX_SIZE_2D * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      pow2Buffer,
      READ_START,
      readBuffer,
      0,
      READ_LENGTH,
    );
    device.queue.submit([copyEncoder.finish()]);

    // wait for the GPU to finish, then read the data
    await readBuffer.mapAsync(GPUMapMode.READ);
    const readData = new Float32Array(readBuffer.getMappedRange().slice());
    readBuffer.unmap();

    return readData;
  }

  async debugGetM4Bytes(): Promise<WebBuf> {
    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();

    const module = device.createShaderModule({ code: wgslCode });

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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // this.pow3.set_nonce_from_header();
    // this.pow3.set_working_header();
    // this.pow3.hash_working_header();
    // this.pow3.fill_many_hash_1();
    // this.pow3.create_m1_from_many_hash_1();
    // this.pow3.create_m2_from_many_hash_1();
    // this.pow3.multiply_m1_times_m2_equals_m3();
    // this.pow3.multiply_m3_by_pi_to_get_m4();
    // this.pow3.convert_m4_to_bytes();
    // this.pow3.create_many_hash_2_from_m4_bytes();
    // this.pow3.create_final_hash_from_many_hash_2();
    const computePipeline1 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_nonce_from_header",
      },
    });
    const computePipeline2 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_working_header",
      },
    });
    const computePipeline3 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "hash_working_header",
      },
    });
    const computePipeline4 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "fill_many_hash_1",
      },
    });
    const computePipeline5 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m1_from_many_hash_1",
      },
    });
    const computePipeline6 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m2_from_many_hash_1",
      },
    });
    const computePipeline7 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m1_times_m2_equals_m3",
      },
    });
    const computePipeline8 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m3_by_pi_to_get_m4",
      },
    });
    const computePipeline9 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "convert_m4_to_bytes",
      },
    });
    const computePipeline10 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_many_hash_2_from_m4_bytes",
      },
    });
    const computePipeline11 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_final_hash_from_many_hash_2",
      },
    });

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
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
        M4_BYTES_SIZE * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

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

    // now run all three compute pipelines

    const commandEncoder1 = device.createCommandEncoder();
    const passEncoder1 = commandEncoder1.beginComputePass();
    passEncoder1.setPipeline(computePipeline1);
    passEncoder1.setBindGroup(0, bindGroup);
    passEncoder1.dispatchWorkgroups(1, 1, 1);
    passEncoder1.end();
    device.queue.submit([commandEncoder1.finish()]);

    const commandEncoder2 = device.createCommandEncoder();
    const passEncoder2 = commandEncoder2.beginComputePass();
    passEncoder2.setPipeline(computePipeline2);
    passEncoder2.setBindGroup(0, bindGroup);
    passEncoder2.dispatchWorkgroups(1, 1, 1);
    passEncoder2.end();
    device.queue.submit([commandEncoder2.finish()]);

    const commandEncoder3 = device.createCommandEncoder();
    const passEncoder3 = commandEncoder3.beginComputePass();
    passEncoder3.setPipeline(computePipeline3);
    passEncoder3.setBindGroup(0, bindGroup);
    passEncoder3.dispatchWorkgroups(1, 1, 1);
    passEncoder3.end();
    device.queue.submit([commandEncoder3.finish()]);

    const commandEncoder4 = device.createCommandEncoder();
    const passEncoder4 = commandEncoder4.beginComputePass();
    passEncoder4.setPipeline(computePipeline4);
    passEncoder4.setBindGroup(0, bindGroup);
    passEncoder4.dispatchWorkgroups(1, 1, 1);
    passEncoder4.end();
    device.queue.submit([commandEncoder4.finish()]);

    const commandEncoder5 = device.createCommandEncoder();
    const passEncoder5 = commandEncoder5.beginComputePass();
    passEncoder5.setPipeline(computePipeline5);
    passEncoder5.setBindGroup(0, bindGroup);
    passEncoder5.dispatchWorkgroups(1, 1, 1);
    passEncoder5.end();
    device.queue.submit([commandEncoder5.finish()]);

    const commandEncoder6 = device.createCommandEncoder();
    const passEncoder6 = commandEncoder6.beginComputePass();
    passEncoder6.setPipeline(computePipeline6);
    passEncoder6.setBindGroup(0, bindGroup);
    passEncoder6.dispatchWorkgroups(1, 1, 1);
    passEncoder6.end();
    device.queue.submit([commandEncoder6.finish()]);

    const commandEncoder7 = device.createCommandEncoder();
    const passEncoder7 = commandEncoder7.beginComputePass();
    passEncoder7.setPipeline(computePipeline7);
    passEncoder7.setBindGroup(0, bindGroup);
    passEncoder7.dispatchWorkgroups(1, 1, 1);
    passEncoder7.end();
    device.queue.submit([commandEncoder7.finish()]);

    const commandEncoder8 = device.createCommandEncoder();
    const passEncoder8 = commandEncoder8.beginComputePass();
    passEncoder8.setPipeline(computePipeline8);
    passEncoder8.setBindGroup(0, bindGroup);
    passEncoder8.dispatchWorkgroups(1, 1, 1);
    passEncoder8.end();
    device.queue.submit([commandEncoder8.finish()]);

    const commandEncoder9 = device.createCommandEncoder();
    const passEncoder9 = commandEncoder9.beginComputePass();
    passEncoder9.setPipeline(computePipeline9);
    passEncoder9.setBindGroup(0, bindGroup);
    passEncoder9.dispatchWorkgroups(1, 1, 1);
    passEncoder9.end();
    device.queue.submit([commandEncoder9.finish()]);

    const commandEncoder10 = device.createCommandEncoder();
    const passEncoder10 = commandEncoder10.beginComputePass();
    passEncoder10.setPipeline(computePipeline10);
    passEncoder10.setBindGroup(0, bindGroup);
    passEncoder10.dispatchWorkgroups(1, 1, 1);
    passEncoder10.end();
    device.queue.submit([commandEncoder10.finish()]);

    const commandEncoder11 = device.createCommandEncoder();
    const passEncoder11 = commandEncoder11.beginComputePass();
    passEncoder11.setPipeline(computePipeline11);
    passEncoder11.setBindGroup(0, bindGroup);
    passEncoder11.dispatchWorkgroups(1, 1, 1);
    passEncoder11.end();
    device.queue.submit([commandEncoder11.finish()]);

    // read the output data
    // in this case, we are reading the final hash only
    const READ_START =
      4 +
      HEADER_SIZE * 4 +
      HASH_SIZE * 4 +
      MANY_HASH_1_SIZE * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4;
    const READ_LENGTH = M4_BYTES_SIZE * 4;
    const readBuffer = device.createBuffer({
      size: M4_BYTES_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      pow2Buffer,
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

    // m4 bytes data is all bytes, so we can copy directly into a Uint8Array
    const dataUint8Array = new Uint8Array(readData);
    const dataWebBuf = WebBuf.fromUint8Array(dataUint8Array);
    return dataWebBuf;
  }

  async debugGetFinalHash(): Promise<FixedBuf<32>> {
    const headerUint8Array = this.header.buf;
    const headerUint32Array = new Uint32Array(headerUint8Array);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter found");
    }
    const device = await adapter.requestDevice();

    const module = device.createShaderModule({ code: wgslCode });

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

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // this.pow3.set_nonce_from_header();
    // this.pow3.set_working_header();
    // this.pow3.hash_working_header();
    // this.pow3.fill_many_hash_1();
    // this.pow3.create_m1_from_many_hash_1();
    // this.pow3.create_m2_from_many_hash_1();
    // this.pow3.multiply_m1_times_m2_equals_m3();
    // this.pow3.multiply_m3_by_pi_to_get_m4();
    // this.pow3.convert_m4_to_bytes();
    // this.pow3.create_many_hash_2_from_m4_bytes();
    // this.pow3.create_final_hash_from_many_hash_2();
    const computePipeline1 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_nonce_from_header",
      },
    });
    const computePipeline2 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "set_working_header",
      },
    });
    const computePipeline3 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "hash_working_header",
      },
    });
    const computePipeline4 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "fill_many_hash_1",
      },
    });
    const computePipeline5 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m1_from_many_hash_1",
      },
    });
    const computePipeline6 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_m2_from_many_hash_1",
      },
    });
    const computePipeline7 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m1_times_m2_equals_m3",
      },
    });
    const computePipeline8 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "multiply_m3_by_pi_to_get_m4",
      },
    });
    const computePipeline9 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "convert_m4_to_bytes",
      },
    });
    const computePipeline10 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_many_hash_2_from_m4_bytes",
      },
    });
    const computePipeline11 = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module,
        entryPoint: "create_final_hash_from_many_hash_2",
      },
    });

    const headerBuffer = device.createBuffer({
      size: HEADER_SIZE * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
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
        M4_BYTES_SIZE * 4 +
        MANY_HASH_2_SIZE * 4 +
        FINAL_HASH_SIZE * 4 +
        4 +
        4,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

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

    // now run all three compute pipelines

    const commandEncoder1 = device.createCommandEncoder();
    const passEncoder1 = commandEncoder1.beginComputePass();
    passEncoder1.setPipeline(computePipeline1);
    passEncoder1.setBindGroup(0, bindGroup);
    passEncoder1.dispatchWorkgroups(1, 1, 1);
    passEncoder1.end();
    device.queue.submit([commandEncoder1.finish()]);

    const commandEncoder2 = device.createCommandEncoder();
    const passEncoder2 = commandEncoder2.beginComputePass();
    passEncoder2.setPipeline(computePipeline2);
    passEncoder2.setBindGroup(0, bindGroup);
    passEncoder2.dispatchWorkgroups(1, 1, 1);
    passEncoder2.end();
    device.queue.submit([commandEncoder2.finish()]);

    const commandEncoder3 = device.createCommandEncoder();
    const passEncoder3 = commandEncoder3.beginComputePass();
    passEncoder3.setPipeline(computePipeline3);
    passEncoder3.setBindGroup(0, bindGroup);
    passEncoder3.dispatchWorkgroups(1, 1, 1);
    passEncoder3.end();
    device.queue.submit([commandEncoder3.finish()]);

    const commandEncoder4 = device.createCommandEncoder();
    const passEncoder4 = commandEncoder4.beginComputePass();
    passEncoder4.setPipeline(computePipeline4);
    passEncoder4.setBindGroup(0, bindGroup);
    passEncoder4.dispatchWorkgroups(1, 1, 1);
    passEncoder4.end();
    device.queue.submit([commandEncoder4.finish()]);

    const commandEncoder5 = device.createCommandEncoder();
    const passEncoder5 = commandEncoder5.beginComputePass();
    passEncoder5.setPipeline(computePipeline5);
    passEncoder5.setBindGroup(0, bindGroup);
    passEncoder5.dispatchWorkgroups(1, 1, 1);
    passEncoder5.end();
    device.queue.submit([commandEncoder5.finish()]);

    const commandEncoder6 = device.createCommandEncoder();
    const passEncoder6 = commandEncoder6.beginComputePass();
    passEncoder6.setPipeline(computePipeline6);
    passEncoder6.setBindGroup(0, bindGroup);
    passEncoder6.dispatchWorkgroups(1, 1, 1);
    passEncoder6.end();
    device.queue.submit([commandEncoder6.finish()]);

    const commandEncoder7 = device.createCommandEncoder();
    const passEncoder7 = commandEncoder7.beginComputePass();
    passEncoder7.setPipeline(computePipeline7);
    passEncoder7.setBindGroup(0, bindGroup);
    passEncoder7.dispatchWorkgroups(1, 1, 1);
    passEncoder7.end();
    device.queue.submit([commandEncoder7.finish()]);

    const commandEncoder8 = device.createCommandEncoder();
    const passEncoder8 = commandEncoder8.beginComputePass();
    passEncoder8.setPipeline(computePipeline8);
    passEncoder8.setBindGroup(0, bindGroup);
    passEncoder8.dispatchWorkgroups(1, 1, 1);
    passEncoder8.end();
    device.queue.submit([commandEncoder8.finish()]);

    const commandEncoder9 = device.createCommandEncoder();
    const passEncoder9 = commandEncoder9.beginComputePass();
    passEncoder9.setPipeline(computePipeline9);
    passEncoder9.setBindGroup(0, bindGroup);
    passEncoder9.dispatchWorkgroups(1, 1, 1);
    passEncoder9.end();
    device.queue.submit([commandEncoder9.finish()]);

    const commandEncoder10 = device.createCommandEncoder();
    const passEncoder10 = commandEncoder10.beginComputePass();
    passEncoder10.setPipeline(computePipeline10);
    passEncoder10.setBindGroup(0, bindGroup);
    passEncoder10.dispatchWorkgroups(1, 1, 1);
    passEncoder10.end();
    device.queue.submit([commandEncoder10.finish()]);

    const commandEncoder11 = device.createCommandEncoder();
    const passEncoder11 = commandEncoder11.beginComputePass();
    passEncoder11.setPipeline(computePipeline11);
    passEncoder11.setBindGroup(0, bindGroup);
    passEncoder11.dispatchWorkgroups(1, 1, 1);
    passEncoder11.end();
    device.queue.submit([commandEncoder11.finish()]);

    // read the output data
    // in this case, we are reading the final hash only
    const READ_START =
      4 +
      HEADER_SIZE * 4 +
      HASH_SIZE * 4 +
      MANY_HASH_1_SIZE * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      MATRIX_SIZE_2D * 4 +
      M4_BYTES_SIZE * 4 +
      MANY_HASH_2_SIZE * 4;
    const READ_LENGTH = FINAL_HASH_SIZE * 4;
    const readBuffer = device.createBuffer({
      size: 32 * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
      pow2Buffer,
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

    // hash data is all bytes, so we can copy directly into a Uint8Array
    const dataUint8Array = new Uint8Array(readData);
    const dataFixedBuf = FixedBuf.fromBuf(
      32,
      WebBuf.fromUint8Array(dataUint8Array),
    );
    return dataFixedBuf;
  }
}
