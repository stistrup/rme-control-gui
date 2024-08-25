// use rusb::{Context, Device, DeviceHandle, UsbContext};
// use std::time::Duration;

// const VENDOR_ID: u16 = 0x2a39;
// const PRODUCT_ID: u16 = 0x3fb0;

// pub struct RMEBabyfacePro {
//     handle: Option<DeviceHandle<Context>>,
//     context: Context,
// }

// impl RMEBabyfacePro {
//     pub fn new() -> Result<Self, rusb::Error> {
//         Ok(RMEBabyfacePro {
//             handle: None,
//             context: Context::new()?,
//         })
//     }

//     pub fn open(&mut self) -> Result<(), rusb::Error> {
//         let (_, handle) = open_device(&self.context, VENDOR_ID, PRODUCT_ID)?;
        
//         // Detach kernel driver if necessary (Linux only)
//         #[cfg(target_os = "linux")]
//         {
//             if handle.kernel_driver_active(0)? {
//                 handle.detach_kernel_driver(0)?;
//             }
//         }
        
//         handle.claim_interface(0)?;
//         self.handle = Some(handle);
//         Ok(())
//     }

//     pub fn close(&mut self) {
//         if let Some(mut handle) = self.handle.take() {
//             let _ = handle.release_interface(0);
            
//             // Reattach kernel driver if necessary (Linux only)
//             #[cfg(target_os = "linux")]
//             {
//                 let _ = handle.attach_kernel_driver(0);
//             }
//         }
//     }

//     // You can add other methods here for specific operations
// }

// fn open_device(context: &Context, vid: u16, pid: u16) -> Result<(Device<Context>, DeviceHandle<Context>), rusb::Error> {
//     let devices = context.devices()?;

//     for device in devices.iter() {
//         let device_desc = device.device_descriptor()?;

//         if device_desc.vendor_id() == vid && device_desc.product_id() == pid {
//             return Ok((device.clone(), device.open()?));
//         }
//     }

//     Err(rusb::Error::NoDevice)
// }

// impl Drop for RMEBabyfacePro {
//     fn drop(&mut self) {
//         self.close();
//     }
// }