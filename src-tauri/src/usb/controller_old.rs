// use super::babyface_pro::{BabyfacePro, ControlRegister, GainChannel};
// use std::sync::Mutex;
// use once_cell::sync::Lazy;

// static BABYFACE_PRO: Lazy<Mutex<Option<BabyfacePro>>> = Lazy::new(|| {
//     match BabyfacePro::new() {
//         Ok(device) => {
//             println!("Babyface Pro initialized successfully");
//             Mutex::new(Some(device))
//         },
//         Err(e) => {
//             println!("Failed to initialize Babyface Pro: {}", e);
//             Mutex::new(None)
//         }
//     }
// });

// fn with_babyface_pro<F, R>(f: F) -> Result<R, String>
// where
//     F: FnOnce(&mut BabyfacePro) -> Result<R, String>
// {
//     let mut lock = BABYFACE_PRO.lock().map_err(|e| {
//         let error_msg = format!("Failed to acquire lock: {}", e);
//         println!("{}", error_msg);
//         error_msg
//     })?;
    
//     match lock.as_mut() {
//         Some(babyface) => f(babyface),
//         None => {
//             let error_msg = "Babyface Pro not initialized. Check USB permissions and udev rules.".to_string();
//             println!("{}", error_msg);
//             Err(error_msg)
//         }
//     }
// }

// #[tauri::command]
// pub fn read_control(reg: u8, idx: u8) -> Result<u8, String> {
//     with_babyface_pro(|babyface| {
//         babyface.read_control(ControlRegister::from(reg), idx)
//             .map_err(|e| e.to_string())
//     })
// }

// #[tauri::command]
// pub fn write_control(reg: u8, idx: u8, value: u8) -> Result<(), String> {
//     with_babyface_pro(|babyface| {
//         babyface.write_control(ControlRegister::from(reg), idx, value)
//             .map_err(|e| e.to_string())
//     })
// }

// #[tauri::command]
// pub fn read_gain(channel: u8) -> Result<u8, String> {
//     with_babyface_pro(|babyface| {
//         babyface.read_gain(GainChannel::from(channel))
//             .map_err(|e| e.to_string())
//     })
// }

// #[tauri::command]
// pub fn write_gain(channel: u8, value: u8) -> Result<(), String> {
//     with_babyface_pro(|babyface| {
//         babyface.write_gain(GainChannel::from(channel), value)
//             .map_err(|e| e.to_string())
//     })
// }

// #[tauri::command]
// pub fn read_volume(index: u16) -> Result<u32, String> {
//     with_babyface_pro(|babyface| {
//         babyface.read_volume(index)
//             .map_err(|e| e.to_string())
//     })
// }

// #[tauri::command]
// pub fn write_volume(index: u16, value: u32) -> Result<(), String> {
//     with_babyface_pro(|babyface| {
//         babyface.write_volume(index, value)
//             .map_err(|e| e.to_string())
//     })
// }