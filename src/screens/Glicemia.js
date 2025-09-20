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
import Svg, { Circle, Text as SvgText } from "react-native-svg"; // <--- alteração aqui

export default function Glicemia() {
  const [valor, setValor] = useState("");
  const [registros, setRegistros] = useState([]);
  const largura = Dimensions.get("window").width - 40;

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

    await addDoc(collection(db, "users", auth.currentUser.uid, "glicemia"), {
      valor: Number(valor),
      data: new Date(),
    });

    setValor("");
    Alert.alert("Sucesso", "Registro salvo com sucesso!");
  };

  const removerRegistro = async (id) => {
    Alert.alert("Confirmar", "Deseja apagar este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(
            doc(db, "users", auth.currentUser.uid, "glicemia", id)
          );
        },
      },
    ]);
  };

  const resetarTudo = async () => {
    Alert.alert("Confirmar", "Deseja realmente apagar todos os registros?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar tudo",
        style: "destructive",
        onPress: async () => {
          const q = collection(db, "users", auth.currentUser.uid, "glicemia");
          const snapshot = await getDocs(q);
          snapshot.forEach(async (docSnap) => {
            await deleteDoc(
              doc(db, "users", auth.currentUser.uid, "glicemia", docSnap.id)
            );
          });
          setValor("");
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            <Text style={styles.titulo}>📊 Controle de Glicemia</Text>

            <Text style={styles.instrucoes}>
              Nesta tela você pode registrar seus níveis de glicemia diários e você poderá acompanhar seu histórico de informações logo abaixo.
              {"\n"}{"\n"}
              • Digite o valor {"\n"}
              • Pressione "Salvar"
            </Text>



            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite o valor da glicemia (mg/dL)"
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
                  <View style={{ paddingHorizontal: 20  }}>
                    <LineChart
                      data={{
                        labels: registros.map((r) =>
                          new Date(r.data.seconds * 1000).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })
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
                        color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                        propsForDots: { r: "6", fill: "#fff" },
                      }}
                      bezier
                      style={styles.grafico}
                      renderDotContent={({ x, y, index }) => {
                        const r = registros[index];
                        return (
                          <Svg>
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

            <Text style={{ fontSize: 15, marginBottom: 10 }}>
              🔴 Vermelho: Acima do normal (&gt; 120 mg/dL){"\n"}
              🟢 Verde: Normal (90 - 120 mg/dL){"\n"}
              🔵 Azul: Abaixo do normal (&lt; 90 mg/dL){"\n"}
            </Text>

            <Text style={{ fontWeight: "bold", margin: 55 - 10 - 30 - 10, fontSize: 30 }}> Histórico </Text>

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
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f4f7" },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#227FB0",
    textAlign: "center",
  },
  inputContainer: { flexDirection: "row", marginBottom: 20, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
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
    marginBottom: 10,
    marginTop: 10,
  },
  botaoResetTexto: { color: "#fff", fontWeight: "bold" },
  grafico: { marginVertical: 20, borderRadius: 16 },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
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
  instrucoes: {
    fontSize: 16,
    margin: 5,
    padding: 10,
    color: "#555",
    marginBottom: 15,
    lineHeight: 20,
    textAlign: "justify",
  },
});
