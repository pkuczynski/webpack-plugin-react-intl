import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'
import { MessageDescriptor } from 'react-intl'
import { Compiler, Plugin } from 'webpack'
import * as crypto from 'crypto'
// import validateOptions from 'schema-utils'

// import schema from './schema.json'

interface Options {
    source: string,
    destination: string
}

class ReactIntlPlugin implements Plugin {
    private readonly name = 'ReactIntlPlugin'

    private readonly source: string
    private readonly destination: string
    private hash: string

    constructor(options: Options) {
        // TODO: implement schema validation
        // validateOptions(schema, options, {
        //     name: this.name,
        //     baseDataPath: 'options'
        // })

        this.source = path.resolve(process.cwd(), options.source, '**/*.json')
        this.destination = path.resolve(process.cwd(), options.destination)

        const messages = fs.existsSync(this.destination) ? fs.readFileSync(this.destination, 'utf8') : ''
        const { hash } = this.process(messages)

        this.hash = hash
    }

    private process(messages: string | object): { content: string, hash: string } {
        const content = typeof messages === 'object' ? JSON.stringify(messages, null, 2) : messages
        const hash = this.checksum(content)

        return { hash, content }
    }

    private aggregate(): object {
        const files = glob.sync(this.source)

        if (files.length === 0) {
            throw new Error(`No message files found in ${this.source}`)
        }

        const result = files.map((filename) => fs.readFileSync(filename, 'utf8'))
            .map((file) => JSON.parse(file))
            .reduce((collection, descriptors: MessageDescriptor[]) => {
                descriptors.forEach(({ id, defaultMessage }) => {
                    if (collection.hasOwnProperty(id)) {
                        throw new Error(`Duplicate message: ${id}`)
                    }

                    collection[id] = defaultMessage
                })

                return collection
            }, {})

        return result
    }

    private save(content: string): void {
        const dirname = path.dirname(this.destination)
        fs.mkdirSync(dirname, { recursive: true })

        fs.writeFileSync(this.destination, content)
    }

    private checksum(content: string): string {
        return crypto.createHash('sha512').update(content).digest('hex')
    }

    apply(compiler: Compiler) {
        // TODO: Verify if babel-react-intl is ON and throw otherwise https://webpack.js.org/api/compiler-hooks/#afterenvironment
        compiler.hooks.emit.tap(this.name, () => {
            const messages = this.aggregate()
            const { content, hash } = this.process(messages)

            if (hash !== this.hash) {
                this.save(content)
                this.hash = hash
            }
        })
    }
}

export = ReactIntlPlugin
