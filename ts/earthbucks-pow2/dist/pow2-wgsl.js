import wgslCode from "./pow2.wgsl?raw";
import { WebBuf, FixedBuf } from "@earthbucks/lib";
const HEADER_SIZE = 217;
const HEADER_BUFFER_SIZE = 217 * 4;
// const NONCE_START = 117;
// const NONCE_END = 121;
const MATRIX_INPUT_DATA_SIZE = 2048;
const MATRIX_DATA_BUFFER_SIZE = 2048 * 4;
const MATRIX_1D_SIZE = 128;
const MATRIX_2D_SIZE = 16384; // 128 * 128
const MATRIX_2D_BUFFER_SIZE = 16384 * 4;
const MATRIX_2D_SIZE_BYTES = 65536; // 128 * 128 * 4
const MATRIX_2D_SIZE_BYTES_BUFFER_SIZE = 65536 * 4;
const HASH_SIZE = 32;
const HASH_BUFFER_SIZE = 32 * 4;
export class Pow2 {
    header;
    constructor(header) {
        this.header = header;
    }
    async debugGetFinalMatrixDataHash() {
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
                entryPoint: "create_working_header",
            },
        });
        const computePipeline2 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "create_matrix_data_from_hashes",
            },
        });
        const headerBuffer = device.createBuffer({
            size: HEADER_BUFFER_SIZE,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
        });
        const pow2Buffer = device.createBuffer({
            size: 4 +
                HEADER_BUFFER_SIZE +
                MATRIX_DATA_BUFFER_SIZE +
                MATRIX_2D_BUFFER_SIZE * 4 +
                MATRIX_2D_SIZE_BYTES_BUFFER_SIZE +
                HASH_BUFFER_SIZE +
                4 +
                4,
            usage: GPUBufferUsage.COPY_DST |
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
        // now run both compute pipelines
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
        // read the output data
        const READ_START = 4 + HEADER_BUFFER_SIZE + MATRIX_DATA_BUFFER_SIZE - HASH_SIZE * 4;
        const READ_LENGTH = HASH_SIZE * 4;
        const readBuffer = device.createBuffer({
            size: 32 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        const copyEncoder = device.createCommandEncoder();
        copyEncoder.copyBufferToBuffer(pow2Buffer, READ_START, readBuffer, 0, READ_LENGTH);
        device.queue.submit([copyEncoder.finish()]);
        // wait for the GPU to finish, then read the data
        await readBuffer.mapAsync(GPUMapMode.READ);
        const readData = new Uint32Array(readBuffer.getMappedRange().slice());
        readBuffer.unmap();
        // matrix data is all bytes, so we can copy directly into a uint8array
        const matrixDataBytes = new Uint8Array(readData);
        const final32bytes = matrixDataBytes.slice(matrixDataBytes.length - 32);
        const matrixDataFixedBuf = FixedBuf.fromBuf(32, WebBuf.fromUint8Array(final32bytes));
        return matrixDataFixedBuf;
    }
    async debugGetM4Hash() {
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
        const computePipeline0 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "set_nonce_from_header"
            },
        });
        const computePipeline1 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "create_working_header",
            },
        });
        const computePipeline2 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "create_matrix_data_from_hashes",
            },
        });
        const computePipeline3 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "create_m1_from_matrix_data",
            },
        });
        const computePipeline4 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "create_m2_from_matrix_data",
            },
        });
        const computePipeline5 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "multiply_m1_times_m2_equals_m3",
            },
        });
        const computePipeline6 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "multiply_m3_by_pi_to_get_m4",
            },
        });
        const computePipeline7 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "convert_m4_to_bytes",
            },
        });
        const computePipeline8 = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: "hash_m4",
            },
        });
        const headerBuffer = device.createBuffer({
            size: HEADER_BUFFER_SIZE,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
        });
        const pow2Buffer = device.createBuffer({
            size: 4 +
                HEADER_BUFFER_SIZE +
                MATRIX_DATA_BUFFER_SIZE +
                MATRIX_2D_BUFFER_SIZE * 4 +
                MATRIX_2D_SIZE_BYTES_BUFFER_SIZE +
                HASH_BUFFER_SIZE +
                4 +
                4,
            usage: GPUBufferUsage.COPY_DST |
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
        // now run all compute pipelines
        const commandEncoder0 = device.createCommandEncoder();
        const passEncoder0 = commandEncoder0.beginComputePass();
        passEncoder0.setPipeline(computePipeline0);
        passEncoder0.setBindGroup(0, bindGroup);
        passEncoder0.dispatchWorkgroups(1, 1, 1);
        passEncoder0.end();
        device.queue.submit([commandEncoder0.finish()]);
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
        // matrix multiply is workgroup size 8x8 with 16x16 workgroups
        passEncoder5.dispatchWorkgroups(16, 16, 1);
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
        // read the output data
        const READ_START = 4 +
            HEADER_BUFFER_SIZE +
            MATRIX_DATA_BUFFER_SIZE +
            MATRIX_2D_BUFFER_SIZE * 4 +
            MATRIX_2D_SIZE_BYTES_BUFFER_SIZE;
        const READ_LENGTH = HASH_SIZE * 4;
        const readBuffer = device.createBuffer({
            size: 32 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        const copyEncoder = device.createCommandEncoder();
        copyEncoder.copyBufferToBuffer(pow2Buffer, READ_START, readBuffer, 0, READ_LENGTH);
        device.queue.submit([copyEncoder.finish()]);
        // wait for the GPU to finish, then read the data
        await readBuffer.mapAsync(GPUMapMode.READ);
        const readData = new Uint32Array(readBuffer.getMappedRange().slice());
        readBuffer.unmap();
        // matrix data is all bytes, so we can copy directly into a uint8array
        const matrixDataBytes = new Uint8Array(readData);
        const final32bytes = matrixDataBytes.slice(matrixDataBytes.length - 32);
        const matrixDataFixedBuf = FixedBuf.fromBuf(32, WebBuf.fromUint8Array(final32bytes));
        return matrixDataFixedBuf;
    }
}
