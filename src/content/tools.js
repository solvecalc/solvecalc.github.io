/*
 * Tool pages. The working widget for each one is copied from the same tool on
 * solvecalc.net (src/partials/tools/<slug>.html); everything written here is
 * this site's own text, so the two sites do not compete with the same copy.
 */
module.exports = [
  {
    slug: 'fraction-calculator', color: '#c084fc', name: 'Fraction Calculator', icon: 'fa-divide',
    blurb: 'Add, subtract, multiply and divide fractions with the steps shown.',
    title: 'Fraction Calculator - Add and Simplify Fractions Free',
    desc: 'Work with two fractions at once: add, subtract, multiply or divide them, then read the reduced answer and the working that produced it. Free, no sign-up.',
    intro: 'Four operations on two fractions, with the reduced result and the steps that got there.',
    sections: [
      { h: 'Why Fractions Trip People Up', p: [
        'Almost every fraction mistake is a missing common denominator. Multiplying and dividing do not need one, which makes it easy to forget that adding and subtracting absolutely do. Two thirds plus one quarter is not three sevenths, and the calculator above shows why by rewriting both parts over twelve before it adds anything.',
        'The second common slip is stopping too early. An answer of eight twelfths is correct but unfinished, and in most classrooms it loses a mark. Anything this page returns is already reduced as far as it goes.'] },
      { h: 'Adding and Subtracting', p: [
        'Find a denominator both fractions can use, rewrite each one over it, then work only on the top numbers. The bottom stays put. For 2/3 + 1/4 the shared denominator is 12, the fractions become 8/12 and 3/12, and the answer is 11/12, which will not reduce.',
        'Subtraction behaves identically until the result goes negative, which is allowed and simply carries the sign on the numerator.'] },
      { h: 'Multiplying and Dividing', p: [
        'Multiplication is the straightforward one: tops together, bottoms together, reduce. 2/3 times 4/5 is 8/15.',
        'Division flips the second fraction and then multiplies. 2/3 divided by 4/5 becomes 2/3 times 5/4, which is 10/12, reducing to 5/6. Flipping the wrong fraction is the classic error here, so the steps above always name which one was inverted.'] },
      { h: 'Mixed Numbers', p: [
        'A mixed number like 2 1/3 is converted to 7/3 before any arithmetic happens, because improper fractions are far easier to compute with. The result is given back in both forms so you can quote whichever your teacher expects.'] },
    ],
    faq: [
      { q: 'Does it reduce the answer automatically?', a: 'Yes. Every result is divided by the greatest common factor of its numerator and denominator before it is shown, so 8/12 comes back as 2/3.' },
      { q: 'Can it handle negative fractions?', a: 'Yes. Enter the minus sign on the numerator. The sign is carried through the working and shown on the final answer.' },
      { q: 'What about mixed numbers?', a: 'They are converted to improper fractions internally, and the answer is given as both an improper fraction and a mixed number.' },
    ],
  },
  {
    slug: 'percentage-calculator', color: '#14b8a6', name: 'Percentage Calculator', icon: 'fa-percent',
    blurb: 'Percentage of a number, increase, decrease and reverse percentages.',
    title: 'Percentage Calculator - Increase, Decrease and Change',
    desc: 'Find a percentage of a number, work out a percentage change between two figures, or go backwards from a discounted price to the original. Free in your browser.',
    intro: 'The four percentage questions that actually come up, each with its own box.',
    sections: [
      { h: 'The Four Questions', p: [
        'Nearly every percentage problem is one of four shapes: what is X percent of Y, X is what percent of Y, what is the change from X to Y, and what was the original before a change. Mixing them up is what makes percentages feel harder than they are, so each has a separate field above rather than one box you have to reinterpret.'] },
      { h: 'Increase and Decrease Are Not Symmetrical', p: [
        'This is the part that costs marks. Add 20 percent to 100 and you get 120. Take 20 percent off 120 and you get 96, not 100, because the second 20 percent is measured against a larger number. The two operations do not cancel out.',
        'To undo a 20 percent rise you divide by 1.2, which is exactly what the reverse box does.'] },
      { h: 'Percentage Points Are a Different Unit', p: [
        'If a rate moves from 5 percent to 7 percent, that is a rise of two percentage points, but a 40 percent increase in the rate itself. Both statements are true and they describe the same move. Saying which one you mean avoids an argument later.'] },
      { h: 'Doing It in Your Head', p: [
        'Ten percent is a decimal point moved one place left. Five percent is half of that, and one percent is the point moved twice. Most everyday percentages can be assembled from those three: 17.5 percent is 10 plus 5 plus half of 5, which is quick enough to do while the calculator is still loading.'] },
    ],
    faq: [
      { q: 'How do I reverse a discount?', a: 'Divide the sale price by one minus the discount as a decimal. A 30 percent discount means dividing by 0.7. The reverse box above does this for you.' },
      { q: 'What is the difference between percent and percentage points?', a: 'Percentage points measure the gap between two percentages. Percent measures the relative change. Moving from 5 to 7 percent is two points, and also a 40 percent increase.' },
      { q: 'Can a percentage be more than 100?', a: 'Yes. Anything more than doubling exceeds 100 percent, and percentage increases are routinely far larger than that.' },
    ],
  },
  {
    slug: 'prime-checker', color: '#dc2626', name: 'Prime Number Checker', icon: 'fa-hashtag',
    blurb: 'Test whether a number is prime and see its factors if it is not.',
    title: 'Prime Number Checker - Test Any Number Instantly',
    desc: 'Check whether a number is prime and, when it is not, see the factors that prove otherwise. Includes the square root shortcut and why 1 is not counted as prime.',
    intro: 'Type a number, find out whether anything divides into it.',
    sections: [
      { h: 'What Makes a Number Prime', p: [
        'A prime has exactly two distinct divisors: itself and one. That wording matters, because it is what rules out the number 1, which has only a single divisor and therefore fails the test. 2 qualifies and is the only even number that ever will, since every other even number is divisible by 2.'] },
      { h: 'You Only Need to Check to the Square Root', p: [
        'To test 97 you do not divide by every number below it. Factors come in pairs that multiply to the original, and one of each pair is always at or below the square root. Since the square root of 97 is a little under 10, checking 2, 3, 5 and 7 settles it. Nothing divides in, so 97 is prime.',
        'That shortcut is why testing a six-digit number is still instant rather than a thousand divisions.'] },
      { h: 'Why Anyone Cares', p: [
        'Primes are the building blocks of every other whole number: any integer above 1 is either prime or a unique product of primes. That uniqueness is what makes prime factorisation useful for finding common denominators, simplifying fractions, and the key exchange behind most encrypted connections.'] },
      { h: 'Reading the Factor List', p: [
        'When a number is not prime this page lists what divides it. 91 looks prime to most people until you see 7 times 13. Seeing the factor pair is usually more useful than the yes or no answer on its own.'] },
    ],
    faq: [
      { q: 'Is 1 a prime number?', a: 'No. A prime needs exactly two distinct divisors, and 1 only has one. Excluding it keeps prime factorisation unique, which is why the definition is written that way.' },
      { q: 'Is 2 really prime?', a: 'Yes, and it is the only even prime. Every other even number has 2 as a factor on top of 1 and itself.' },
      { q: 'How large a number can it test?', a: 'Anything within JavaScript safe integer range checks instantly, because only divisors up to the square root are tried.' },
    ],
  },
  {
    slug: 'gcf-lcm-calculator', color: '#2563eb', name: 'GCF and LCM Calculator', icon: 'fa-layer-group',
    blurb: 'Greatest common factor and lowest common multiple, with the factors listed.',
    title: 'GCF and LCM Calculator - Factors and Multiples Fast',
    desc: 'Find the greatest common factor and lowest common multiple of two or more numbers, see the factor lists behind both, and stop confusing which one you need.',
    intro: 'Both answers at once, with the working that separates them.',
    sections: [
      { h: 'Telling Them Apart', p: [
        'The greatest common factor is the largest number that divides into all of your numbers. It is always less than or equal to the smallest one you entered. The lowest common multiple is the smallest number they all divide into, and it is always at least as large as the biggest one you entered.',
        'If your answer is bigger than every input, it is an LCM. If it is smaller, it is a GCF. That single check catches most mix-ups.'] },
      { h: 'Where Each One Is Used', p: [
        'Adding fractions needs the LCM, because that is the common denominator. Reducing a fraction needs the GCF, because that is what you divide top and bottom by. Same two numbers, opposite operations, which is exactly why they are so easy to swap by accident.'] },
      { h: 'The Prime Factor Method', p: [
        'Break both numbers into primes. For the GCF, take each shared prime at the lowest power present; for the LCM, take every prime at the highest power. With 12 as 2 squared times 3 and 18 as 2 times 3 squared, the GCF is 2 times 3 which is 6, and the LCM is 4 times 9 which is 36.'] },
      { h: 'The Shortcut Worth Remembering', p: [
        'For any two numbers, the GCF multiplied by the LCM equals the two numbers multiplied together. 6 times 36 is 216, and 12 times 18 is also 216. Find one and the other follows by division.'] },
    ],
    faq: [
      { q: 'Which one do I need for adding fractions?', a: 'The lowest common multiple of the denominators. That becomes the common denominator you rewrite both fractions over.' },
      { q: 'Can the GCF be 1?', a: 'Yes. Numbers with no shared factor beyond 1, such as 8 and 15, are called coprime and their GCF is 1.' },
      { q: 'Does it work with more than two numbers?', a: 'Yes. The same rules apply across the whole set, taking shared primes at the lowest power for GCF and all primes at the highest for LCM.' },
    ],
  },
  {
    slug: 'roman-numeral-converter', color: '#64748b', name: 'Roman Numeral Converter', icon: 'fa-landmark',
    blurb: 'Convert numbers to Roman numerals and read numerals back as numbers.',
    title: 'Roman Numeral Converter - Both Directions, Free',
    desc: 'Turn a number into Roman numerals or read a numeral back as a number, with the subtraction rule explained and the limits of the system spelled out.',
    intro: 'Numbers to numerals and numerals to numbers, either way round.',
    sections: [
      { h: 'The Seven Letters', p: [
        'I is 1, V is 5, X is 10, L is 50, C is 100, D is 500 and M is 1000. Every Roman numeral is built from those seven and nothing else, which is why the system struggles past a few thousand.'] },
      { h: 'The Subtraction Rule', p: [
        'A smaller letter before a larger one is subtracted rather than added, which is why IV is 4 and IX is 9. Only six pairs are permitted: IV, IX, XL, XC, CD and CM. Anything else, such as IL for 49, is not valid, however sensible it looks. 49 is XLIX.',
        'The rule exists to stop four identical letters in a row, so IIII gives way to IV.'] },
      { h: 'What the System Cannot Do', p: [
        'There is no zero, no way to write a negative, and no fraction. The largest value writable with the standard seven letters is 3999, or MMMCMXCIX. Above that, historical texts used a bar over a letter to multiply it by a thousand, a convention this converter does not use because it renders inconsistently.'] },
      { h: 'Where You Still Meet Them', p: [
        'Clock faces, book chapters, film copyright lines, monarch and pope names, and the Super Bowl. Reading them is a more useful skill than writing them, which is why the reverse direction on this page gets more use than the forward one.'] },
    ],
    faq: [
      { q: 'Why is 49 XLIX and not IL?', a: 'Only six subtractive pairs are valid: IV, IX, XL, XC, CD and CM. IL is not one of them, so 49 is built as XL (40) followed by IX (9).' },
      { q: 'What is the biggest number I can write?', a: '3999, written MMMCMXCIX, using the standard seven letters without overline notation.' },
      { q: 'Is there a Roman zero?', a: 'No. The system has no symbol for zero and no way to express negative numbers or fractions.' },
    ],
  },
  {
    slug: 'times-table', color: '#10b981', name: 'Times Table Generator', icon: 'fa-table',
    blurb: 'Print or practise any multiplication table up to whatever range you need.',
    title: 'Times Table Generator - Any Number, Any Range',
    desc: 'Generate a clean multiplication table for any number and range, ready to read on screen or print for practice. Includes the tricks that cut memorisation down.',
    intro: 'Pick a number and a range, get a table you can actually read.',
    sections: [
      { h: 'Tables Are Smaller Than They Look', p: [
        'The twelve by twelve grid has 144 squares, which sounds like a lot to learn. It is not. Because 7 times 8 and 8 times 7 give the same answer, almost half the grid is a mirror image of the other half. Strike out the ones, twos, fives and tens, which most people already know, and the genuinely unfamiliar set is closer to fifteen facts.'] },
      { h: 'The Ones Worth Knowing Cold', p: [
        'Nines have a check built in: the digits of every answer in the nine times table add to nine. 9 times 7 is 63, and 6 plus 3 is 9. If your answer fails that test it is wrong.',
        'Fours are just doubling twice, and eights are doubling three times. 8 times 6 becomes 6 to 12 to 24 to 48, which is faster than recalling it for most people.'] },
      { h: 'Why Speed Matters Later', p: [
        'Fluent tables are the difference between long division being tedious and being impossible. The same goes for simplifying fractions, factorising, and spotting that a number is divisible before you commit to a method. Time spent here is repaid in every topic that follows.'] },
      { h: 'Using the Table', p: [
        'Set the number and how far you want it to run. The generated grid prints cleanly in black and white, which is usually what a practice sheet needs to be.'] },
    ],
    faq: [
      { q: 'How far can the table go?', a: 'Well past the usual twelve. Set whatever upper limit you need and the grid is generated to match.' },
      { q: 'Can I print it?', a: 'Yes. The table is plain HTML and prints cleanly without the surrounding page furniture.' },
      { q: 'Which tables are hardest?', a: 'Sevens and eights, because they lack the pattern shortcuts that nines, fives and tens have. Those are worth drilling directly.' },
    ],
  },
  {
    slug: 'exponent-calculator', color: '#f43f5e', name: 'Exponent Calculator', icon: 'fa-superscript',
    blurb: 'Powers, roots and negative or fractional exponents, worked out.',
    title: 'Exponent Calculator - Powers, Roots and Indices',
    desc: 'Raise any number to a power, including negative and fractional exponents, and see what each one means. Covers the index laws and why anything to the zero is 1.',
    intro: 'Any base, any exponent, including the ones that look strange.',
    sections: [
      { h: 'What the Exponent Counts', p: [
        'An exponent counts how many times the base is multiplied by itself. Two to the fifth is 2 times 2 times 2 times 2 times 2, which is 32. That plain reading covers positive whole numbers and nothing else, which is where the confusion usually starts.'] },
      { h: 'Negative and Fractional Exponents', p: [
        'A negative exponent means a reciprocal, not a negative answer. Two to the minus three is one over two cubed, which is one eighth, and is firmly positive.',
        'A fractional exponent is a root. Nine to the power of one half is the square root of nine, which is 3. Eight to the power of one third is the cube root of eight, which is 2. Combining the two, 8 to the power of minus one third is one half.'] },
      { h: 'Why Anything to the Zero Is 1', p: [
        'Dividing powers subtracts exponents, so 2 to the fifth divided by 2 to the fifth is 2 to the zero. Any number divided by itself is 1, so 2 to the zero must be 1. The same reasoning holds for every base except zero itself, where it is left undefined.'] },
      { h: 'The Laws Worth Memorising', p: [
        'Multiplying powers of the same base adds exponents, dividing subtracts them, and a power raised to a power multiplies them. Those three cover most of what an exam will ask, and they are the reason index questions can usually be simplified before anything is calculated.'] },
    ],
    faq: [
      { q: 'What does a negative exponent mean?', a: 'A reciprocal. Two to the minus three is one over two cubed, which equals one eighth. The result stays positive.' },
      { q: 'What is a fractional exponent?', a: 'A root. The power of one half is a square root, one third is a cube root, and so on for any denominator.' },
      { q: 'Why is anything to the power of zero equal to 1?', a: 'Because dividing a power by itself subtracts the exponents to zero, and any number divided by itself is 1. Zero to the zero is the exception and is left undefined.' },
    ],
  },
  {
    slug: 'ratio-calculator', color: '#eab308', name: 'Ratio Calculator', icon: 'fa-scale-balanced',
    blurb: 'Simplify ratios, scale them up or down, and solve for a missing part.',
    title: 'Ratio Calculator - Simplify, Scale and Solve',
    desc: 'Reduce a ratio to its simplest form, scale a recipe or plan up and down, or find the missing number in an equivalent pair. Free, with the working shown.',
    intro: 'Simplify, scale, or fill in the missing part of a ratio.',
    sections: [
      { h: 'Simplifying a Ratio', p: [
        'Divide every part by their greatest common factor. 12:18 has a GCF of 6, so it reduces to 2:3. A simplified ratio says the same thing with smaller numbers, which makes two ratios far easier to compare.'] },
      { h: 'Scaling Without Breaking It', p: [
        'Whatever you do to one part you do to all of them. Doubling a recipe written 2:3:5 gives 4:6:10, and the proportions are untouched. Adding two to each part instead gives 4:5:7, which is a completely different mixture and the most common ratio mistake there is.'] },
      { h: 'Ratio Against Fraction', p: [
        'A ratio of 2:3 means five parts in total, so the first share is two fifths of the whole, not two thirds. Sharing 40 sweets in a 2:3 ratio gives 16 and 24. Reading a ratio as if it were a fraction is what produces the wrong split.'] },
      { h: 'Finding a Missing Part', p: [
        'Equivalent ratios cross-multiply. If 3:4 equals 9:x, then 3x is 36 and x is 12. That single step handles scale drawings, map distances and unit pricing, which are the same question wearing different clothes.'] },
    ],
    faq: [
      { q: 'How do I share an amount in a given ratio?', a: 'Add the parts to get the total number of shares, divide the amount by that total, then multiply by each part. For 40 in 2:3, one share is 8, giving 16 and 24.' },
      { q: 'Is 2:3 the same as two thirds?', a: 'No. 2:3 means two parts out of five in total, which is two fifths of the whole.' },
      { q: 'Can a ratio have three parts?', a: 'Yes. Simplify and scale it exactly the same way, applying every operation to all parts at once.' },
    ],
  },
  {
    slug: 'base-converter', color: '#0891b2', name: 'Number Base Converter', icon: 'fa-right-left',
    blurb: 'Convert between binary, decimal, octal and hexadecimal.',
    title: 'Number Base Converter - Binary, Hex, Octal, Decimal',
    desc: 'Convert a number between binary, octal, decimal and hexadecimal, and see why hex is grouped in fours. Free browser tool for computing and maths homework.',
    intro: 'One number, shown in every base that matters.',
    sections: [
      { h: 'What a Base Actually Changes', p: [
        'Only the notation. The quantity is identical whichever base you write it in: decimal 255, binary 11111111 and hexadecimal FF all describe the same number of things. What changes is how many symbols are available before you need another column.'] },
      { h: 'Why Computers Use Binary', p: [
        'A circuit is reliably either on or off, and two states map exactly onto two digits. Every larger structure, from an integer to a video frame, is built from those. Binary is unreadable at length for people, though, which is where hexadecimal comes in.'] },
      { h: 'Hexadecimal Is Compressed Binary', p: [
        'Sixteen is two to the fourth, so one hex digit stands in for exactly four binary digits with no arithmetic needed. 1111 becomes F, and 11111111 becomes FF. That is why colour codes, memory addresses and byte dumps are written in hex rather than binary: it is four times shorter and converts back mechanically.'] },
      { h: 'Converting by Hand', p: [
        'To go from decimal, divide repeatedly by the target base and read the remainders bottom to top. To come back, multiply each digit by its place value and add. 1011 in binary is 8 plus 0 plus 2 plus 1, which is 11.'] },
    ],
    faq: [
      { q: 'Why does hex use letters?', a: 'Base sixteen needs sixteen single-character digits. After 0 to 9 the letters A to F cover the values ten to fifteen.' },
      { q: 'How do binary and hex relate?', a: 'One hex digit equals exactly four binary digits, so conversion between them is grouping rather than calculating.' },
      { q: 'What is octal used for?', a: 'Base eight groups binary in threes. It survives mainly in Unix file permissions, where 755 and 644 are octal.' },
    ],
  },
];
