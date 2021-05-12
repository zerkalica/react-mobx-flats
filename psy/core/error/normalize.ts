import { psyDataIsPromise } from '../data/isPromise'

export const wm = new WeakMap<Object, Error>()

export class PsyErrorNormalized extends Error {
  constructor(message: string, readonly original: any) {
    super(message)
  }
}

/**
 * Convert non Error or PromiseLike to Error
 */
export function psyErrorNormalize(error: any): Error | PromiseLike<any> {
  if (psyDataIsPromise(error) || error instanceof Error) return error

  // Weakmap used to keep instance of error with same input value
  let converted = wm.get(error)

  if (!converted) {
    converted = new PsyErrorNormalized(JSON.stringify(error, null, ' '), error)
    wm.set(converted, error)
  }

  return converted
}
