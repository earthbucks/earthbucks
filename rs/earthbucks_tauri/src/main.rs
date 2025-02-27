// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rand::{distr::Alphanumeric, Rng};
use tauri::menu::{
    AboutMetadata, MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder,
};
use tauri::{AppHandle, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
fn new_window(app: AppHandle) -> tauri::Result<()> {
    let label: String = rand::rng()
        .sample_iter(&Alphanumeric)
        .take(8)
        .map(char::from)
        .collect();
    let window_label = format!("win-{}", label);

    WebviewWindowBuilder::new(&app, window_label, WebviewUrl::App("index.html".into()))
        .title("EarthBucks")
        .inner_size(800.0, 600.0)
        .build()?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let new_window_item = MenuItemBuilder::new("New Window")
                .id("new_window")
                .accelerator("CmdOrCtrl+N")
                .build(app)?;

            // Edit menu for both platforms
            let edit_menu = SubmenuBuilder::new(app, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .separator()
                .select_all()
                .build()?;

            // Window menu for both platforms
            let window_menu = SubmenuBuilder::new(app, "Window")
                .minimize()
                .separator()
                .build()?;

            let menu = {
                let macos_menu = SubmenuBuilder::new(app, "App")
                    .item(&PredefinedMenuItem::about(
                        app,
                        Some("About EarthBucks"),
                        Some(AboutMetadata::default()),
                    )?)
                    .separator()
                    .services()
                    .separator()
                    .item(&PredefinedMenuItem::hide(app, Some("Hide EarthBucks"))?)
                    .hide_others()
                    .item(&PredefinedMenuItem::quit(app, Some("Quit EarthBucks"))?)
                    .build()?;
                let file_menu = SubmenuBuilder::new(app, "File")
                    .item(&new_window_item)
                    .close_window()
                    .separator()
                    .item(&PredefinedMenuItem::quit(app, Some("Quit EarthBucks"))?)
                    .build()?;

                #[cfg(target_os = "macos")]
                let menu = MenuBuilder::new(app)
                    .items(&[&macos_menu, &file_menu, &edit_menu, &window_menu])
                    .build()?;

                #[cfg(not(target_os = "macos"))]
                let menu = MenuBuilder::new(app)
                    .items(&[&file_menu2, &edit_menu, &window_menu])
                    .build()?;

                menu
            };

            app.set_menu(menu)?;

            app.on_menu_event(move |app, event| {
                if event.id() == "new_window" {
                    new_window(app.clone()).unwrap();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![new_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
