export function loadShader(innerHTML: string) {
  const script = document.createElement("script")
  script.setAttribute("type", "shader-source")
  script.innerHTML = innerHTML
  return script
}

export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}
export function randomColor(): RGBA {
  const random = Math.random
  return {
    r: random() * 255,
    g: random() * 255,
    b: random() * 255,
    a: random() * 1,
  }
}
