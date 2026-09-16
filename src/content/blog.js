/*
 * Blog posts. Practical rather than reference; the guides cover the theory.
 * Written for this site only.
 */
module.exports = [
  {
    slug: 'calculator-mistakes-that-cost-marks', name: 'Calculator Mistakes That Cost Marks',
    title: 'Calculator Mistakes That Quietly Cost You Marks',
    desc: 'Six errors that produce a confident wrong answer: degrees against radians, minus signs, implied brackets, rounding early, and skipping the estimate.',
    blurb: 'Six ways a calculator hands you a confident wrong answer.',
    date: '2026-09-16',
    sections: [
      { h: 'Degrees Against Radians', p: [
        'This one wrecks whole trigonometry papers. Sine of 30 is 0.5 in degrees and about -0.988 in radians, and the calculator will not warn you which mode it is in. Check the display indicator before the first trig question rather than after the last one.',
        'If an answer is wildly off and the working looks right, mode is the first thing to check.'] },
      { h: 'The Minus Sign That Is Not a Subtraction', p: [
        'Scientific calculators separate the subtract key from the negative key. Entering -3 squared with the subtract key gives -9, because it reads as the negative of 3 squared. Using the negative key gives 9, because it squares negative three.',
        'Both are correct interpretations of different expressions, which is exactly why it is dangerous.'] },
      { h: 'Brackets You Assumed Were There', p: [
        'Typing 6 divided by 2 plus 4 gets you 7, because the calculator divides by 2 first. If the fraction bar on paper covered the whole of 2 plus 4, the answer is 1. The calculator cannot see your paper. Type the brackets.'] },
      { h: 'Rounding on the Way Through', p: [
        'Rounding an intermediate value and then continuing bakes the error into everything after it. Keep full precision until the end, or use the answer memory rather than retyping a shortened number.'] },
      { h: 'Trusting the Screen Over an Estimate', p: [
        'Before you press equals, know roughly what to expect. If 19.8 times 4.1 should be about 80 and the screen says 8.1, you have caught a typo that would otherwise have been copied straight onto the answer line.',
        'A rough estimate takes two seconds and catches the majority of input errors.'] },
      { h: 'Leaving Memory Loaded', p: [
        'A value left in memory or a constant still active from the previous question quietly contaminates the next one. Clear between questions; it costs one keypress.'] },
    ],
  },
  {
    slug: 'estimating-before-you-calculate', name: 'Estimating Before You Calculate',
    title: 'Estimate First: The Habit That Catches Typos',
    desc: 'How to get a rough answer in a couple of seconds, why it catches most calculator slips, and the rounding tricks that make mental estimation reliable.',
    blurb: 'A two-second habit that catches most input errors.',
    date: '2026-09-16',
    sections: [
      { h: 'Why Bother When You Have a Calculator', p: [
        'Because the calculator is not the weak point. It computes exactly what it was given, and what it was given is where mistakes live. An estimate is the only cheap check on whether the input was what you meant.',
        'It is the difference between an answer being wrong and being wrong without anyone noticing.'] },
      { h: 'Round to One Significant Figure', p: [
        'Turn every number into a single digit and a power of ten, then work with those. 312 times 47 becomes 300 times 50, which is 15,000. The real answer is 14,664, close enough to confirm the order of magnitude and the leading digit.'] },
      { h: 'Know Which Way You Pushed It', p: [
        'If you rounded both numbers up, your estimate is too high, and the true answer must be lower. Tracking the direction turns a vague ballpark into a bound, which is far more useful.'] },
      { h: 'Division by Compatible Numbers', p: [
        'Adjust both numbers to something that divides cleanly rather than rounding each independently. 412 divided by 7.9 is easier as 400 divided by 8, which is 50. The real answer is 52.2.'] },
      { h: 'Percentages in Your Head', p: [
        'Ten percent is one decimal shift. Five percent is half of that, one percent is two shifts. Assemble the rest: 35 percent is 10 plus 10 plus 10 plus 5. Most real percentage questions can be estimated faster than they can be typed.'] },
      { h: 'Where It Pays Off Most', p: [
        'Long multi-step problems, anything involving unit conversion, and money. Those are the places where a misplaced decimal survives to the final line unnoticed, and where an estimate would have flagged it at the first step.'] },
    ],
  },
  {
    slug: 'why-chromebooks-need-browser-tools', name: 'Why Chromebooks Need Browser Tools',
    title: 'Why School Chromebooks Need Browser-Based Tools',
    desc: 'Managed Chromebooks block installs by design. What that means for classroom software, and why a page that runs entirely client-side sidesteps the problem.',
    blurb: 'Locked-down devices, and the software that still works on them.',
    date: '2026-09-16',
    sections: [
      { h: 'The Device Most Students Actually Have', p: [
        'School fleets standardised on Chromebooks because they are cheap, centrally managed and hard to break. The same management that makes them practical also means a student cannot install anything, and usually cannot approve an extension either.',
        'Any tool that needs installing is therefore not available to the people who most need it.'] },
      { h: 'What Gets Blocked', p: [
        'Installs, extensions, and often whole categories of domains. Policies vary by district, but the pattern is consistent: the browser works, and very little else is negotiable.'] },
      { h: 'Why Client-Side Matters Here', p: [
        'A page that does its work in JavaScript on the device needs nothing but the page itself. No account, no server round trip for each calculation, no data leaving the machine. That last point is what lets a tool be used without a data-processing agreement, because there is no data to process.'] },
      { h: 'Offline and Flaky Connections', p: [
        'Once a client-side page has loaded, it keeps working if the connection drops, because nothing further is being fetched. On school wifi at 9am that is a real advantage over anything that queries a server per keystroke.'] },
      { h: 'What to Look For', p: [
        'A tool worth using on a managed device loads in one request, works without signing in, and does not ask for permissions it has no use for. If a calculator wants an account, the account is the product.'] },
    ],
  },
  {
    slug: 'reading-a-question-before-solving-it', name: 'Reading a Question Before Solving It',
    title: 'Read the Question Twice, Solve It Once',
    desc: 'Most lost marks are comprehension, not arithmetic. How to spot what a question actually asks, the units it wants, and the form the answer should take.',
    blurb: 'Most lost marks are comprehension, not arithmetic.',
    date: '2026-09-16',
    sections: [
      { h: 'Where Marks Actually Go', p: [
        'Look at a marked paper and the pattern is rarely broken arithmetic. It is the right method applied to a slightly different question: the area when the perimeter was asked for, the discount instead of the final price, the answer in metres when the question said centimetres.',
        'Those are reading errors, and they are cheaper to fix than any amount of extra practice.'] },
      { h: 'Find the Actual Verb', p: [
        'Underline what the question tells you to produce. Calculate, estimate, explain, compare and prove all demand different things, and an explanation written where a proof was requested will not score full marks however true it is.'] },
      { h: 'Check the Units Before You Start', p: [
        'If lengths arrive in centimetres and the answer must be in square metres, decide when you are converting before you calculate, not after. Converting halfway through a chain of working is where factors of a hundred go missing.'] },
      { h: 'Note the Required Form', p: [
        '"Give your answer to three significant figures", "leave it in terms of pi", "as a fraction in simplest form". Each of those is a mark. Circle the instruction while you read it so the finished answer gets the right treatment.'] },
      { h: 'Ask What Would Be Reasonable', p: [
        'A person is not 4 metres tall and a bus fare is not 900 pounds. Holding a rough sense of a plausible answer before starting means an implausible result gets questioned rather than written down.'] },
      { h: 'Re-read Before You Move On', p: [
        'Ten seconds checking that the answer matches what was asked catches the majority of these errors. It is the highest-return habit available in an exam, and it costs nothing but discipline.'] },
    ],
  },
];
