const express = require('express');
const morgan = require('morgan');
const fs = require('fs')
const path = require('path');
var mysql = require('mysql2');
const redoc = require('redoc-express');
//const basicAuth = require('express-basic-auth')
//const bearerToken = require('express-bearer-token');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { SwaggerTheme } = require('swagger-themes');
const request = require('supertest');
const { error } = require('console');

const theme = new SwaggerTheme('v3');

const options = {
  explorer: true,
  customCss: theme.getBuffer('feeling-blue')
};

var app = express()
app.use(express.json())
const def = fs.readFileSync(path.join(__dirname,'./swagger.json'),
  {encoding: 'utf-8', flag:'r'});
const read =fs.readFileSync(path.join(__dirname,'./str/README.md'),
  {encoding: 'utf-8',flag:'r'})
const defObj = JSON.parse(def)
defObj.info.description=read

const swaggerOptions = {
  definition:defObj,
  apis: [`${path.join(__dirname,"doc.js")}`],
}


// create a write stream (in append mode)
//app.use(bearerToken());
//app.use(function (req, res) {
  //res.send('miTOken '+req.token);
//});






// app.use(basicAuth({
//   users: { 'admin': '1234' }
// }))

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
/**
 * @swagger
 * /usuarios/:
 *   get:
 *     tags:
 *       - usuario
 *     summary: Consultar todos los usuarios
 *     description: Obtiene un JSON conteniendo todos los usuarios de la BD
 *     responses:
 *       200:
 *         description: Regresa un JSON conteniendo todos los usuarios de la BD
 *       500:
 *         description: Error interno del servidor al intentar consultar los alumnos.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Mensaje de error específico generado por la base de datos.
 */

 
app.get("/usuarios", async(req,res)=>{
  req.token
  try {
    const DB_HOST = process.env.DB_HOST ||  'localhost';
    const DB_NAME = process.env.DB_NAME || 'serverbd';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
    const DB_PORT = process.env.DB_PORT || 3307;
    const DB_USER = process.env.DB_USER || 'root';
    const conn = await mysql.createConnection({host:DB_HOST,user:DB_USER,password:DB_PASSWORD,database:DB_NAME, port: DB_PORT});
    const [rows, fields] = await conn.promise().query('SELECT * FROM ALUMNOS')
    res.json(rows)
  } catch (err){
    res.status(500).json({mensaje:err.sqlMessage})
  }

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     tags:
 *       - usuario
 *     summary: Consultar un usuario en base a su matricula
 *     description: Obtiene un JSON conteniendo uno de los usuarios que se encuentren el la BD
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del alumno a consultar
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Regresa un JSON conteniendo uno los usuarios de la BD
 *       404:
 *         description: No se encontró ningún alumno con el ID proporcionado.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: El alumno no existe.
 *       500:
 *         description: Error interno del servidor al intentar consultar la información del alumno.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Mensaje de error específico generado por la base de datos.      
 */

})
 app.get("/usuarios/:id", async(req,res,next)=>{
  try{
  console.log(req.params.id)
  const DB_HOST = process.env.DB_HOST ||  'localhost';
  const DB_NAME = process.env.DB_NAME || 'serverbd';
  const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
  const DB_PORT = process.env.DB_PORT || 3307;
  const DB_USER = process.env.DB_USER || 'root';
  const conn = await mysql.createConnection({host:DB_HOST,user:DB_USER,password:DB_PASSWORD,database:DB_NAME, port: DB_PORT});
  const [rows, fields] = await conn.promise().query('SELECT * FROM ALUMNOS where matricula='+req.params.id)
  if(rows.length==0){
    let e = new Error("Error del lado de usuario, id inexistente.")
    next(e)
  }
  else{
    res.json(rows)
  }
}
catch{
  let e = new Error("No es posible establecer la conexion")
  next(e)
}
})
app.use((err,req,res,next)=>{
  res.status(500)
  res.send({Error: err.message})
})
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocs,options));
app.use("/api-docs-json",(req,res)=>{
  res.json(swaggerDocs);
});
/**
 * @swagger
 * /usuarios:
 *   delete:
 *     tags:
 *       - alumnos
 *     summary: Eliminar un alumno por ID
 *     description: Elimina un alumno de la Base de Datos según su ID.
 *     parameters:
 *       - name: id
 *         in: query
 *         description: ID del alumno a eliminar
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: El alumno ha sido eliminado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: El usuario ha sido eliminado correctamente.
 *       404:
 *         description: No se encontró ningún alumno con el ID proporcionado.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: El alumno no existe.
 *       500:
 *         description: Error interno del servidor al intentar eliminar al alumno.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Mensaje de error específico generado por la base de datos.
 */
app.delete("/usuarios", async(req,res)=>{
  console.log(req.query)
  try {
    const DB_HOST = process.env.DB_HOST ||  'localhost';
    const DB_NAME = process.env.DB_NAME || 'serverbd';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
    const DB_PORT = process.env.DB_PORT || 3307;
    const DB_USER = process.env.DB_USER || 'root';
    const conn = await mysql.createConnection({host:DB_HOST,user:DB_USER,password:DB_PASSWORD,database:DB_NAME, port: DB_PORT});
    const [rows, fields] = await conn.promise().query(`delete FROM ALUMNOS WHERE matricula = ${req.query.idUsuario}`)
    if(rows.affectedRows==0){
      res.status(404).json({mensaje:"Registro no eliminado"})
    }else{res.status(200).json({mensaje: "Alumno eliminado"})}

    //res.json(rows)
  } catch (err){
    res.status(500).json({mensaje:err.sqlMessage})
  }
})
/**
 * @swagger
 * /usuarios:
 *   post:
 *     tags:
 *       - alumnos
 *     summary: Agregar un nuevo alumno
 *     description: Agrega un nuevo alumno a la Base de Datos.
 *     parameters:
 *       - name: matricula
 *         in: query
 *         description: Matricula del nuevo alumno
 *         required: true
 *         schema:
 *           type: integer
 *       - name: nombre
 *         in: query
 *         description: Nombre del nuevo alumno
 *         required: true
 *         schema:
 *           type: string
 *       - name: semestre
 *         in: query
 *         description: Semestre del nuevo alumno
 *         required: true
 *         schema:
 *           type: integer
 *       - name: carrera
 *         in: query
 *         description: Carrera del nuevo alumno
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: El nuevo alumno ha sido agregado correctamente a la BD.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: El alumno ha sido agregado correctamente.
 *       500:
 *         description: Error interno del servidor al intentar agregar el nuevo alumno.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Mensaje de error específico generado por la BD.
 */
app.post("/usuarios", async(req,res)=>{
  try {
    const DB_HOST = process.env.DB_HOST ||  'localhost';
    const DB_NAME = process.env.DB_NAME || 'serverbd';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
    const DB_PORT = process.env.DB_PORT || 3307;
    const DB_USER = process.env.DB_USER || 'root';
    const conn = await mysql.createConnection({host:DB_HOST,user:DB_USER,password:DB_PASSWORD,database:DB_NAME, port: DB_PORT});

  const [rows, fields] = await conn.promise().query("INSERT INTO `ALUMNOS` VALUES ('" + req.query.matricula + "', '" + req.query.nombre + "', '" + req.query.semestre + "', '" + req.query.carrera + "');");

  // Respondemos con un JSON que contiene información sobre la inserción exitosa del nuevo alumno.
  res.status(200).json({ mensaje: "El alumno ha sido agregado correctamente." });
} catch (err) {
  // En caso de un error, respondemos con un código de estado 500 y un mensaje de error específico.
  res.status(500).json({ mensaje: err.sqlMessage });
}
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     tags:
 *       - alumnos
 *     summary: Actualizar información de un alumno por ID
 *     description: Actualiza la información de un alumno en la Base de Datos según su ID.
 *     parameters:
 *       - name: matricula
 *         in: path
 *         description: ID del alumno a actualizar
 *         required: true
 *         schema:
 *           type: integer
 *       - name: body
 *         in: body
 *         description: Campos que se actualizaran en el alumno
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *             semestre:
 *               type: integer
 *             carrera:
 *               type: string
 *     responses:
 *       200:
 *         description: La información del alumno ha sido actualizada correctamente.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: La información del alumno ha sido actualizada correctamente.
 *       404:
 *         description: No se encontró ningún alumno con el ID proporcionado.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: El alumno no existe.
 *       500:
 *         description: Error interno del servidor al intentar actualizar la información del alumno.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Mensaje de error específico generado por la base de datos.
 */
app.put("/usuarios/:id",async(req,res)=>{
  console.log(req.body)
  let sentencia = "";
  let sentenciaUpdate = "UPDATE `ALUMNOS` SET ";
  let sentenciaWhere = 'WHERE matricula = ' + req.params.id ;
  let camposModificar = "";
  let campos = Object.keys(req.body);
  var segundo = false;
  campos.forEach(campo => {
    if (segundo == false) {
      camposModificar = camposModificar + ("`" + campo + "` = '" + req.body[campo] + "' ");
      segundo = true;
    } else {
      camposModificar = camposModificar + (", `" + campo + "` = '" + req.body[campo] + "' ");
    }
  });
  sentencia = sentenciaUpdate + camposModificar + sentenciaWhere;
  console.log(sentencia);
  try{
    const DB_HOST = process.env.DB_HOST ||  'localhost';
    const DB_NAME = process.env.DB_NAME || 'serverbd';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
    const DB_PORT = process.env.DB_PORT || 3307;
    const DB_USER = process.env.DB_USER || 'root';
    const conn = await mysql.createConnection({host:DB_HOST,user:DB_USER,password:DB_PASSWORD,database:DB_NAME, port: DB_PORT});
    const [rows, fields] = await conn.promise().query(sentencia);

    // Verificación si la actualización fue exitosa.
    if (rows.affectedRows === 0) {
      // No se encontró ningún alumno con el ID proporcionado.
      res.status(404).json({ mensaje: "El alumno no existe." });
    } else {
      // Respondemos con un mensaje indicando que la información del alumno ha sido actualizada correctamente.
      res.status(200).json({ mensaje: "La información del alumno ha sido actualizada correctamente." });
    }
  }catch (err) {
    // En caso de un error, respondemos con un código de estado 500 y un mensaje de error específico.
    res.status(500).json({ mensaje: err.sqlMessage });
  }
});

app.get("/alumnos", (req,res)=>{
    res.send("servidor express contestando a peticion get")
})
app.post("/alumnos", (req,res)=>{
    res.send("servidor express contestando a peticion post")
})


app.get(
  '/docs',
  redoc({
    title: 'API Docs',
    specUrl: '/api-docs-json',
    nonce: '', // <= it is optional,we can omit this key and value
    // we are now start supporting the redocOptions object
    // you can omit the options object if you don't need it
    // https://redocly.com/docs/api-reference-docs/configuration/functionality/
    redocOptions: {
      theme: {
        colors: {
          primary: {
            main: '#6EC5AB'
          }
        },
        typography: {
          fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
          fontSize: '15px',
          lineHeight: '1.5',
          code: {
            code: '#87E8C7',
            backgroundColor: '#4D4D4E'
          }
        },
        menu: {
          backgroundColor: '#ffffff'
        }
      }
    }
  })
);


app.listen(3000,(req,res)=>{
    console.log("El servidor express esta escuchando...")
})

// fetch("http://localhost:8087/api-docs-json")
//   .then(respuesta=>respuesta.json())
//     .then(desc=>{
// const openApi = desc // Open API document
// const targets = ['node_unirest', 'c'] // array of targets for code snippets. See list below...

// try {
//   // either, get snippets for ALL endpoints:
//   const results = OpenAPISnippet.getSnippets(openApi, targets) // results is now array of snippets, see "Output" below.
//   console.log(result)
//   // ...or, get snippets for a single endpoint:
//   const results2 = OpenAPISnippet.getEndpointSnippets(openApi, '/users/{user-id}/relationship', 'get', targets)
// } catch (err) {
//   // do something with potential errors...
// }
// })

 




