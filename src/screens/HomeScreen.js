import React, { useState, useEffect } from "react";
import {
  Linking, Dimensions, StyleSheet, SafeAreaView, Image,
  View, Text, TouchableOpacity, ScrollView, navigate, BackHandler
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInUp } from "react-native-reanimated";
import YoutubePlayer from "react-native-youtube-iframe";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as vectorIcons from "@expo/vector-icons";


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
    onPress: (navigation) => navigation.navigate("RegistroMedicamento")
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
    description: "Aprenda 5 dicas práticas para manter sua glicemia estável e saudável. mantenha um estilo de vida equilibrado.",
    url: "https://natcofarma.com/controle-de-glicemia/natcofarma",
  },
  {
    title: "Alimentação saudável",
    description: "Descubra alimentos que ajudam no controle da diabetes e dicas de receitas saudáveis para o seu dia a dia.",
    url: "https://aworsaude.com.br/dieta-para-diabetes",
  },
  {
    title: "O que é Diabetes, e quais são os tipos?",
    description: "Veja quais tipos de diabetes existem e como cada um afeta o corpo.",
    url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/diabetes",
  },
];

const dicas = ["Beba 2L de água hoje 💧", "Faça 15 min de caminhada 🚶‍♂️", "Evite alimentos muito açucarados 🍬"];

const registrosHoje = [

];

// Vídeos do YouTube
const videos = [
  { id: "AnF8j2MLkH4", title: "Exercícios recomendados para diabéticos" },
  { id: "LRfH7Tz3rtI", title: "Café com bolinho Barato para DIABÉTICOS" },
  { id: "ercbFjVG2Vs", title: "5 MANEIRAS DE REVERTER O PRÉ-DIABETES!" },
];

export default function HomeScreen({ route, navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [plano, setPlano] = useState(null);

  const nome = route?.params?.user?.displayName ?? "Usuário";

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const p = await AsyncStorage.getItem("@nutrition_plan");
      setPlano(p ? JSON.parse(p) : null);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuAberto(!menuAberto)}>
          <Ionicons name="menu-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Bem-vindo, {nome}! ✌</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Menu lateral */}
      {menuAberto && (
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuAberto(false)}>
          <Animated.View entering={FadeInUp} style={styles.menu}>

            {/* Opção de Editar Perfil */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuAberto(false);
                navigation.navigate("EditarPerfil");
              }}
            >
              <Ionicons name="person-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Editar Perfil</Text>
            </TouchableOpacity>

            {/* Opção de Trocar conta */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuAberto(false);
                navigation.navigate("Login");
              }}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Trocar Conta</Text>
            </TouchableOpacity>

            {/* Opção de Configurações */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuAberto(false);
                navigation.navigate("Configurações");
              }}
            >
              <Ionicons name="settings-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Configurações</Text>
            </TouchableOpacity>

            {/* Opção de Sair */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuAberto(false);
                BackHandler.exitApp(); // Fecha o aplicativo
              }}
            >
              <Ionicons name="exit-outline" size={20} color="red" />
              <Text style={[styles.menuText, { color: "red" }]}>Sair</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Conteúdo principal */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Carrossel de ações */}
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


        {/* Resumo diário */}
        <View style={[styles.card, { backgroundColor: "#fff" }]}>
          <Text style={styles.cardTitle}>Resumo Diário</Text>
          {plano ? (
            <>
            <Text>Meta: {plano.macros.kcal} kcal</Text>
            <Text>
              Carbo: {plano.macros.carbs_g} g · Prot: {plano.macros.protein_g} g · Gord: {plano.macros.fat_g} g
            </Text>
            <Text style={{ marginTop: 6, fontWeight: "600" }}>
              Café da manhã: {plano.perMeal.cafe.kcal} kcal
            </Text>
            <Text style={{ marginTop: 6, fontWeight: "600" }}>
              Almoço: {plano.perMeal.almoco.kcal} kcal
            </Text>
            <Text style={{ marginTop: 6, fontWeight: "600" }}>
              Jantar: {plano.perMeal.jantar.kcal} kcal
            </Text>
            <Text style={{ marginTop: 6, fontWeight: "600" }}>
              Lanche/Ceia: {plano.perMeal.lanche.kcal} kcal
            </Text>
          </>
          
          ) : registrosHoje.length === 0 ? (
            <Text>Nenhum registro para hoje.</Text>
          ) : (
            registrosHoje.map((item, index) => (
              <Text key={index}>
                Glicemia: {item.glicemia} mg/dL | Insulina: {item.insulina} UI
              </Text>
            ))
          )}
        </View>

        {/* Notícias */}
        <Animated.View entering={FadeInUp.delay(400)} style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginLeft: 20, marginBottom: 10 }}>Notícias & Curiosidades</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
            {noticias.map((item, index) => (
              <View key={index} style={[styles.carouselCard, { backgroundColor: "#1e90ff", width: 250, marginBottom: 40 }]}>
                <Text style={{ fontWeight: "bold", color: "#fff", marginBottom: 5, fontSize: 18 }}>{item.title}</Text>
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
        <Animated.View entering={FadeInUp.delay(300)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
            {dicas.map((dica, index) => (
              <View key={index} style={styles.carouselCard}>
                <Text style={styles.carouselText}>{dica}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Vídeos recomendados */}
        <Animated.View entering={FadeInUp.delay(400)} style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>🎥 Vídeos Recomendados</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20, marginBottom: 20 }}>
            {videos.map((video, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setVideoId(video.id)}
                style={[styles.videoCard, { width: screenWidth * 0.6 }]}
              >
                <Image source={{ uri: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` }} style={styles.thumbnail} />
                <Text style={styles.videoTitle} numberOfLines={2}>{
                  video.title
                }</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Player do vídeo */}
        {videoId && (
          <View
            style={{
              marginHorizontal: 20,
              marginVertical: 10,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <YoutubePlayer
              height={220}
              play={true}
              videoId={videoId}
              webViewProps={{ allowsFullscreenVideo: true }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: '#e40000ff',
                padding: 10,
                borderRadius: 8,
                marginTop: 10,
                alignItems: 'center',
              }}
              onPress={() => setVideoId(null)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="home-outline" size={24} color="#00c47c" />
          <Text style={[styles.footerText, { color: "#00c47c" }]}>Início</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => navigation.navigate("Glicemia")}>
          <Ionicons name="water-outline" size={24} color="#00bcd4" />
          <Text style={[styles.footerText, { color: "#00bcd4" }]}>Glicemia</Text>
        </TouchableOpacity>


        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => navigation.navigate("Refeicao")}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#d17d6b" />
          <Text style={[styles.footerText, { color: "#d17d6b" }]}>Refeição</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => navigation.navigate("Exercicio")}>
          <Ionicons name="barbell-outline" size={24} color="#7c6e7f" />
          <Text style={[styles.footerText, { color: "#7c6e7f" }]}>Exercícios</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles 
const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1 },
  header: {
    backgroundColor: "#1e90ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff" },

  // Menu lateral
  menuOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.36)",
    justifyContent: "flex-start",
    alignItems: "right",
    paddingTop: 50,
    zIndex: 998,
  },
  menu: {
    marginTop: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 999,
    width: 220,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuText: { fontSize: 16, fontWeight: "500" },

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
  carousel: { flexDirection: "row", paddingLeft: 10 },
  carouselCard: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 16,
    marginRight: 15,
    minWidth: 200,
  },
  carouselText: { color: "#fff", fontWeight: "bold" },
  carouselContainer: { marginTop: 20, alignItems: "center" },
  iconContainer: { marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  description: { fontSize: 14, textAlign: "center", marginBottom: 15 },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  buttonText: { color: "#fff", fontWeight: "600", textTransform: "lowercase" },
  dots: { flexDirection: "row", marginTop: -10, paddingBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ccc", margin: 4 },
  activeDot: { backgroundColor: "#000" },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  footerItem: { alignItems: "center" },
  footerText: { fontSize: 12, marginTop: 4, fontWeight: "600" },

  // YouTube
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10, paddingHorizontal: 20 },
  videoCard: {
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
  },
  thumbnail: { width: "100%", height: 120 },
  videoTitle: { fontSize: 14, fontWeight: "600", padding: 8 },
});