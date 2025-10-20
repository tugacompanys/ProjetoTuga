import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 20;
const CARD_HEIGHT = 140;

const receitasFaixaCalorica = [
  { id: "1", emoji: "🥯", label: "200-300 kcal" },
  { id: "2", emoji: "🍛", label: "400-500 kcal" },
  { id: "3", emoji: "🍝", label: "600-700 kcal" },
  { id: "4", emoji: "🥞", label: "300-400 kcal" },
  { id: "5", emoji: "🍱", label: "500-600 kcal" },
  { id: "6", emoji: "🍔", label: "700+ kcal" },
  { id: "7", emoji: "🥗", label: "100-200 kcal" },
  { id: "8", emoji: "🍩", label: "800+ kcal" },
];

const categoriasComuns = [
  { id: "1", emoji: "☕", label: "Café da manhã" },
  { id: "2", emoji: "🍲", label: "Almoço" },
  { id: "3", emoji: "🥗", label: "Jantar" },
  { id: "4", emoji: "🍳", label: "Rico em proteína" },
  { id: "5", emoji: "🥩", label: "Baixo carboidrato" },
  { id: "6", emoji: "🥑", label: "Baixa gordura" },
  { id: "7", emoji: "🍎", label: "Baixa caloria" },
  { id: "8", emoji: "🥄", label: "Poucos ingredientes" },
  { id: "9", emoji: "🏃", label: "Preparo rápido" },
  { id: "10", emoji: "🍲", label: "Fácil" },
];

const escolhaRefeicao = [
  { id: "1", emoji: "🥣", label: "Café da manhã" },
  { id: "2", emoji: "🥬", label: "Almoço" },
  { id: "3", emoji: "🍛", label: "Jantar" },
  { id: "4", emoji: "🍓", label: "Lanche" },
];

const escolhaMetodo = [
  { id: "1", emoji: "🍲", label: "Fácil" },
  { id: "2", emoji: "🥗", label: "Para comer no caminho" },
  { id: "3", emoji: "🏃", label: "Rápido" },
  { id: "4", emoji: "🥄", label: "Poucos ingredientes" },
];

const preferencias = [
  { id: "1", emoji: "🥩", label: "Baixo carboidrato" },
  { id: "2", emoji: "🥑", label: "Baixa gordura" },
  { id: "3", emoji: "🍎", label: "Baixa caloria" },
  { id: "4", emoji: "🍗", label: "Rico em proteína" },
  { id: "5", emoji: "🌾", label: "Rico em fibra" },
  { id: "6", emoji: "🥓", label: "Cetogênica" },
  { id: "7", emoji: "🥛", label: "Sem lactose" },
  { id: "8", emoji: "🌽", label: "Sem glúten" },
];

function getCurvaPorQuadrado(index) {
  switch (index) {
    case 0: return "M0,50 Q80,100 130,70 T240,80 L240,140 L0,140 Z";
    case 1: return "M0,0 Q10000,130 120,80 T240,80 L240,140 L0,140 Z";
    case 2: return "M0,55 Q60,50 120,130 T240,50 L240,140 L0,140 Z";
    case 3: return "M0,0 Q120,-50 140,20 T240,80 L240,140 L0,140 Z";
    case 4: return "M0,680 Q20,120 120,80 T240,80 L240,140 L0,140 Z";
    case 5: return "M0,73 Q40,80 70,0 T240,80 L240,140 L0,140 Z";
    case 6: return "M0,60 Q100,40 250,200 T240,80 L240,140 L0,140 Z";
    case 7: return "M0,0 Q10000,130 120,80 T240,80 L240,140 L0,140 Z";
    default: return "M0,80 Q60,30 120,80 T240,80 L240,140 L0,140 Z";
  }
}

function CardOndulado({ item, index }) {
  const curva = getCurvaPorQuadrado(index);
  return (
    <View style={styles.card}>
      <Svg width={CARD_WIDTH} height={CARD_HEIGHT} style={StyleSheet.absoluteFill}>
        <Path d={curva} fill="#6AC484" opacity={0.85} />
      </Svg>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.label}>{item.label}</Text>
    </View>
  );
}

function renderColunas({ item, navigation }) {
  return (
    <View style={styles.column}>
      {item.map((cardItem) => (
        <TouchableOpacity
          key={cardItem.id}
          onPress={() =>
navigation.navigate("Refeicao", { categoria: item.label })

          }
        >
          <CardOndulado item={cardItem} index={cardItem.id - 1} />
        </TouchableOpacity>
      ))}
    </View>
  );
}


function CardHorizontalFlex({ item, navigation, grupo, backgroundColor = "#E3E3E3" }) {
  return (
        <TouchableOpacity
          style={[styles.cardHorizontalFlex, { backgroundColor }]}
          onPress={() =>
            navigation.navigate("Refeicao", { categoria: item.label })

          }
        >

      <Text style={[styles.emoji, { fontSize: 20 }]}>{item.emoji}</Text>
      <Text style={[styles.label, { fontSize: 12, marginTop: 2 }]} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

function CardHorizontal({ item, backgroundColor = "#F9F6EE", onPressCard }) {
  return (
    <TouchableOpacity
      style={[styles.cardHorizontalFlex, { backgroundColor }]}
      onPress={onPressCard}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Path
          d="M0,40 Q60,10 120,60 T240,80 L240,140 L0,140 Z"
          fill="#000"
          opacity={0.08}
        />
        <Path d="M20,100 Q80,50 200,120" stroke="#000" strokeWidth={2} opacity={0.1} />
      </Svg>
      <Text style={[styles.emoji, { fontSize: 28 }]}>{item.emoji}</Text>
      <Text style={[styles.label, { fontSize: 14, marginTop: 5 }]} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}


export default function InicioRefeicaoScreen({ navigation }) {
  const [abaSelecionada, setAbaSelecionada] = useState("descubra");

  const groupedData = [];
  for (let i = 0; i < receitasFaixaCalorica.length; i += 2) {
    groupedData.push(receitasFaixaCalorica.slice(i, i + 2));
  }

  const groupedPreferencias = [];
  for (let i = 0; i < preferencias.length; i += 2) {
    groupedPreferencias.push(preferencias.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Receitas</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Ionicons name="search-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Ionicons name="add-outline" size={28} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabButton, abaSelecionada === "descubra" && styles.tabButtonAtivo]}
            onPress={() => setAbaSelecionada("descubra")}
          >
            <Text style={[styles.tabText, abaSelecionada === "descubra" && styles.tabTextAtivo]}>
              DESCUBRA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, abaSelecionada === "favoritas" && styles.tabButtonAtivo]}
            onPress={() => setAbaSelecionada("favoritas")}
          >
            <Text style={[styles.tabText, abaSelecionada === "favoritas" && styles.tabTextAtivo]}>
              MINHAS FAVORITAS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.title}>Categorias comuns</Text>
<FlatList
  data={categoriasComuns}
  horizontal
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <CardHorizontalFlex
      item={item}
      navigation={navigation}
      onPressCard={() =>
        navigation.navigate("Refeicao", { categoria: item.label })
      }
    />
  )}
  contentContainerStyle={{ paddingHorizontal: 10, marginBottom: 10 }}
/>


        <Text style={styles.title}>Calorias contadas</Text>
        <FlatList
          data={groupedData}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => renderColunas({ item, navigation, grupo: "caloriasContadas" })}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />

        <Text style={styles.title}>Escolha a refeição</Text>
<FlatList
  data={escolhaRefeicao}
  horizontal
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <CardHorizontal
      item={item}
      onPressCard={() =>
navigation.navigate("Refeicao", { categoria: item.label })
      }
    />
  )}
  contentContainerStyle={{ paddingHorizontal: 10 }}
/>


        <Text style={styles.title}>Escolha seu método</Text>
        <FlatList
          data={escolhaMetodo}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CardHorizontal item={item} navigation={navigation} grupo="escolhaMetodo" backgroundColor="#FAD689" />}
          contentContainerStyle={{ paddingHorizontal: 10, marginBottom: 20 }}
        />

        <Text style={styles.title}>Preferências</Text>
        <FlatList
          data={groupedPreferencias}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.column}>
              {item.map((cardItem) => (
                <TouchableOpacity
                  key={cardItem.id}
                        onPress={() =>
navigation.navigate("Refeicao", { categoria: item.label })

                        }
                >
                  <CardOndulado item={cardItem} index={cardItem.id - 1} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 10, marginBottom: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  headerContainer: { backgroundColor: "#fff", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#000" },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  tabs: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#eee" },
  tabButton: { paddingVertical: 6, paddingHorizontal: 12 },
  tabButtonAtivo: { borderBottomWidth: 2, borderBottomColor: "#5DE884" },
  tabText: { color: "#555", fontWeight: "bold", fontSize: 16 },
  tabTextAtivo: { color: "#5DE884" },
  title: { fontSize: 20, fontWeight: "bold", color: "#000", marginLeft: 15, marginTop: 20, marginBottom: 10 },
  column: { flexDirection: "column", marginRight: 10 },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 16, backgroundColor: "#F9F6EE", overflow: "hidden", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cardHorizontalFlex: { borderRadius: 16, backgroundColor: "#E3E3E3", overflow: "hidden", alignItems: "center", justifyContent: "center", marginRight: 10, paddingHorizontal: 10, paddingVertical: 8, minWidth: 60, maxWidth: 120 },
  cardHorizontalLarge: { width: CARD_WIDTH, height: 120, borderRadius: 16, backgroundColor: "#F9F6EE", overflow: "hidden", alignItems: "center", justifyContent: "center", marginRight: 12 },
  emoji: { fontSize: 28, color: "#000", zIndex: 2 },
  label: { color: "#000", fontWeight: "600", zIndex: 2, marginTop: 5, textAlign: "center" },
});
