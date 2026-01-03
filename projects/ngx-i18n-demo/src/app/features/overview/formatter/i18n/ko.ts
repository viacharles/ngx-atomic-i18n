import en from "./en";

const ko: typeof en = {
  intro: '아래 라이브 입력으로 ICU 포맷팅을 직접 테스트해 보세요.',
  section: {
    basic: { title: '기본 치환' },
    plural: { title: '복수형 포맷팅' },
    select: { title: 'Select 포맷팅' },
    exact: { title: '정확히 일치 & "other" 폴백' },
    nested: { title: '중첩 ICU 블록' },
    interpolation: { title: 'ICU 옵션 내부 치환' },
    invalid: { title: '잘못된 ICU & 원문 유지' },
    missing: { title: '파라미터 누락' },
  },
  basic: {
    title: '기본 치환',
    sub: 'ICU 로직 없이 {{name}}과 {{count}}를 파라미터 값으로 바꿉니다.',
    show: '안녕하세요, {{name}}! 처리할 일이 {{count}}개 있습니다.',
  },
  plural: {
    title: '복수형 포맷팅',
    sub: '{count, plural, one {...} other {...}} 패턴과 숫자 대체 #를 테스트합니다.',
    show: '{count, plural, =0 {항목 없음} one {1개} other {#개}}',
  },
  select: {
    title: 'Select 포맷팅',
    sub: 'gender, role, status 같은 문자열 값으로 {kind, select, ...}를 사용해 문구를 전환합니다.',
    show: '{kind, select, male {그는 온라인입니다} female {그녀는 온라인입니다} other {온라인입니다}}',
  },
  exact: {
    title: '정확히 일치 & "other" 폴백',
    sub: '=0, =1 등 정확히 일치 옵션과 other 분기의 폴백 동작을 확인합니다.',
    show: '{count, plural, =0 {아무도 없음} =1 {1명뿐} =2 {2인조} =3 {3인 스쿼드} =4 {4인 그룹} other {#명 대규모}}',
  },
  nested: {
    title: '중첩 ICU 블록',
    sub: '복수형과 select를 서로 안에 넣어 재귀 파싱을 테스트합니다.',
    show: '{count, plural, one {{role, select, vip {VIP는 1장을 보유} member {멤버는 1장을 보유} other {게스트는 1장을 보유}}} other {{role, select, vip {VIP는 #장을 보유} member {멤버는 #장을 보유} other {게스트는 #장을 보유}}}}',
  },
  interpolation: {
    title: 'ICU 옵션 내부 치환',
    sub: '{{name}}, {count} 같은 플레이스홀더를 plural/select 분기 안에서 사용합니다.',
    show: '{count, plural, one {{name}은(는) 1장을 보유} other {{name}은(는) #장을 보유}}',
  },
  invalid: {
    title: '잘못된 ICU & 원문 유지',
    sub: '잘못된 ICU 패턴이 어떻게 처리되는지와 원문이 유지되는 경우를 확인합니다.',
    show: '{count, plural, one {1개} other {#개}',
  },
  missing: {
    title: '파라미터 누락',
    sub: '일부 변수가 params에 없을 때 포맷터가 어떻게 동작하는지 확인합니다.',
    show: '안녕하세요 {{name}}님, 새 메시지가 {{count}}개 있습니다.',
  },
  label: {
    name: '이름',
    count: '개수',
    kind: '종류',
    role: '역할',
  },
  // option
  female: '여성',
  male: '남성',
  other: '기타',
  vip: 'VIP',
  member: '멤버',
  guest: '게스트',
};

export default ko;
