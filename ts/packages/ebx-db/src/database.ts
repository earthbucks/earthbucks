import { ExtractTablesWithRelations } from 'drizzle-orm'
import { MySqlTransaction } from 'drizzle-orm/mysql-core'
import {
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
  drizzle,
} from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
})

export const db = drizzle(connection)
