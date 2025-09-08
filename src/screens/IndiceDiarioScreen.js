// src/screens/IndiceDiarioScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../config/firebaseConfig";

export default function IndiceDiarioScreen({ route }) {
  const { userId, plano } = route.params || {}; // pode vir nulo
  const [planoAtual, setPlanoAtual] = useState(plano || null);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    async function carregarPlano() {
      try {
        if (!planoAtual) {
          const planoSalvo = await AsyncStorage.getItem("@nutrition_plan");
          if (planoSalvo) {
            setPlanoAtual(JSON.parse(planoSalvo));
          }
        }
      } catch (e) {
        console.error("Erro ao carregar plano do AsyncStorage", e);
      }
    }

    async function carregarHistorico() {
      try {
        if (!userId) return;
        const historicoRef = collection(db, "usuarios", userId, "historico");
        const snapshot = await getDocs(historicoRef);
        setHistorico(snapshot.docs.map(doc => doc.data()));
      } catch (e) {
        console.error("Erro ao carregar histórico:", e);
      }
    }

    carregarPlano();
    carregarHistorico();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📊 Índice Diário</Text>

      {planoAtual ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Plano Nutricional</Text>
          <Text>🔹 Calorias: {planoAtual.macros.kcal} kcal</Text>
          <Text>🍞 Carboidratos: {planoAtual.macros.carbs_g} g</Text>
          <Text>🥩 Proteínas: {planoAtual.macros.protein_g} g</Text>
          <Text>🥑 Gorduras: {planoAtual.macros.fat_g} g</Text>
        </View>
      ) : (
        <Text style={styles.alert}>⚠ Nenhum plano carregado</Text>
      )}

      <Text style={styles.subtitulo}>📅 Histórico</Text>
      {historico.length > 0 ? (
        historico.map((h, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemTxt}>
              📅{" "}
              {h.timestamp?.seconds
                ? new Date(h.timestamp.seconds * 1000).toLocaleString()
                : new Date(h.timestamp).toLocaleString()}
            </Text>
            <Text>Calorias: {h.macros?.kcal} kcal</Text>
            <Text>Carboidratos: {h.macros?.carbs_g} g</Text>
            <Text>Proteínas: {h.macros?.protein_g} g</Text>
            <Text>Gorduras: {h.macros?.fat_g} g</Text>
          </View>
        ))
      ) : (
        <Text style={styles.alert}>⚠ Nenhum histórico encontrado</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  subtitulo: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  item: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  itemTxt: { fontWeight: "bold" },
  alert: { color: "red", fontStyle: "italic", marginTop: 10 },
});
