function addVec(v1, v2){
    return {x: v1.x+v2.x, y: v1.y+v2.y}
}
function subVec(v1, v2){
    return {x: v1.x-v2.x, y: v1.y-v2.y}
}
function multVec(v1, v2){
    return {x: v1.x*v2.x, y: v1.y*v2.y}
}
function multVecCon(v1, n){
    return {x: v1.x*n, y: v1.y*n}
}
function divVecCon(v1, n){
    return {x: v1.x/n, y: v1.y/n}
}
function mag(v){
    return Math.sqrt(v.x**2+v.y**2)
}
function norm(v){
    return divVecCon(v, mag(v))
}
/*linePoint(float x1, float y1, float x2, float y2, float px, float py) {

  // get distance from the point to the two ends of the line
  float d1 = dist(px,py, x1,y1);
  float d2 = dist(px,py, x2,y2);

  // get the length of the line
  float lineLen = dist(x1,y1, x2,y2);

  // since floats are so minutely accurate, add
  // a little buffer zone that will give collision
  float buffer = 0.1;    // higher # = less accurate

  // if the two distances are equal to the line's
  // length, the point is on the line!
  // note we use the buffer here to give a range,
  // rather than one #
  if (d1+d2 >= lineLen-buffer && d1+d2 <= lineLen+buffer) {
    return true;
  }
  return false;
} */