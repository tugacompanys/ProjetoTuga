import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { alimentos } from "./../data/receita";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";


const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 1 - 130;
const CARD_HEIGHT = 220;
const INFO_HEIGHT = 70;  // espaço para nome, kcal, estrelas

function getSecoesPorCategoria(categoriaSelecionada) {
  const alimentosSelecionados = alimentos.filter(alimento =>
    alimento.categorias.includes(categoriaSelecionada)
  );

  const categoriasRelacionadas = [];
  alimentosSelecionados.forEach(alimento => {
    alimento.categorias.forEach(cat => {
      if (cat !== categoriaSelecionada && !categoriasRelacionadas.includes(cat)) {
        categoriasRelacionadas.push(cat);
      }
    });
  });

  const secoes = categoriasRelacionadas.map(cat => {
    const itens = alimentosSelecionados.filter(alimento =>
      alimento.categorias.includes(cat)
    );
    return { titulo: cat, dados: itens };
  });

  return secoes;
} function CardAlimento({ item, navigation }) {
  const [favorito, setFavorito] = useState(false);

  const toggleFavorito = () => setFavorito(!favorito);

  // Função que vai abrir a tela Alimento.js
  const handlePress = () => {
    navigation.navigate("Alimento", { comida: item });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={{ position: "relative" }}>
        <Image source={{ uri: item.img }} style={styles.imagem} resizeMode="cover" />

        {/* Botão de favoritar */}
        <TouchableOpacity style={styles.favButton} onPress={toggleFavorito}>
          <View style={styles.favCircle}>
            <Ionicons
              name={favorito ? "heart" : "heart-outline"}
              size={18}
              color={favorito ? "#FF4C4C" : "#fff"}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Informações do card */}
      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={2}>{item.nome}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={12} color="#fff" />
            <Text style={[styles.tempo, { marginLeft: 4 }]}>{item.tempo}</Text>

            <Ionicons name="flame-outline" size={12} color="#fff" style={{ marginLeft: 8 }} />
            <Text style={[styles.tempo, { marginLeft: 4 }]}>{item.kcal} kcal</Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(item.avaliacao) ? "star" : "star-outline"}
                size={12}
                color="#FFD700"
              />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}



// --- Carrossel fixo com "Novidade" ---
function CarouselComponent() {
  const novidades = [
    { id: 1, img: "https://images.unsplash.com/photo-1512058564366-c9e3e0469b1f" },
    { id: 2, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
    { id: 3, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836" },
  ];

  return (
    <Carousel
      loop
      width={width}
      height={220}
      autoPlay={true}
      data={novidades}
      scrollAnimationDuration={2000}
      renderItem={({ item }) => (
        <View style={styles.cardCarousel}>
          <Image source={{ uri: item.img }} style={styles.imageCarousel} />
          <View style={styles.overlayCard}>
            <Text style={styles.overlayText}>🍽️ Novidade</Text>
          </View>
        </View>
      )}
    />
  );
}


// --- Componente principal ---
export default function Refeicao({ route, navigation }) {
  const categoriaSelecionada = route.params?.categoria || "Café da manhã";
  const secoes = getSecoesPorCategoria(categoriaSelecionada);

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão voltar */}
      <TouchableOpacity
        style={styles.containerBack}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={{
            uri: "https://cdn.icon-icons.com/icons2/1514/PNG/512/backbutton_104978.png",
          }}
          style={styles.back}
        />
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 120, // antes estava 80
        }}

        showsVerticalScrollIndicator={false}
      >
        {/* Carrossel */}
        <View style={styles.carrossel}>
          <Text style={styles.titulo}>{categoriaSelecionada.toUpperCase()}</Text>
          <CarouselComponent />
        </View>

        {/* FlatLists */}
        {secoes.map((secao, index) => (
          <View key={index} style={styles.subReceitas}>
            <Text style={styles.subTitulo}>{secao.titulo}</Text>
            <FlatList
              horizontal
              data={secao.dados}
              keyExtractor={(item) => item.nome}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <CardAlimento item={item} navigation={navigation} />}

            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2f2" },

  containerBack: { position: "absolute", top: 30, left: 15, zIndex: 10 },
  back: { width: 25, height: 40, resizeMode: "contain" },

  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },

  carrossel: { width: "100%", marginTop: 20, marginBottom: 30 },
  cardCarousel: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageCarousel: {
    width: "90%",
    height: 200,
    borderRadius: 20,
    resizeMode: "cover",
  },
  overlayCard: {
    position: "absolute",
    bottom: 15,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  overlayText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  subReceitas: { width: "100%", paddingHorizontal: 10, marginBottom: 25 },
  subTitulo: { fontSize: 17, fontWeight: "bold", marginBottom: 10, marginLeft: 5 },


  bannerDesc: { marginTop: 8, fontSize: 15, fontWeight: "600", textAlign: "center", color: "#ffffffff" },
  infoText: { marginTop: 4, fontSize: 13, color: "#ffffffff" },

  footer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  footerItem: { alignItems: "center" },
  footerText: { fontSize: 10, fontWeight: "bold" },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative", // <- necessário para o botão ficar sobre a imagem
  },


  imagem: {
    width: "100%",
    height: CARD_HEIGHT - INFO_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  info: {
    height: INFO_HEIGHT,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "space-between",
    backgroundColor: "#000000ff",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  nome: {
    fontWeight: "600",
    fontSize: 14,
    color: "#ffffffff",
  },
  tempo: {
    fontSize: 12,
    color: "#ffffffff",
    marginTop: 4,
  },
  favButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 5, // garante que fique acima da imagem
  },

  favCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(100,100,100,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

});
