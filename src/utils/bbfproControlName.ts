

import { AlsaOutput, OutputType } from "../types/config.types";

export const formatRoutingControlName = (inputControlName: string, outputType: OutputType, outputs: AlsaOutput[], compatabilityMode = false) => {
        let output

        if (compatabilityMode && outputType === OutputType.SPEAKERS) {
                output = {routeNameLeft: "AN1", routeNameRight: "AN2"}
        } else {
                output = outputs.find(el => el.type === outputType)
        }

        if(!output) {
                return
        }

        const left = `${inputControlName}-${output.routeNameLeft}`
        const right = `${inputControlName}-${output.routeNameRight}`

        return {left, right}
}