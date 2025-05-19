import { bind } from "./io.mjs"

/** @import { IO } from "./io.mjs" */

/** @type {function(Blob): IO<string>} */
export function blob2zcat2text(blob) {
  return () => {
    return Promise.resolve(new DecompressionStream("gzip"))
      .then((dec) => blob.stream().pipeThrough(dec))
      .then((decoded) => new Response(decoded))
      .then((res) => res.text())
  }
}

/** @type {function(string): object[]} */
export function text2jsons2objects(txt) {
  /** @type string[] */
  const splited = txt.split(/\n/)

  /** @type string[] */
  const noempty = splited.filter((s) => 0 < s.length)

  return noempty.map((txt) => JSON.parse(txt))
}

/**
 * @template T
 * @param {T[]} objs
 * @returns {ArrayIterator<T>}
 */
export function objs2iter(objs) {
  return objs[Symbol.iterator]()
}

/** @type {function(Blob): IO<object[]>} */
export function blob2zcat2jsonl2jsons2objects(blob) {
  /** @type IO<string> */
  const ijsonl = blob2zcat2text(blob)

  return bind(
    ijsonl,
    (jsonl) => () => Promise.resolve(text2jsons2objects(jsonl)),
  )
}
