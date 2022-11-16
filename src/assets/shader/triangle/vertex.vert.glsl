// 设置浮点数精度为中等精度
precision mediump float;
// 接受点在 canvas 坐标系上的坐标 (x, y)
attribute vec2 a_Position;
// 接收 canvas 的宽高尺寸
attribute vec2 a_Screen_Size;

// 顶点着色器
void main() {
  vec2 position = (a_Position / a_Screen_Size) * 2.0 - 1.0; // 得到 -1~1的值, 即NOC坐标
  position = position * vec2(1.0, -1.0);
  gl_Position = vec4(position, 0.0, 1.0);

}