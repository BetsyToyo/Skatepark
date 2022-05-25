const express = require('express');
const app = express();
const hbs = require("express-handlebars");
const jwt = require('jsonwebtoken');
const expressFileUpload= require('express-fileupload');
const {registro, registros, editarRegistro, eliminarRegistro, skaterStatus}= require('./data/consultas.js');

app.listen(3000, () => console.log('Your app listening on port 3000'));

//Middlewares

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use("/assets", express.static(`${__dirname}/assets/`));
app.use("/jquery", express.static(`${__dirname}/node_modules/jquery/dist/`));
app.use("/axios", express.static(`${__dirname}/node_modules/axios/dist/`));
app.use("/fotos", express.static(`${__dirname}/fotos/`));

app.use(expressFileUpload({
  limits:{fileSize: 5000000},
  abortOnLimit: true,
  responseOnLimit: 'El peso del archivo que intentas subir supera el limite permitido'
}));

const llaveSecreta= 'Skaters2022'

app.set("view engine", "handlebars");
app.engine(
  "handlebars",
  hbs.engine({
    layoutsDir: `${__dirname}/views`,
    partialsDir:`${__dirname}/views/partials`,
  })
);

//Rutas para renderizar los handlebars
app.get("/", async (req, res) => {
  const skaters= await registros()    
    res.render("index", {
      layout: "index",
      datos: skaters.map((skater)=>{
        return {id: skater.id, 
                foto: skater.foto, 
                nombre: skater.nombre, 
                experiencia: skater.anos_experiencia,
                especialidad: skater.especialidad,
                estado: skater.estado
                }
      }),               
    });
  });

app.get('/login', (req, res) => {
  res.render("login",{ layout: 'login'});
})

app.get('/registro', (req, res) => {
  res.render("registro",{ layout: 'registro'});
})

//Correo para poder acceder a la pagina de admin admin@gmail.com.
app.get("/admin", async (req, res) => {
  const skaters= await registros()    
    res.render("admin", {
      layout: "admin",
      datos: skaters.map((skater)=>{
        return {id: skater.id, 
                foto: skater.foto, 
                nombre: skater.nombre, 
                experiencia: skater.anos_experiencia,
                especialidad: skater.especialidad,
                estado: skater.estado
                }
      }),               
    });
  });

//Ruta para registro de Usuario

app.post('/registro',(req,res)=>{
  const{email, nombre, password, experiencia, especialidad}=req.body;
  console.log(req.body)
  const { fotoSkater }= req.files;
  const nombreImagen= `${fotoSkater.name}.jpg`
    const ruta= `${__dirname}/fotos/${nombreImagen}`;
    fotoSkater.mv(ruta, async(err)=>{ 
      if (!err) {
        const parametros={ email, nombre, password, experiencia, especialidad, nombreImagen}
       console.log(await registro(parametros))  
       res.send('registrado')
      }else{
        res.status(500)
      }           
})     
})

//ruta de Login y creacion de token

app.post("/login", async(req, res) => {
  const { email, password } = req.body;  
  const skaters=await registros()  
  const skater = skaters.find(skater => skater.email == email && skater.password == password);  
  if(!skater){
    res.status(403).send({ message: 'Credenciales inválidas'})
} else {
    const token = jwt.sign(skater, llaveSecreta);
    res.send({
        message: 'Autenticación exitosa',
        token: token,
        skater: skater.email
    });
}
})

//Envio de datos al formulario de datos de usuario

let skaterData;

app.use('/registros',(req, res, next)=>{  
    const token = req.headers.authorization;
    jwt.verify(token, llaveSecreta, (error, data) => {
        if(error){
            res.status(403).send({ message: 'token inválido'})
        } else {
            skaterData = data;
            next();
        }
    })
})

app.get('/datos',(req,res)=>{  
  res.render("datos",{ layout: 'datos', 
    datos: skaterData
  })
})

app.get('/registros',async(req, res)=>{
  const skaters=await registros()  
  const skater= skaters.filter(skater => skater.email == skaterData.email)
  res.json({data: skater, message: "datos obtenidos"})
})

//Modificacion de datos de Skater

app.put('/registro', async(req, res)=>{ 
  const respuesta= await editarRegistro(req.body)
  res.status(respuesta.mensaje? 500 : 201).json(respuesta.mensaje? respuesta.mensaje : respuesta )    

})

//Modificacion de status en tabla administrador
app.put("/registro/status/:id", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
      await skaterStatus(id, estado);
      res.status(200).send("Estatus de skater cambiado con éxito");
  } catch (error) {
      res.status(500).send({
          error: `Algo salió mal... ${error}`,
          code: 500
      })
  };
});

//eliminnar patinador

 app.delete('/registro', async (req, res)=>{
   const id= req.query.id
    const respuesta= await eliminarRegistro(id)
    res.status(respuesta.mensaje? 500 : 201).json(respuesta.mensaje? respuesta.mensaje : respuesta )
 })
