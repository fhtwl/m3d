interface Options {
    method?: "GET" | "POST";
    path: string;
}
export default function request(option: Options): Promise<unknown>;
export {};
