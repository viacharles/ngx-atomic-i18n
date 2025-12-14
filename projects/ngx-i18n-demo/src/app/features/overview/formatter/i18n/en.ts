const en = {
  intro: 'Play with ICU formatting using live inputs below.',
  section: {
    basic: { title: 'Basic interpolation' },
    plural: { title: 'Plural formatting' },
    select: { title: 'Select formatting' },
    exact: { title: 'Exact matches & "other" fallback' },
    nested: { title: 'Nested ICU blocks' },
    interpolation: { title: 'Interpolation inside ICU options' },
    invalid: { title: 'Invalid ICU & untouched text' },
    missing: { title: 'Missing parameters' },
  },
  basic: {
    title: 'Basic interpolation',
    sub: 'Replace {{name}} and {{count}} with parameter values without any ICU logic.',
    show: 'Hello, {{name}}! You have {{count}} tasks waiting.',
  },
  plural: {
    title: 'Plural formatting',
    sub: 'Test {count, plural, one {...} other {...}} patterns and # replacement for numbers.',
    show: '{count, plural, =0 {No items} one {1 item} other {# items}}',
  },
  select: {
    title: 'Select formatting',
    sub: 'Switch text based on string values like gender, role, or status using {kind, select, ...}.',
    show: '{kind, select, male {He is online} female {She is online} other {They are online}}',
  },
  exact: {
    title: 'Exact matches & "other" fallback',
    sub: 'Try =0, =1, and other exact-value options and see how the other branch is used as a fallback.',
    show: '{count, plural, =0 {no one} =1 {just one person} =2 {a couple} =3 {a three-person squad} =4 {a group of four} other {# people and treat it as a big group}}',
  },
  nested: {
    title: 'Nested ICU blocks',
    sub: 'Combine plural and select blocks inside each other to test recursive parsing.',
    show: '{count, plural, one {{role, select, vip {VIP has one ticket} member {Member has one ticket} other {Guest has one ticket}}} other {{role, select, vip {VIP has # tickets} member {Member has # tickets} other {Guest has # tickets}}}}',
  },
  interpolation: {
    title: 'Interpolation inside ICU options',
    sub: 'Use {{name}}, {count}, and other placeholders inside plural/select branches.',
    show: '{count, plural, one {{name} has one ticket} other {{name} has # tickets}}',
  },
  invalid: {
    title: 'Invalid ICU & untouched text',
    sub: 'See how malformed ICU patterns are handled and when the original block is left unchanged.',
    show: '{count, plural, one {One item} other {# items}',
  },
  missing: {
    title: 'Missing parameters',
    sub: 'Test how the formatter behaves when some variables are not provided in params.',
    show: 'Hello {{name}}, you have {{count}} messages.',
  },
  label: {
    name: 'Name',
    count: 'Count',
    kind: 'Kind',
    role: 'Role',
  },
  // option
  female: 'Female',
  male: 'Male',
  other: 'Other',
  vip: 'VIP',
  member: 'Member',
  guest: 'Guest',
};

export default en;
