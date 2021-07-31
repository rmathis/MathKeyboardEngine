import { expect } from "chai";
import { KeyboardMemory } from "../../src/KeyboardEngine/KeyboardMemory";
import { LatexConfiguration } from "../../src/LatexConfiguration";

const testConfig = new LatexConfiguration();
testConfig.activePlaceholderNucleus = '◼';
testConfig.passivePlaceholderNucleus = '◻';

export function expectLatex(latex : string, k : KeyboardMemory) : void {
  expect(latex).to.equal(k.getLatex(testConfig));
}