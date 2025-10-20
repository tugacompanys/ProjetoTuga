import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { receitas } from "./data/receita";

const { width } = Dimensions.get("window");
const CARD_WIDTH = 140;
const CARD_HEIGHT = 180;

export default function RefeicaoScreen({ route, navigation }) {
  const { grupo, id: categoriaSelecionadaId, label: categoriaSelecionadaLabel } = route.params;

  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [receitasPorCategoria, setReceitasPorCategoria] = useState({});

  useEffect(() => {
    // Filtra todas as receitas que possuem a categoria selecionada
    const receitasFiltradas = receitas.filter((r) =>
      r.categorias.some((c) => c.id === categoriaSelecionadaId)
    );

    // Pega todas as categorias dessas receitas (para FlatList de cima)
    const categorias = [];
    receitasFiltradas.forEach((r) => {
      r.categorias.forEach((c) => {
        if (!categorias.find((cat) => cat.id === c.id)) {
          categorias.push(c);
        }
      });
    });
    setCategoriasFiltradas(categorias);

    // Agrupa as receitas por categoria
    const grouped = {};
    receitasFiltradas.forEach((r) => {
      r.categorias.forEach((c) => {
        if (!grouped[c.id]) grouped[c.id] = [];
        grouped[c.id].push(r);
      });
    });
    setReceitasPorCategoria(grouped);
  }, [categoriaSelecionadaId]);

  const renderCategoriaCard = ({ item }) => (
    <TouchableOpacity
      style={styles.categoriaCard}
      onPress={() =>
        navigation.push("Refeicao", {
          grupo,
          id: item.id,
          label: item.label,
        })
      }
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.categoriaLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderReceitaCard = ({ item }) => (
    <View style={styles.receitaCard}>
      <Image source={{ uri: item.imagem }} style={styles.receitaImagem} />
      <View style={styles.receitaInfo}>
        <Text style={styles.receitaNome} numberOfLines={1}>
          {item.nome}
        </Text>
        <View style={styles.receitaDetalhes}>
          <View style={styles.detalheItem}>
            <FontAwesome name="star" size={14} color="#FFD700" />
            <Text style={styles.detalheText}>{item.avaliacao}</Text>
          </View>
          <View style={styles.detalheItem}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={styles.detalheText}>{item.tempo}</Text>
          </View>
          <View style={styles.detalheItem}>
            <Ionicons name="flame-outline" size={14} color="#fff" />
            <Text style={styles.detalheText}>{item.kcal}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.tituloPrincipal}>{categoriaSelecionadaLabel}</Text>

        {/* FlatList horizontal com categorias irmãs */}
        <FlatList
          data={categoriasFiltradas}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoriaCard}
          contentContainerStyle={{ paddingHorizontal: 10, marginBottom: 20 }}
        />

        {/* FlatLists de receitas por categoria */}
        {categoriasFiltradas.map((cat) => (
          <View key={cat.id} style={{ marginBottom: 25 }}>
            <Text style={styles.subTitulo}>{cat.label}</Text>
            <FlatList
              data={receitasPorCategoria[cat.id]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderReceitaCard}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  tituloPrincipal: { fontSize: 24, fontWeight: "bold", marginLeft: 15, marginTop: 20 },
  subTitulo: { fontSize: 18, fontWeight: "600", marginLeft: 15, marginBottom: 10 },
  categoriaCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: "#E3E3E3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emoji: { fontSize: 28, marginBottom: 5 },
  categoriaLabel: { fontSize: 14, textAlign: "center" },
  receitaCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#fff",
  },
  receitaImagem: { width: "100%", height: 100 },
  receitaInfo: {
    flex: 1,
    backgroundColor: "#000",
    padding: 6,
    justifyContent: "space-between",
  },
  receitaNome: { color: "#fff", fontWeight: "600", marginBottom: 4 },
  receitaDetalhes: { flexDirection: "row", justifyContent: "space-between" },
  detalheItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detalheText: { color: "#fff", fontSize: 12 },
});
