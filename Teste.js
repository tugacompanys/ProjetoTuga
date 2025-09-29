import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient"

export default function EditarPerfil() {
  const navigation = useNavigation();

  return (
    // ======== TAB BAR ESTILIZADA ========
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
          style={[styles.footerItem, styles.activeTab]}
          onPress={() => navigation.navigate("Glicemia")}
        >
          <Ionicons name="water-outline" size={26} color="#00bcd4" />
          <Text style={[styles.footerText, { color: "#00bcd4" }]}>Glicemia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
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
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f4f7" },
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    bottom: 12
  },
  footer: {
    position: "absolute",
    bottom: 0, // ✅ Corrigido para ficar colado na parte de baixo
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  footerItem: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
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
  backgroundColor: "rgba(0,196,124,0.08)", // leve destaque no item ativo
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 6,
},

});
