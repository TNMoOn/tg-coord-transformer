import { getModelInfo, getModelLocationAndOffset, switchRequestUrl, getModelGridList } from "./api"
import { TransformFormulaParser } from "./TransformFormulaParser"
import { SUZHOU_ADDRESS } from "./config"
import TgGridCoordTrans from "./TgGridCoordTrans"

export class TgCoordTransformer {
  name = null

  _params = null
  _offset = [0, 0, 0]
  _transformFormulaParser = TransformFormulaParser.newDefaultParser()

  tgGridMap = null;
  roughestGrid = null;

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

    const [{ projection }, { offset }, gridNameList] = await Promise.all([
      getModelInfo(this.name),
      getModelLocationAndOffset(this.name),
      getModelGridList(this.name),
    ])

    this.params = projection.para.parameters
    this.offset = offset
    this.transformFormulaParser = new TransformFormulaParser({
      transformFormulaId: projection.trans_formula_id,
      transformFormulaParams: projection.trans_formula_paras,
    })
    this.tgGridMap = gridNameList.reduce((map, gridName) => map.set(gridName, new TgGridCoordTrans(gridName, this)), new Map());

    await Promise.all([...this.tgGridMap.values()].map(grid => grid.initialize()));
    this.roughestGrid = this.tgGridMap.values().next().value;
  }

  localToWGS84(fromVertice) {
    return this.roughestGrid.localToWGS84(fromVertice);
  }

  WGS84ToLocal(fromVertice, coordType = COORD_TYPE.LONGLAT) {
    return this.roughestGrid.WGS84ToLocal(fromVertice, coordType);
  }
}

export const COORD_TYPE = {
  GEOCENT: "geocent",
  LONGLAT: "longlat",
}