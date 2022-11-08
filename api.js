import createAxiosInstance from "./request"
import { BEIJING_ADDRESS, SUZHOU_ADDRESS } from "./config"
import * as THREE from "three"

const requestCache = {
  BEIJING_ADDRESS: createAxiosInstance(BEIJING_ADDRESS),
  SUZHOU_ADDRESS: createAxiosInstance(SUZHOU_ADDRESS),
}

let request = requestCache[SUZHOU_ADDRESS]

export function switchRequestUrl(url) {
  if (!requestCache[url]) requestCache[url] = createAxiosInstance(url)
  request = requestCache[url]
}

export async function getModelInfo(modelName) {
  const result = await request({
    method: 'post',
    url: '/manager/get_data',
    data: {
      type: 'get_model_info',
      name: modelName,
    }
  })
  if (!result) throw new Error("model不存在，请传入正确的model名称")

  return {
    name: result["Model_Info:Name"],
    parent: result["Model_Info:Parent"],
    projection: result["Model_Info:Projection"],
    range: result["Model_Info:Range"],
  }
}

export async function getModelLocationAndOffset(modelName) {
  const { data: result } = await request({
    method: 'post',
    url: '/data/te-model-info.php',
    data: {
      type: 'getModelLocationByName',
      model: modelName.split("Model_")[1],
    }
  })

  return {
    offset: result.offset.split(",").map(v => Number.parseFloat(v)),
    location: result.location.split(",").map(v => Number.parseFloat(v)),
  }
}

export async function getGridLocalCoordinate(gridName) {
  const { "Grid_Info:Local_Coordinate": data } = await request({
    method: 'post',
    url: '/manager/get_data',
    data: {
      type: 'get_local_coordinate',
      name: gridName,
    }
  })

  return {
    xAxisLocal: new THREE.Vector3(data["x_dir"].x, data["x_dir"].y, data["x_dir"].z).normalize(),
    yAxisLocal: new THREE.Vector3(data["y_dir"].x, data["y_dir"].y, data["y_dir"].z).normalize(),
    zAxisLocal: new THREE.Vector3(data["z_dir"].x, data["z_dir"].y, data["z_dir"].z).normalize(),
    originCoord: data ? new THREE.Vector3(data.origin.x, data.origin.y, data.origin.z,) : new THREE.Vector3(0, 0, 0),
  }
}

export async function getModelGridList(modelName) {
  return (await request({
    method: 'post',
    url: '/manager/get_data',
    data: {
      type: 'get_model_grids_list',
      name: modelName,
    },
  })).map(gridName => modelName + "-Grid_" + gridName)
}
