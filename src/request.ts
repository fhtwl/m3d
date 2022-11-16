interface Options {
  method?: "GET" | "POST"
  path: string
}
export default function request(option: Options) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(xhr.responseText)
      } else {
        reject()
      }
    }
    xhr.open(option.method || "GET", option.path, true)
    xhr.send()
  })
}
