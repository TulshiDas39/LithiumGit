import { Env } from "./types";

export class Config{
    static readonly env:Env=Env.DEVELOPMENT;
    static readonly UI_PORT = 3000;
}