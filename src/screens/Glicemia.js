import React, { useState, useEffect } from "react";
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
  BackHandler,
  Image,
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
import Animated, { SlideInLeft } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function Glicemia() {
  const [valor, setValor] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [nome, setNome] = useState("Usuário");
  const [registros, setRegistros] = useState([]);
  const { width: screenWidth } = Dimensions.get("window");
  const largura = screenWidth - 40;
  const navigation = useNavigation();

  // 🔹 Buscar dados de glicemia do Firestore
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

  // 🔹 Salvar valor no Firestore
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

  // 🔹 Remover registro
  const removerRegistro = async (id) => {
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "glicemia", id));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover este registro.");
    }
  };

  // 🔹 Resetar todos registros
  const resetarTudo = async () => {
    Alert.alert("Confirmar", "Deseja realmente apagar todos os registros?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar tudo",
        style: "destructive",
        onPress: async () => {
          try {
            const q = collection(db, "users", auth.currentUser.uid, "glicemia");
            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map((docSnap) =>
              deleteDoc(
                doc(db, "users", auth.currentUser.uid, "glicemia", docSnap.id)
              )
            );
            await Promise.all(promises);
          } catch (error) {
            Alert.alert("Erro", "Não foi possível apagar os registros.");
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
        {/* 🔹 Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuAberto(true)}>
            <Ionicons name="menu-outline"
              size={28}
              color="#fff"
              paddingBottom={20}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>📊 Controle de Glicemia</Text>
          <View style={{ width: 28 }} />
        </View>

        {/*Menu lateral */}
        {
          menuAberto && (
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setMenuAberto(false)}
            >
              <Animated.View
                entering={SlideInLeft.duration(300)}
                style={[styles.menuContainer, { width: screenWidth * 0.8 }]}
              >
                <LinearGradient
                  colors={["#1e90ff", "#b5d8fcff"]}
                  style={styles.menuGradient}
                >
                  <View style={styles.menuHeader}>
                    <Image
                      source={{ uri: "https://i.pravatar.cc/150?img=47" }}
                      style={styles.avatar}
                    />
                    <Text style={styles.username}>{nome}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuAberto(false);
                      navigation.navigate("Login");
                    }}
                  >
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={22}
                      color="#fff"
                    />
                    <Text style={styles.menuText}>Trocar Conta</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuAberto(false);
                      navigation.navigate("Configurações");
                    }}
                  >
                    <Ionicons name="settings-outline" size={22} color="#fff" />
                    <Text style={styles.menuText}>Configurações</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuItem, { marginTop: "auto" }]}
                    onPress={() => {
                      setMenuAberto(false);
                      BackHandler.exitApp();
                    }}
                  >
                    <Ionicons name="exit-outline" size={22} color="#ff4d4d" />
                    <Text style={[styles.menuText, { color: "#ff4d4d" }]}>Sair</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          )
        }

        {/* 🔹 Corpo principal */}
        <FlatList
          data={[]}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <>
              <Text style={styles.instrucoes}>
                Registre seus níveis de glicemia e acompanhe o gráfico e o
                histórico abaixo.
                {"\n\n"}• Digite o valor {"\n"}• Pressione "Salvar"
              </Text>

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
                  <Ionicons
                    name="reload-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.botaoResetTexto}>Resetar Tudo</Text>
                </TouchableOpacity>
              )}

              {/* 🔹 Gráfico */}
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
                              { day: "2-digit", month: "2-digit" }
                            )
                          ),
                          datasets: [{ data: registros.map((r) => r.valor) }],
                        }}
                        width={Math.max(largura, registros.length * 80 + 40)}
                        height={260}
                        yAxisSuffix="/dL"
                        chartConfig={{
                          backgroundGradientFrom: "#dceefc",
                          backgroundGradientTo: "#ffffff",
                          decimalPlaces: 0,
                          color: (o = 1) => `rgba(34,128,176,${o})`,
                          labelColor: (o = 1) => `rgba(0,0,0,${o})`,
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

              <Text
                style={{
                  fontSize: 15,
                  marginBottom: 10,
                  padding: 10,
                  marginLeft: 10,
                }}
              >
                🔴 Maior que 120 = Acima da média {"\n"}
                🟢 Entre 90-120 = Equilibrado {"\n"}
                🔵 Menor que 90 = Abaixo da média
              </Text>

              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 24,
                  marginTop: 20,
                  marginLeft: 20,
                }}
              >
                Histórico
              </Text>
              {registros.length > 0 && (
                <View style={{ maxHeight: 300, marginTop: 10 }}>
                  <ScrollView nestedScrollEnabled={true}>
                    {registros
                      .slice()
                      .reverse()
                      .map((item, index) => (
                        <MotiView
                          key={item.id}
                          from={{ opacity: 0, translateX: -50 }}
                          animate={{ opacity: 1, translateX: 0 }}
                          transition={{
                            type: "timing",
                            duration: 400,
                            delay: index * 100,
                          }}
                        >
                          <View style={styles.card}>
                            <Text style={styles.cardValor}>
                              {item.valor} mg/dL
                            </Text>
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

        {/* 🔹 Rodapé fixo */}
        <View style={styles.footerWrapper}>
          <LinearGradient
            colors={["#ffffffcc", "#f5f4fcee"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.footer}
          >
            <TouchableOpacity
              style={styles.footerItem}
              onPress={() => navigation.navigate("HomeScreen")}
            >
              <Ionicons name="home-outline" size={26} color="#00c47c" />
              <Text style={[styles.footerText, { color: "#00c47c" }]}>
                Início
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerItem, styles.activeTab]}
              onPress={() => navigation.navigate("Glicemia")}
            >
              <Ionicons name="water-outline" size={26} color="#00bcd4" />
              <Text style={[styles.footerText, { color: "#00bcd4" }]}>
                Glicemia
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerItem}
              onPress={() => navigation.navigate("Refeicao")}
            >
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={26}
                color="#d17d6b"
              />
              <Text style={[styles.footerText, { color: "#d17d6b" }]}>
                Refeição
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerItem}
              onPress={() => navigation.navigate("Exercicio")}
            >
              <Ionicons name="barbell-outline" size={26} color="#7c6e7f" />
              <Text style={[styles.footerText, { color: "#7c6e7f" }]}>
                Exercícios
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f4f7"
  },

  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },

  header: {
    backgroundColor: "#1e90ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 0,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
  },

  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    bottom: 12
  },

  // 🔹 Menu lateral corrigido
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    zIndex: 998,
  },

  menuContainer: {
    height: "100%",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    elevation: 8,
  },

  menuGradient: {
    flex: 1,
    padding: 20,
  },

  menuHeader: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, borderWidth: 2, borderColor: "#fff" },
  username: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.3)" },
  menuText: { marginLeft: 15, color: "#fff", fontSize: 16, fontWeight: "600" },

  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  botao: {
    backgroundColor: "#227FB0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
  },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
  botaoReset: {
    backgroundColor: "#f87171",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  botaoResetTexto: { color: "#fff", fontWeight: "bold" },
  grafico: { marginVertical: 10, borderRadius: 16 },
  instrucoes: {
    fontSize: 16,
    margin: 10,
    color: "#555",
    marginBottom: 15,
    lineHeight: 20,
    textAlign: "justify",
  },

  // 🔹 Cards
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginHorizontal: 10,
  },
  cardValor: { fontSize: 18, fontWeight: "bold", color: "#227FB0" },
  cardData: { fontSize: 14, color: "#555", marginTop: 4 },
  botaoRemover: {
    marginTop: 8,
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoRemoverTexto: { color: "#fff", fontWeight: "bold" },

  footerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingBottom: 10, // espaço p/ iPhone com notch
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "95%",
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 8, // sombra Android
    shadowColor: "#000", // sombra iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },

  footerItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  footerText: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "700",
  },

  activeTab: {
    backgroundColor: "rgba(0, 134, 196, 0.08)", // leve destaque no item ativo
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

});