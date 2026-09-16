/*
 * Reference guides. Written for this site; the topics overlap with solvecalc.net
 * because the subject does, but none of the wording or the examples are shared.
 */
module.exports = [
  {
    slug: 'order-of-operations', name: 'Order of Operations',
    img: true, imgAlt: "A classroom blackboard covered in hand-written mathematical equations",
    credit: { who: "thepatrick", where: "https://www.flickr.com/photos/thepatrick/", lic: "CC BY 2.0", licUrl: "https://creativecommons.org/licenses/by/2.0/" },
    title: 'Order of Operations - PEMDAS and BODMAS Explained',
    desc: 'Why 2 + 3 x 4 is 14 and not 20, what PEMDAS and BODMAS each stand for, and the two rules about left-to-right working that most people were never told.',
    blurb: 'The fixed sequence every calculator follows, and the two rules people miss.',
    sections: [
      { h: 'Why an Order Exists at All', p: [
        'Without an agreed sequence, 2 + 3 x 4 has two defensible answers. Working left to right gives 20. Multiplying first gives 14. Mathematics settled on 14, and every calculator, spreadsheet and programming language on earth now follows that same convention, because a shared wrong answer is worse than useless.',
        'The order is not a law of nature. It is an agreement, chosen so that expressions can be written without brackets around every single operation.'] },
      { h: 'PEMDAS and BODMAS Are the Same Rule', p: [
        'PEMDAS is parentheses, exponents, multiplication and division, addition and subtraction. BODMAS is brackets, orders, division and multiplication, addition and subtraction. The wording differs by country; the behaviour does not. Orders and exponents mean the same thing, as do brackets and parentheses.',
        'Notice that PEMDAS lists multiplication before division and BODMAS lists division first. Neither is claiming priority, which brings us to the part the acronym hides.'] },
      { h: 'The Part the Acronym Gets Wrong', p: [
        'Multiplication and division share a rank. So do addition and subtraction. When operations of equal rank sit next to each other, you work from left to right, and nothing else.',
        'That is why 8 / 2 x 4 is 16, not 1. The division is on the left, so it happens first: 8 divided by 2 is 4, then times 4 is 16. Reading the M in PEMDAS as "multiply before divide" is what produces the wrong answer, and it is the single most common mistake on this topic.'] },
      { h: 'Subtraction Behaves the Same Way', p: [
        '10 - 4 + 3 is 9. Working left to right, 10 minus 4 is 6, then plus 3 is 9. Treating the addition as higher priority gives 3, which is wrong for exactly the same reason.',
        'A reliable trick is to read subtraction as adding a negative. 10 + (-4) + 3 can then be added in any order and still gives 9.'] },
      { h: 'Worked Through', p: [
        'Take 20 - 3 x 2 squared + (6 - 2).',
        'Brackets first: 6 minus 2 is 4, so the expression is 20 - 3 x 2 squared + 4. Exponents next: 2 squared is 4, giving 20 - 3 x 4 + 4. Multiplication: 3 times 4 is 12, giving 20 - 12 + 4. Then left to right: 20 minus 12 is 8, plus 4 is 12.'] },
      { h: 'When to Just Use Brackets', p: [
        'If an expression needs a paragraph of explanation to be read correctly, add brackets. Being unambiguous is worth more than being clever, and no examiner has ever deducted a mark for a bracket that was not strictly required.'] },
    ],
    faq: [
      { q: 'Is 8 / 2 x 4 equal to 1 or 16?', a: 'It is 16. Multiplication and division have equal priority, so they are worked left to right, and the division comes first.' },
      { q: 'Is PEMDAS different from BODMAS?', a: 'Only in wording. Orders and exponents mean the same thing, and both systems rank multiplication with division and addition with subtraction.' },
      { q: 'Do calculators follow this order?', a: 'Any scientific calculator does, including the one on this site. Basic four-function calculators sometimes do not, which is why they can disagree with a phone.' },
    ],
  },
  {
    slug: 'fractions-decimals-percentages', name: 'Fractions, Decimals and Percentages',
    img: true, imgAlt: "A red fifty percent off sale tag hanging on a rail of clothes in a shop",
    title: 'Fractions, Decimals and Percentages - Converting Between',
    desc: 'How to move between fractions, decimals and percentages in any direction, which conversions are worth memorising, and why some fractions never terminate.',
    blurb: 'Three notations for the same quantity, and how to move between them.',
    sections: [
      { h: 'One Quantity, Three Notations', p: [
        'A half, 0.5 and 50 percent are the same amount written three ways. Which one you use depends on the job: fractions are exact and good for working, decimals compare and sort easily, percentages communicate.',
        'Being able to switch quickly is more useful than preferring one, because most questions hand you the awkward form on purpose.'] },
      { h: 'Fraction to Decimal', p: [
        'Divide the top by the bottom. Three quarters is 3 divided by 4, which is 0.75. That is the whole method, and it always works.',
        'Some divisions never finish. A third is 0.3333 recurring, and a seventh runs through a six-digit cycle forever. A fraction terminates only when its denominator, once reduced, has no prime factors other than 2 and 5. That is why halves, quarters, fifths and eighths are clean and thirds and sevenths are not.'] },
      { h: 'Decimal to Fraction', p: [
        'Write the decimal over its place value, then reduce. 0.35 is 35 over 100, which reduces to 7 over 20.',
        'Recurring decimals need algebra rather than counting places. For 0.777 recurring, call it x, multiply by ten to get 7.777 recurring, subtract the original to leave 9x equal to 7, so x is seven ninths.'] },
      { h: 'The Percentage Step', p: [
        'Percent means per hundred, so a percentage is a decimal multiplied by a hundred, and a decimal is a percentage divided by a hundred. 0.42 is 42 percent. Done in either direction it is a decimal point moving two places, which is why it is the easiest of the three conversions.'] },
      { h: 'Worth Memorising', p: [
        'A handful of conversions appear so often that recalling them beats calculating them: a half is 0.5 or 50 percent, a quarter is 0.25 or 25 percent, a fifth is 0.2 or 20 percent, an eighth is 0.125 or 12.5 percent, and a third is 0.333 or 33.3 percent.',
        'Knowing those lets you sanity-check an answer instantly. If a calculation claims three eighths is 0.6, the stored fact that an eighth is 0.125 tells you it is wrong before you redo anything.'] },
    ],
    faq: [
      { q: 'Why does a third never terminate as a decimal?', a: 'Because 3 is not a factor of any power of ten. A reduced fraction terminates only when its denominator has no prime factors besides 2 and 5.' },
      { q: 'How do I turn a recurring decimal into a fraction?', a: 'Multiply by a power of ten that shifts one full cycle, subtract the original, then solve. For 0.777 recurring this gives seven ninths.' },
      { q: 'Which form should I answer in?', a: 'Whatever the question used, unless it says otherwise. If it gave you fractions, answer in fractions.' },
    ],
  },
  {
    slug: 'logarithms', name: 'Logarithms',
    img: true, imgAlt: "A circular slide rule photographed against a dark background",
    title: 'Logarithms Explained - What Log Actually Asks',
    desc: 'A logarithm answers one question: what power was applied. Covers log and ln, the three laws, change of base, and why log scales appear in earthquakes and sound.',
    blurb: 'One question, asked backwards: what power produced this number.',
    sections: [
      { h: 'The Question a Logarithm Asks', p: [
        'Log base 10 of 1000 asks: ten to what power gives 1000. The answer is 3. That is all a logarithm is, an exponent question asked in reverse, and once you read it that way most of the mystery goes.',
        'So log of 100 is 2, log of 10 is 1, and log of 1 is 0, because anything to the power of zero is one.'] },
      { h: 'log and ln', p: [
        'On a calculator, log usually means base ten and ln means base e, where e is roughly 2.718. Base ten suits anything measured in orders of magnitude; base e appears wherever something grows or decays continuously, which is most of physics, biology and compound interest.',
        'The button labels differ by manufacturer, which is worth checking before an exam rather than during one.'] },
      { h: 'The Three Laws', p: [
        'The log of a product is the sum of the logs. The log of a quotient is the difference. The log of a power brings the exponent out to the front as a multiplier.',
        'That third law is the one that earns its keep, because it turns an unknown sitting in an exponent into an ordinary coefficient you can divide by. It is how equations like 2 to the x equals 50 get solved at all.'] },
      { h: 'Change of Base', p: [
        'Calculators generally offer only base ten and base e, which is inconvenient when a question asks for base 2. Divide: log base 2 of 32 equals log 32 divided by log 2, which gives 5. Either available base works, provided you use the same one top and bottom.'] },
      { h: 'Why Log Scales Are Everywhere', p: [
        'Earthquake magnitude, sound in decibels and acidity in pH are all logarithmic, because the underlying quantities span too many orders of magnitude to plot honestly on a linear axis.',
        'It also explains why a magnitude 6 earthquake is not slightly worse than a 5 but roughly thirty times more energetic. Each step up the scale is a multiplication, not an addition.'] },
    ],
    faq: [
      { q: 'What is the difference between log and ln?', a: 'log is base ten on most calculators; ln is base e, about 2.718. Both answer the same kind of question, just with a different base.' },
      { q: 'Can you take the log of a negative number?', a: 'Not within real numbers. No real power of a positive base produces a negative result, so the domain starts just above zero.' },
      { q: 'How do I do log base 2 on a calculator?', a: 'Divide log of the number by log of 2. Change of base works with either log or ln as long as both are the same.' },
    ],
  },
  {
    slug: 'rounding-and-significant-figures', name: 'Rounding and Significant Figures',
    img: true, imgAlt: "A vernier caliper measuring a small object, with the millimetre scale in focus",
    title: 'Rounding and Significant Figures - Getting It Right',
    desc: 'Decimal places against significant figures, why rounding twice gives the wrong answer, and how to decide what precision an answer should actually carry.',
    blurb: 'How precise to be, and how to avoid losing marks getting there.',
    sections: [
      { h: 'Two Different Instructions', p: [
        'Decimal places count digits after the point. Significant figures count meaningful digits from the first non-zero one onward. They are not interchangeable, and a question asking for one will not accept the other.',
        '0.004821 to two decimal places is 0.00, which is useless. To two significant figures it is 0.0048, which preserves the information. That gap is exactly why significant figures exist.'] },
      { h: 'Which Zeros Count', p: [
        'Leading zeros never count: they are placeholders. Zeros between non-zero digits always count, so 4007 has four significant figures. Trailing zeros after a decimal point count, because writing them was a deliberate claim of precision, so 2.50 has three.',
        'Trailing zeros in a whole number such as 1500 are genuinely ambiguous, which is what standard form is for.'] },
      { h: 'Round Once, at the End', p: [
        'Rounding partway through and then continuing compounds the error. Work with full precision throughout and round only the final answer.',
        'A worked example: 2.4 times 3.6 is 8.64, and rounding that to 8.6 at the end is correct. Rounding the inputs first to 2 and 4 gives 8, which is wrong by a margin that grows with every further step.'] },
      { h: 'Choosing a Sensible Precision', p: [
        'An answer cannot be more precise than the data it came from. Measure a room as 3.2 by 4.1 metres and the area is 13.12 square metres on paper, but honestly it is 13 square metres: two significant figures in, two out.',
        'Quoting every digit the calculator offers is not more accurate. It just misrepresents how much you actually know.'] },
      { h: 'The Five Rule and Its Exception', p: [
        'Digits below five round down, five and above round up. Most classrooms stop there, and for schoolwork that is fine.',
        'Statistical work often rounds a bare five to the nearest even digit instead, so 2.5 becomes 2 and 3.5 becomes 4, because always rounding up biases a long series of numbers upward. Use the plain rule unless you are told otherwise.'] },
    ],
    faq: [
      { q: 'Is 0.0500 two significant figures or three?', a: 'Three. The leading zeros are placeholders, but the trailing zeros after the decimal point are a deliberate claim of precision.' },
      { q: 'Why is rounding twice a problem?', a: 'Each rounding introduces error, and rounding an already rounded number compounds it. Keep full precision until the final step.' },
      { q: 'How many figures should my answer have?', a: 'Match the least precise measurement you started with. Two significant figures in means two significant figures out.' },
    ],
  },
];
