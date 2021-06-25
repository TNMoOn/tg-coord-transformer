import createAxiosInstance from "./request"

const beijingRequest = createAxiosInstance("https://e.gridworld.com.cn")
const suzhouRequest = createAxiosInstance("https://sz.gridworld.com.cn:10443")

export async function getModelInfo(modelName) {
  const result = await suzhouRequest({
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
  const { data: result } = await suzhouRequest({
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
