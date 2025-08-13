// type check our environment variables
import { env as loadEnv } from 'custom-env'
// type check schemas at runtime
import { z } from 'zod'

process.env.APP_STAGE = process.env.APP_STAGE || 'dev'

const isProduction = process.env.APP_STAGE === 'production'
const isDevelopment = process.env.APP_STAGE === 'dev'
const isTest = process.env.APP_STAGE === 'test'

if (isDevelopment) {
  loadEnv() // loads .env
} else if (isTest) {
  loadEnv('test') // loads .env.test
}

// define validation schema with zod for environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),
  // express expects a number
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  // hashing passwords
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
})

// type inference from schema
export type Env = z.infer<typeof envSchema>
let env: Env

try {
  env = envSchema.parse(process.env)
} catch (e) {
  if (e instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:')
    console.error(JSON.stringify(e.flatten().fieldErrors, null, 2))

    e.issues.forEach((err) => {
      const path = err.path.join('.')
      console.error(`  ${path}: ${err.message}`)
    })
    process.exit(1) // exit with error code
  }
  throw e
}

export const isProd = () => env.NODE_ENV === 'production'
export const isDev = () => env.NODE_ENV === 'development'
export const isTestEnv = () => env.NODE_ENV === 'test'

export { env }
export default env
