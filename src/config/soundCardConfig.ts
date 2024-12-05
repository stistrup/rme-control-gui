import { AudioProfile, SoundcardConfig } from "../types/config.types";

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
            inputIndex: 0,
            displayName: "Mic 1",
            displayNameStereo: "Mic 1/2",
            controlName: "Mic-AN1",
            type: InputType.MIC,
            switchNames: {
                phantom: "Mic-AN1 48V",
                gain: "Mic-AN1 Gain",
                pad: "Mic-AN1 PAD",
            },
            stereoCoupled: false
        },
        {
            inputIndex: 1,
            displayName: "Mic 2",
            controlName: "Mic-AN2",
            type: InputType.MIC,
            switchNames: {
                phantom: "Mic-AN2 48V",
                gain: "Mic-AN2 Gain",
                pad: "Mic-AN2 PAD"
            },
            stereoCoupled: false
        },
        {
            inputIndex: 2,
            displayName: "Line 3",
            displayNameStereo: "Line 3/4",
            controlName: "Line-IN3",
            type: InputType.LINE,
            switchNames: {
                lineSens: "Sens.",
                gain: "Line-IN3 Gain"
            },
            stereoCoupled: false
        },
        {
            inputIndex: 3,
            displayName: "Line 4",
            controlName: "Line-IN4",
            type: InputType.LINE,
            switchNames: {
                lineSens: "Sens.",
                gain: "Line-IN4 Gain"
            },
            stereoCoupled: false
        }
    ],
    outputs: [
        {
            displayName: "Main Output",
            controlNameLeft: "Main-Out AN1",
            controlNameRight: "Main-Out AN2",
            routeNameLeft: "AN1",
            routeNameRight: "AN2",
            type: OutputType.SPEAKERS
        },
        {
            displayName: "Headphones",
            controlNameLeft: "Main-Out PH3",
            controlNameRight: "Main-Out PH4",
            routeNameLeft: "PH3",
            routeNameRight: "PH4",
            type: OutputType.HEADPHONES
        }
    ],
    playback: {
        displayName: "Playback",
        controlNameLeft: "PCM-AN1-AN1",
        controlNameRight: "PCM-AN2-AN2"
    },
    inputSwitchValues: {
        lineSensLow: "+4dBu",
        lineSensHigh: "-10dBV",
    },
    inputRange: {
        min: 0,
        max: 65536
    }
}

export const audioProfilesConfig: AudioProfile[] = [
    {
        profileName: "pro-audio",
        displayName: "Pro Audio"
    },
    {
        profileName: "output:analog-stereo+input:analog-stereo",
        displayName: "Default"
    }
];