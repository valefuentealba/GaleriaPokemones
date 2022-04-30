const axios = require("axios");
const http = require("http");
const fs = require("fs");

const urlPokeApi = `https://pokeapi.co/api/v2/pokemon`;

async function getPomokemons() {
    const { data } = await axios.get(urlPokeApi + "?limit=150");
    return data.results;
}

async function getImgPokemon(pokemonName) {
    const { data } = await axios.get(urlPokeApi + "/" + pokemonName);
    return { name: pokemonName, img1: data.sprites.front_default, img2: data.sprites.back_shiny };
}

const server = http.createServer((req, res) => {
    const { url } = req;
    if (url == "/") {
        try {
            const index = fs.readFileSync("index.html", "utf-8");
            res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
            res.end(index);
        } catch (e) {
            funError(res, e, "text/html");
        }
    } else if (url == "/pokemones") {
        try {
            res.writeHead(200, { "Content-Type": "application/json; charset=UTF-8" });
            getPomokemons().then((pokemons) => {
                let allPromises = [];
                let arrPokes = [];
                pokemons.forEach((pokemon) => {
                    allPromises.push(getImgPokemon(pokemon.name));
                });

                Promise.all(allPromises).then((results) => {
                    results.forEach((result) => {
                        arrPokes.push({ img1: result.img2, nombre: result.name });
                    });
                    res.end(JSON.stringify(arrPokes));
                });
            });
        } catch (e) {
            funError(res, e, "json");
        }
    } else {
        funError(res, null, "text/html");
    }
});

const port = 3000;
server.listen(port, () => console.log(`Escuchando el puerto ${port}`));

const funError = (res, err, type) => {
    if (err) console.log(err);
    res.writeHead(404, { "Content-Type": type });
    if (type == "text/html") res.write("<p>Pagina no encontrada!</p>");
    res.end();
};