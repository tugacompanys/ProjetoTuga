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
import { Circle, Text as SvgText } from "react-native-svg";

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
    if (valor < 90) return "#3b82f6"; // azul (baixo)
    if (valor > 120) return "#ef4444"; // vermelho (alto)
    return "#22c55e"; // verde (normal)
  };

  return (


    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={registros.slice().reverse()}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.titulo}>📊 Controle de Glicemia</Text>

            {/* Texto de instruções */}
            <Text style={styles.instrucoes}>
              Nesta tela você pode registrar seus níveis de glicemia diários. {"\n"}
              • Digite o valor e pressione "Salvar" para adicionar um registro.{"\n"}
              • Os registros aparecem abaixo em ordem cronológica.{"\n"}
              • O gráfico mostra a evolução, com cores indicando: azul (baixo), verde (normal), vermelho (alto).{"\n"}
              • Pressione "❌ Remover" para excluir um registro ou "Resetar Tudo" para apagar todos.
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
                          new Date(r.data.seconds * 1000).toLocaleDateString()
                        ),
                        datasets: [{ data: registros.map((r) => r.valor) }],
                      }}
                      width={Math.max(largura, registros.length * 80 + 40)}
                      height={240}
                      chartConfig={{
                        backgroundGradientFrom: "#f0f4f7",
                        backgroundGradientTo: "#dceefc",
                        decimalPlaces: 0,
                        color: (opacity = 1) =>
                          `rgba(34, 128, 176, ${opacity})`,
                        labelColor: (opacity = 1) =>
                          `rgba(0,0,0,${opacity})`,
                        propsForDots: { r: "0" },
                        propsForBackgroundLines: { strokeDasharray: "" },
                      }}
                      bezier
                      style={styles.grafico}
                      decorator={({ width, height, data }) => {
                        const chartHeight = height - 40;
                        const chartWidth = width - 60;
                        const max = Math.max(...data);
                        const min = Math.min(...data);

                        return registros.map((r, i) => {
                          const stepX = chartWidth / (registros.length - 1 || 1);
                          const x = i * stepX + 30;
                          const y = ((max - r.valor) / (max - min)) * chartHeight + 20;

                          return (
                            <React.Fragment key={`frag-${r.id}`}>
                              <Circle
                                cx={x}
                                cy={y}
                                r={6}
                                fill={getDotColor(r.valor)}
                                stroke="#fff"
                                strokeWidth={2}
                              />
                              {/* Número colorido sobre o ponto */}
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
                            </React.Fragment>
                          );
                        });
                      }}
                    />
                  </View>
                </ScrollView>
              </MotiView>
            )}
          </>
        }
        renderItem={({ item, index }) => (
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
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f4f7" },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
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
  }
});
