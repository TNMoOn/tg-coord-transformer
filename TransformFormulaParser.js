import BigNumber from "bignumber.js"

export class TransformFormulaParser {
  transformFormulaId = null
  transformFormulaParams = null

  constructor({ transformFormulaId, transformFormulaParams } = {}) {
    if (transformFormulaId || transformFormulaId === 0) this.transformFormulaId = transformFormulaId
    if (transformFormulaParams) this.transformFormulaParams = transformFormulaParams
  }

  decode(fromVertice) {
    if (this.transformFormulaId === 0) {
      fromVertice = [fromVertice[1], fromVertice[0], fromVertice[2]]
      const X0 = new BigNumber(this.transformFormulaParams.X0)
      const Y0 = new BigNumber(this.transformFormulaParams.Y0)
      const x0 = new BigNumber(this.transformFormulaParams.x0)
      const y0 = new BigNumber(this.transformFormulaParams.y0)
      const c = new BigNumber(this.transformFormulaParams.c)
      const d = new BigNumber(this.transformFormulaParams.d)
      const x = new BigNumber(fromVertice[0])
      const y = new BigNumber(fromVertice[1])
      fromVertice = [
        X0.plus(c.multipliedBy(x.minus(x0))).plus(d.multipliedBy(y.minus(y0))).toNumber(),
        Y0.minus(d.multipliedBy(x.minus(x0))).plus(c.multipliedBy(y.minus(y0))).toNumber(),
        fromVertice[2],
      ]
      const toVertice = [fromVertice[1], fromVertice[0], fromVertice[2]]
      return toVertice

    } else if (this.transformFormulaId === 1) {
      const a = new BigNumber(this.transformFormulaParams.a)
      const toVertice = [
        (new BigNumber(fromVertice[0]).dividedBy(a)).toNumber(),
        (new BigNumber(fromVertice[1]).dividedBy(a)).toNumber(),
        fromVertice[2],
      ]
      return toVertice

    } else if (this.transformFormulaId === 2) {
      const x0 = this.transformFormulaParams.X0
      const y0 = this.transformFormulaParams.Y0
      const toVertice = [
        decodeBand(fromVertice[0], x0),
        decodeBand(fromVertice[1], y0),
        fromVertice[2],
      ]
      return toVertice

    } else if (this.transformFormulaId === 3) {
      const a = new BigNumber(this.transformFormulaParams.a)
      const b = new BigNumber(this.transformFormulaParams.b)
      const c = new BigNumber(this.transformFormulaParams.c)
      const d = new BigNumber(this.transformFormulaParams.d)
      const toVertice = [
        b.plus(a.multipliedBy(new BigNumber(fromVertice[0]))).toNumber(),
        d.plus(c.multipliedBy(new BigNumber(fromVertice[1]))).toNumber(),
        fromVertice[2],
      ]
      return toVertice

    } else {
      return fromVertice
    }
  }

  encode(fromVertice) {
    if (this.transformFormulaId === 0) {
      fromVertice = [fromVertice[1], fromVertice[0], fromVertice[2]]
      const X0 = new BigNumber(this.transformFormulaParams.X0)
      const Y0 = new BigNumber(this.transformFormulaParams.Y0)
      const x0 = new BigNumber(this.transformFormulaParams.x0)
      const y0 = new BigNumber(this.transformFormulaParams.y0)
      const c = new BigNumber(this.transformFormulaParams.c)
      const d = new BigNumber(this.transformFormulaParams.d)
      const x = new BigNumber(fromVertice[0])
      const y = new BigNumber(fromVertice[1])
      fromVertice = [
        c.multipliedBy(x.minus(X0)).plus(d.multipliedBy(Y0.minus(y))).dividedBy(d.multipliedBy(d).plus(c.multipliedBy(c))).plus(x0).toNumber(),
        d.multipliedBy(x.minus(X0)).plus(c.multipliedBy(y.minus(Y0))).dividedBy(d.multipliedBy(d).plus(c.multipliedBy(c))).plus(y0).toNumber(),
        fromVertice[2],
      ]

      const toVertice = [fromVertice[1], fromVertice[0], fromVertice[2]]
      return toVertice

    } else if (this.transformFormulaId === 1) {
      const a = new BigNumber(this.transformFormulaParams.a)
      const toVertice = [
        (new BigNumber(fromVertice[0]).multipliedBy(a)).toNumber(),
        (new BigNumber(fromVertice[1]).multipliedBy(a)).toNumber(),
        fromVertice[2],
      ]
      return toVertice

    } else if (this.transformFormulaId === 2) {
      const x0 = this.transformFormulaParams.X0
      const y0 = this.transformFormulaParams.Y0
      const toVertice = [
        encodeBand(fromVertice[0], x0),
        encodeBand(fromVertice[1], y0),
        fromVertice[2],
      ]
      return toVertice

    } else if (this.transformFormulaId === 3) {
      const a = new BigNumber(this.transformFormulaParams.a)
      const b = new BigNumber(this.transformFormulaParams.b)
      const c = new BigNumber(this.transformFormulaParams.c)
      const d = new BigNumber(this.transformFormulaParams.d)
      const toVertice = [
        (new BigNumber(fromVertice[0]).minus(b)).dividedBy(a).toNumber(),
        (new BigNumber(fromVertice[1]).minus(d)).dividedBy(c).toNumber(),
        fromVertice[2],
      ]
      return toVertice

    } else {
      return fromVertice
    }
  }

  static newDefaultParser() {
    return new TransformFormulaParser()
  }
}

function decodeBand(coordinate, band) {
  if (typeof (band) === "number") band = band.toString()
  if (band === "" || band === "0") return coordinate
  const offset = coordinate.toString().indexOf(band)
  return Number(coordinate.toString().slice(offset + band.length))
}

function encodeBand(coordinate, band) {
  if (typeof (band) === "number") band = band.toString()
  if (band === "" || band === "0") return coordinate
  return Number(band.toString() + coordinate.toString())
}