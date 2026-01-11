import { Env } from "./types";

export class Config{
    static readonly env:Env=Env.PRODUCTION;
    static readonly UI_PORT = 3000;
}