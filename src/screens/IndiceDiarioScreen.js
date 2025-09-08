import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Button, TouchableOpacity, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";

export default function IndiceDiarioScreen({ route }) {
  const { userId, plano } = route.params || {};
  const [planoAtual, setPlanoAtual] = useState(plano || null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showGrafico, setShowGrafico] = useState(false);

  async function carregarDados() {
    try {
      setLoading(true);

      if (!planoAtual) {
        const planoSalvo = await AsyncStorage.getItem("@nutrition_plan");
        if (planoSalvo) setPlanoAtual(JSON.parse(planoSalvo));
      }

      if (userId) {
        const historicoRef = collection(db, "users", userId, "historico");
        const q = query(historicoRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const hist = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHistorico(hist);
      }
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    } finally {
      setLoading(false);
    }
  }

  async function excluirHistorico(id) {
    try {
      await deleteDoc(doc(db, "users", userId, "historico", id));
      setHistorico(historico.filter(h => h.id !== id));
    } catch (e) {
      console.error("Erro ao excluir histórico:", e);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [userId])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📊 Últimos Resultados</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1e90ff" style={{ marginTop: 20 }} />
      ) : planoAtual ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Plano Nutricional</Text>
          <Text>🔹 Calorias: {planoAtual.macros.kcal} kcal</Text>
          <Text>🍞 Carboidratos: {planoAtual.macros.carbs_g} g</Text>
          <Text>🥩 Proteínas: {planoAtual.macros.protein_g} g</Text>
          <Text>🥑 Gorduras: {planoAtual.macros.fat_g} g</Text>

          <Text style={styles.subtitulo}>Divisão por Refeições 🍽</Text>
          {Object.entries(planoAtual.perMeal || {}).map(([ref, v]) => (
            <Text key={ref} style={styles.itemTxt}>
              {labelMeal(ref)} → {v.kcal} kcal · C:{v.carbs_g}g · P:{v.protein_g}g · G:{v.fat_g}g
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.alert}>⚠ Nenhum plano carregado</Text>
      )}

      {/* Botões para mostrar histórico e gráfico */}
      <View style={styles.btnRow}>
        <Button title={showHistorico ? "Esconder Histórico" : "Mostrar Histórico"} onPress={() => setShowHistorico(!showHistorico)} />
        <Button title={showGrafico ? "Esconder Gráfico" : "Mostrar Gráfico"} onPress={() => setShowGrafico(!showGrafico)} />
      </View>

      {/* Histórico */}
      {showHistorico && (
        <>
          <Text style={styles.subtitulo}>📅 Histórico</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#34d399" />
          ) : historico.length > 0 ? (
            historico.map((h, i) => (
              <View key={h.id || i} style={styles.item}>
                <Text style={styles.itemTxt}>
                  📅 {h.createdAt?.toDate().toLocaleString() || "Sem data"}
                </Text>
                <Text>Calorias: {h.macros?.kcal} kcal</Text>
                <Text>Carboidratos: {h.macros?.carbs_g} g</Text>
                <Text>Proteínas: {h.macros?.protein_g} g</Text>
                <Text>Gorduras: {h.macros?.fat_g} g</Text>

                <TouchableOpacity onPress={() => excluirHistorico(h.id)} style={styles.deleteBtn}>
                  <Text style={{ color: "white" }}>🗑 Excluir</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.alert}>⚠ Nenhum histórico encontrado</Text>
          )}
        </>
      )}

      {/* Gráfico */}
      {showGrafico && historico.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subtitulo}>📈 Evolução de Carboidratos</Text>
          <LineChart
            data={{
              labels: historico.slice(0, 5).map(h => h.createdAt?.toDate().toLocaleDateString() || ""),
              datasets: [{ data: historico.slice(0, 5).map(h => h.macros?.carbs_g || 0) }],
            }}
            width={Dimensions.get("window").width - 40}
            height={220}
            yAxisSuffix="g"
            chartConfig={{
              backgroundColor: "#1e90ff",
              backgroundGradientFrom: "#6fbfff",
              backgroundGradientTo: "#1e90ff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: () => "#fff",
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

function labelMeal(key) {
  switch (key) {
    case "cafe": return "Café da manhã";
    case "almoco": return "Almoço";
    case "jantar": return "Jantar";
    case "lanche": return "Lanche/Ceia";
    default: return key;
  }
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#9ecfff75", padding: 12, borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontWeight: "700", marginBottom: 6, fontSize: 18, color: "#0e3f77ff" },
  subtitulo: { fontSize: 18, fontWeight: "600", marginTop: 30, marginBottom: 12, color: "#0e3f77ff" },
  item: { marginBottom: 12, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  itemTxt: { fontSize: 14, marginBottom: 4, color: "#000000ff" },
  alert: { color: "red", marginTop: 8 },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  deleteBtn: { marginTop: 6, backgroundColor: "red", padding: 6, borderRadius: 6, alignItems: "center" }
});
