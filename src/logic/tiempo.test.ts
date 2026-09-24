import { describe, it, expect } from 'vitest'
import { mmss } from '../hooks/useCuentaRegresiva'
import { urlAtajo } from '../lib/atajos'

describe('timer por hora de término', () => {
  it('formatea lo que falta redondeando hacia arriba', () => {
    expect(mmss(90_000)).toBe('1:30')
    expect(mmss(89_400)).toBe('1:30')
    expect(mmss(500)).toBe('0:01')
    expect(mmss(0)).toBe('0:00')
    expect(mmss(-4000)).toBe('0:00')
  })
})

describe('atajo de descanso', () => {
  it('arma la URL con el nombre codificado y los segundos', () => {
    expect(urlAtajo(72.4)).toBe('shortcuts://run-shortcut?name=FM%20Descanso&input=text&text=72')
    expect(urlAtajo(0)).toMatch(/text=1$/)
  })
})
