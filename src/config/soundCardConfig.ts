import { AudioProfiles, SoundcardConfig } from "../types/config.types";

export enum OutputType {
    SPEAKERS,
    HEADPHONES
}

export enum InputType {
    MIC,
    LINE
}

export const babyfaceProConf: SoundcardConfig = {
    inputs: [
        {
            displayName: "Mic 1",
            controlName: "Mic-AN1",
            type: InputType.MIC,
            switcheNames: {
                phantom: "Mic-AN1 48V"
            }
        },
        {
            displayName: "Mic 2",
            controlName: "Mic-AN2",
            type: InputType.MIC,
            switcheNames: {
                phantom: "Mic-AN2 48V"
            }
        },
        {
            displayName: "Line 3",
            controlName: "Line-IN3",
            type: InputType.LINE,
            switcheNames: {
                lineSens: "Sens.",
            }
        },
        {
            displayName: "Line 4",
            controlName: "Line-IN4",
            type: InputType.LINE,
            switcheNames: {
                lineSens: "Sens.",
            }
        }
    ],
    outputs: [
        {
            displayName: "Main Output",
            controlNameLeft: "Main-Out AN1",
            controlNameRight: "Main-Out AN2",
            type: OutputType.SPEAKERS
        },
        {
            displayName: "Headphones",
            controlNameLeft: "Main-Out PH3",
            controlNameRight: "Main-Out PH4",
            type: OutputType.HEADPHONES
        }
    ],
    inputControlValues: {
        lineSensLow: "+4dBu",
        lineSensHigh: "-10dBV",
    }
}


export const audioProfilesConfig: AudioProfiles = {
    proAudio: {
        profileName: "pro-audio",
        displayName: "Pro Audio"
    },
    default: {
        profileName: "output:analog-stereo+input:analog-stereo",
        displayName: "Default"
    }
  };
