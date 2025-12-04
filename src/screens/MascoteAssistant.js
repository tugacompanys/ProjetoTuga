// MascoteAssistant.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';


const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function MascoteAssistant({
  screenRefs = {}, // refs da tela atual
  explicacoes = [], // passos da explicação
telasDisponiveis = [
  { nome: "Início", rota: "HomeScreen" },
  { nome: "Glicemia", rota: "Glicemia" },
  { nome: "Refeição", rota: "Refeicao_inicio" },
  { nome: "Exercício", rota: "Exercicio" },

  // novas telas
  { nome: "Configurações", rota: "Configuracoes" },
  { nome: "Editar Perfil", rota: "EditarPerfil" },
  { nome: "Índice Diário", rota: "IndiceDiario" },
  { nome: "Medicamento", rota: "Medicamento" },
],
}) {
  const navigation = useNavigation();

  const [visivel, setVisivel] = useState(false);
  const [menuStack, setMenuStack] = useState(["main"]);
  const [telasPage, setTelasPage] = useState(0);
  const [highlightRect, setHighlightRect] = useState(null);
  const [falaAtual, setFalaAtual] = useState(null);

  const animOpacity = useRef(new Animated.Value(0)).current;
  const animMascote = useRef(new Animated.Value(0)).current;

  const [passoAtual, setPassoAtual] = useState(0);
  const [dialogoAtivo, setDialogoAtivo] = useState(false);

  const [mostrarMenu, setMostrarMenu] = useState(true);


  const iniciarExplicacaoCustom = (opcao) => {
  const filtradas = explicacoes.filter((f) => f.id.startsWith(opcao));
  if (filtradas.length === 0) return;

  setMostrarMenu(false);
  setVisivel(true);
  setDialogoAtivo(true);
  setHighlightRect(null);

  setPassoAtual(0);
  setFalaAtual({
    texto: filtradas[0].texto,
    img: filtradas[0].img
  });

  // 🔁 troca o array principal para navegação com as setas
  explicacoes.splice(0, explicacoes.length, ...filtradas);
};



const proximoPasso = () => {
  if (!dialogoAtivo) return;

  if (passoAtual < explicacoes.length - 1) {
    const novoPasso = passoAtual + 1;
    setPassoAtual(novoPasso);

    const passo = explicacoes[novoPasso];

    // Atualiza falaAtual com possibilidade de flip
    setFalaAtual({
      texto: passo.texto,
      img: passo.img || require("../../assets/tuga_bodybuilder.png"),
      flip: passo.flip || false, // flag opcional para virar o Tuga
    });

    const ref = screenRefs[passo.id];
    if (ref) {
      setTimeout(() => medirEHighlight(ref), 200);
    } else {
      setHighlightRect(null);
    }
  } else {
  setDialogoAtivo(false);
  setHighlightRect(null);
  setMostrarMenu(true);     // <--- MOSTRA MENU DE NOVO
}

};

const voltarPasso = () => {
  if (!dialogoAtivo) return;
  if (passoAtual > 0) {
    const novoPasso = passoAtual - 1;
    setPassoAtual(novoPasso);
    const passo = explicacoes[novoPasso];
    setFalaAtual({
      texto: passo.texto,
      img: passo.img || require("../../assets/tuga_bodybuilder.png"),
    });
    const ref = screenRefs[passo.id];
    if (ref) {
      setTimeout(() => medirEHighlight(ref), 200);
    } else {
      setHighlightRect(null);
    }
  }
};


  const dialogosGenericos = [
    {
      texto: "Oi! Eu sou o Tuga — seu assistente. Em que posso ajudar?",
      img: require("../tuga/tuga_feio_ola.png"),
    },
    {
      texto: "Posso explicar cada tela do app para você.",
      img: require("../../assets/tuga_bodybuilder.png"),
    },
  ];

  useEffect(() => {
    Animated.timing(animOpacity, {
      toValue: visivel ? 0.5 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.timing(animMascote, {
      toValue: visivel ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visivel]);

  const telasPorPagina = 4;
  const paginas = [];
  for (let i = 0; i < telasDisponiveis.length; i += telasPorPagina) {
    paginas.push(telasDisponiveis.slice(i, i + telasPorPagina));
  }

  const abrir = () => {
    setVisivel(true);
    setMenuStack(["main"]);
    setFalaAtual(dialogosGenericos[0]);
  };

const fechar = () => {
  setVisivel(false);
  setHighlightRect(null);
  setMostrarMenu(true);     // <--- VOLTA A APARECER
};

  const abrirMenuTelas = () => {
    setMenuStack((s) => [...s, "telas"]);
    setTelasPage(0);
  };

  const navegarPara = async (rota) => {
    fechar();
    navigation.navigate(rota);
    await new Promise((res) => setTimeout(res, 400));
  };

  const medirEHighlight = (ref) => {
    if (!ref || !ref.current || !ref.current.measure) return;

    ref.current.measure((fx, fy, width, height, px, py) => {
      setHighlightRect({
        x: px,
        y: py,
        width,
        height,
      });
    });
  };

const iniciarExplicacao = () => {
  if (!explicacoes || explicacoes.length === 0) return;

  setMostrarMenu(false);
  setVisivel(true);
  setDialogoAtivo(true);
  setPassoAtual(0);

  const passo = explicacoes[0];
  setFalaAtual({
    texto: passo.texto,
    img: passo.img || require("../../assets/tuga_bodybuilder.png"),
  });

  const ref = screenRefs[passo.id];
  if (ref) {
    setTimeout(() => medirEHighlight(ref), 200);
  } else {
    setHighlightRect(null);
  }
};


  const onEscolherTela = async (tela) => {
    if (tela.rota === "Exercicio") {
      await iniciarExplicacao();
      return;
    }
    await navegarPara(tela.rota);
  };

  return (
    <>
      {/* Botão flutuante do mascote */}
      <TouchableOpacity style={styles.mascoteButton} onPress={abrir}>
        <Image
          source={require("../../assets/tuga_bodybuilder.png")}
          style={styles.mascoteIcon}
        />
      </TouchableOpacity>

{visivel && (
  <>
  <TouchableOpacity
  style={styles.setaTopoTela}
  onPress={() => setMenuStack(["main"])}
>
  <Ionicons name="chevron-back" size={30} color="#fff" />
</TouchableOpacity>

    {/* ------------------------------------------------------------ */}
    {/* OVERLAY ESCURO — aparece apenas quando NÃO está destacando   */}
    {/* ------------------------------------------------------------ */}
    {visivel && !highlightRect && (
      <Animated.View
        style={[styles.overlay, { opacity: animOpacity }]}
        pointerEvents="none"
      />
    )}

    {/* ------------------------------------------------------------ */}
    {/* HIGHLIGHT REAL — buraco completamente LIMPO sem overlay      */}
    {/* ------------------------------------------------------------ */}
    {highlightRect && (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Topo */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: SCREEN_W,
            height: highlightRect.y,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />

        {/* Esquerda */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: highlightRect.y,
            width: highlightRect.x,
            height: highlightRect.height,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />

        {/* Direita */}
        <View
          style={{
            position: "absolute",
            left: highlightRect.x + highlightRect.width,
            top: highlightRect.y,
            width: SCREEN_W - (highlightRect.x + highlightRect.width),
            height: highlightRect.height,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />

        {/* Bottom */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: highlightRect.y + highlightRect.height,
            width: SCREEN_W,
            height: SCREEN_H - (highlightRect.y + highlightRect.height),
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />
      </View>
    )}

    {/* ------------------------------------------------------------ */}
    {/* MASCOTE + MENU                                               */}
    {/* ------------------------------------------------------------ */}
    <Animated.View
      style={[
        styles.mascoteContainer,
        {
          transform: [
            {
              translateY: animMascote.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* MENU à esquerda */}
      <View style={styles.menu}>
{mostrarMenu && (

  <View style={styles.menuTopo}>
    
    {/* ============================ */}
    {/*       MENU PRINCIPAL         */}
    {/* ============================ */}
    {menuStack[menuStack.length - 1] === "main" && (
      <FlatList
        data={[
          { nome: "Telas", id: "telas" },
          { nome: "Quem é a MindSync?", id: "mindsync" },
          { nome: "Quem sou eu?", id: "quem_sou_eu" },
          { nome: "Como o app ajuda?", id: "como_ajuda" },
        ]}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.botaoGrande}
onPress={() => {
  if (item.id === "telas") {
    abrirMenuTelas();
  } else {
    iniciarExplicacaoCustom(item.id);
  }
}}

          >
            <Text style={styles.botaoGrandeTexto}>{item.nome}</Text>
          </TouchableOpacity>
        )}
      />
    )}

    {/* ============================ */}
    {/*       MENU DE TELAS          */}
    {/* ============================ */}
{menuStack[menuStack.length - 1] === "telas" && (
  <>
    <TouchableOpacity
      style={styles.botaoVoltar}
      onPress={() => {

        setMenuStack((prev) => prev.slice(0, -1));
      }}
    >
      <Ionicons name="chevron-back" size={2} color="#ffffffff" />
    </TouchableOpacity>

    {/* LISTA DE TELAS */}
    <FlatList
      data={paginas[telasPage]}
      keyExtractor={(it) => it.rota}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.botaoGrande}
          onPress={() => onEscolherTela(item)}
        >
          <Text style={styles.botaoGrandeTexto}>{item.nome}</Text>
        </TouchableOpacity>
      )}
    />

    {/* SETAS DE NAVEGAÇÃO */}
    <View style={styles.setasNavegacao}>
      <TouchableOpacity
        style={[
          styles.pageArrowRounded,
          telasPage === 0 && { opacity: 0.3 },
        ]}
        disabled={telasPage === 0}
        onPress={() => setTelasPage((p) => Math.max(0, p - 1))}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.pageArrowRounded,
          telasPage >= paginas.length - 1 && { opacity: 0.3 },
        ]}
        disabled={telasPage >= paginas.length - 1}
        onPress={() =>
          setTelasPage((p) => Math.min(paginas.length - 1, p + 1))
        }
      >
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  </>
)}

  </View>
)}


      </View>

      {/* ------------------------------------------------------------ */}
      {/* MASCOTE: balão acima + seta + mascote                        */}
      {/* ------------------------------------------------------------ */}

      <View style={styles.mascoteBox}>
        <TouchableOpacity style={styles.closeX} onPress={fechar}>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>✕</Text>
        </TouchableOpacity>

        <View style={styles.balao}>
          <Text style={styles.balaoTexto}>{falaAtual?.texto}</Text>
        </View>

        {/* Seta do balão apontando para o mascote */}
        <View style={styles.balaoSeta} />

        <Image
          source={falaAtual?.img || require("../../assets/tuga_bodybuilder.png")}
          style={[
            styles.mascoteImage,
            falaAtual?.flip ? { transform: [{ scaleX: -1 }] } : {},
          ]}
        />
      </View>
    </Animated.View>

    {/* ------------------------------------------------------------ */}
    {/* BOTÕES DO GUIA DE EXPLICAÇÃO                                 */}
    {/* ------------------------------------------------------------ */}
    {dialogoAtivo && (
      <View style={styles.navegacaoExplicacao}>
        <TouchableOpacity
          style={styles.botaoPasso}
          onPress={voltarPasso}
          disabled={passoAtual === 0}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={passoAtual === 0 ? "#aaa" : "#000"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoPasso} onPress={proximoPasso}>
          <Ionicons
            name={
              passoAtual === explicacoes.length - 1
                ? "checkmark"
                : "chevron-forward"
            }
            size={28}
            color="#000"
          />
        </TouchableOpacity>
      </View>
    )}
  </>
)}

    </>
  );
}

const styles = StyleSheet.create({
mascoteButton: {
  position: "absolute",
  bottom: 80,
  alignSelf: "center",
  zIndex: 999,
  width: 70,
  height: 70,
  borderRadius: 120,
  overflow: "hidden",  // <-- ADICIONE ISTO
  backgroundColor: "#ffffff" // opcional pra não ficar transparente
},

mascoteIcon: {
  width: 160,     // <-- maior
  height: 160,    // <-- maior
  resizeMode: "cover",
  right: 35,
  top: 0 // <-- enche o espaço e corta bordas
},

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000ff",
    zIndex: 30,
  },

  balaoTexto: {
    color: "#222",
    fontSize: 16,
  },
  balaoSeta: {
  width: 0,
  height: 0,
  borderLeftWidth: 12,
  borderRightWidth: 0,
  borderBottomWidth: 12,
  borderStyle: "solid",
  backgroundColor: "transparent",
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
  borderBottomColor: "white",
  transform: [{ rotate: "45deg" }],
  right: 90,
  top: -5,
  marginBottom: 4,
  marginRight: 18,
  alignSelf: "flex-end",
},



  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginVertical: 6,
  },
  menuButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    alignSelf: "center"
  },
  pageArrow: {
    padding: 8,
  },
  navegacaoExplicacao: {
  position: "absolute",
  bottom: 40,  // ajuste conforme quiser
  left: 20,
  flexDirection: "row",
  justifyContent: "space-between",
  width: 120,
  zIndex: 10010,
},

botaoPasso: {
  width: 50,
  height: 50,
  backgroundColor: "white",
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 4,
  elevation: 6,
},

botaoPassoTexto: {
  fontSize: 20,
  fontWeight: "700",
},
pageArrowRounded: {
  width: 45,
  height: 45,
  borderRadius: 12,
  backgroundColor: "white",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 4,
  elevation: 5,
},
mascoteContainer: {
  position: "absolute",
  bottom: 40,
  right: 20,
  flexDirection: "column",
  alignItems: "flex-end",
  zIndex: 9999,
},


menu: {
  position: "absolute",
  top: -300,
  left: 40,
  right: 40,
  zIndex: 9999,
},


mascoteBox: {
  flexDirection: "column", // balão encima, imagem embaixo
  alignItems: "flex-end",  // balão alinhado à direita (sobre o mascote)
  justifyContent: "flex-end",
},

balao: {
  maxWidth: 260,
  backgroundColor: "white",
  paddingHorizontal: 14,
  paddingVertical: 14,
  borderRadius: 16,
  marginBottom: -2,
  alignSelf: "flex-end",

  // sombra
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 6,
},


closeX: {
  position: "absolute",
  top: -8,
  right: -8,
  backgroundColor: "white",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 20,
  elevation: 4,
  zIndex: 9999,
},

mascoteImage: {
  width: 240,   // reduz um pouco para caber ao lado do menu
  height: 300,
  resizeMode: "contain",
  transform: [{ scaleX: -1 }],
},
menuTopo: {
  width: "200%",
  paddingHorizontal: 0,
  marginBottom: 0,
  marginLeft: -130
},
botaoGrande: {
  flex: 1,
  backgroundColor: "white",
  paddingVertical: 14,
  margin: 6,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  elevation: 4,
  height: 65,    // <-- garante tamanho igual
},
botaoGrandeTexto: {
  fontSize: 16,
  fontWeight: "600",
  textAlign: "center",
},

setasNavegacao: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 10,
  gap: 20,
},
setaTopoTela: {
  position: "absolute",
  top: 40,            // ajuste conforme o celular
  left: 20,
  zIndex: 100000,
  width: 45,
  height: 45,
  backgroundColor: "rgba(0,0,0,0.6)",
  borderRadius: 50,
  justifyContent: "center",
  alignItems: "center",
  elevation: 8,
},

});
