import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDT2MKf6edM4lz-xbsz7bDw0A-aj4YWOvE",
  authDomain: "gestao-de-compras-d25a9.firebaseapp.com",
  projectId: "gestao-de-compras-d25a9",
  storageBucket: "gestao-de-compras-d25a9.appspot.com",
  messagingSenderId: "603433039615",
  appId: "1:603433039615:web:3324bd5284797aef073eca",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCollection = collection(db, "products");

// Função para carregar os produtos na tabela
async function loadProducts() {
  const q = query(productsCollection, orderBy("timestamp", "asc")); // Ordena do mais antigo para o mais recente
  const querySnapshot = await getDocs(q);

  const productTable = document.getElementById("productTable");
  productTable.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const product = { id: doc.id, ...doc.data() };

    const row = document.createElement("tr");
    row.classList.toggle("ticked", product.ticked);

    row.innerHTML = `
      <td>${product.code || ""}</td>
      <td>${product.name}</td>
      <td>
        <button class="tick-btn" data-id="${product.id}" data-ticked="${product.ticked}">Ticar</button>
        <button class="delete-btn" data-id="${product.id}">Excluir</button>
      </td>
    `;

    productTable.appendChild(row);
  });

  // Adiciona os eventos para os botões após renderizar os produtos
  document.querySelectorAll(".tick-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const id = event.target.dataset.id;
      const currentState = event.target.dataset.ticked === "true";
      await tickProduct(id, currentState);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const id = event.target.dataset.id;
      await deleteProduct(id);
    });
  });
}

// Função para adicionar um produto
async function addProduct(event) {
  event.preventDefault();
  const code = document.getElementById("productCode").value;
  const name = document.getElementById("productName").value;

  if (!name) {
    alert("O nome do produto é obrigatório.");
    return;
  }

  // Adiciona um timestamp ao produto
  await addDoc(productsCollection, {
    code,
    name,
    ticked: false,
    timestamp: new Date(), // Adiciona a data e hora
  });

  document.getElementById("productCode").value = "";
  document.getElementById("productName").value = "";
  loadProducts();
}

// Função para ticar/desmarcar um produto
async function tickProduct(id, currentState) {
  const productDoc = doc(db, "products", id);
  await updateDoc(productDoc, { ticked: !currentState });

  if (!currentState) {
    setTimeout(async () => {
      await updateDoc(productDoc, { ticked: false });
      loadProducts();
    }, 30000);
  }

  loadProducts();
}

// Função para excluir um produto
async function deleteProduct(id) {
  const productDoc = doc(db, "products", id);
  await deleteDoc(productDoc);
  loadProducts();
}

// Evento para o formulário de adicionar produto
document.getElementById("productForm").addEventListener("submit", addProduct);

// Carrega os produtos ao inicializar
loadProducts();
