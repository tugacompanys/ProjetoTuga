import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

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
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistros(dados);
    });
    return () => unsubscribe();
  }, []);

  const salvarGlicemia = async () => {
    if (!valor) return;
    await addDoc(collection(db, "users", auth.currentUser.uid, "glicemia"), {
      valor: Number(valor),
      data: new Date()
    });
    setValor("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Controle de Glicemia</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite a glicemia"
          keyboardType="numeric"
          value={valor}
          onChangeText={setValor}
        />
        <Button title="Salvar" onPress={salvarGlicemia} />
      </View>

      {registros.length > 0 && (
        <LineChart
          data={{
            labels: registros.map(r => new Date(r.data.seconds * 1000).toLocaleTimeString()),
            datasets: [{ data: registros.map(r => r.valor) }]
          }}
          width={largura}
          height={220}
          yAxisSuffix=" mg/dL"
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            strokeWidth: 2,
          }}
          style={{ marginVertical: 20, borderRadius: 16 }}
        />
      )}

      <FlatList
        data={registros.slice().reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Valor: {item.valor} mg/dL</Text>
            <Text>Data: {new Date(item.data.seconds * 1000).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f4f7" },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#227FB0" },
  inputContainer: { flexDirection: "row", marginBottom: 20, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginRight: 10 },
  card: { padding: 15, backgroundColor: "#fff", borderRadius: 10, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 }
});
