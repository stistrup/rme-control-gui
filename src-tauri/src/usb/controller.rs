// use super::babyface_pro::BabyfacePro;
// use std::sync::Mutex;
// use once_cell::sync::Lazy;

// const SND_BBFPRO_MIXER_MAIN_OUT_CH_OFFSET: u16 = 992;
// const SND_BBFPRO_MIXER_VAL_MIN: u32 = 0;
// const SND_BBFPRO_MIXER_VAL_MAX: u32 = 65536;
// const SND_BBFPRO_GAIN_VAL_MIN: u8 = 0;
// const SND_BBFPRO_GAIN_VAL_MIC_MAX: u8 = 65;
// const SND_BBFPRO_GAIN_VAL_LINE_MAX: u8 = 18;

// static BABYFACE_PRO: Lazy<Mutex<Option<BabyfacePro>>> = Lazy::new(|| {
//     match BabyfacePro::new("3") {
//         Ok(device) => {
//             println!("Babyface Pro initialized successfully");
//             Mutex::new(Some(device))
//         },
//         Err(e) => {
//             eprintln!("Failed to initialize Babyface Pro: {}. Check ALSA permissions.", e);
//             Mutex::new(None)
//         }
//     }
// });

// // #[tauri::command]
// // pub fn set_switch(reg: u8, index: u8, value: bool) -> Result<(), String> {
// //     let babyface = BABYFACE_PRO.lock().map_err(|e| e.to_string())?;
// //     let device = babyface.as_ref().ok_or("Babyface Pro not initialized")?;
// //     let control = (index as u16) << 1;
// //     device.write_control(reg as u16, control, value as u32).map_err(|e| e.to_string())
// // }

// // #[tauri::command]
// // pub fn set_routing_volume(output: u8, input: u8, value: u32) -> Result<(), String> {
// //     if value > SND_BBFPRO_MIXER_VAL_MAX {
// //         return Err("Volume value out of range".to_string());
// //     }
// //     let babyface = BABYFACE_PRO.lock().map_err(|e| e.to_string())?;
// //     let device = babyface.as_ref().ok_or("Babyface Pro not initialized")?;
// //     let index = (26 * output as u16 + input as u16) & 0x3FF;
// //     device.write_control(index, 0, value).map_err(|e| e.to_string())
// // }

// // #[tauri::command]
// // pub fn set_pcm_routing_volume(output: u8, pcm_channel: u8, value: u32) -> Result<(), String> {
// //     if value > SND_BBFPRO_MIXER_VAL_MAX {
// //         return Err("Volume value out of range".to_string());
// //     }
// //     let babyface = BABYFACE_PRO.lock().map_err(|e| e.to_string())?;
// //     let device = babyface.as_ref().ok_or("Babyface Pro not initialized")?;
// //     let index = (26 * output as u16 + 12 + pcm_channel as u16) & 0x3FF;
// //     device.write_control(index, 0, value).map_err(|e| e.to_string())
// // }

// #[tauri::command]
// pub fn set_main_out_volume(channel: u16, value: u32) -> Result<(), String> {
//     // Print channel and value
//     println!("Setting volume - Channel: {}, Value: {}", channel, value);

//     if channel >= 12 {
//         return Err("Channel out of range".to_string());
//     }
//     if value > SND_BBFPRO_MIXER_VAL_MAX {
//         return Err("Volume value out of range".to_string());
//     }
//     let babyface = BABYFACE_PRO.lock().map_err(|e| e.to_string())?;
//     let device = babyface.as_ref().ok_or("Babyface Pro not initialized")?;
//     let index = channel + SND_BBFPRO_MIXER_MAIN_OUT_CH_OFFSET;
    
//     device.write_volume_control(index, value).map_err(|e| e.to_string())
// }


// // #[tauri::command]
// // pub fn set_gain(channel: u8, value: u8) -> Result<(), String> {
// //     let max_gain = if channel < 2 { SND_BBFPRO_GAIN_VAL_MIC_MAX } else { SND_BBFPRO_GAIN_VAL_LINE_MAX };
// //     if value < SND_BBFPRO_GAIN_VAL_MIN || value > max_gain {
// //         return Err("Gain value out of range".to_string());
// //     }
// //     let babyface = BABYFACE_PRO.lock().map_err(|e| e.to_string())?;
// //     let device = babyface.as_ref().ok_or("Babyface Pro not initialized")?;
    
// //     let gain = if channel < 2 {
// //         // XLR preamp: 3-bit fine, 5-bit coarse; special case >60
// //         if value < 60 {
// //             ((value % 3) << 5) | (value / 3)
// //         } else {
// //             ((value % 6) << 5) | (60 / 3)
// //         }
// //     } else {
// //         value
// //     };

// //     device.write_control(0x1A, channel as u16, gain as u32).map_err(|e| e.to_string())
// // }

// // #[tauri::command]
// // pub fn read_control(index: u16, control: u16) -> Result<u32, String> {
// //     let babyface = BABYFACE_PRO.lock().map_err(|e| e.to_string())?;
// //     let device = babyface.as_ref().ok_or("Babyface Pro not initialized")?;
// //     device.read_control(index, control).map_err(|e| e.to_string())
// // }

// // #[tauri::command]
// // pub fn write_control(index: u16, control: u16, value: u32) -> Result<(), String> {
// //     let babyface = BABYFACE_PRO.lock().map_err(|e| e.to_string())?;
// //     let device = babyface.as_ref().ok_or("Babyface Pro not initialized")?;
// //     device.write_control(index, control, value).map_err(|e| e.to_string())
// // }