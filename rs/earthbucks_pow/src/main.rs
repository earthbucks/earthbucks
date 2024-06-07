use tensorflow::ops;
use tensorflow::Graph;
use tensorflow::Scope;
use tensorflow::Session;
use tensorflow::SessionOptions;
use tensorflow::SessionRunArgs;
use tensorflow::Tensor;

fn main() {
    let graph = Graph::new();
    let session = Session::new(&SessionOptions::new(), &graph).unwrap();

    let mut root = Scope::new_root_scope();
    let a = ops::constant(Tensor::new(&[1]).with_values(&[1]).unwrap(), &mut root).unwrap();
    let b = ops::constant(Tensor::new(&[1]).with_values(&[2]).unwrap(), &mut root).unwrap();
    let c = ops::add(a, b, &mut root).unwrap();

    let mut args = SessionRunArgs::new();
    // Request a fetch for the output of the add operation
    let token = args.request_fetch(&c, 0);
    session.run(&mut args).unwrap();
    let result_tensor: Tensor<i32> = args.fetch(token).unwrap();
    println!("{:?}", result_tensor.to_vec()[0]);
}