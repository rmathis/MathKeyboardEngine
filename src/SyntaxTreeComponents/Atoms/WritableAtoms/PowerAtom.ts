import { lastOrNull } from "../../../helpers/arrayhelpers/lastOrNull";
import { KeyboardMemory } from "../../../KeyboardEngine/KeyboardMemory";
import { LatexConfiguration } from "../../../LatexConfiguration";
import { Placeholder } from "../../Placeholder/Placeholder";
import { Atom } from "../Base/Atom";
import { WritableAtom } from "../Base/WritableAtom";

export class PowerAtom extends WritableAtom {

    readonly Base : Placeholder;
    readonly Exponent : Placeholder;
    
    constructor() {
        super([new Placeholder(), new Placeholder()]);
        this.Base = this.Placeholders[0];
        this.Exponent = this.Placeholders[1];
    }

    override provideLatex(latexConfiguration: LatexConfiguration, keyboardInfo: KeyboardMemory) : string {
        return `${this.Base.getLatex(latexConfiguration, keyboardInfo)}^{${this.Exponent.getLatex(latexConfiguration, keyboardInfo)}}`;
    }

    override GetMoveDownSuggestion(current : Placeholder) : Placeholder | null {
        if (current === this.Exponent) {
            return this.Base;
        } else {
            return null;
        }
    }
    
    override GetMoveUpSuggestion(current : Placeholder) : Placeholder | null {
        if (current === this.Base) {
            return this.Exponent;
        } else {
            return null;
        }
    }
}