import service from "./service";

export function getPoiList(data) {
  return service({
    url: '/file/api/get',
    method: 'get',
    params: data
  });
}