import service from "./service";

export function imageJudge() {
  return service({
    url: '/api/images/image_judge',
    method: 'get'
  });
}


export function judge(data) {
  return service({
    url: '/api/images/judge',
    method: 'post',
    data
  });
}