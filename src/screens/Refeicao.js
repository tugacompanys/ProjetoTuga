import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context";


export default function EditarPerfil() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        {/* Conteúdo principal */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Tela de Refeição</Text>
        </View>

    {/* ======== TAB BAR ESTILIZADA ========*/}
    <View style={styles.footerWrapper}>
      <LinearGradient
        colors={["#ffffffcc", "#f5f4fcee"]}
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
          onPress={() => navigation.navigate("Refeicao")}
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
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f4f7" },
  container: {
    backgroundColor: "#f0f4f7",
    bottom: 12
  },
 
  footerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingBottom: 10, // espaço p/ iPhone com notch
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "95%",
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 8, // sombra Android
    shadowColor: "#000", // sombra iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },

  footerItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  footerText: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "700",
  },

  activeTab: {
    backgroundColor: "rgba(196, 72, 0, 0.08)", // leve destaque no item ativo
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

});
