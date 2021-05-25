import { getModelInfo, getModelLocationAndOffset } from "./api"
import proj4 from "proj4"
import { TransformFormulaParser } from "./TransformFormulaParser"

export class TgCoordTransformer {
  name = null

  _params = null
  _offset = [0, 0, 0]
  _transformFormulaParser = TransformFormulaParser.newDefaultParser()

  constructor(name) {
    if (!name) throw new Error("no model name")
    this.name = name
  }

  set params(value) {
    this._params = value
  }

  get params() {
    return this._params
  }

  set offset(value) {
    this._offset = value
  }

  get offset() {
    return this._offset
  }

  get transformFormulaParser() {
    return this._transformFormulaParser
  }

  set transformFormulaParser(value) {
    this._transformFormulaParser = value
  }

  async initialize() {
    const [{ projection }, { offset }] = await Promise.all([
      getModelInfo(this.name),
      getModelLocationAndOffset(this.name),
    ])

    this.params = projection.para.parameters
    this.offset = offset
    this.transformFormulaParser = new TransformFormulaParser({
      transformFormulaId: projection.trans_formula_id,
      transformFormulaParams: projection.trans_formula_paras,
    })
  }

  localToWGS84(fromVertice) {
    fromVertice = this.transformFormulaParser.decode(fromVertice)
    fromVertice = [...proj4(this.params, proj4.WGS84, [fromVertice[0], fromVertice[1]]), fromVertice[2]]
    const toVerticeLonglat = fromVertice.map((value, index) => value + this.offset[index])
    const toVerticeGeocent = proj4(proj4.WGS84, "+proj=geocent +datum=WGS84 +units=m +no_defs", toVerticeLonglat)
    return {
      longlat: toVerticeLonglat,
      geocent: toVerticeGeocent,
    }
  }

  WGS84ToLocal(fromVertice, coordType = COORD_TYPE.LONGLAT) {
    if (coordType === COORD_TYPE.GEOCENT) fromVertice = proj4("+proj=geocent +datum=WGS84 +units=m +no_defs", proj4.WGS84, fromVertice)
    else if (coordType !== COORD_TYPE.LONGLAT) throw new Error("输入坐标类型未知")
    fromVertice = fromVertice.map((value, index) => value - this.offset[index])
    fromVertice = [...proj4(proj4.WGS84, this.params, [fromVertice[0], fromVertice[1]]), fromVertice[2]]
    const toVertice = this.transformFormulaParser.encode(fromVertice)
    return toVertice
  }
}

export const COORD_TYPE = {
  GEOCENT: "geocent",
  LONGLAT: "longlat",
}