const fs = require("fs");
const entradaSaida = require("event-stream");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Carrega arestas pelo arquivo, para cada linha: origem, destino e peso
const leituraArquivo = async () => {
  return new Promise((resolve, reject) => {
    const arestas = [];
    const arquivo = fs
      .createReadStream("./entrada.txt")
      .pipe(entradaSaida.split())
      .pipe(
        entradaSaida
          .mapSync((line) => {
            arquivo.pause();
            let novaAresta = {};
            let aux = line.split(" ");
            novaAresta.origem = aux[0];
            novaAresta.destino = aux[1];
            novaAresta.peso = aux[2];
            arestas.push(novaAresta);
            arquivo.resume();
          })
          .on("error", (err) => {
            console.log("Erro:", err);
            reject(err);
          })
          .on("end", () => {
            console.log("Arquivo lido com sucesso!");
            resolve(arestas);
          })
      );
  });
};

/* Funções para carregar os dados do grafo */

const carregaVertices = (grafo) => {
  let auxVertices = [];
  grafo.forEach((aresta) => {
    auxVertices.push(aresta.origem);
    auxVertices.push(aresta.destino);
  });
  auxVertices = Object.values(
    auxVertices.reduce((acc, cur) => Object.assign(acc, { [cur]: cur }), {})
  );
  return auxVertices;
};

const grauDoVertice = (grafo, id) => {
  let contador = 0;
  grafo.forEach((aresta) => {
    if (String(aresta.destino) === String(id)) {
      contador++;
    }
  });
  return contador;
};

const sucessoresVertice = (grafo, id) => {
  let sucessores = [];
  grafo.forEach((aresta) => {
    if (String(aresta.origem) === String(id)) {
      sucessores.push(aresta.destino);
    }
  });
  return sucessores;
};

const antecessoresVertice = (grafo, id) => {
  let antecessores = [];
  grafo.forEach((aresta) => {
    if (String(aresta.destino) === String(id)) {
      antecessores.push(aresta.origem);
    }
  });
  return antecessores;
};

/* Funções auxiliares para entradas via terminal */

const entradaIdVerticeGrau = async (textoEntrada, grafo) => {
  rl.question(textoEntrada || "Entrada: ", (answer) => {
    console.log(grafo?.vertices[String(Number(answer)-1)]?.grau || "Não foi possível calcular");
    menu(grafo);
  });
};

const entradaIdVerticeSucessores = async (textoEntrada, grafo) => {
  rl.question(textoEntrada || "Entrada: ", (answer) => {
    console.log(
      grafo?.vertices[String(Number(answer)-1)]?.sucessores?.length === 0
        ? "Nenhum sucessor"
        : grafo.vertices[String(Number(answer)-1)].sucessores
    );
    menu(grafo);
  });
};

const entradaIdVerticeAntecessores = async (textoEntrada, grafo) => {
  rl.question(textoEntrada || "Entrada: ", (answer) => {
    console.log(
      grafo?.vertices[String(Number(answer)-1)]?.antecessores?.length === 0
        ? "Nenhum antecessor"
        : grafo.vertices[String(Number(answer)-1)].antecessores
    );
    menu(grafo);
  });
};

/* Funções de log e menu principal*/

const sumario = (grafo) => {
  console.log("Número de Vértices: ", grafo.vertices.length);
  console.log("Número de Arestas: ", grafo.arestas.length);
  console.log(
    "Densidade: ",
    grafo.arestas.length > 0 ? grafo.vertices.length / grafo.arestas.length : ""
  );
};

const listMenu = () => {
  console.log("-------Menu------");
  console.log("1. Sumário");
  console.log("2. Grau do vértice");
  console.log("3. Sucessores");
  console.log("4. Antecessores");
  console.log("5. Log completo");
  console.log("0. Sair");
  console.log("-----------------");
};

const menu = (grafo) => {
  listMenu();
  rl.question("Entrada: ", (answer) => {
    if (answer === "0") {
      return rl.close();
    } else if (answer === "1") {
      sumario(grafo);
    } else if (answer === "2") {
      entradaIdVerticeGrau("Digite o ID do vértice: ", grafo);
      return;
    } else if (answer === "3") {
      entradaIdVerticeSucessores("Digite o ID do vértice: ", grafo);
      return;
    } else if (answer === "4") {
      entradaIdVerticeAntecessores("Digite o ID do vértice: ", grafo);
    } else if (answer === "5") {
      console.log(grafo);
    } else {
      console.log("Comando inválido");
    }
    menu(grafo);
  });
};

const carregaGrafo = (arestas, vertices) => {
  return new Promise((resolve, reject) => {
    const grafo = {
      arestas,
      vertices,
    };
    grafo.arestas = arestas;
    grafo.vertices = [];
    for (id of vertices) {
      let sucessores = sucessoresVertice(arestas, id);
      let antecessores = antecessoresVertice(arestas, id);
      let grau = grauDoVertice(arestas, id);
      grafo.vertices.push({
        id,
        sucessores,
        antecessores,
        grau,
      });
    }
    resolve(grafo);
  });
};

const main = async () => {
  const arestas = await leituraArquivo();
  const vertices = carregaVertices(arestas);
  const grafo = await carregaGrafo(arestas, vertices);
  menu(grafo);
};

main();
