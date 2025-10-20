export const receitas = [
  // Café da manhã / 200-300 kcal / Rico em proteína
  {
    id: "1",
    nome: "Omelete de Claras",
    imagem: "https://www.receiteria.com.br/wp-content/uploads/2020/02/omelete.jpg",
    avaliacao: 4.5,
    tempo: 10,
    kcal: 180,
    categorias: [
      { id: "1", label: "Café da manhã", grupo: "escolhaRefeicao", emoji: "🥣" },
      { id: "2", label: "200-300 kcal", grupo: "caloriasContadas", emoji: "🥯" },
      { id: "3", label: "Rico em proteína", grupo: "preferencias", emoji: "🍳" },
    ],
  },
  // Café da manhã / 100-200 kcal / Baixa caloria
  {
    id: "2",
    nome: "Salada de Frutas",
    imagem: "https://www.receiteria.com.br/wp-content/uploads/2017/09/salada-de-frutas.jpg",
    avaliacao: 4.0,
    tempo: 5,
    kcal: 120,
    categorias: [
      { id: "4", label: "Café da manhã", grupo: "escolhaRefeicao", emoji: "🥣" },
      { id: "5", label: "100-200 kcal", grupo: "caloriasContadas", emoji: "🥗" },
      { id: "6", label: "Baixa caloria", grupo: "preferencias", emoji: "🍎" },
    ],
  },
  // Almoço / 400-500 kcal / Rico em proteína
  {
    id: "3",
    nome: "Frango Grelhado",
    imagem: "https://www.receiteria.com.br/wp-content/uploads/2017/08/frango-grelhado.jpg",
    avaliacao: 5.0,
    tempo: 25,
    kcal: 350,
    categorias: [
      { id: "7", label: "Almoço", grupo: "escolhaRefeicao", emoji: "🍲" },
      { id: "8", label: "400-500 kcal", grupo: "caloriasContadas", emoji: "🍛" },
      { id: "9", label: "Rico em proteína", grupo: "preferencias", emoji: "🍳" },
    ],
  },
  // Jantar / 400-500 kcal / Baixa gordura
  {
    id: "4",
    nome: "Macarrão Integral",
    imagem: "https://www.receiteria.com.br/wp-content/uploads/2017/09/macarrao-integral.jpg",
    avaliacao: 4.3,
    tempo: 30,
    kcal: 400,
    categorias: [
      { id: "3", label: "Jantar", grupo: "escolhaRefeicao", emoji: "🥗" },
      { id: "8", label: "400-500 kcal", grupo: "caloriasContadas", emoji: "🍛" },
      { id: "10", label: "Baixa gordura", grupo: "preferencias", emoji: "🥑" },
    ],
  },
  // Lanche / 100-200 kcal / Baixa caloria
  {
    id: "5",
    nome: "Smoothie de Morango",
    imagem: "https://www.receiteria.com.br/wp-content/uploads/2017/08/smoothie.jpg",
    avaliacao: 4.7,
    tempo: 7,
    kcal: 180,
    categorias: [
      { id: "1", label: "Lanche", grupo: "escolhaRefeicao", emoji: "🍓" },
      { id: "5", label: "100-200 kcal", grupo: "caloriasContadas", emoji: "🥗" },
      { id: "6", label: "Baixa caloria", grupo: "preferencias", emoji: "🍎" },
    ],
  },
  // Fácil / 300-400 kcal / Baixa gordura
  {
    id: "6",
    nome: "Panqueca Integral",
    imagem: "https://www.receiteria.com.br/wp-content/uploads/2018/05/panqueca-integral.jpg",
    avaliacao: 4.2,
    tempo: 20,
    kcal: 250,
    categorias: [
      { id: "1", label: "Café da manhã", grupo: "escolhaRefeicao", emoji: "🥣" },
      { id: "12", label: "300-400 kcal", grupo: "caloriasContadas", emoji: "🥞" },
      { id: "10", label: "Baixa gordura", grupo: "preferencias", emoji: "🥑" },
    ],
  },
  // Rápido / 700+ kcal / Rico em proteína
  {
    id: "7",
    nome: "Hambúrguer Fit",
    imagem: "https://www.receiteria.com.br/wp-content/uploads/2018/05/hamburguer.jpg",
    avaliacao: 4.5,
    tempo: 15,
    kcal: 750,
    categorias: [
      { id: "3", label: "Jantar", grupo: "escolhaRefeicao", emoji: "🥗" },
      { id: "13", label: "700+ kcal", grupo: "caloriasContadas", emoji: "🍔" },
      { id: "3", label: "Rico em proteína", grupo: "preferencias", emoji: "🍳" },
    ],
  },
];
