const {Pool} = require('pg')

const pool = new Pool({
    user:"postgres",
    password:"leoney31",
    database:"skatepark",
    host:"localhost",
    port: 5432
    
})

const registro= async (datos)=>{
    const {email, nombre, password, experiencia, especialidad, nombreImagen}= datos
    const parametros={
        text:'INSERT INTO skaters(email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING*',     
        values: [email, nombre, password, experiencia, especialidad, nombreImagen, false]       
    }

    try {
        const { rows }= await pool.query(parametros)
        return rows
    } catch (error) {
        return { status: 'ERROR', mensaje: error.message }
    }
}

const registros= async ()=>{    
    const parametros={
        text:'SELECT * FROM skaters',     
        values: []       
    }

    try {
        const { rows }= await pool.query(parametros)
        return rows
    } catch (error) {
        return { status: 'ERROR', mensaje: error.message }
    }
}

const editarRegistro= async (datos)=>{
    const {nombre, password, experiencia, especialidad, id}= datos
    const parametros={
        text:'UPDATE skaters SET nombre= $1, password= $2, anos_experiencia=$3, especialidad=$4 WHERE id= $5 RETURNING*',     
        values: [nombre, password, experiencia, especialidad, id]       
    }
   
    try {
        const { rows }= await pool.query(parametros)
        return rows
    } catch (error) {
        return { status: 'ERROR', mensaje: error.message }
    }
}

const eliminarRegistro= async (id)=>{    
    const sql= `DELETE FROM skaters WHERE id=${id}`
    try {
        const { rows }= await pool.query(sql)
        return rows
    } catch (error) {
        return { status: 'ERROR', mensaje: error.message }
    }
}

const skaterStatus = async (id, estado) => {
    const result = await pool.query(
      `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *`
    );
    const skater = result.rows[0];
    return skater;
  }

module.exports= {registro, registros, editarRegistro, eliminarRegistro, skaterStatus}