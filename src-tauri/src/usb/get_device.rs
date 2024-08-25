// use rusb::{Context, Device, UsbContext};

// pub fn list_usb_devices() -> Result<(), rusb::Error> {
//     let context = Context::new()?;

//     for device in context.devices()?.iter() {
//         let device_desc = device.device_descriptor()?;

//         println!(
//             "Bus {:03} Device {:03} ID {:04x}:{:04x}",
//             device.bus_number(),
//             device.address(),
//             device_desc.vendor_id(),
//             device_desc.product_id()
//         );

//         match device.open() {
//             Ok(handle) => {
//                 if let Ok(manufacturer) = handle.read_manufacturer_string_ascii(&device_desc) {
//                     println!("  Manufacturer: {}", manufacturer);
//                 }
//                 if let Ok(product) = handle.read_product_string_ascii(&device_desc) {
//                     println!("  Product: {}", product);
//                 }
//             }
//             Err(_) => {
//                 println!("  Unable to open device");
//             }
//         }

//         println!();
//     }

//     Ok(())
// }