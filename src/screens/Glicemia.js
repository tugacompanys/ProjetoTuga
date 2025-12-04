// Tela Glicemia — nova estrutura de layout

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { db, auth } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from '@react-navigation/native';
import MascoteAssistant from "./MascoteAssistant";





export default function Glicemia() {
  const navigation = useNavigation();

  const [valor, setValor] = useState("");
  const [registros, setRegistros] = useState([]);
  const [modalHistorico, setModalHistorico] = useState(false);
const route = useRoute(); // pega a rota atual
const currentRoute = route.name;

  const screenWidth = Dimensions.get("window").width;

  // Buscar registros
  useEffect(() => {
    const q = query(
      collection(db, "users", auth.currentUser.uid, "glicemia"),
      orderBy("data", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRegistros(lista);
    });
    return () => unsub();
  }, []);

  // Salvar registro
  const salvarGlicemia = async () => {
    if (!valor) return;
    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "glicemia"), {
        valor: Number(valor),
        data: new Date(),
      });
      setValor("");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };



  // Remover registro
  const remover = async (id) => {
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "glicemia", id));
  };

  // Cálculos
  const valores = registros.map((r) => r.valor);
  const media = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  const variacao = valores.length ? Math.max(...valores) - Math.min(...valores) : 0;
  const hb1ac = valores.length ? (media + 46.7) / 28.7 : 0;

  const acima = valores.filter((v) => v > 120).length;
  const dentro = valores.filter((v) => v >= 90 && v <= 120).length;
  const abaixo = valores.filter((v) => v < 90).length;
  const total = valores.length || 1;

  
  // Estado
  const ultimo = valores[valores.length - 1];
  const estado = ultimo > 120 ? "alta" : ultimo < 90 ? "baixa" : "normal";
    const imagemTuga =
  estado === "alta"
  
    ? require("../tuga/tuga_doente.png")
    : estado === "baixa"
    ? require("../tuga/tuga_falando.png")
    : require("../../assets/tuga_bodybuilder.png");


  return (
    
    
  <View style={{ flex: 1 }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* TÍTULO */}
      <Text style={styles.titulo}>Glicemia</Text>

      {/* QUADRADOS PRINCIPAIS */}
      <View style={styles.row}>
        {/* Média e variação */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={26} color="#fff" />
          </View>

          <Text style={styles.cardTitulo}>Média e variação</Text>
          <Text style={styles.cardValor}>
            {media.toFixed(0)} ± {variacao.toFixed(0)} mg/dL
          </Text>
        </View>

        {/* Hb1Ac */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={26} color="#fff" />
          </View>

          <Text style={styles.cardTitulo}>Hb1Ac estimada</Text>
          <Text style={styles.cardValor}>{hb1ac.toFixed(2)}%</Text>
        </View>
      </View>

      {/* ESTADO DO TUGA */}
      <View style={styles.boxEstado}>
        <View style={{ flex: 1 }}>
          <Text style={styles.estadoTitulo}>Seu estado atual</Text>
          <Text style={styles.estadoTexto}>
            {estado === "alta" && "Sua glicemia está alta. Vamos ajustar!"}
            {estado === "normal" && "Tudo está equilibrado! Continue assim."}
            {estado === "baixa" && "Sua glicemia está baixa. Cuidado!"}
          </Text>
        </View>

<Image source={imagemTuga} style={styles.tuga} />

      </View>

      {/* SITUAÇÃO GLICÊMICA */}
      <View style={styles.cardGrande}>
        <View style={styles.cardHeader}>
          <View style={styles.circPequeno}>
            <Ionicons name="water" size={20} color="#000" />
          </View>

          <Text style={styles.cardHeaderTitulo}>Situação glicêmica</Text>
        </View>

        <Text style={styles.total}>{registros.length} medições no total</Text>

        {/* Barras */}
        <View style={styles.barraBox}>
          {/* ACIMA */}
          <View style={styles.barraLinha}>
            <View
              style={[
                styles.barra,
                styles.barraAlta,
                { flex: acima / total },
              ]}
            />
            <Text style={styles.barraTexto}>Acima ({acima})</Text>
          </View>

          {/* DENTRO */}
          <View style={styles.barraLinha}>
            <View
              style={[
                styles.barra,
                styles.barraNormal,
                { flex: dentro / total },
              ]}
            />
            <Text style={styles.barraTexto}>Dentro ({dentro})</Text>
          </View>

          {/* ABAIXO */}
          <View style={styles.barraLinha}>
            <View
              style={[
                styles.barra,
                styles.barraBaixa,
                { flex: abaixo / total },
              ]}
            />
            <Text style={styles.barraTexto}>Abaixo ({abaixo})</Text>
          </View>
        </View>
      </View>

      {/* INPUT */}
      <Text style={styles.informe}>Informe seu valor glicêmico</Text>

      <View style={styles.inputBox}>
        <TextInput
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          placeholder="000"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={salvarGlicemia}>
        <Text style={styles.btnTexto}>Salvar</Text>
      </TouchableOpacity>

      {/* GRÁFICO */}
      {registros.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels: registros.map((r) =>
                new Date(r.data.seconds * 1000).toLocaleDateString("pt-BR")
              ),
              datasets: [{ data: registros.map((r) => r.valor) }],
            }}
            width={Math.max(380, registros.length * 80)}
            height={250}
            chartConfig={{
              color: () => "#1e90ff",
              labelColor: () => "#333",
              backgroundGradientFrom: "#dceeff",
              backgroundGradientTo: "#fff",
            }}
            bezier
            style={styles.grafico}
          />
        </ScrollView>
      )}

      {/* HISTÓRICO */}
      <TouchableOpacity
        style={styles.btnHistorico}
        onPress={() => setModalHistorico(true)}
      >
        <Text style={styles.btnHistoricoTexto}>Histórico de Registros</Text>
      </TouchableOpacity>

      {/* MODAL HISTÓRICO */}
      <Modal visible={modalHistorico} animationType="slide">
        <View style={styles.modal}>
          <TouchableOpacity onPress={() => setModalHistorico(false)}>
            <Text style={styles.modalFechar}>Fechar</Text>
          </TouchableOpacity>

          <ScrollView>
            {registros
              .slice()
              .reverse()
              .map((item) => (
                <View key={item.id} style={styles.registro}>
                  <View style={styles.registroLeft}>
                    <View style={styles.circHist}>
                      <Ionicons name="water" size={18} color="#fff" />
                    </View>

                    <View>
                      <Text style={styles.registroTitulo}>
                        Glicemia {item.valor} mg/dL
                      </Text>

                      <View
                        style={[
                          styles.statusBox,
                          item.valor > 120
                            ? styles.alta
                            : item.valor < 90
                            ? styles.baixa
                            : styles.dentro,
                        ]}
                      >
                        <Text style={styles.statusTexto}>
                          {item.valor > 120
                            ? "Acima do normal"
                            : item.valor < 90
                            ? "Abaixo do normal"
                            : "Dentro do normal"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.registroRight}>
                    <Text style={styles.registroHora}>
                      {new Date(item.data.seconds * 1000).toLocaleTimeString(
                        "pt-BR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </Text>

                    <TouchableOpacity onPress={() => remover(item.id)}>
                      <Ionicons name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>

    
        <MascoteAssistant
          explicacoes={[
        // ================== QUEM É A MINDSYNC ==================
        {
          id: "quem_e_mindsync_1",
          texto: "A MindSync é uma equipe formada durante o curso de Desenvolvimento de Sistemas da ETEC Sapopemba!",
          img: require("../tuga/tuga_alto.png"),
        },
        {
          id: "quem_e_mindsync_2",
          texto: "Somos 6 integrantes dedicados a criar soluções tecnológicas: Keven, Renan, Ismael, Matheus, Carlos e Kauã.",
          img: require("../tuga/tuga_alto.png"),
        },
        {
          id: "quem_e_mindsync_3",
          texto: "Nosso TCC é este aplicativo desenvolvido especialmente para ajudar no controle da diabetes!",
          img: require("../tuga/tuga_alto.png"),
          flip: true,
        },
    
        // ================== QUEM SOU EU (TUGA) ==================
        {
          id: "quem_sou_eu_1",
          texto: "Eu sou o Tuga! Seu assistente que deixa tudo mais fácil e divertido!",
          img: require("../tuga/tuga_naruto.png"),
        },
        {
          id: "quem_sou_eu_2",
          texto: "Fui criado para ajudar pessoas que não têm tanta familiaridade com tecnologia, como idosos.",
          img: require("../tuga/tuga_falando.png"),
        },
        {
          id: "quem_sou_eu_3",
          texto: "Mas eu ajudo qualquer pessoa que queira acompanhar sua saúde com mais carinho e facilidade!",
          img: require("../tuga/tuga_falando.png"),
          flip: true,
        },
    
        // ================== COMO O APP AJUDA ==================
        {
          id: "como_ajuda_1",
          texto: "O app permite acompanhar glicemia, alimentação, exercícios e medicamentos, tudo em um só lugar!",
          img: require("../tuga/tuga_alto.png"),
        },
        {
          id: "como_ajuda_2",
          texto: "Isso ajuda a entender melhor a diabetes no dia a dia e a manter hábitos mais saudáveis!",
          img: require("../tuga/tuga_alto.png"),
        },
        {
          id: "como_ajuda_3",
          texto: "Estou sempre aqui para guiar você em cada passo. Vamos juntos cuidar da sua saúde! 💙",
          img: require("../tuga/tuga_alto.png"),
          flip: true,
        },
      ]}
    
        />
    

{/* Footer */}
<View style={styles.footerWrapper}>
  <LinearGradient
    colors={["#ffffffcc", "#ffffffee"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.footer}
  >
    <TouchableOpacity
      style={styles.footerItem}
      onPress={() => navigation.navigate("HomeScreen")}
    >
      <Ionicons name="home-outline" size={26} color="#00c47c" />
      <Text style={[styles.footerText, { color: "#00c47c" }]}>Início</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.footerItem, styles.activeTab]}
      onPress={() => navigation.navigate("Glicemia")}
    >
      <Ionicons name="water-outline" size={26} color="#00bcd4" />
      <Text style={[styles.footerText, { color: "#00bcd4" }]}>Glicemia</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.footerItem}
      onPress={() => navigation.navigate("Refeicao_inicio")}
    >
      <MaterialCommunityIcons name="silverware-fork-knife" size={26} color="#d17d6b" />
      <Text style={[styles.footerText, { color: "#d17d6b" }]}>Refeição</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.footerItem}
      onPress={() => navigation.navigate("Exercicio")}
    >
      <Ionicons name="barbell-outline" size={26} color="#7c6e7f" />
      <Text style={[styles.footerText, { color: "#7c6e7f" }]}>Exercícios</Text>
    </TouchableOpacity>
  </LinearGradient>
</View>

          </View>
  );
}

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f4f7fb",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20,
    alignSelf: "center"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },

  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#1e90ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  cardTitulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
  },

  cardValor: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 3,
  },

  boxEstado: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden"
  },

  estadoTitulo: {
    fontSize: 18,
    fontWeight: "600",
  },

  estadoTexto: {
    fontSize: 14,
    marginTop: 5,
    color: "#555",
  },

  tuga: {
    width: 230,
    height: 230,
    transform: [{ scaleX: -1 }],
    top: 80,
    resizeMode: "contain",
    marginLeft: -50,
    marginTop: -80,
    left: 30
  },

  cardGrande: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  circPequeno: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },

  cardHeaderTitulo: {
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 12,
  },

  total: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },

  barraBox: {
    marginTop: 12,
  },

  barraLinha: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  barra: {
    height: 18,
    borderRadius: 10,
    marginRight: 10,
  },

  barraAlta: {
    backgroundColor: "#ef4444",
  },

  barraNormal: {
    backgroundColor: "#22c55e",
  },

  barraBaixa: {
    backgroundColor: "#3b82f6",
  },

  barraTexto: {
    fontSize: 14,
  },

  informe: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
  },

  inputBox: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
  },

  input: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },

  btn: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  btnTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },

  grafico: {
    marginTop: 20,
    borderRadius: 12,
  },

  btnHistorico: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#227FB0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 90
  },

  btnHistoricoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  modal: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    padding: 15,
  },

  modalFechar: {
    fontSize: 18,
    color: "#227FB0",
    marginBottom: 15,
  },

  registro: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  registroLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  circHist: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e90ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  registroTitulo: {
    fontSize: 16,
    fontWeight: "bold",
  },

  statusBox: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 4,
  },

  alta: { backgroundColor: "#fee2e2" },
  baixa: { backgroundColor: "#dbeafe" },
  dentro: { backgroundColor: "#dcfce7" },

  statusTexto: {
    fontSize: 12,
    fontWeight: "600",
  },

  registroRight: {
    alignItems: "flex-end",
  },

  registroHora: {
    fontSize: 12,
    marginBottom: 6,
  },
  
  footerWrapper: {
    position: "absolute",
    letterSpacing: 19,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "95%",
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,

  },

  footerItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  footerText: { fontSize: 13, marginTop: 4, fontWeight: "700" },


  activeTab: {
    backgroundColor: "#f08f112c", // leve destaque no item ativo
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

});
