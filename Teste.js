import React, { useState, useEffect } from "react";
import {
  Linking, Dimensions, StyleSheet, SafeAreaView, Image,
  View, Text, TouchableOpacity, ScrollView, BackHandler
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInUp, SlideInLeft } from "react-native-reanimated";
import YoutubePlayer from "react-native-youtube-iframe";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient"; // ADICIONADO

const { width: screenWidth } = Dimensions.get("window");

// ... Seus arrays data, noticias, dicas, registrosHoje, videos permanecem iguais ...

export default function HomeScreen({ route, navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [plano, setPlano] = useState(null);
  const [nome, setNome] = useState("Usuário");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const storedName = await AsyncStorage.getItem("@user_name");
      if (storedName) setNome(storedName);
      else if (route?.params?.user?.displayName) setNome(route.params.user.displayName);
    });
    return unsubscribe;
  }, [navigation, route?.params]);

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

      {/* ===== MENU LATERAL ESTILIZADO ===== */}
      {menuAberto && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuAberto(false)}
        >
          <Animated.View
            entering={SlideInLeft.duration(300)}
            style={[styles.menuContainer, { width: screenWidth * 0.8 }]}
          >
            <LinearGradient
              colors={["#1e90ff", "#00bfff"]}
              style={styles.menuGradient}
            >
              {/* Header do menu */}
              <View style={styles.menuHeader}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=47" }}
                  style={styles.avatar}
                />
                <Text style={styles.username}>{nome}</Text>
              </View>

              {/* Itens de navegação */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuAberto(false);
                  navigation.navigate("Login");
                }}
              >
                <Ionicons name="swap-horizontal-outline" size={22} color="#fff" />
                <Text style={styles.menuText}>Trocar Conta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuAberto(false);
                  navigation.navigate("Configurações");
                }}
              >
                <Ionicons name="settings-outline" size={22} color="#fff" />
                <Text style={styles.menuText}>Configurações</Text>
              </TouchableOpacity>

              {/* Sair */}
              <TouchableOpacity
                style={[styles.menuItem, { marginTop: "auto" }]}
                onPress={() => {
                  setMenuAberto(false);
                  BackHandler.exitApp();
                }}
              >
                <Ionicons name="exit-outline" size={22} color="#ff4d4d" />
                <Text style={[styles.menuText, { color: "#ff4d4d" }]}>Sair</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* ===== Conteúdo principal permanece igual ===== */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Carrossel de ações, Resumo Diário, Notícias, Dicas, Vídeos */}
        {/* TODO: Colar todo o conteúdo que você já tinha aqui, sem alterações */}
      </ScrollView>

      {/* Footer */}
      {/* TODO: Manter footer igual */}
    </SafeAreaView>
  );
}

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#1e90ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff" },

  // Overlay escuro por trás do menu
  menuOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    zIndex: 998,
  },

  // Container do menu
  menuContainer: {
    height: "100%",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    elevation: 8,
  },
  menuGradient: {
    flex: 1,
    padding: 20,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 60, height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  menuText: {
    marginLeft: 15,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
