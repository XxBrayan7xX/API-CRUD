const fetch = require("node-fetch");
const OpenAPISnippet = require('openapi-snippet')
fetch("http://localhost:8087/api-docs-json")
    .then(respuesta=>respuesta.json())
        .then(desc=>{

// define input:
const openApi = desc
const targets = ['node_unirest','javascript_xhr','go_native'] // array of targets for code snippets. See list below...
try {
  // either, get snippets for ALL endpoints:
  const results = OpenAPISnippet.getEndpointSnippets(openApi, '/usuarios/','get',targets) // results is now array of snippets, see "Output" below.
  console.log(results)
} catch (err) {
  // do something with potential errors...
}
})