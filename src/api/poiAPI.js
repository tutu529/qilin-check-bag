import service from "./service";

export function getPoiList(data) {
  return service({
    url: '/poi/v1/',
    method: 'post',
    data
  });
}