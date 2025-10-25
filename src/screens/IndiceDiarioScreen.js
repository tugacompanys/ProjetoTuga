import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import Ionicons from 'react-native-vector-icons/Ionicons'; // ícone de seta

export default function IndiceDiarioScreen({ route, navigation }) {
  const { plano } = route.params || {};
  const [planoAtual, setPlanoAtual] = useState(plano || null);
  const [loading, setLoading] = useState(true);

  async function carregarDados() {
    try {
      setLoading(true);
      if (!planoAtual) {
        const planoSalvo = await AsyncStorage.getItem("@nutrition_plan");
        if (planoSalvo) setPlanoAtual(JSON.parse(planoSalvo));
      }
    } catch (e) {
      console.error("Erro ao carregar plano:", e);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { carregarDados(); }, []));

  const macroPieData = planoAtual
    ? [
      { name: "Carboidratos", population: planoAtual.macros.carbs_g, color: "#4A90E2", legendFontColor: "#4A90E2", legendFontSize: 16 },
      { name: "Proteínas", population: planoAtual.macros.protein_g, color: "#50E3C2", legendFontColor: "#50E3C2", legendFontSize: 16 },
      { name: "Gorduras", population: planoAtual.macros.fat_g, color: "#7ED321", legendFontColor: "#7ED321", legendFontSize: 16 },
    ]
    : [];

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#00796B" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
        <Image
          source={require("../../assets/tuga_calculadora.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>📊 Seus Resultados</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
        ) : planoAtual ? (
          <>
            <View style={styles.cardPlano}>
              <Text style={styles.cardTitle}>Plano Atual</Text>
              <Text style={styles.itemTxt}>🔹 Calorias: {planoAtual.macros.kcal} kcal</Text>
              <Text style={styles.itemTxt}>🍞 Carboidratos: {planoAtual.macros.carbs_g} g</Text>
              <Text style={styles.itemTxt}>🥩 Proteínas: {planoAtual.macros.protein_g} g</Text>
              <Text style={styles.itemTxt}>🥑 Gorduras: {planoAtual.macros.fat_g} g</Text>

              <Text style={styles.subtitulo}>Divisão por Refeições 🍽</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {Object.entries(planoAtual.perMeal || {}).map(([ref, v]) => (
                    <View key={ref} style={styles.mealCard}>
                      <Text style={styles.mealTitle}>{labelMeal(ref)}</Text>
                      <Text style={styles.mealInfo}>
                        {v.kcal} kcal · C:{v.carbs_g}g · P:{v.protein_g}g · G:{v.fat_g}g
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => navigation.navigate('Perfil')}
              >
                <Text style={styles.updateButtonText}>Atualizar Plano</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitulo}>🍕 Distribuição de Macros</Text>
            <PieChart
              data={macroPieData}
              width={Dimensions.get("window").width - 40}
              height={250}
              chartConfig={{
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#D0F0F9",
                color: (opacity = 1) => `rgba(74,144,226, ${opacity})`,
                labelColor: () => "#333333",
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              hasLegend={true}
            />
          </>
        ) : (
          <Text style={styles.alert}>⚠ Nenhum plano carregado</Text>
        )}
      </ScrollView>
    </View>
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
  container: { flex: 1, backgroundColor: "#D0F0F9" },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginLeft: 10,
    marginTop: 10
  },
  backText: {
    color: '#00796B',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6
  },
  titulo: { fontSize: 34, fontWeight: "900", marginBottom: 20, color: "#00796B", textAlign: "center" },
  icon: { width: 130, height: 130, marginBottom: 20 },
  cardPlano: {
    width: "100%",
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 28,
    marginBottom: 26,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#50E3C2",
    backgroundColor: "#FFFFFF",
    shadowColor: "#50E3C2",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontWeight: "900",
    marginBottom: 20,
    fontSize: 26,
    color: "#00796B",
  },
  subtitulo: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 14,
    color: "#00796B",
  },
  itemTxt: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333333",
  },
  mealCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#50E3C2',
    alignItems: 'center',
    minWidth: 120,
    backgroundColor: '#B2EBF2',
  },
  mealTitle: {
    color: '#004D40',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  mealInfo: {
    color: '#00796B',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  updateButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignSelf: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  alert: { color: "#D32F2F", marginTop: 20, fontWeight: "700", fontSize: 16 },
});
