let objeto = {
    matricula: "19100166",
    nombre: "brayan",
    semestre: "9",
    carrera: "ISC"
}
let campos = Object.keys(objeto);
let valores = Object.values(objeto);

console.log(campos);
console.log(valores);

campos.forEach(campo=>{
    console.log(campo+`='`+objeto[campo]+`'`)
});

const x = x