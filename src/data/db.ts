// IndexedDB con idb. Todo vive en el teléfono.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Sesion, SetLog, Bodyweight, Photo } from './tipos'

interface GymDB extends DBSchema {
  sesiones: { key: string; value: Sesion; indexes: { fecha: string } }
  setLogs: { key: number; value: SetLog; indexes: { sessionId: string; exerciseId: string } }
  pesoCorporal: { key: string; value: Bodyweight }
  fotos: { key: string; value: Photo }
}

let dbPromise: Promise<IDBPDatabase<GymDB>> | null = null

export function db(): Promise<IDBPDatabase<GymDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GymDB>('gym-app', 1, {
      upgrade(d) {
        const s = d.createObjectStore('sesiones', { keyPath: 'id' })
        s.createIndex('fecha', 'fecha')
        const l = d.createObjectStore('setLogs', { keyPath: 'id', autoIncrement: true })
        l.createIndex('sessionId', 'sessionId')
        l.createIndex('exerciseId', 'exerciseId')
        d.createObjectStore('pesoCorporal', { keyPath: 'fecha' })
        d.createObjectStore('fotos', { keyPath: 'fecha' })
      },
    })
  }
  return dbPromise
}

// Sesiones
export async function todasLasSesiones(): Promise<Sesion[]> {
  return (await db()).getAll('sesiones')
}
export async function guardarSesion(s: Sesion): Promise<void> {
  await (await db()).put('sesiones', s)
}
export async function borrarSesion(id: string): Promise<void> {
  const d = await db()
  const tx = d.transaction(['sesiones', 'setLogs'], 'readwrite')
  await tx.objectStore('sesiones').delete(id)
  const idx = tx.objectStore('setLogs').index('sessionId')
  let cursor = await idx.openCursor(id)
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

// Sets
export async function todosLosSets(): Promise<SetLog[]> {
  return (await db()).getAll('setLogs')
}
export async function guardarSet(s: SetLog): Promise<number> {
  return (await db()).put('setLogs', s)
}
export async function borrarSet(id: number): Promise<void> {
  await (await db()).delete('setLogs', id)
}

// Peso corporal
export async function todoElPeso(): Promise<Bodyweight[]> {
  const all = await (await db()).getAll('pesoCorporal')
  return all.sort((a, b) => a.fecha.localeCompare(b.fecha))
}
export async function guardarPeso(p: Bodyweight): Promise<void> {
  await (await db()).put('pesoCorporal', p)
}
export async function borrarPeso(fecha: string): Promise<void> {
  await (await db()).delete('pesoCorporal', fecha)
}

// Fotos
export async function todasLasFotos(): Promise<Photo[]> {
  const all = await (await db()).getAll('fotos')
  return all.sort((a, b) => a.fecha.localeCompare(b.fecha))
}
export async function guardarFoto(f: Photo): Promise<void> {
  await (await db()).put('fotos', f)
}
export async function borrarFoto(fecha: string): Promise<void> {
  await (await db()).delete('fotos', fecha)
}

export async function borrarTodo(): Promise<void> {
  const d = await db()
  const tx = d.transaction(['sesiones', 'setLogs', 'pesoCorporal', 'fotos'], 'readwrite')
  await Promise.all([
    tx.objectStore('sesiones').clear(),
    tx.objectStore('setLogs').clear(),
    tx.objectStore('pesoCorporal').clear(),
    tx.objectStore('fotos').clear(),
  ])
  await tx.done
}

/** Pedir almacenamiento persistente para que iOS no borre los datos */
export async function pedirPersistencia(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist()
  } catch {
    /* sin soporte */
  }
  return false
}
