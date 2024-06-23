import { Socket } from "net"

interface ITable {
    set: (key: string, value: string) => Promise<string>
    setEX: (key: string, value: string, expiry: number) => Promise<string>
    delete: (key: string) => Promise<string>
    get: (key: string) => Promise<string>
    getAll: () => Promise<Object>
}

export class Table implements ITable {
    private name: string
    private socket: Socket | null = null

    constructor(name: string, socket: Socket | null) {
        this.name = name
        this.socket = socket
    }

    private async handleMessages(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                let response = ""
                const handle = (buffer: Buffer) => {
                    response += buffer.toString()
                    
                    if (response.endsWith("\n")) {
                        this.socket?.removeListener("data", handle)
                        resolve(response)
                    }
                }
                this.socket?.on("data", handle)
            } catch (error) {
                reject(error)
            }
        })
    }

    async set(key: string, value: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                this.socket?.write(`SET ${key} ${value} ${this.name} 0`)
                
                const response = await this.handleMessages()
                resolve(response)

            } catch (error) {
                reject("error: " + error)
            }
        })
    }

    async setEX(key: string, value: string, expiry: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                this.socket?.write(`SETEX ${key} ${value} ${this.name} ${expiry}`)
    
                const response = await this.handleMessages()
                resolve(response)
            } catch (error) {
                reject("error: " + error)
            }
        })
    }

    async delete(key: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                this.socket?.write(`DELETE ${key} ${this.name}`)
    
                const response = await this.handleMessages()
                resolve(response)
            } catch (error) {
                reject("error: " + error)
            }
        })
    }
    
    async get(key: string): Promise<string>{
        return new Promise(async (resolve, reject) => {
            try {
                this.socket?.write(`GET ${key} ${this.name}`)
    
                const response = await this.handleMessages()
                resolve(response)
            } catch (error) {
                reject("error: " + error)
            }
        })
    }

    async getAll(): Promise<{ [key: string]: string }> {
        return new Promise(async (resolve, reject) => {
            try {
                this.socket?.write(`GET * ${this.name}`)

                const response = await this.handleMessages()
                resolve(JSON.parse(response))
            } catch (error) {
                reject("error: " + error)
            }      
        })
    }
}