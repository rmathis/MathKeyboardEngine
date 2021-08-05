import { describe } from 'mocha';
import { assert, expect } from 'chai';
import { KeyboardMemory } from '../../../../../src/KeyboardEngine/KeyboardMemory'
import { PowerAtom } from '../../../../../src/SyntaxTreeComponents/Atoms/WritableAtoms/PowerAtom';
import { TryInsertWithEncapsulateCurrent } from '../../../../../src/KeyboardEngine/Functions/Insert/TryInsertWithEncapsulateCurrent';
import { expectLatex } from '../../../../helpers/expectLatex';
import { Placeholder } from '../../../../../src/SyntaxTreeComponents/Placeholder/Placeholder';
import { Insert } from '../../../../../src/KeyboardEngine/Functions/Insert/Insert';
import { MatrixAtom } from '../../../../../src/SyntaxTreeComponents/Atoms/WritableAtoms/MatrixAtom';
import { MoveRight } from '../../../../../src/KeyboardEngine/Functions/Navigation/MoveRight';
import { DigitAtom } from '../../../../../src/SyntaxTreeComponents/Atoms/ReadonlyAtoms/DigitAtom';
import { DecimalSeparatorAtom } from '../../../../../src/SyntaxTreeComponents/Atoms/ReadonlyAtoms/DecimalSeparatorAtom';
import { RawAtom } from '../../../../../src/SyntaxTreeComponents/Atoms/ReadonlyAtoms/RawAtom';
import { FractionAtom } from '../../../../../src/SyntaxTreeComponents/Atoms/WritableAtoms/FractionAtom';
import { MoveLeft } from '../../../../../src/KeyboardEngine/Functions/Navigation/MoveLeft';
import { DeleteCurrent } from '../../../../../src/KeyboardEngine/Functions/Delete/DeleteCurrent';
import { MoveUp } from '../../../../../src/KeyboardEngine/Functions/Navigation/MoveUp';
import { RoundBracketLeftAtom, RoundBracketRightAtom } from '../../../../../src/SyntaxTreeComponents/Atoms/ReadonlyAtoms/Brackets/RoundBracketAtoms';
import { SquareBracketLeftAtom, SquareBracketRightAtom } from '../../../../../src/SyntaxTreeComponents/Atoms/ReadonlyAtoms/Brackets/SquareBracketAtoms';


describe(TryInsertWithEncapsulateCurrent.name, () =>
{
  it('returns false if current is placeholder', () =>
  {
    let k = new KeyboardMemory();
    assert.isTrue(k.Current instanceof Placeholder);
    expectLatex('◼', k);
    assert.notOk(TryInsertWithEncapsulateCurrent(k, new PowerAtom().Base));
    expectLatex('◼', k);
  });

  it('can encapsulate complex stuff like matrixes', () =>
  {
    let k = new KeyboardMemory();
    Insert(k, new MatrixAtom({matrixType: "pmatrix", height:2, width:2}));
    for(let i = 1; i <= 4; i++){
        Insert(k, new DigitAtom(i));
        MoveRight(k);    
    }
    assert.ok(TryInsertWithEncapsulateCurrent(k, new PowerAtom().Base));
    expectLatex(String.raw`\begin{pmatrix}1 & 2 \\ 3 & 4\end{pmatrix}^{◼}`, k);
  });

  it('can also be used inside (for example) a matrix', () =>
  {
    let k = new KeyboardMemory();
    Insert(k, new MatrixAtom({matrixType: "pmatrix", height:2, width:2}));
    Insert(k, new DigitAtom(1));
    assert.ok(TryInsertWithEncapsulateCurrent(k, new PowerAtom().Base));
    expectLatex(String.raw`\begin{pmatrix}1^{◼} & ◻ \\ ◻ & ◻\end{pmatrix}`, k);
  });

  it('can encapsulate multiple digits', () =>
  {
    let k = new KeyboardMemory();
    Insert(k, new DigitAtom(1));
    Insert(k, new DigitAtom(2));
    assert.ok(TryInsertWithEncapsulateCurrent(k, new FractionAtom().Numerator));
    expectLatex(String.raw`\frac{12}{◼}`, k);
  });

  it('can encapsulate a decimal number', () =>
  {
    let k = new KeyboardMemory();
    Insert(k, new DigitAtom(1));
    Insert(k, new DigitAtom(2));
    Insert(k, new DecimalSeparatorAtom());
    Insert(k, new DigitAtom(3));

    assert.ok(TryInsertWithEncapsulateCurrent(k, new PowerAtom().Base));
    expectLatex('12.3^{◼}', k);
    MoveLeft(k);
    expectLatex('12.3◼^{◻}', k);
    DeleteCurrent(k);
    DeleteCurrent(k);
    expectLatex('12◼^{◻}', k);
    MoveUp(k);
    expectLatex('12^{◼}', k);
  });

  it('does not encapsulate more than it should', () =>
  {
    let k = new KeyboardMemory();
    Insert(k, new DigitAtom(1));
    Insert(k, new RawAtom('+'));
    Insert(k, new DigitAtom(2));
    Insert(k, new DigitAtom(3));
    assert.ok(TryInsertWithEncapsulateCurrent(k, new FractionAtom().Numerator));
    expectLatex(String.raw`1+\frac{23}{◼}`, k);
  });

  it ('can encapsulate round brackets', () => {
    let k = new KeyboardMemory();
    Insert(k, new DigitAtom(1));
    Insert(k, new RawAtom('+'));
    Insert(k, new RoundBracketLeftAtom());
    Insert(k, new DigitAtom(2));
    Insert(k, new RawAtom('+'));
    Insert(k, new DigitAtom(3));
    Insert(k, new RoundBracketRightAtom());
    let powerAtom = new PowerAtom();
    assert.ok(TryInsertWithEncapsulateCurrent(k, powerAtom.Base));
    expectLatex(String.raw`1+(2+3)^{◼}`, k);

    expect(powerAtom.Base.getLatex(null, k)).to.be.equal("(2+3)");
  });

  it ('config.deleteOuterRoundBracketsIfAny: can delete round brackets during encapsulation', () => {
    let k = new KeyboardMemory();
    Insert(k, new DigitAtom(1));
    Insert(k, new RawAtom('+'));
    Insert(k, new RoundBracketLeftAtom());
    Insert(k, new DigitAtom(2));
    Insert(k, new RawAtom('+'));
    Insert(k, new DigitAtom(3));
    Insert(k, new RoundBracketRightAtom());
    assert.ok(TryInsertWithEncapsulateCurrent(k, new FractionAtom().Numerator, { deleteOuterRoundBracketsIfAny: true}));
    expectLatex(String.raw`1+\frac{2+3}{◼}`, k);
  });
  
  it ('config.deleteOuterRoundBracketsIfAny does not delete square brackets during encapsulation', () => {
    let k = new KeyboardMemory();
    Insert(k, new DigitAtom(1));
    Insert(k, new RawAtom('+'));
    Insert(k, new SquareBracketLeftAtom());
    Insert(k, new DigitAtom(2));
    Insert(k, new RawAtom('+'));
    Insert(k, new DigitAtom(3));
    Insert(k, new SquareBracketRightAtom());
    let numerator = new FractionAtom().Numerator;
    assert.ok(TryInsertWithEncapsulateCurrent(k, numerator, { deleteOuterRoundBracketsIfAny: true}));
    expectLatex(String.raw`1+\frac{[2+3]}{◼}`, k);
    expect(numerator.getLatex(null, k)).to.be.equal("[2+3]");
  });
});