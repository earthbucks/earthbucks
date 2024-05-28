use byteorder::{BigEndian, WriteBytesExt};

// add Default
#[derive(Default)]
pub struct IsoBufWriter {
    pub bufs: Vec<Vec<u8>>,
}

impl IsoBufWriter {
    pub fn new() -> IsoBufWriter {
        IsoBufWriter { bufs: Vec::new() }
    }

    pub fn with_buffers(buffers: Vec<Vec<u8>>) -> IsoBufWriter {
        IsoBufWriter { bufs: buffers }
    }

    pub fn get_length(&self) -> usize {
        self.bufs.iter().map(|buf| buf.len()).sum()
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        let mut result = Vec::new();
        for buf in &self.bufs {
            result.extend(buf);
        }
        result
    }

    pub fn write_iso_buf(&mut self, buf: Vec<u8>) {
        self.bufs.push(buf);
    }

    pub fn write_reverse(&mut self, buf: Vec<u8>) {
        let mut buf2 = vec![0; buf.len()];
        for (i, &item) in buf.iter().rev().enumerate() {
            buf2[i] = item;
        }
        self.bufs.push(buf2);
    }

    pub fn write_u8(&mut self, n: u8) {
        self.bufs.push(vec![n]);
    }

    pub fn write_u16_be(&mut self, n: u16) {
        let mut buf = vec![0; 2];
        buf.as_mut_slice().write_u16::<BigEndian>(n).unwrap();
        self.bufs.push(buf);
    }

    pub fn write_u32_be(&mut self, n: u32) {
        let mut buf = vec![0; 4];
        buf.as_mut_slice().write_u32::<BigEndian>(n).unwrap();
        self.bufs.push(buf);
    }

    pub fn write_u64_be(&mut self, n: u64) {
        let mut buf = vec![0; 8];
        buf.as_mut_slice().write_u64::<BigEndian>(n).unwrap();
        self.bufs.push(buf);
    }

    pub fn var_int_buf(n: u64) -> Vec<u8> {
        let mut buf = vec![];
        if n < 253 {
            buf.push(n as u8);
        } else if n < 0x10000 {
            buf.push(253);
            buf.write_u16::<BigEndian>(n as u16).unwrap();
        } else if n < 0x100000000 {
            buf.push(254);
            buf.write_u32::<BigEndian>(n as u32).unwrap();
        } else {
            buf.push(255);
            buf.write_u64::<BigEndian>(n).unwrap();
        }
        buf
    }

    pub fn write_var_int(&mut self, n: u64) -> &mut Self {
        let buf = IsoBufWriter::var_int_buf(n);
        self.write_iso_buf(buf);
        self
    }
}
