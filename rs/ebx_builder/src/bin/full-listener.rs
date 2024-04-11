use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use ebx_lib::key::Key;
use hex;

async fn generate_key() -> impl Responder {
    let key = Key::from_random();
    let priv_key = key.private_key;
    let priv_key_hex = hex::encode(priv_key);
    HttpResponse::Ok().body(format!("Private key: {}", priv_key_hex))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().route("/key", web::get().to(generate_key))
    })
    .bind("127.0.0.1:3000")?
    .run()
    .await
}