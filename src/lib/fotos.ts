/** Comprime una foto a 1200 px de lado largo, JPEG 0.8 (8.1). Si falla, devuelve el archivo tal cual. */
export async function comprimirFoto(archivo: File, ladoMax = 1200, calidad = 0.8): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(archivo)
    const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * escala)
    const h = Math.round(bitmap.height * escala)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return archivo
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? archivo), 'image/jpeg', calidad))
  } catch {
    return archivo
  }
}
