const {Pool} = require('pg')

const pool = new Pool({
    user:"postgres",
    password:"leoney31",
    database:"skatepark",
    host:"localhost",
    port: 5432
    
})