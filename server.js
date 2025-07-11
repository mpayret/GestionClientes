const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENTES_FILE = path.join(__dirname, "clientes.json");
const USUARIOS_FILE = path.join(__dirname, "usuarios.json");

// Middleware para leer JSON y formularios HTML
app.use(bodyParser.json());


app.use(bodyParser.urlencoded({ extended: true }));

// Archivos estáticos en /public (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, "public")));

// Redirige "/" a login.html
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Función para cargar clientes
function cargarClientes() {
  if (!fs.existsSync(CLIENTES_FILE)) return [];
  const data = fs.readFileSync(CLIENTES_FILE, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Función para guardar clientes
function guardarClientes(clientes) {
  fs.writeFileSync(CLIENTES_FILE, JSON.stringify(clientes, null, 2), "utf-8");
}

// API: Obtener lista de clientes
app.get("/api/clientes", (req, res) => {
  const clientes = cargarClientes();
  res.json(clientes);
});

// API: Crear nuevo cliente
app.post("/api/clientes", (req, res) => {
  const clientes = cargarClientes();
  const nuevoCliente = {
    id: crypto.randomUUID(),
    nombre: req.body.nombre,
    rut: req.body.rut,
    vencDGI: req.body.vencDGI || null,
    claveDGI: req.body.claveDGI || "",
    vencBPS: req.body.vencBPS || null,
    claveBPS: req.body.claveBPS || "",
    cumple: req.body.cumple || null
  };
  clientes.push(nuevoCliente);
  guardarClientes(clientes);
  res.status(201).json(nuevoCliente);
});

// API: Actualizar cliente existente
app.put("/api/clientes/:id", (req, res) => {
  const clientes = cargarClientes();
  const id = req.params.id;
  const index = clientes.findIndex(c => c.id === id);

  if (index < 0) return res.sendStatus(404);

  clientes[index] = {
    ...clientes[index],
    nombre: req.body.nombre,
    rut: req.body.rut,
    vencDGI: req.body.vencDGI || null,
    claveDGI: req.body.claveDGI || "",
    vencBPS: req.body.vencBPS || null,
    claveBPS: req.body.claveBPS || "",
    cumple: req.body.cumple || null
  };

  guardarClientes(clientes);
  res.sendStatus(200);
});

// API: Eliminar cliente
app.delete("/api/clientes/:id", (req, res) => {
  let clientes = cargarClientes();
  clientes = clientes.filter(c => c.id !== req.params.id);
  guardarClientes(clientes);
  res.sendStatus(200);
});

// Función para cargar usuarios
function cargarUsuarios() {
  if (!fs.existsSync(USUARIOS_FILE)) return [];
  const data = fs.readFileSync(USUARIOS_FILE, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Login: valida usuario y redirige
app.post("/api/login", (req, res) => {
  const { usuario, clave } = req.body;
  const usuarios = cargarUsuarios();
  const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave);

  if (encontrado) {
    res.redirect("/inicio.html");  // redirige si el login es correcto
  } else {
    res.status(401).send("Usuario o clave incorrectos"); // mensaje simple por ahora
  }
});


// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
