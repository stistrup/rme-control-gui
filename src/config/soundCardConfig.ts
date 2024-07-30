
export enum OutputType {
    SPEAKERS,
    HEADPHONES
}

export enum InputType {
    MIC,
    LINE
}

export const babyfaceProConf = {
    inputs: [
        {
            displayName: "Mic 1",
            controlName: "Mic-AN1",
            hasPhantom: true,
            hasLineSens: false,
            type: InputType.MIC
        },
        {
            displayName: "Mic 2",
            controlName: "Mic-AN2",
            hasPhantom: true,
            hasLineSens: false,
            type: InputType.MIC
        },
        {
            displayName: "Line 3",
            controlName: "Line-IN3",
            hasPhantom: false,
            hasLineSens: true,
            type: InputType.LINE
        },
        {
            displayName: "Line 4",
            controlName: "Line-IN4",
            hasPhantom: false,
            hasLineSens: true,
            type: InputType.LINE
        }
    ],
    outputs: [
        {
            displayNamE: "Main Output",
            controlNameLeft: "Main-Out AN1",
            controlNameRight: "Main-Out AN2",
            type: OutputType.SPEAKERS
        },
        {
            displayNamE: "Headphones",
            controlNameLeft: "Main-Out PH3",
            controlNameRight: "Main-Out PH4",
            type: OutputType.HEADPHONES
        }
    ],
    inputControlNames: {
        phantom: "48V",
        lineSensLow: "+4dBu",
        lineSensHigh: "-10dBV",
        pad: "PAD",
    }
}
