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
  };

  const removerRegistro = async (id) => {
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "glicemia", id));
    } catch (error) {
      console.log("Erro ao remover:", error);
    }
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
        },
      },
    ]);
  };

  // Determina cor do ponto
  const getDotColor = (valor) => {
    if (valor < 90) return "#3b82f6"; // azul
    if (valor > 120) return "#ef4444"; // vermelho
    return "#22c55e"; // verde
  };

  // Converte valor glicemia para posição y no gráfico
  const getYPos = (valor, height) => {
    const max = 130;
    const min = 70;
    return ((max - valor) / (max - min)) * height;
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.titulo}>📊 Controle de Glicemia</Text>

        {/* Campo de input */}
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

        {/* Botão resetar tudo */}
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
            <ScrollView horizontal showsHorizontalScrollIndicator>
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

                  fromZero={false}
                  segments={() => 0}
                  chartConfig={{
                    backgroundGradientFrom: "#f0f4f7",
                    backgroundGradientTo: "#dceefc",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                    propsForDots: { r: "0" },
                    propsForBackgroundLines: { strokeDasharray: "" },
                  }}
                  bezier
                  style={styles.grafico}
                  decorator={() =>
                    registros.map((r, i) => {
                      const chartHeight = 240 - 20; // altura interna do gráfico
                      const chartWidth = Math.max(largura, registros.length * 80 + 40); // largura total
                      const x = (i * chartWidth) / registros.length; // posição horizontal do ponto
                      const y = getYPos(r.valor, chartHeight); // posição vertical do ponto
                      return (
                        <View
                          key={i}
                          style={{


                          }}
                        />
                      );
                    })
                  }

                />
              </View>
            </ScrollView>

            {/* Labels fixos do lado */}
            <View
              style={{
                position: "absolute",
                left: 0,
                top: 20,
                height: 200,
                justifyContent: "space-between",
              }}
            >
              <Text>130 mg/dL</Text>
              <Text>90 mg/dL</Text>
              <Text>70 mg/dL</Text>
            </View>

            {/* Legenda vertical */}
            <View style={[styles.legendaContainer, { margin: 20 }]}>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, { backgroundColor: "#22c55e" }]} />
                <Text>Normal (90-120 mg/dL)</Text>
              </View>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, { backgroundColor: "#3b82f6" }]} />
                <Text>Abaixo (&lt;90 mg/dL)</Text>
              </View>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, { backgroundColor: "#ef4444" }]} />
                <Text>Acima (&gt;120 mg/dL)</Text>
              </View>
            </View>
          </MotiView>
        )}

        {/* Histórico animado */}
        <FlatList
          data={registros.slice().reverse()}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <MotiView
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
      </View>
    </ScrollView>
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
  legendaContainer: { flexDirection: "column", marginTop: 10 },
  legendaItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendaCor: { width: 16, height: 16, borderRadius: 8, marginRight: 6 },
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
});
