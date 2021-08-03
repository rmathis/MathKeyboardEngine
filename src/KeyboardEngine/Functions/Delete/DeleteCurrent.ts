import { Placeholder } from "../../../SyntaxTreeComponents/Placeholder/Placeholder";
import { KeyboardMemory } from "../../KeyboardMemory";
import { GetFirstNonEmptyOnLeftOf } from "../../../SyntaxTreeComponents/Placeholder/GetFirstNonEmptyOnLeftOf";
import { lastOrNull } from "../../../helpers/arrayhelpers/lastOrNull";
import { firstBefore } from "../../../helpers/arrayhelpers/firstBefore";
import { remove } from "../../../helpers/arrayhelpers/remove";
import { Atom } from "../../../SyntaxTreeComponents/Atoms/Base/Atom";
import { WritableAtom } from "../../../SyntaxTreeComponents/Atoms/Base/WritableAtom";
import { last } from "../../../helpers/arrayhelpers/last";
import { PartOfNumberWithDigits } from "../../../SyntaxTreeComponents/Atoms/ReadonlyAtoms/Base/PartOfNumberWithDigits";
import { EncapsulateAll_PartsOfNumberWithDigits_LeftOfIndex } from "../Insert/TryInsertWithEncapsulateCurrent";

export function DeleteCurrent(k : KeyboardMemory) {
    if (k.Current instanceof Placeholder) {
        if (k.Current.ParentAtom == null || k.Current.Atoms.length > 0) {
            return;
        } else {
            let nonEmptyPlaceholderOnLeft : Placeholder | null = GetFirstNonEmptyOnLeftOf(k.Current.ParentAtom.Placeholders, k.Current);
            if (nonEmptyPlaceholderOnLeft) {
                if (k.Current.ParentAtom.Placeholders.length == 2
                    && k.Current === k.Current.ParentAtom.Placeholders[1]
                    && k.Current.Atoms.length == 0) {
                    k.Current.ParentAtom.ParentPlaceholder.Atoms.pop();
                    for(let atom of nonEmptyPlaceholderOnLeft.Atoms){
                        k.Current.ParentAtom.ParentPlaceholder.Atoms.push(atom);
                    }
                    k.Current = last(nonEmptyPlaceholderOnLeft.Atoms);
                } else {
                    nonEmptyPlaceholderOnLeft.Atoms.pop();
                    k.Current = lastOrNull(nonEmptyPlaceholderOnLeft.Atoms) ?? nonEmptyPlaceholderOnLeft;
                }
            } else if (k.Current.ParentAtom.Placeholders.every(ph => ph.Atoms.length == 0)) {
                let ancestorPlaceholder = k.Current.ParentAtom.ParentPlaceholder;
                let previousAtom = firstBefore(ancestorPlaceholder.Atoms, k.Current.ParentAtom);
                remove(ancestorPlaceholder.Atoms, k.Current.ParentAtom);
                k.Current = previousAtom ?? ancestorPlaceholder;
            } else if (k.Current.ParentAtom.Placeholders[0] === k.Current 
            && k.Current.Atoms.length == 0 
            && k.Current.ParentAtom.Placeholders.some(ph => ph.Atoms.length != 0)) {
                if (TryEncapsulatePreviousInto(k.Current)) {
                    k.Current = last(k.Current.Atoms);
                }
            }
        }
    } else {
        if (k.Current instanceof WritableAtom && k.Current.Placeholders.some(ph => ph.Atoms.length > 0)) {
            let lastPlaceholderWithContent! : Placeholder;
            for (let i = k.Current.Placeholders.length - 1; i >= 0; i--) {
                let ph = k.Current.Placeholders[i];
                if (ph.Atoms.length > 0){
                    lastPlaceholderWithContent = ph;
                    break;
                }
            }
            lastPlaceholderWithContent.Atoms.pop();
            k.Current = lastPlaceholderWithContent.Atoms.length == 0 ? lastPlaceholderWithContent : last(lastPlaceholderWithContent.Atoms);
        } else {
            let previousAtom : Atom | null = firstBefore(k.Current.ParentPlaceholder.Atoms, k.Current);
            remove(k.Current.ParentPlaceholder.Atoms, k.Current);
            k.Current = previousAtom ?? k.Current.ParentPlaceholder;
        }
    }
}

function TryEncapsulatePreviousInto(targetPlaceholder : Placeholder) {
    let previousAtom = firstBefore(targetPlaceholder.ParentAtom!.ParentPlaceholder.Atoms, targetPlaceholder.ParentAtom);
    if (previousAtom != null) {
        remove(targetPlaceholder.ParentAtom!.ParentPlaceholder.Atoms, previousAtom);
        targetPlaceholder.Atoms.push(previousAtom);
        previousAtom.ParentPlaceholder = targetPlaceholder;
        if (previousAtom instanceof PartOfNumberWithDigits){
            EncapsulateAll_PartsOfNumberWithDigits_LeftOfIndex(previousAtom.ParentPlaceholder.Atoms.length, previousAtom.ParentPlaceholder.Atoms, targetPlaceholder);
        }
        return true;
    }

    return false;
}