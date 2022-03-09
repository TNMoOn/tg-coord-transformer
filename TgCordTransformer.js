import { getModelInfo, getModelLocationAndOffset, switchRequestUrl } from "./api"
import proj4 from "proj4"
import { TransformFormulaParser } from "./TransformFormulaParser"
import { SUZHOU_ADDRESS } from "./config"

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

  async initialize({ url } = {}) {
    if (url) switchRequestUrl(url)
    else switchRequestUrl(SUZHOU_ADDRESS)

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
    const decodedLocalVertice = this.transformFormulaParser.decode(fromVertice)
    const wgs84LonglatVertice = [...proj4(this.params, proj4.WGS84, [decodedLocalVertice[0], decodedLocalVertice[1]]), decodedLocalVertice[2]]

    if (wgs84LonglatVertice.findIndex(x => !(typeof (x) === 'number' && !isNaN(x))) !== -1) {
      throw new Error(`模型局部坐标向wgs84坐标转换出错，请检查投影参数！局部坐标为: [${fromVertice}]，解码后坐标为: [${decodedLocalVertice}]，投影参数为: ${this.params}`);
    }

    const toVerticeLonglat = wgs84LonglatVertice.map((value, index) => value + this.offset[index])
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