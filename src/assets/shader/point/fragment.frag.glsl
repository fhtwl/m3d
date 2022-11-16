// 设置浮点数精度为中等精度
precision mediump float;
// 接受javascript 传过来的颜色值 rgba
uniform vec4 u_Color;

void main() {
  // 将普通的颜色表示转换为webgl需要的表示方式, 即 [0-255]转换到[0-1]
  vec4 color = u_Color / vec4(255, 255, 255, 1);
  //设置像素颜色为红色
  gl_FragColor = color;
}