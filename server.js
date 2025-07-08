const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENTES_FILE = path.join(__dirname, "clientes.json");

app.use(bodyParser.json());
app.use(express.static("public"));

function cargarClientes() {
  if (!fs.existsSync(CLIENTES_FILE)) return [];
  const data = fs.readFileSync(CLIENTES_FILE, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function guardarClientes(clientes) {
  fs.writeFileSync(CLIENTES_FILE, JSON.stringify(clientes, null, 2), "utf-8");
}

app.get("/api/clientes", (req, res) => {
  const clientes = cargarClientes();
  res.json(clientes);
});

// POST para crear cliente sin id en URL
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

// PUT para actualizar cliente existente
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const USUARIOS_FILE = path.join(__dirname, "usuarios.json");

function cargarUsuarios() {
  if (!fs.existsSync(USUARIOS_FILE)) return [];
  const data = fs.readFileSync(USUARIOS_FILE, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

app.post("/api/login", (req, res) => {
  const { usuario, clave } = req.body;
  const usuarios = cargarUsuarios();
  const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave);

  if (encontrado) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, mensaje: "Credenciales inválidas" });
  }
});
