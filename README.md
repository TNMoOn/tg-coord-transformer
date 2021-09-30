tg-coord-transformer
========

#### 截断网格专用坐标转换库 ####

截断网格数据中点的坐标处于各自不同的坐标系中，这些坐标系有些是公开标准，有些是私有标准。将这些位于各色各样坐标系下的点转换至地球坐标系下是一个非常常见的需求，该工具库就是为这种坐标转换提供统一、易用的功能入口。

### Usage ###

1.首先，使用模型名称构造TgCoordTransformer对象并初始化。当前有两种初始化方式可供选择，一种是调用异步方法initialize()，它将自动访问预设的服务器（苏州）获取所需投影参数，这就要求数据库中必须存储了该模型对应的投影参数信息；另一种是手动为投影参数赋值，所需的共有params、offset、transformFormulaParser三个投影参数，他们分别表示投影字符串、手调经纬度偏移、公式解析对象，后两者都是非必须的，若无设置将使用默认值。公式解析对象为TransformFormulaParser对象，用来为非标准坐标系进行解码和编码，要初始化该对象需要提供两个数据，分别是transformFormulaId和transformFormulaParams。
```javascript
import { TgCoordTransformer } from "tg-coord-transformer"

const tgCoordTransformer = new TgCoordTransformer("Model_xianhe")

// 调用initialize()方法初始化
// 1.不指定初始化url时，将默认访问苏州服务器
await tgCoordTransformer.initialize()
// 2.指定初始化url
await tgCoordTransformer.initialize({ url: "https://www.abc.def" })

// 手动赋值初始化
tgCoordTransformer.params = "+proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=500000 +y_0=0 +ellps=krass +units=m +no_defs "
```
2.接着，就可利用TgCoordTransformer对象进行坐标转换了。这里共提供了两个转换接口，分别是localToWGS84()和WGS84ToLocal()。前者将模型局部坐标系下的点坐标转换至WGS84坐标系下，输入为一形如[x, y, z]的数组，输出为一包含了两个形如[x, y, z]数组的对象，分别表示以经纬度形式和ECEF形式表示的WGS84坐标。后者将WGS84坐标系下的点坐标转换至模型局部坐标系下，输入为一形如[x, y, z]的数组和坐标类型常量，该常量表示输入的WGS84坐标是经纬度形式的还是ECEF形式的，默认为经纬度形式的，输出为一形如[x, y, z]的数组。
```javascript
import { COORD_TYPE } from "tg-coord-transformer"

const {longlat, geocent} = tgCoordTransformer.localToWGS84([1, 2, 3])
const local = tgCoordTransformer.WGS84ToLocal([1, 2, 3], COORD_TYPE.GEOCENT)
```