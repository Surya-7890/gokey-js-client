import { Socket } from "node:net"
import { Table } from "./Table"

interface IClient {
    connect: () => void
    disconnect: () => void
    createTable: (name: string) => Promise<Table | null>
}

export class Client implements IClient {
    private host: string
    private port: number
    private socket: Socket | null = null

    constructor(host: string, port: number) {
        this.host = host
        this.port = port
    }

    connect():void {
        try {
            const new_socket = new Socket()
            const conn = new_socket.connect({
                port: this.port,
                host: this.host
            })

            this.socket = conn
        } catch (error) {
            return
        }
    }

    disconnect(): void {
        try {
            this.socket?.end()
        } catch (error) {
            return
        }
    }

    async createTable(name: string): Promise<Table | null> {
        return new Promise((resolve, reject) => {
            try {
                this.socket?.write(`CREATE ${name}`)

                let data = ""
                this.socket?.on('data', (buffer) => {
                    data += buffer.toString()

                    if (data.endsWith("\n")) {
                        this.socket?.removeAllListeners("data")
                        resolve(new Table(name, this.socket))
                    }
                })
            } catch (error) {
                reject("error: " + error)
            }
        })
    }
}