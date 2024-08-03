
import { AlsaOutput, OutputType } from "../types/config.types";

export const formatRoutingControlName = (inputControlName: string, outputType: OutputType, outputs: AlsaOutput[]) => {
        const output = outputs.find(el => el.type === outputType)
        if(!output) {
                console.error('Could not find output when formatting controlname')
                return
        }

        const left = `${inputControlName}-${output.routeNameLeft}`
        const right = `${inputControlName}-${output.routeNameRight}`

        return {left, right}
}