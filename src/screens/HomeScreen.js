import React, { useState, useEffect } from "react";
import {
  Linking,
  Dimensions,
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Modal,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInUp, SlideInLeft } from "react-native-reanimated";
import YoutubePlayer from "react-native-youtube-iframe";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";


const { width: screenWidth } = Dimensions.get("window");

const data = [
  {
    title: "FAZER NOVO REGISTRO",
    description: "Faça novo registro do seu estado glicêmico.",
    backgroundColor: "#e3f8f5ff",
    titleColor: "#000000",
    descriptionColor: "#555555",
    buttonColor: "#00cfff",
    buttonText: "fazer registro",
    icon: <Ionicons name="create-outline" size={32} color="#00cfff" />,
    onPress: (navigation) => navigation.navigate("Perfil"),
  },
  {
    title: "AGENDA DE MEDICAMENTOS",
    description: "Registre seus medicamentos e horários.",
    backgroundColor: "#f0fef5",
    titleColor: "#00796b",
    descriptionColor: "#33691e",
    buttonColor: "#4caf50",
    buttonText: "Agendar Medicamentos",
    icon: <MaterialCommunityIcons name="needle" size={32} color="#4caf50" />,
    onPress: (navigation) => navigation.navigate("RegistroMedicamento"),
  },
  {
    title: "ÍNDICE DIÁRIO",
    description: "Veja seu índice glicêmico médio do dia.",
    backgroundColor: "#fff8e1",
    titleColor: "#ff6f00",
    descriptionColor: "#6d4c41",
    buttonColor: "#ff9800",
    buttonText: "ver índice",
    icon: <Ionicons name="stats-chart" size={32} color="#ff9800" />,
    onPress: (navigation) => navigation.navigate("IndiceDiario"),
  },
];

const noticias = [
  {
    title: "Controle da glicemia",
    description:
      "Aprenda 5 dicas práticas para manter sua glicemia estável e saudável. mantenha um estilo de vida equilibrado.",
    url: "https://natcofarma.com/controle-de-glicemia/natcofarma",
  },
  {
    title: "Alimentação saudável",
    description:
      "Descubra alimentos que ajudam no controle da diabetes e dicas de receitas saudáveis para o seu dia a dia.",
    url: "https://aworsaude.com.br/dieta-para-diabetes",
  },
  {
    title: "O que é Diabetes, e quais são os tipos?",
    description:
      "Veja quais tipos de diabetes existem e como cada um afeta o corpo.",
    url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/diabetes",
  },
];

const dicas = [
  "Beba 2L de água hoje 💧",
  "Faça 15 min de caminhada 🚶‍♂️",
  "Evite alimentos muito açucarados 🍬",
];

const registrosHoje = [];

const videos = [
  { id: "AnF8j2MLkH4", title: "Exercícios recomendados para diabéticos" },
  { id: "LRfH7Tz3rtI", title: "Café com bolinho Barato para DIABÉTICOS" },
  { id: "ercbFjVG2Vs", title: "5 MANEIRAS DE REVERTER O PRÉ-DIABETES!" },
];

export default function HomeScreen({ route, navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);
  const [activeMenu, setActiveMenu] = useState("HOME");
  const [videoId, setVideoId] = useState(null);
  const [plano, setPlano] = useState(null);
  const [nome, setNome] = useState("Usuário");

  useEffect(() => {
    const fetchName = async () => {
      const storedName = await AsyncStorage.getItem("@user_name");
      if (storedName) {
        setNome(storedName);
      } else {
        const paramName = route?.params?.user?.displayName;
        if (paramName) setNome(paramName);
      }
    };

    fetchName(); // executa na montagem da tela

    const unsubscribe = navigation.addListener("focus", fetchName);
    return unsubscribe;
  }, [navigation, route?.params]);


  useEffect(() => {
    const carregarPlano = async () => {
      try {
        const planoSalvo = await AsyncStorage.getItem("@nutrition_plan");

        if (planoSalvo) {
          setPlano(JSON.parse(planoSalvo));
        } else {
          setPlano(null);
        }
      } catch (error) {
        console.log("Erro ao carregar plano na Home:", error);
      }
    };

    carregarPlano();

    const unsubscribe = navigation.addListener("focus", carregarPlano);
    return unsubscribe;
  }, [navigation]);


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuAberto(!menuAberto)}>
          <Ionicons name="menu-outline"
            size={28}
            color="#fff"
            top={9}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          Bem-vindo, <Text style={{ fontWeight: "900" }}>{nome}</Text> ✌
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Menu deslizante */}
      {menuAberto && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuAberto(false)}
        >
          <Animated.View
            style={[styles.menuContainer, { width: screenWidth * 0.8 }]}
          >
            {/* Menu Header */}
            <View style={styles.menuHeader}>
              <TouchableOpacity onPress={() => {
                setMenuAberto(false); // fecha o menu
                navigation.navigate("EditarPerfil"); // navega para EditarPerfil
              }}>
                <Image
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/147/147142.png" }}
                  style={styles.menuAvatar}
                />
              </TouchableOpacity>
              <Text style={styles.menuName}>{nome}</Text>
            </View>


            {/* Opções do menu */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={[
                  styles.menuButton,
                  activeMenu === "HOME" && styles.menuButtonActive,
                ]}
                onPress={() => {
                  setActiveMenu("HOME");
                  navigation.navigate("HomeScreen");
                  setMenuAberto(false);
                }}
              >
                <Ionicons
                  name="home-outline"
                  size={22}
                  color={activeMenu === "HOME" ? "#fff" : "#000"}
                />
                <Text
                  style={[
                    styles.menuButtonText,
                    activeMenu === "HOME" && { color: "#fff" },
                  ]}
                >
                  HOME
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuButton,
                  activeMenu === "CONFIG" && styles.menuButtonActive,
                ]}
                onPress={() => {
                  setActiveMenu("CONFIG");
                  navigation.navigate("Configurações");
                  setMenuAberto(false);
                }}
              >
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={activeMenu === "CONFIG" ? "#fff" : "#000"}
                />
                <Text
                  style={[
                    styles.menuButtonText,
                    activeMenu === "CONFIG" && { color: "#fff" },
                  ]}
                >
                  CONFIGURAÇÕES
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuButton,
                  activeMenu === "TROCAR" && styles.menuButtonActive,
                ]}
                onPress={() => {
                  setActiveMenu("TROCAR");
                  navigation.navigate("Login");
                  setMenuAberto(false);
                }}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={22}
                  color={activeMenu === "TROCAR" ? "#fff" : "#000"}
                />
                <Text
                  style={[
                    styles.menuButtonText,
                    activeMenu === "TROCAR" && { color: "#fff" },
                  ]}
                >
                  TROCAR CONTA
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sair na parte inferior */}
            <TouchableOpacity
              style={[
                styles.menuButton,
                styles.menuButtonBottom,
                activeMenu === "SAIR" && styles.menuButtonActive,
              ]}
              onPress={() => BackHandler.exitApp()}
            >
              <Ionicons
                name="exit-outline"
                size={22}
                color={activeMenu === "SAIR" ? "#fff" : "#ff4d4d"}
              />
              <Text
                style={[
                  styles.menuButtonText,
                  activeMenu === "SAIR" && { color: "#fff", fontWeight: "bold" },
                  { color: "#ff4d4d" },
                ]}
              >
                SAIR
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Conteúdo principal */}
      <ScrollView contentContainerStyle={{}}>
        {/* Carrossel principal */}
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={screenWidth * 0.9}
            height={220}
            data={data}
            scrollAnimationDuration={500}
            onSnapToItem={(index) => setActiveIndex(index)}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: item.backgroundColor }]}>
                <View style={styles.iconContainer}>{item.icon}</View>
                <Text style={[styles.title, { color: item.titleColor }]}>{item.title}</Text>
                <Text style={[styles.description, { color: item.descriptionColor }]}>{item.description}</Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: item.buttonColor }]}
                  onPress={() => item.onPress(navigation)}
                >
                  <Text style={styles.buttonText}>{item.buttonText}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.dots}>
            {data.map((_, index) => (
              <View key={index} style={[styles.dot, index === activeIndex && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* Resumo Diário */}
        {/* Resumo Diário */}
        <Animated.View entering={FadeInUp} style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📊 Resumo Diário</Text>

          {plano ? (
            <>
              {/* META */}
              <View style={styles.summaryBlock}>
                <Ionicons name="flag-outline" size={20} color="#1e90ff" />
                <Text style={styles.summaryTitle}>Meta diária</Text>
                <Text style={styles.summaryValue}>{plano.macros.kcal} kcal</Text>
              </View>

              {/* MACROS */}
              <View style={styles.macrosRow}>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>Carbo</Text>
                  <Text style={styles.macroValue}>{plano.macros.carbs_g}g</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>Proteína</Text>
                  <Text style={styles.macroValue}>{plano.macros.protein_g}g</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroLabel}>Gordura</Text>
                  <Text style={styles.macroValue}>{plano.macros.fat_g}g</Text>
                </View>
              </View>

              {/* REFEIÇÕES */}
              <View style={styles.mealsBox}>
                <Text style={styles.mealsTitle}>Refeições do dia</Text>

                <View style={styles.mealItem}>
                  <Text style={styles.mealLabel}>☕ Café da manhã</Text>
                  <Text style={styles.mealValue}>{plano.perMeal.cafe.kcal} kcal</Text>
                </View>

                <View style={styles.mealItem}>
                  <Text style={styles.mealLabel}>🍛 Almoço</Text>
                  <Text style={styles.mealValue}>{plano.perMeal.almoco.kcal} kcal</Text>
                </View>

                <View style={styles.mealItem}>
                  <Text style={styles.mealLabel}>🌙 Jantar</Text>
                  <Text style={styles.mealValue}>{plano.perMeal.jantar.kcal} kcal</Text>
                </View>

                <View style={styles.mealItem}>
                  <Text style={styles.mealLabel}>🍎 Lanche/Ceia</Text>
                  <Text style={styles.mealValue}>{plano.perMeal.lanche.kcal} kcal</Text>
                </View>
              </View>
            </>
          ) : registrosHoje.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 10 }}>
              Nenhum registro para hoje.
            </Text>
          ) : (
            registrosHoje.map((item, index) => (
              <Text key={index}>
                Glicemia: {item.glicemia} mg/dL | Insulina: {item.insulina} UI
              </Text>
            ))
          )}
        </Animated.View>


        {/* Notícias */}
        <Animated.View entering={FadeInUp.delay(400)} style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginLeft: 20, marginBottom: 10 }}>
            Notícias & Curiosidades
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
            {noticias.map((item, index) => (
              <View key={index} style={[styles.carouselCard, { backgroundColor: "#1e90ff", width: 250 }]}>
                <Text style={{ fontWeight: "bold", color: "#fff", marginBottom: 5, fontSize: 18 }}>
                  {item.title}
                </Text>
                <Text style={{ color: "#fff", marginBottom: 10 }}>{item.description}</Text>
                <TouchableOpacity
                  style={{ backgroundColor: "#fff", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 }}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Text style={{ color: "#1e90ff", fontWeight: "bold" }}>Ler mais</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Dicas */}
        <Animated.View entering={FadeInUp.delay(300)} style={{ marginTop: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dicasCarousel}>
            {dicas.map((dica, index) => (
              <View key={index} style={styles.dicasCard}>
                <Text style={styles.dicasText}>{dica}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Vídeos */}
        <Animated.View entering={FadeInUp.delay(400)} style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>🎥 Vídeos Recomendados</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20, marginBottom: 20, paddingBottom: 100 }}>
            {videos.map((video, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setVideoId(video.id)}
                style={[styles.videoCard, { width: screenWidth * 0.6 }]}
              >
                <Image
                  source={{ uri: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` }}
                  style={styles.thumbnail}
                />
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {video.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Player */}
        <Modal
          visible={!!videoId}
          animationType="slide"
          transparent={true}
          presentationStyle="fullScreen"
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: "#000000da", justifyContent: "center" }}>
            <YoutubePlayer
              height={250}
              play={true}
              videoId={videoId}
              webViewProps={{ allowsFullscreenVideo: true }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#e40000ff",
                padding: 12,
                borderRadius: 8,
                marginTop: 20,
                alignItems: "center",
                marginHorizontal: 80,
              }}
              onPress={() => setVideoId(null)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Fechar</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </ScrollView>





      {/* Footer */}
      <View style={styles.footerWrapper}>
        <LinearGradient
          colors={["#ffffffcc", "#f8f8f8ee"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.footer}
        >
          <TouchableOpacity
            style={[styles.footerItem, styles.activeTab]}
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
            style={styles.footerItem}
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
  container: { backgroundColor: "#fff", flex: 1 },

  header: {
    backgroundColor: "#1e90ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff", top: 8 },

  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    flexDirection: "row",
    zIndex: 998,
  },
  menuContainer: {
    height: "100%",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    elevation: 8,
  },
  menuContainer: {
    height: "100%",
    backgroundColor: "#fff",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    elevation: 8,
  },
  menuHeader: { alignItems: "center", marginBottom: 30 },
  menuAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  menuName: { fontSize: 20, fontWeight: "bold" },

  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuButtonActive: { backgroundColor: "#1e90ff" },
  menuButtonText: { fontSize: 16, fontWeight: "600", marginLeft: 15, color: "#000" },
  menuButtonBottom: { marginTop: "auto" },

  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  // RESUMO DIÁRIO NOVO
  summaryCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },

  summaryBlock: {
    alignItems: "center",
    marginBottom: 15,
  },

  summaryTitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#888",
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e90ff",
  },

  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  macroBox: {
    backgroundColor: "#f0f8ff",
    padding: 10,
    borderRadius: 14,
    width: "30%",
    alignItems: "center",
  },

  macroLabel: {
    fontSize: 12,
    color: "#777",
  },

  macroValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  mealsBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 15,
  },

  mealsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  mealLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  mealValue: {
    fontSize: 14,
    color: "#444",
  },

  // Dicas
  dicasCarousel: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dicasCard: {
    backgroundColor: "#1e90ff",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 160,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dicasText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },

  carouselContainer: { marginTop: 20, alignItems: "center" },
  iconContainer: { marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  description: { fontSize: 14, textAlign: "center", marginBottom: 15 },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  buttonText: { color: "#fff", fontWeight: "600", textTransform: "lowercase" },
  dots: { flexDirection: "row", marginTop: -10, paddingBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ccc", margin: 4 },
  activeDot: { backgroundColor: "#000" },

  carouselCard: { backgroundColor: "#1e90ff", padding: 15, borderRadius: 16, marginRight: 15, minWidth: 200 },

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
    backgroundColor: "#11f09e2c", // leve destaque no item ativo
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10, paddingHorizontal: 20 },
  videoCard: { marginRight: 15, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 4, },
  thumbnail: { width: "100%", height: 120 },
  videoTitle: { fontSize: 14, fontWeight: "600", padding: 8 },
});
