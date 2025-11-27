module.exports = {
 development: {
   client: 'sqlite3',
   connection: {
     filename: './dev.sqlite3'
   },
   migrations: {
     directory: './migrations'
   },
   seeds: {
     directory: './seeds'
   }
 },
 production: {
   client: 'pg',
   connection: process.env.DATABASE_URL,
   migrations: {
     directory: './migrations'
   },
   seeds: {
     directory: './seeds'
   }
 }
};