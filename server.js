const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENTES_FILE = path.join(__dirname, "clientes.json");
const USUARIOS_FILE = path.join(__dirname, "usuarios.json");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (login.html, css, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Configurar sesiones
app.use(session({
  secret: 'mi_clave_secreta',
  resave: false,
  saveUninitialized: false
}));

// Redirigir raíz a login.html
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

// Rutas de API para clientes
app.get("/api/clientes", (req, res) => {
  const clientes = cargarClientes();
  res.json(clientes);
});

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

// ✅ Login: guardar sesión y redirigir a /inicio
app.post("/api/login", (req, res) => {
  const { usuario, clave } = req.body;
  const usuarios = cargarUsuarios();
  const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave);

  if (encontrado) {
    req.session.usuario = usuario; // 🔐 Guardamos en sesión
    res.redirect("/inicio");       // 👈 Usamos la ruta protegida, no .html
  } else {
    res.status(401).send("Usuario o clave incorrectos");
  }
});

// ✅ Ruta protegida: solo entra si está logueado
app.get("/inicio", (req, res) => {
  if (req.session && req.session.usuario) {
    res.sendFile(path.join(__dirname, "inicio.html")); // Moved fuera de public/
  } else {
    res.redirect("/login.html");
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
