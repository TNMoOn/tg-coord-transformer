import { getGridLocalCoordinate } from "./api";
import proj4 from "proj4"

export default class TgGridCoordTrans {
  name;
  parent;

  xAxis; yAxis; zAxis;

  constructor(name, parent) {
    this.name = name;
    this.parent = parent;
  }

  async initialize() {
    ({ xAxis: this.xAxis, yAxis: this.yAxis } = await getGridLocalCoordinate(this.name));
  }

  localToWGS84(fromVertice) {
    const decodedLocalVertice = this.parent.transformFormulaParser.decode(fromVertice)
    const wgs84LonglatVertice = [...proj4(this.parent.params, proj4.WGS84, [decodedLocalVertice[0], decodedLocalVertice[1]]), decodedLocalVertice[2]]

    if (wgs84LonglatVertice.findIndex(x => !(typeof (x) === 'number' && !isNaN(x))) !== -1) {
      throw new Error(`模型局部坐标向wgs84坐标转换出错，请检查投影参数！局部坐标为: [${fromVertice}]，解码后坐标为: [${decodedLocalVertice}]，投影参数为: ${this.parent.params}`);
    }

    const toVerticeLonglat = wgs84LonglatVertice.map((value, index) => value + this.parent.offset[index])
    const toVerticeGeocent = proj4(proj4.WGS84, "+proj=geocent +datum=WGS84 +units=m +no_defs", toVerticeLonglat)
    return {
      longlat: toVerticeLonglat,
      geocent: toVerticeGeocent,
    }
  }

  WGS84ToLocal(fromVertice, coordType = COORD_TYPE.LONGLAT) {
    if (coordType === COORD_TYPE.GEOCENT) fromVertice = proj4("+proj=geocent +datum=WGS84 +units=m +no_defs", proj4.WGS84, fromVertice)
    else if (coordType !== COORD_TYPE.LONGLAT) throw new Error("输入坐标类型未知")
    fromVertice = fromVertice.map((value, index) => value - this.parent.offset[index])
    fromVertice = [...proj4(proj4.WGS84, this.parent.params, [fromVertice[0], fromVertice[1]]), fromVertice[2]]
    const toVertice = this.parent.transformFormulaParser.encode(fromVertice)
    return toVertice
  }
}