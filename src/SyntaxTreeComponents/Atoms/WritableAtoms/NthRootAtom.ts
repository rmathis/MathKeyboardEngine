import { KeyboardMemory } from "../../../KeyboardEngine/KeyboardMemory";
import { LatexConfiguration } from "../../../LatexConfiguration";
import { Placeholder } from "../../Placeholder/Placeholder";
import { WritableAtom } from "../Base/WritableAtom";

export class NthRootAtom extends WritableAtom {
    readonly N : Placeholder;
    readonly Radicand : Placeholder;

    constructor() {
        super([new Placeholder(), new Placeholder()]);
        this.N = this.Placeholders[0];
        this.Radicand = this.Placeholders[1];
    }
    
    override provideLatex(latexConfiguration: LatexConfiguration, keyboardMemory : KeyboardMemory): string {
        return String.raw`\sqrt[${this.N.getLatex(latexConfiguration, keyboardMemory)}]{${this.Radicand.getLatex(latexConfiguration, keyboardMemory)}}`;
    }

    override GetMoveDownSuggestion(current : Placeholder) : Placeholder | null {
        return (current === this.N)  ? this.Radicand : null;
    }
    
    override GetMoveUpSuggestion(current : Placeholder) : Placeholder | null {
        return (current === this.Radicand) ? this.N : null;
    }
}