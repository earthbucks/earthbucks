use std::env;
use tensorflow::ops;
// use tensorflow::Graph;
use tensorflow::Scope;
use tensorflow::Session;
use tensorflow::SessionOptions;
use tensorflow::SessionRunArgs;
use tensorflow::Tensor;

// our goal is to write a test program using rust tensorflow
// it is very simple: we want to add two numbers together
fn add() {
    // first, we need to create a scope
    let scope = &mut Scope::new_root_scope();

    // now we need to create two constants
    let a = ops::constant(3.0f32, scope).unwrap();
    let b = ops::constant(4.0f32, scope).unwrap();

    // now we need to add the two constants together
    let c = ops::add(a, b, scope).unwrap();

    // now we need to create a session
    let graph = scope.graph();
    let session = Session::new(&SessionOptions::new(), &graph).unwrap();

    // now we need to run the session
    let mut args = SessionRunArgs::new();

    // Request a fetch for the output of the add operation
    let token = args.request_fetch(&c, 0);

    // now we need to run the session
    session.run(&mut args).unwrap();

    // now we need to get the result
    let result: Tensor<f32> = args.fetch(token).unwrap();

    // now we need to print the result
    println!("result: {}", result[0]);
}

// our goal is to write a test program using rust tensorflow
// it is very simple: we want to add two numbers together
fn mul() {
    // first, we need to create a scope
    let scope = &mut Scope::new_root_scope();

    // now we need to create two constants
    let a = ops::constant(3.0f32, scope).unwrap();
    let b = ops::constant(4.0f32, scope).unwrap();

    // now we need to add the two constants together
    let c = ops::mul(a, b, scope).unwrap();

    // now we need to create a session
    let graph = scope.graph();
    let session = Session::new(&SessionOptions::new(), &graph).unwrap();

    // now we need to run the session
    let mut args = SessionRunArgs::new();

    // Request a fetch for the output of the add operation
    let token = args.request_fetch(&c, 0);

    // now we need to run the session
    session.run(&mut args).unwrap();

    // now we need to get the result
    let result: Tensor<f32> = args.fetch(token).unwrap();

    // now we need to print the result
    println!("result: {}", result[0]);
}

// our goal is to write a test program using rust tensorflow
// it is very simple: we want to add two matrices together
fn mat_add() {
    // first, we need to create a scope
    let scope = &mut Scope::new_root_scope();

    // Create two 2x2 matrices
    let a_values = &[3.0f32, 4.0f32, 5.0f32, 6.0f32];
    let a = ops::constant(Tensor::new(&[2, 2]).with_values(a_values).unwrap(), scope).unwrap();

    let b_values = &[7.0f32, 8.0f32, 9.0f32, 10.0f32];
    let b = ops::constant(Tensor::new(&[2, 2]).with_values(b_values).unwrap(), scope).unwrap();

    // now we need to add the two constants together
    let c = ops::add(a, b, scope).unwrap();

    // now we need to create a session
    let graph = scope.graph();
    let session = Session::new(&SessionOptions::new(), &graph).unwrap();

    // now we need to run the session
    let mut args = SessionRunArgs::new();

    // Request a fetch for the output of the add operation
    let token = args.request_fetch(&c, 0);

    // now we need to run the session
    session.run(&mut args).unwrap();

    // now we need to get the result
    let result: Tensor<f32> = args.fetch(token).unwrap();

    // now we need to print the result
    println!("result: {:?}", result);
}

// our goal is to write a test program using rust tensorflow
// it is very simple: we want to multiply two matrices together
fn mat_mul() {
    // first, we need to create a scope
    let scope = &mut Scope::new_root_scope();

    // Create two 2x2 matrices
    let a_values = &[3.0f32, 4.0f32, 5.0f32, 6.0f32];
    let a = ops::constant(Tensor::new(&[2, 2]).with_values(a_values).unwrap(), scope).unwrap();

    let b_values = &[7.0f32, 8.0f32, 9.0f32, 10.0f32];
    let b = ops::constant(Tensor::new(&[2, 2]).with_values(b_values).unwrap(), scope).unwrap();

    // now we need to add the two constants together
    let c = ops::mat_mul(a, b, scope).unwrap();

    // now we need to create a session
    let graph = scope.graph();
    let session = Session::new(&SessionOptions::new(), &graph).unwrap();

    // now we need to run the session
    let mut args = SessionRunArgs::new();

    // Request a fetch for the output of the add operation
    let token = args.request_fetch(&c, 0);

    // now we need to run the session
    session.run(&mut args).unwrap();

    // now we need to get the result
    let result: Tensor<f32> = args.fetch(token).unwrap();

    // now we need to print the result
    println!("result: {:?}", result);
}

// unfinished test implmentation of algo17
fn algo17() {
    let n: i32 = 17;
    let scope = &mut Scope::new_root_scope();
    let hex = "80".to_string().repeat(32);
    let buf = &hex::decode(hex).unwrap();

    // tensor_from_buffer_bits
    // create a tensor by extracting every bit from the buffer into a new int32
    // value in a tensor. the new tensor has a bunch of int32 values that are
    // all either 0 or 1.
    let mut bits: Vec<i32> = Vec::new();
    for byte in buf {
        let byte = *byte as i32;
        for i in (0..8).rev() {
            bits.push((byte >> i) & 1);
        }
    }
    let tensor: Tensor<i32> = Tensor::new(&[bits.len() as u64])
        .with_values(&bits)
        .unwrap();
    let tensor_len = tensor.len() as i32;

    // println!("{}", tensor.len())

    let seed = ops::constant(tensor, scope).unwrap();
    // let seed_length = ops::constant(tensor.len() as u32, scope).unwrap();
    let n_replica = (n * n + tensor_len - 1) / tensor_len;
    let n_replica_op = ops::constant([n_replica], scope).unwrap();
    let seed_replica = ops::tile(seed, n_replica_op, scope).unwrap();
    let zero_op = ops::constant([0], scope).unwrap();
    let n_n_op = ops::constant([n * n], scope).unwrap();
    let seed_replica = ops::slice(seed_replica, zero_op, n_n_op, scope).unwrap();
    let matrix_shape_op = ops::constant([n as i64, n as i64], scope).unwrap();
    let matrix = ops::reshape(seed_replica, matrix_shape_op, scope).unwrap();
    let matrix = ops::mat_mul(matrix.clone(), matrix, scope).unwrap();
    // TODO: Fill in the rest of the operations
    let axis_op = ops::constant(1, scope).unwrap();
    let reduce_sum = ops::sum(matrix, axis_op, scope).unwrap();

    let graph = scope.graph();
    let session = Session::new(&SessionOptions::new(), &graph).unwrap();

    let mut args = SessionRunArgs::new();

    let token = args.request_fetch(&reduce_sum, 0);

    session.run(&mut args).unwrap();

    let result: Tensor<i32> = args.fetch(token).unwrap();

    println!("result: {:?}", result);
}

fn main() {
    // Get the command-line arguments
    let args: Vec<String> = env::args().collect();

    // Check if an argument was provided
    if args.len() > 1 {
        match args[1].as_str() {
            "add" => add(),
            "mul" => mul(),
            "mat_add" => mat_add(),
            "mat_mul" => mat_mul(),
            "algo17" => algo17(),
            _ => println!("Unknown command"),
        }
    } else {
        println!("Please provide a command");
    }
}
