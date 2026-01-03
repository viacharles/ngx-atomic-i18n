import en from "./en";

const ja: typeof en = {
  intro: '以下のライブ入力で ICU フォーマットを試してください。',
  section: {
    basic: { title: '基本の補間' },
    plural: { title: '複数形フォーマット' },
    select: { title: 'Select フォーマット' },
    exact: { title: '完全一致と "other" フォールバック' },
    nested: { title: 'ネストした ICU ブロック' },
    interpolation: { title: 'ICU オプション内の補間' },
    invalid: { title: '無効な ICU と未加工テキスト' },
    missing: { title: 'パラメータ不足' },
  },
  basic: {
    title: '基本の補間',
    sub: 'ICU を使わずに {{name}} と {{count}} をパラメータ値で置換します。',
    show: 'こんにちは、{{name}}！未処理のタスクが {{count}} 件あります。',
  },
  plural: {
    title: '複数形フォーマット',
    sub: '{count, plural, one {...} other {...}} のパターンと # の数値置換をテストします。',
    show: '{count, plural, =0 {アイテムなし} one {1 件} other {# 件}}',
  },
  select: {
    title: 'Select フォーマット',
    sub: 'gender/role/status などの文字列値で {kind, select, ...} を使い文言を切り替えます。',
    show: '{kind, select, male {彼はオンラインです} female {彼女はオンラインです} other {オンラインです}}',
  },
  exact: {
    title: '完全一致と "other" フォールバック',
    sub: '=0、=1 など完全一致オプションと other のフォールバック挙動を試します。',
    show: '{count, plural, =0 {誰もいません} =1 {1 人だけ} =2 {2 人組} =3 {3 人チーム} =4 {4 人グループ} other {# 人の大所帯}}',
  },
  nested: {
    title: 'ネストした ICU ブロック',
    sub: '複数形と select を組み合わせて再帰的な解析を試します。',
    show: '{count, plural, one {{role, select, vip {VIP は1枚持っています} member {メンバーは1枚持っています} other {ゲストは1枚持っています}}} other {{role, select, vip {VIP は#枚持っています} member {メンバーは#枚持っています} other {ゲストは#枚持っています}}}}',
  },
  interpolation: {
    title: 'ICU オプション内の補間',
    sub: '{{name}} や {count} などのプレースホルダを plural/select の分岐内で使います。',
    show: '{count, plural, one {{name} は1枚持っています} other {{name} は#枚持っています}}',
  },
  invalid: {
    title: '無効な ICU と未加工テキスト',
    sub: '不正な ICU パターンの扱いと、元のブロックがそのまま残るケースを確認します。',
    show: '{count, plural, one {1 件} other {# 件}',
  },
  missing: {
    title: 'パラメータ不足',
    sub: 'params に一部の変数が無い場合の挙動を確認します。',
    show: 'こんにちは {{name}}、未読メッセージが {{count}} 件あります。',
  },
  label: {
    name: '名前',
    count: '件数',
    kind: '種別',
    role: 'ロール',
  },
  // option
  female: '女性',
  male: '男性',
  other: 'その他',
  vip: 'VIP',
  member: 'メンバー',
  guest: 'ゲスト',
};

export default ja;
