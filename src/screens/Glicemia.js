import React, { useState, useEffect } from "react"; // ✅ único import de React
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { LineChart } from "react-native-chart-kit";
import { MotiView } from "moti";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
// ✅ Import correto do Animated / FadeInUp
import Animated, { FadeInUp } from "react-native-reanimated";

export default function Glicemia() {
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [resetando, setResetando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [registros, setRegistros] = useState([]);
  const largura = Dimensions.get("window").width - 40;
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(
      collection(db, "users", auth.currentUser.uid, "glicemia"),
      orderBy("data", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRegistros(dados);
    });
    return () => unsubscribe();
  }, []);

  const salvarGlicemia = async () => {
    if (!valor) return;
    const valorAtual = valor;
    setValor("");
    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "glicemia"), {
        valor: Number(valorAtual),
        data: new Date(),
      });
      Alert.alert("Sucesso", "Registro salvo com sucesso!");
    } catch (error) {
      setValor(valorAtual);
      Alert.alert("Erro", "Não foi possível salvar o registro.");
    }
  };

  const removerRegistro = async (id) => {      // ✅ NOVO BLOCO
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "glicemia", id));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover este registro.");
    }
  };

  const resetarTudo = async () => {            // ✅ MANTER APENAS ESTA VERSÃO
    Alert.alert("Confirmar", "Deseja realmente apagar todos os registros?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar tudo",
        style: "destructive",
        onPress: async () => {
          try {
            setResetando(true); // ✅ Ativa spinner
            const q = collection(db, "users", auth.currentUser.uid, "glicemia");
            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map((docSnap) =>
              deleteDoc(doc(db, "users", auth.currentUser.uid, "glicemia", docSnap.id))
            );
            await Promise.all(promises);
            setValor(""); // Limpa input
          } catch (error) {
            Alert.alert("Erro", "Não foi possível apagar os registros.");
          } finally {
            setResetando(false);
          }
        },
      },
    ]);
  };


  const getDotColor = (valor) => {
    if (valor < 90) return "#3b82f6"; // azul
    if (valor > 120) return "#ef4444"; // vermelho
    return "#22c55e"; // verde
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={[]}
          contentContainerStyle={{ paddingBottom: 80 }} // 🔑 Espaço extra p/ a TabBar
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setMenuAberto(!menuAberto)}>
                  <Ionicons name="menu-outline" size={28} color="#fff" bottom="10" right="10" />
                </TouchableOpacity>
                <Text style={styles.headerText}>📊 Controle de Glicemia</Text>
                <View style={{ width: 28 }} />
              </View>

              {/* Menu lateral */}
              {menuAberto && (
                <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuAberto(false)}>
                  <Animated.View entering={FadeInUp} style={styles.menu}>

                    {/* Opção de Editar Perfil */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuAberto(false);
                        navigation.navigate("EditarPerfil");
                      }}
                    >
                      <Ionicons name="person-outline" size={20} color="#000" />
                      <Text style={styles.menuText}>Editar Perfil</Text>
                    </TouchableOpacity>

                    {/* Opção de Trocar conta */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuAberto(false);
                        navigation.navigate("Login");
                      }}
                    >
                      <Ionicons name="swap-horizontal-outline" size={20} color="#000" />
                      <Text style={styles.menuText}>Trocar Conta</Text>
                    </TouchableOpacity>

                    {/* Opção de Configurações */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuAberto(false);
                        navigation.navigate("Configurações");
                      }}
                    >
                      <Ionicons name="settings-outline" size={20} color="#000" />
                      <Text style={styles.menuText}>Configurações</Text>
                    </TouchableOpacity>

                    {/* Opção de Sair */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuAberto(false);
                        BackHandler.exitApp(); // Fecha o aplicativo
                      }}
                    >
                      <Ionicons name="exit-outline" size={20} color="red" />
                      <Text style={[styles.menuText, { color: "red" }]}>Sair</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableOpacity>
              )}




              <Text style={styles.instrucoes}>
                Registre seus níveis de glicemia e acompanhe com o gráfico e o histórico abaixo.
                {"\n\n"}• Digite o valor {"\n"}• Pressione "Salvar"
              </Text>

              {/* Input + Botão */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o valor (mg/dL)"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={valor}
                  onChangeText={setValor}
                />
                <TouchableOpacity style={styles.botao} onPress={salvarGlicemia}>
                  <Text style={styles.botaoTexto}>Salvar</Text>
                </TouchableOpacity>
              </View>

              {registros.length > 0 && (
                <TouchableOpacity style={styles.botaoReset} onPress={resetarTudo}>
                  <Ionicons name="reload-outline" size={20} color="#ffffffff" fontWeight="900"/>
                  <Text style={styles.botaoResetTexto}>Resetar Tudo</Text>
                </TouchableOpacity>
              )}

              {/* Gráfico */}
              {registros.length > 0 && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 600 }}
                >
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ paddingHorizontal: 20 }}>
                      <LineChart
                        data={{
                          labels: registros.map((r) =>
                            new Date(r.data.seconds * 1000).toLocaleDateString(
                              "pt-BR",
                              { day: "2-digit", month: "2-digit", year: "2-digit" }
                            )
                          ),
                          datasets: [{ data: registros.map((r) => r.valor) }],
                        }}
                        width={Math.max(largura, registros.length * 80 + 40)}
                        height={260}
                        yAxisSuffix="/dL"
                        chartConfig={{
                          backgroundGradientFrom: "#acd7fa59",
                          backgroundGradientTo: "#dceefc",
                          decimalPlaces: 0,
                          color: (o = 1) => `rgba(34,128,176,${o})`,
                          labelColor: (o = 1) => `rgba(0,0,0,${o})`,
                          propsForDots: { r: "6", fill: "#fff" },
                        }}
                        bezier
                        style={styles.grafico}
                        renderDotContent={({ x, y, index }) => {
                          const r = registros[index];
                          return (
                            <Svg key={r.id || index}>
                              <Circle
                                cx={x}
                                cy={y}
                                r={6}
                                fill={getDotColor(r.valor)}
                                stroke="#0e0b0bff"
                                strokeWidth={2}
                              />
                              <SvgText
                                x={x}
                                y={y - 12}
                                fontSize="12"
                                fill={getDotColor(r.valor)}
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {r.valor}
                              </SvgText>
                            </Svg>
                          );
                        }}
                      />
                    </View>
                  </ScrollView>
                </MotiView>
              )}

              <Text style={{ fontSize: 15, marginBottom: 10, padding: 10, marginLeft: 10 }}>
                🔴 Maior que 120 = Acima da média {"\n"}
                🟢 Entre 90-120 = Equilibrado {"\n"}
                🔵 Menor que 90 = Abaixo da média
              </Text>

              <Text style={{ fontWeight: "bold", fontSize: 24, marginTop: 20, marginLeft: 20 }}>
                Histórico
              </Text>

              {/* Cards de histórico */}
              {registros.length > 0 && (
                <View style={{ maxHeight: 300, marginTop: 10 }}>
                  <ScrollView nestedScrollEnabled={true}>
                    {registros.slice().reverse().map((item, index) => (
                      <MotiView
                        key={item.id}
                        from={{ opacity: 0, translateX: -50 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ type: "timing", duration: 400, delay: index * 100 }}
                      >
                        <View style={styles.card}>
                          <Text style={styles.cardValor}>{item.valor} mg/dL</Text>
                          <Text style={styles.cardData}>
                            {new Date(item.data.seconds * 1000).toLocaleString()}
                          </Text>
                          <TouchableOpacity
                            style={styles.botaoRemover}
                            onPress={() => removerRegistro(item.id)}
                          >
                            <Text style={styles.botaoRemoverTexto}>❌ Remover</Text>
                          </TouchableOpacity>
                        </View>
                      </MotiView>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          }
        />

        {/* TAB BAR FIXA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("HomeScreen")}
          >
            <Ionicons name="home-outline" size={24} color="#00c47c" />
            <Text style={[styles.footerText, { color: "#00c47c" }]}>Início</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("Glicemia")}
          >
            <Ionicons name="water-outline" size={28} color="#009eb3ff" backgroundColor="#b9ffff8e" />
            <Text style={[styles.footerText, { color: "#009eb3ff", backgroundColor: "#b9ffffdc", fontWeight: "900", fontSize: 14 }]}>Glicemia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("Refeicao")}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={24}
              color="#d17d6b"
            />
            <Text style={[styles.footerText, { color: "#d17d6b" }]}>Refeição</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("Exercicio")}
          >
            <Ionicons name="barbell-outline" size={24} color="#7c6e7f" />
            <Text style={[styles.footerText, { color: "#7c6e7f" }]}>Exercícios</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f4f7" },
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    bottom: 12
  },
  header: {
    backgroundColor: "#1e90ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 12,
  },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff", bottom: 12 },
  inputContainer: { flexDirection: "row", marginBottom: 20, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  // Menu lateral
  menuOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.36)",
    justifyContent: "flex-start",
    alignItems: "right",
    paddingTop: 50,
    zIndex: 998,
  },
  menu: {
    marginTop: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 999,
    width: 220,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuText: { fontSize: 16, fontWeight: "500" },

  resetButton: {
    backgroundColor: '#d9534f',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  

  botao: { backgroundColor: "#227FB0", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, elevation: 3, marginRight: 10 },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
  botaoReset: { backgroundColor: "#f87171", padding: 10, borderRadius: 8, alignSelf: "flex-end", marginTop: 10, marginRight: 10 },
  botaoResetTexto: { color: "#fff", fontWeight: "bold" },
  grafico: { marginVertical: 10, borderRadius: 16 },
  card: { padding: 15, backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 2, marginLeft: 10, marginRight: 10 },
  cardValor: { fontSize: 18, fontWeight: "bold", color: "#227FB0" },
  cardData: { fontSize: 14, color: "#555", marginTop: 4 },
  botaoRemover: { marginTop: 8, backgroundColor: "#ef4444", paddingVertical: 6, borderRadius: 8, alignItems: "center" },
  botaoRemoverTexto: { color: "#fff", fontWeight: "bold" },
  instrucoes: { fontSize: 16, margin: 5, padding: 10, color: "#555", marginBottom: 15, lineHeight: 20, textAlign: "justify" },
  footer: {
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  footerItem: { alignItems: "center" },
  footerText: { fontSize: 12, marginTop: 4, fontWeight: "600" },
});
