import { getGridLocalCoordinate } from "./api";
import proj4 from "proj4"
import * as THREE from "three"

export default class TgGridCoordTrans {
  name;
  parent;
  rotatedTranslatedMatrix;

  constructor(name, parent) {
    this.name = name;
    this.parent = parent;
  }

  async initialize() {
    const { xAxisLocal, yAxisLocal, zAxisLocal, originCoord } = await getGridLocalCoordinate(this.name);
    this.rotatedTranslatedMatrix = new THREE.Matrix4().makeTranslation(originCoord.x, originCoord.y, originCoord.z).multiply(
      new THREE.Matrix4().setFromMatrix3(new THREE.Matrix3().set(
        xAxisLocal.x, yAxisLocal.x, zAxisLocal.x,
        xAxisLocal.y, yAxisLocal.y, zAxisLocal.y,
        xAxisLocal.z, yAxisLocal.z, zAxisLocal.z,
      ))
    );
  }

  localToWGS84(fromVertice) {
    const rotatedTranslatedLocalVertice = new THREE.Vector3().fromArray(fromVertice).applyMatrix4(this.rotatedTranslatedMatrix);
    const decodedLocalVertice = this.parent.transformFormulaParser.decode(rotatedTranslatedLocalVertice.toArray())
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