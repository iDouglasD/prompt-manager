import "@testing-library/jest-dom"

import { webcrypto } from "node:crypto"
import { TextDecoder, TextEncoder } from "node:util"

// biome-ignore lint/suspicious/noExplicitAny: Polyfill for TextEncoder/TextDecoder and crypto in Jest environment
;(globalThis as any).TextEncoder = TextEncoder
// biome-ignore lint/suspicious/noExplicitAny: Polyfill for TextEncoder/TextDecoder and crypto in Jest environment
;(globalThis as any).TextDecoder = TextDecoder
// biome-ignore lint/suspicious/noExplicitAny: Polyfill for TextEncoder/TextDecoder and crypto in Jest environment
if (!(globalThis as any).crypto) {
  // biome-ignore lint/suspicious/noExplicitAny: Polyfill for TextEncoder/TextDecoder and crypto in Jest environment
  ;(globalThis as any).crypto = webcrypto
}

expect.extend({})
