import { bind } from "./io.mjs"

import { blob2zcat2jsonl2jsons2objects } from "./gz2jsonl2objs.mjs";

/** @import { IO } from "./io.mjs" */

(() => {
  /** @type function(string): IO<Response> */
  function url2response(url) {
    return () => fetch(url)
  }

  /** @type function(Response): IO<ArrayBuffer> */
  function response2buffer(res) {
    return () => res.arrayBuffer()
  }

  /** @type function(string): IO<ArrayBuffer> */
  function url2buf(url) {
    /** @type IO<Response> */
    const ires = url2response(url)

    return bind(ires, response2buffer)
  }

  /**
   * @param {ArrayBuffer} buf
   * @returns {function(string): IO<Blob>}
   */
  function buf2zip2itemname2blob(buf) {
    return (name) => {
      return () =>
        Promise.resolve()
          .then((_) => {
            /** @ts-ignore */
            return window.JSZip.loadAsync(buf)
          })
          .then((jz) => jz.files[name])
          .then((zobj) => zobj.async("blob"))
    }
  }

  const main = () => {
    return Promise.resolve()
      .then((_) => {
        /** @type string */
        const zurl = "sample.d/sample.zip"

        /** @type IO<ArrayBuffer> */
        const ibuf = url2buf(zurl)

        /** @type IO<Blob> */
        const iblob = bind(
          ibuf,
          (buf) => buf2zip2itemname2blob(buf)("g0.jsonl.gz"),
        )

        /** @type IO<object[]> */
        const iobjs = bind(iblob, blob2zcat2jsonl2jsons2objects)

        /** @type HTMLElement? */
        const oroot = document.getElementById("app-root")

        if (!oroot) return

        /** @type HTMLElement */
        const root = oroot

        /** @type function(HTMLElement): (text: string) => IO<Void> */
        const setText = (ele) => (text) => () => {
          return Promise.resolve()
            .then((_) => {
              ele.textContent = text
            })
        }

        /** @type IO<string> */
        const ijsonl = bind(
          iobjs,
          (objs) => () => Promise.resolve(JSON.stringify(objs)),
        )

        /** @type IO<Void> */
        const iset = bind(ijsonl, (txt) => setText(root)(txt))

        return iset()
      })
  }

  main().catch(console.error)
})()
