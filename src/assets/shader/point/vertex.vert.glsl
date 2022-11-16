// 点和线
// 浮点数设置为中等精度
precision mediump float;
// 接收 JavaScript 传递过来的点的坐标（X, Y）
attribute vec2 a_Position;
// 接收canvas的尺寸。
attribute vec2 a_Screen_Size;
void main(){
  // 将 canvas 的坐标值 转换为 [-1.0, 1.0]的范围。
  vec2 position = (a_Position / a_Screen_Size) * 2.0 - 1.0;
  // canvas的 Y 轴坐标方向和 设备坐标系的相反。
  position = position * vec2(1.0, -1.0);
  // 最终的顶点坐标。
  gl_Position = vec4(position, 0.0, 1.0);
  // 点的大小。
  gl_PointSize = 10.0;
}