// use rusb::{DeviceHandle, GlobalContext};
// use std::time::Duration;

// const VENDOR_ID: u16 = 0x1234; // Replace with actual Babyface Pro vendor ID
// const PRODUCT_ID: u16 = 0x5678; // Replace with actual Babyface Pro product ID

// pub struct BabyfacePro {
//     handle: DeviceHandle<GlobalContext>,
// }

// pub enum ControlRegister {
//     Reg1 = 0,
//     Reg2 = 1,
// }

// impl From<u8> for ControlRegister {
//     fn from(value: u8) -> Self {
//         match value {
//             0 => ControlRegister::Reg1,
//             1 => ControlRegister::Reg2,
//             _ => panic!("Invalid control register"),
//         }
//     }
// }

// pub enum GainChannel {
//     MicAN1 = 0,
//     MicAN2 = 1,
//     LineIN3 = 2,
//     LineIN4 = 3,
// }

// impl From<u8> for GainChannel {
//     fn from(value: u8) -> Self {
//         match value {
//             0 => GainChannel::MicAN1,
//             1 => GainChannel::MicAN2,
//             2 => GainChannel::LineIN3,
//             3 => GainChannel::LineIN4,
//             _ => panic!("Invalid gain channel"),
//         }
//     }
// }

// impl BabyfacePro {
//     pub fn new() -> Result<Self, String> {
//         println!("Attempting to initialize Babyface Pro...");
//         let devices = rusb::devices().map_err(|e| format!("Failed to list USB devices: {}", e))?;
        
//         println!("Searching for Babyface Pro device...");
//         for device in devices.iter() {
//             let device_desc = match device.device_descriptor() {
//                 Ok(desc) => desc,
//                 Err(e) => {
//                     println!("Failed to get device descriptor: {}", e);
//                     continue;
//                 }
//             };

//             println!("Found device with vendor ID: {:04x}, product ID: {:04x}", 
//                      device_desc.vendor_id(), device_desc.product_id());

//             if device_desc.vendor_id() == VENDOR_ID && device_desc.product_id() == PRODUCT_ID {
//                 println!("Babyface Pro device found, attempting to open...");
//                 match device.open() {
//                     Ok(handle) => {
//                         println!("Successfully opened Babyface Pro device!");
//                         // Try to set configuration
//                         if let Err(e) = handle.set_active_configuration(1) {
//                             println!("Warning: Failed to set active configuration: {}", e);
//                         }
//                         // Try to claim interface
//                         if let Err(e) = handle.claim_interface(0) {
//                             return Err(format!("Failed to claim interface: {}. This might be a permissions issue.", e));
//                         }
//                         return Ok(BabyfacePro { handle });
//                     }
//                     Err(e) => return Err(format!("Failed to open device: {}. This might be a permissions issue.", e)),
//                 }
//             }
//         }

//         Err("Babyface Pro device not found".to_string())
//     }

//     pub fn read_control(&self, reg: ControlRegister, index: u8) -> rusb::Result<u8> {
//         let request_type = 0xC0; // USB_DIR_IN | USB_TYPE_VENDOR | USB_RECIP_DEVICE
//         let request = match reg {
//             ControlRegister::Reg1 => 0x10,
//             ControlRegister::Reg2 => 0x17,
//         };
//         let mut buffer = [0u8; 1];
//         self.handle.read_control(request_type, request, 0, index as u16, &mut buffer, Duration::from_secs(1))?;
//         Ok(buffer[0])
//     }

//     pub fn write_control(&self, reg: ControlRegister, index: u8, value: u8) -> rusb::Result<()> {
//         let request_type = 0x40; // USB_DIR_OUT | USB_TYPE_VENDOR | USB_RECIP_DEVICE
//         let request = match reg {
//             ControlRegister::Reg1 => 0x10,
//             ControlRegister::Reg2 => 0x17,
//         };
//         self.handle.write_control(request_type, request, value as u16, index as u16, &[], Duration::from_secs(1))?;
//         Ok(())
//     }

//     pub fn read_gain(&self, channel: GainChannel) -> rusb::Result<u8> {
//         let request_type = 0xC0;
//         let request = 0x1A;
//         let mut buffer = [0u8; 1];
//         self.handle.read_control(request_type, request, 0, channel as u16, &mut buffer, Duration::from_secs(1))?;
//         Ok(buffer[0])
//     }

//     pub fn write_gain(&self, channel: GainChannel, value: u8) -> rusb::Result<()> {
//         let request_type = 0x40;
//         let request = 0x1A;
//         self.handle.write_control(request_type, request, value as u16, channel as u16, &[], Duration::from_secs(1))?;
//         Ok(())
//     }

//     pub fn read_volume(&self, index: u16) -> rusb::Result<u32> {
//         let request_type = 0xC0;
//         let request = 0x12;
//         let mut buffer = [0u8; 4];
//         self.handle.read_control(request_type, request, 0, index, &mut buffer, Duration::from_secs(1))?;
//         Ok(u32::from_le_bytes(buffer))
//     }

//     pub fn write_volume(&self, index: u16, value: u32) -> rusb::Result<()> {
//         let request_type = 0x40;
//         let request = 0x12;
//         let value_bytes = value.to_le_bytes();
//         self.handle.write_control(request_type, request, 
//             u16::from_le_bytes([value_bytes[0], value_bytes[1]]),
//             index | ((value as u16 & 0x3) << 14),
//             &value_bytes[2..], Duration::from_secs(1))?;
//         Ok(())
//     }
// }