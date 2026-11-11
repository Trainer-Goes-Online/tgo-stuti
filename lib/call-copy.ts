/**
 * What the call is, verbatim from funnel-copy/01-landing.md. Read by the
 * booking page and the thank-you so the two cannot drift.
 */

export const CALL_NAME = 'Private 1:1 Breakthrough Call';

export const CALL_DECK =
  "A focused conversation about the problems you're facing, the answers you're looking for and whether a comprehensive 4D reading is the right approach for you.";

export const CALL_STEPS = [
  {
    title: 'Identify Your Most Pressing Life Question',
    body: "Briefly share the one area of your life where you're seeking guidance, whether it's a career decision, financial concern, relationship or something else, and what you'd most like to understand.",
  },
  {
    title: 'Understand What A Comprehensive 4D Reading Could Reveal',
    body: 'Learn how looking at your birth chart, numbers, current energy patterns and surroundings together could offer a different perspective from a conventional Astrology or Numerology consultation.',
  },
  {
    title: 'Know Exactly What Your Next Step Could Look Like',
    body: "Understand whether the 4D Clarity Method is relevant to your concerns, what your personalised reading would involve and how to proceed if you decide it's right for you.",
  },
] as const;

/** FAQ 5, verbatim. */
export const FAQ_WHO = {
  q: 'Will my 1:1 consultation be directly with Stutie Gupta?',
  a: [
    "Yes, your 1:1 consultation will be directly with Stutie Gupta, where you'll have the opportunity to discuss your concerns, ask questions and understand how her 4D Clarity Method can help you.",
    'This is a private, personalised conversation focused on your situation, rather than a generic consultation where everyone receives the same advice.',
  ],
};

/** FAQ 3, verbatim. */
export const FAQ_PRIOR = {
  q: 'Do I need to know anything about Astrology, Numerology or spiritual practices before booking?',
  a: [
    "Not at all. You don't need any prior knowledge of Astrology, Numerology or spiritual practices. What matters more is your willingness to understand your situation with an open mind.",
    'Some people come to us having consulted multiple astrologers, while others are exploring a reading for the very first time. Both are equally welcome.',
  ],
};

/** FAQ 4, verbatim. */
export const FAQ_REMEDIES = {
  q: 'Will I be asked to follow expensive remedies or make changes to my home?',
  a: [
    "Not every reading leads to remedies, and you won't automatically be asked to make changes to your home or office.",
    'The purpose of the 4D Clarity Method is to explore your situation through different perspectives, rather than prescribe the same remedies to everyone.',
    "If an additional Vastu assessment or any other service is considered relevant, this will be discussed separately, including what it involves. You're free to decide whether you wish to proceed.",
  ],
};

/** The hero's assurance line, verbatim. */
export const CALL_IS_NOT =
  'Without Fear-Based Predictions, Scare Tactics Or Pressure To Follow Expensive Remedies.';
