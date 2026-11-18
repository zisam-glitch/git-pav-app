import React from "react";
import { WhiteningVisualizer } from "./whitening-visualizer";
import { WhiteningComparison } from "./whitening-comparison";
import { WhiteningProducts } from "./whitening-products";
import { WhiteningFaq } from "./whitening-faq";

/**
 * The whitening page as it stands before it is rebuilt from the live page's text (three
 * products at £65, £295 and £495, and its own questions and answers). The sections left here
 * are the ones not yet replaced; the doctor video, awards, evidence, hero and contact
 * sections were removed because they named a dentist and made claims the live site does not.
 */
export function WhiteningPage() {
  return (
    <main>
      <WhiteningVisualizer />
      <WhiteningComparison />
      <WhiteningProducts />
      <WhiteningFaq />
    </main>
  );
}
