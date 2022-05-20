const express = require('express');
const app = express();
const hbs = require("express-handlebars");
const jwt = require('jsonwebtoken');
const expressFileUpload= require('express-fileupload');
const {registro, registros, editarRegistro, eliminarRegistro}= require('./data/consultas.js');

app.listen(3000, () => console.log('Your app listening on port 3000'));

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use("/assets", express.static(`${__dirname}/assets/`));
app.use("/jquery", express.static(`${__dirname}/node_modules/jquery/dist/`));
app.use("/axios", express.static(`${__dirname}/node_modules/axios/dist/`));

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

app.get("/", async (request, response) => {
    response.render("index", {
      layout: "index",          
    });
  });

app.get('/login', (req, res) => {
  res.render("login",{ layout: 'login'});
})

app.get('/registro', (req, res) => {
  res.render("registro",{ layout: 'registro'});
})



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
        token: token
    });
}
})

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

app.put('/registro', async(req, res)=>{ 
  const respuesta= await editarRegistro(req.body)
  res.status(respuesta.mensaje? 500 : 201).json(respuesta.mensaje? respuesta.mensaje : respuesta )    

})
 app.delete('/registro', async (req, res)=>{
   const id= req.query.id
    const respuesta= await eliminarRegistro(id)
    res.status(respuesta.mensaje? 500 : 201).json(respuesta.mensaje? respuesta.mensaje : respuesta )
 })
