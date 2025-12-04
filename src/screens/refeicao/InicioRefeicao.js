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
  Image,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

import MascoteAssistant from "../MascoteAssistant";



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
  { id: "1", label: "Café da manhã", image: "https://static.vecteezy.com/system/resources/previews/069/662/484/non_2x/plate-with-traditional-breakfast-with-fried-eggs-crispy-bacon-strips-and-toasted-bread-isolated-on-transparent-background-png.png" },
  { id: "2", label: "Almoço", image: "https://sosmaesexaustas.com.br/wp-content/uploads/2024/07/plate-01-1.webp" },
  { id: "3", label: "Jantar", image: "https://yata.s3-object.locaweb.com.br/c5e7395c9cc22cfebae43c4e2165a615d3940e747fddc6abe3d7c545bf925e81" },
  { id: "4", label: "Lanche", image: "https://static.vecteezy.com/system/resources/previews/048/722/409/non_2x/plate-of-delicious-golden-brown-crispy-rice-cakes-garnished-with-fresh-herbs-and-grated-cheese-ready-to-be-enjoyed-as-a-savory-snack-free-png.png" },
];

const escolhaMetodo = [
  { id: "1", label: "Fácil", image: "https://cdn.pixabay.com/photo/2023/07/25/08/03/food-8148498_1280.png" },
  { id: "2", label: "Para comer no caminho", image: "https://cdn.shopify.com/s/files/1/0531/3259/1264/files/PRATOS_TOPSHOT_bowl2.png?v=1741620138" },
  { id: "3", label: "Rápido", image: "https://static.loja.strawplast.com.br/public/strawplast/imagens/produtos/prato-refeicao-21cm-redondo-branco-10-unidades-64189b5d5e6d7.png" },
  { id: "4", label: "Poucos ingredientes", image: "https://sosmaesexaustas.com.br/wp-content/uploads/2024/07/plate-02.webp" },
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
    case 7: return "M0,0 Q10000,130 120,80 T240,80 L240,140 L0,140 Z";
    case 1: return "M0,55 Q60,50 120,130 T240,50 L240,140 L0,140 Z";
    case 5: return "M0,0 Q120,-50 140,20 T240,80 L240,140 L0,140 Z";
    case 2: return "M0,680 Q20,120 120,80 T240,80 L240,140 L0,140 Z";
    case 6: return "M0,73 Q40,80 70,0 T240,80 L240,140 L0,140 Z";
    case 3: return "M0,60 Q100,40 250,200 T240,80 L240,140 L0,140 Z";
    case 4: return "M0,0 Q10000,130 120,80 T240,80 L240,140 L0,140 Z";
    default: return "M0,80 Q60,30 120,80 T240,80 L240,140 L0,140 Z";
  }
}

function getCurvaPreferencias(index) {
  switch (index % 8) {
    case 0: return "M0,0 Q00,0 0,0 L0,140 L0,140 Z";
    case 1: return "M0,30 Q100,140 240,0 L240,140 L0,140 Z";
    case 2: return "M0,600 Q0,50 170,90 L240,140 L0,140 Z";
    case 3: return "M0,50 Q40,30 150,-100 T240,80 L240,140 L0,140 Z";
    case 4: return "M0,130 Q-50,20 200,250 L240,140 L0,140 Z";
    case 5: return "M0,0 Q0,-150 60,-40 T240,80 L240,140 L0,140 Z";
    case 6: return "M0,0 Q00,0 0,0 L0,140 L0,140 Z";
    case 7: return "M0,70 Q100,140 240,0 L240,140 L0,140 Z";
    default: return "M0,0 Q100,80 240,90 L240,140 L0,140 Z";
  }
}

function getCurvaRefeicao(index) {
  switch (index % 4) {
    case 0:
      return "M0,0 H220 A50,50 0 0,1 220,200 H0 Z";
    case 1:
      return "M0,0 Q100,80 240,60 T300,120 L300,200 L0,200 Z";
    case 2:
      return "M0,60 Q120,20 260,90 T300,120 L300,200 L0,200 Z";
    case 3:
      return "M0,80 Q90,100 50,50 T300,120 L300,200 L0,200 Z";
    default:
      return "M0,40 Q80,10 180,60 T300,100 L300,200 L0,200 Z";
  }
}



function getCurvaMetodo(index) {
  switch (index % 4) {
    case 0:
      return "M0,0 H220 A50,50 0 0,1 220,200 H0 Z";
    case 1:
      return "M0,0 Q100,80 240,60 T300,120 L300,200 L0,200 Z";
    case 2:
      return "M0,60 Q120,20 260,90 T300,120 L300,200 L0,200 Z";
    case 3:
      return "M0,80 Q90,100 50,50 T300,120 L300,200 L0,200 Z";
    default:
      return "M0,40 Q80,10 180,60 T300,100 L300,200 L0,200 Z";
  }
}


function CardOnduladoPreferencia({ item, index }) {
  const curva = getCurvaPreferencias(index);
  return (
    <View style={styles.card}>
      <Svg width={CARD_WIDTH} height={CARD_HEIGHT} style={StyleSheet.absoluteFill}>
        <Path d={curva} fill="#6AC484" opacity={0.85} />
        {/* Cor diferente pra destacar */}
      </Svg>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.label}>{item.label}</Text>
    </View>
  );
} function CardGrandeComImagem({ item, onPressCard, tipo = "refeicao", index }) {
  const curva =
    tipo === "metodo"
      ? getCurvaMetodo(index)
      : getCurvaRefeicao(index);

  return (
    <TouchableOpacity style={styles.cardGrande} onPress={onPressCard}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Path d={curva} fill="#6AC484" opacity={0.25} />
      </Svg>

      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.image }}
          style={styles.cardMiniImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.cardTitleSmall}>{item.label}</Text>
    </TouchableOpacity>
  );
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
} function CardHorizontal({ item, onPressCard, backgroundColor = "#F9F6EE" }) {
  return (
    <TouchableOpacity
      style={[styles.cardHorizontalFlex, { backgroundColor }]}
      onPress={onPressCard} // <-- aqui é essencial
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
  const [activeTab, setActiveTab] = useState("CONFIG");
  const [favoritos, setFavoritos] = useState([]);
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
      {abaSelecionada === "favoritas" && (
        <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
          {favoritos.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Você ainda não adicionou nenhum favorito.
            </Text>
          ) : (
            favoritos.map((item) => (
              <CardAlimento
                key={item.id}
                item={item}
                navigation={navigation}
                favoritos={favoritos}
                toggleFavorito={toggleFavorito}
              />
            ))
          )}
        </View>
      )}


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
          data={Array.from(
            { length: Math.ceil(receitasFaixaCalorica.length / 2) },
            (_, i) => [
              receitasFaixaCalorica[i],
              receitasFaixaCalorica[i + Math.ceil(receitasFaixaCalorica.length / 2)],
            ].filter(Boolean)
          )}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.column}>
              {item.map((cardItem) => (
                <TouchableOpacity
                  key={cardItem.id}
                  onPress={() =>
                    navigation.navigate("Refeicao", { categoria: cardItem.label })
                  }
                >
                  <CardOndulado item={cardItem} index={parseInt(cardItem.id) - 1} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />

        <Text style={styles.title}>Escolha a refeição</Text><FlatList
          data={escolhaRefeicao}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <CardGrandeComImagem
              item={item}
              tipo="refeicao"
              index={index}
              onPressCard={() => navigation.navigate("Refeicao", { categoria: item.label })}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />

        <Text style={styles.title}>Escolha seu método</Text><FlatList
          data={escolhaMetodo}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <CardGrandeComImagem
              item={item}
              tipo="metodo"
              index={index}
              onPressCard={() => navigation.navigate("Refeicao", { categoria: item.label })}
            />
          )}
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
                    navigation.navigate("Refeicao", { categoria: cardItem.label })
                  }
                >
                  <CardOnduladoPreferencia
                    item={cardItem}
                    index={parseInt(cardItem.id) - 1}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 10, marginBottom: 100 }}
        />



      </ScrollView>

    <MascoteAssistant/>
      {/* Footer */}
      <View style={styles.footerWrapper}>
        <LinearGradient
          colors={["#ffffffcc", "#f8f8f8ee"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.footer}
        >
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("HomeScreen")}
          >
            <Ionicons name="home-outline" size={26} color="#00c47c" />
            <Text style={[styles.footerText, { color: "#00c47c" }]}>Início</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("Glicemia")}
          >
            <Ionicons name="water-outline" size={26} color="#00bcd4" />
            <Text style={[styles.footerText, { color: "#00bcd4" }]}>Glicemia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerItem, styles.activeTab]}
            onPress={() => navigation.navigate("Refeicao_inicio")}
          >
            <MaterialCommunityIcons name="silverware-fork-knife" size={26} color="#d17d6b" />
            <Text style={[styles.footerText, { color: "#d17d6b" }]}>Refeição</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("Exercicio")}
          >
            <Ionicons name="barbell-outline" size={26} color="#7c6e7f" />
            <Text style={[styles.footerText, { color: "#7c6e7f" }]}>Exercícios</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>



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
  cardGrande: {
    width: width / 1.7,
    height: 170,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },

  cardMiniImage: {
    width: 85,
    height: 85,
    borderRadius: 35,
  },

  cardTitleSmall: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  footerWrapper: {
    position: "absolute",
    letterSpacing: 19,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "95%",
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,

  },

  footerItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  footerText: { fontSize: 13, marginTop: 4, fontWeight: "700" },


  activeTab: {
    backgroundColor: "#f08f112c", // leve destaque no item ativo
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

});
