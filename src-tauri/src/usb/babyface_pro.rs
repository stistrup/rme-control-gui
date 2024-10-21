// use std::fs::File;
// use std::io::Read;
// use std::os::unix::io::AsRawFd;
// use nix::libc::{ioctl, c_ulong};
// use std::io::{Error, Result};
// use std::fs::OpenOptions;

// const SNDRV_CTL_IOCTL_WRITE: c_ulong = 0x40084813;

// const USB_DIR_OUT: u8 = 0x00;
// const USB_TYPE_VENDOR: u8 = 0x40;
// const USB_RECIP_DEVICE: u8 = 0x00;

// const SND_BBFPRO_USBREQ_MIXER: u8 = 0x12;
// const SND_BBFPRO_USBREQ_GAIN: u8 = 0x1A;

// pub struct BabyfacePro {
//     file: File,
// }

// #[repr(C)]
// struct UsbControlMessage {
//     request_type: u8,
//     request: u8,
//     value: u16,
//     index: u16,
//     data: [u8; 8],
// }

// impl BabyfacePro {
//     pub fn new(card: &str) -> Result<Self> {
//         let file = File::open(format!("/dev/snd/controlC{}", card))?;
//         Ok(BabyfacePro { file })
//     }

//     pub fn write_volume_control(&self, index: u16, value: u32) -> Result<()> {
//         // 18 bit linear volume, split so 2 bits end up in index.
//         let mut file = OpenOptions::new()
//         .read(true)
//         .write(true)
//         .open("/dev/snd/controlC3")?;
    
//         let mut buffer = [0; 1024];
//         let bytes_read = file.read(&mut buffer)?;
//         println!("Read {} bytes from device", bytes_read);
//         Ok(())
//         // let usb_idx = index | (((value & 0x3) as u16) << 14);
//         // let usb_val = (value >> 2) & 0xffff;
    
//         // // Print usb_idx in binary
//         // println!("usb_idx in binary: {:016b}", usb_idx);
        
//         // // Print usb_val in binary
//         // println!("usb_val in binary: {:016b}", usb_val);
    
//         // let mut msg = UsbControlMessage {
//         //     request_type: USB_DIR_OUT | USB_TYPE_VENDOR | USB_RECIP_DEVICE,
//         //     request: SND_BBFPRO_USBREQ_MIXER,
//         //     value: usb_val as u16,
//         //     index: usb_idx,
//         //     data: [0; 8],
//         // };
    
//         // let result = unsafe {
//         //     ioctl(self.file.as_raw_fd(), SNDRV_CTL_IOCTL_WRITE, &mut msg)
//         // };
    
//         // if result == -1 {
//         //     Err(Error::last_os_error())
//         // } else {
//         //     Ok(())
//         // }
//     }

//     pub fn write_switch_control(&self, reg: u8, index: u8, value: bool) -> Result<()> {
//         let mut msg = UsbControlMessage {
//             request_type: USB_DIR_OUT | USB_TYPE_VENDOR | USB_RECIP_DEVICE,
//             request: reg,
//             value: (index as u16) << 1 | (value as u16),
//             index: 0,
//             data: [0; 8],
//         };

//         let result = unsafe {
//             ioctl(self.file.as_raw_fd(), SNDRV_CTL_IOCTL_WRITE, &mut msg)
//         };

//         if result == -1 {
//             Err(Error::last_os_error())
//         } else {
//             Ok(())
//         }
//     }

//     pub fn write_gain_control(&self, channel: u8, value: u8) -> Result<()> {
//         let mut msg = UsbControlMessage {
//             request_type: USB_DIR_OUT | USB_TYPE_VENDOR | USB_RECIP_DEVICE,
//             request: SND_BBFPRO_USBREQ_GAIN,
//             value: value as u16,
//             index: channel as u16,
//             data: [0; 8],
//         };

//         let result = unsafe {
//             ioctl(self.file.as_raw_fd(), SNDRV_CTL_IOCTL_WRITE, &mut msg)
//         };

//         if result == -1 {
//             Err(Error::last_os_error())
//         } else {
//             Ok(())
//         }
//     }
// }