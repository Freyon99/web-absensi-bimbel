/**
 * Helper respons API supaya bentuk balasan konsisten di semua route.
 *
 * - `responJson`  : balasan sukses dengan body apa pun (array/objek).
 * - `responError` : balasan kegagalan berisi `message` (+ `extra` bila perlu).
 *
 * Route tetap boleh memilih status & bentuk body; helper ini hanya menyingkat
 * `Response.json` dan menjamin kunci `message` pada error.
 */

export type ExtraRespons = Record<string, unknown>

export function responJson(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, init)
}

export function responError(status: number, message: string, extra?: ExtraRespons): Response {
  return Response.json({ message, ...extra }, { status })
}
