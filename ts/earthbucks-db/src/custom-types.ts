// Drizzle does not support MySQL BLOB types by default, so we have to define
// our own custom types

import { customType } from "drizzle-orm/mysql-core";
import { Buffer } from "buffer";

export const customTinyBlob = customType<{ data: Buffer }>({
  // up to 255 bytes
  dataType() {
    return "TINYBLOB";
  },
  toDriver(data) {
    return data;
  },
});

export const customBlob = customType<{ data: Buffer }>({
  // up to 64KB
  dataType() {
    return "BLOB";
  },
});

export const customMediumBlob = customType<{ data: Buffer }>({
  // up to 16MB
  dataType() {
    return "MEDIUMBLOB";
  },
});

export const customLongBlob = customType<{ data: Buffer }>({
  // up to 4GB
  dataType() {
    return "LONGBLOB";
  },
});

export const customBinary = customType<{ data: Buffer }>({
  dataType() {
    return "BINARY";
  },
});
