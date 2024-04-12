use actix_web::{web, App, HttpResponse, HttpServer, Responder};

async fn generate_key() -> impl Responder {
    HttpResponse::Ok().body(format!("Hello world."))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().route("/key", web::get().to(generate_key)))
        .bind("127.0.0.1:3000")?
        .run()
        .await
}
