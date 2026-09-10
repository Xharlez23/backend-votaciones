import { db } from "./firebaseClient";


async function seed() {
  const aprendices = [
    { cedula: '1001', nombre: 'Andrea Ramírez', ficha: '2589401', programa: 'Análisis y Desarrollo de Software', jornada: 'MANANA' },
    { cedula: '1002', nombre: 'Felipe Castro', ficha: '2589401', programa: 'Análisis y Desarrollo de Software', jornada: 'MANANA' },
    { cedula: '1004', nombre: 'Sebastián Vargas', ficha: '2589402', programa: 'Contabilidad y Finanzas', jornada: 'TARDE' },
  ];

  for (const a of aprendices) {
    await db.collection('aprendices').doc(a.cedula).set({
      nombre: a.nombre, ficha: a.ficha, programa: a.programa, jornada: a.jornada
    });
  }

  const candidatos = [
    { nombre: 'Juan Pérez', ficha: '2589401', jornada: 'MANANA', numero_tarjeton: 1, activo: true, foto_url: '' },
    { nombre: 'María Gómez', ficha: '2589401', jornada: 'MANANA', numero_tarjeton: 2, activo: true, foto_url: '' },
  ];

  for (const c of candidatos) {
    await db.collection('candidatos').add(c);
  }

  console.log('Datos de prueba cargados.');
}

seed();