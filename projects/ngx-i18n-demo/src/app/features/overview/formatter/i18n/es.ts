import en from "./en";

const es: typeof en = {
  intro: 'Prueba el formato ICU con las entradas en vivo de abajo.',
  section: {
    basic: { title: 'Interpolación básica' },
    plural: { title: 'Formato plural' },
    select: { title: 'Formato select' },
    exact: { title: 'Coincidencias exactas y fallback "other"' },
    nested: { title: 'Bloques ICU anidados' },
    interpolation: { title: 'Interpolación dentro de opciones ICU' },
    invalid: { title: 'ICU inválido y texto intacto' },
    missing: { title: 'Parámetros faltantes' },
  },
  basic: {
    title: 'Interpolación básica',
    sub: 'Sustituye {{name}} y {{count}} con valores de parámetros sin lógica ICU.',
    show: 'Hola, {{name}}. Tienes {{count}} tareas pendientes.',
  },
  plural: {
    title: 'Formato plural',
    sub: 'Prueba patrones {count, plural, one {...} other {...}} y reemplazo # para números.',
    show: '{count, plural, =0 {Sin elementos} one {1 elemento} other {# elementos}}',
  },
  select: {
    title: 'Formato select',
    sub: 'Cambia el texto según valores string como género, rol o estado usando {kind, select, ...}.',
    show: '{kind, select, male {Él está en línea} female {Ella está en línea} other {Están en línea}}',
  },
  exact: {
    title: 'Coincidencias exactas y fallback "other"',
    sub: 'Prueba =0, =1 y otros valores exactos y cómo se usa la rama other como fallback.',
    show: '{count, plural, =0 {nadie} =1 {solo una persona} =2 {un par} =3 {un escuadrón de tres} =4 {un grupo de cuatro} other {# personas, un grupo grande}}',
  },
  nested: {
    title: 'Bloques ICU anidados',
    sub: 'Combina bloques plural y select dentro de otros para probar el parseo recursivo.',
    show: '{count, plural, one {{role, select, vip {VIP tiene un ticket} member {El miembro tiene un ticket} other {El invitado tiene un ticket}}} other {{role, select, vip {VIP tiene # tickets} member {El miembro tiene # tickets} other {El invitado tiene # tickets}}}}',
  },
  interpolation: {
    title: 'Interpolación dentro de opciones ICU',
    sub: 'Usa {{name}}, {count} y otros placeholders dentro de ramas plural/select.',
    show: '{count, plural, one {{name} tiene un ticket} other {{name} tiene # tickets}}',
  },
  invalid: {
    title: 'ICU inválido y texto intacto',
    sub: 'Observa cómo se maneja un ICU malformado y cuándo se deja el bloque original.',
    show: '{count, plural, one {Un elemento} other {# elementos}',
  },
  missing: {
    title: 'Parámetros faltantes',
    sub: 'Prueba cómo se comporta el formateador cuando faltan variables en params.',
    show: 'Hola {{name}}, tienes {{count}} mensajes.',
  },
  label: {
    name: 'Nombre',
    count: 'Cantidad',
    kind: 'Tipo',
    role: 'Rol',
  },
  // option
  female: 'Femenino',
  male: 'Masculino',
  other: 'Otro',
  vip: 'VIP',
  member: 'Miembro',
  guest: 'Invitado',
};

export default es;
