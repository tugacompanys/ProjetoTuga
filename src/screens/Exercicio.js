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

export default function EditarPerfil() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        {/* Conteúdo principal */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Tela de Exercícios</Text>
        </View>

        {/* TAB BAR FIXA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("HomeScreen")}
          >
            <Ionicons name="home-outline" size={24} color="#00c47c" />
            <Text style={[styles.footerText, { color: "#00c47c" }]}>Início</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("Glicemia")}
          >
            <Ionicons name="water-outline" size={24} color="#009eb3" />
            <Text style={[styles.footerText, { color: "#009eb3" }]}>Glicemia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("Refeicao")}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={24}
              color="#d17d6b"
            />
            <Text style={[styles.footerText, { color: "#d17d6b" }]}>Refeição</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate("Exercicio")}
          >
            <Ionicons name="barbell-outline" size={28} color="#7c6e7f" backgroundColor="#7c6e7f2e"/>
            <Text style={[styles.footerText, { color: "#7c6e7f", backgroundColor: "#7c6e7f2e", fontWeight: "900", fontSize: 14 }]}>Exercícios</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    backgroundColor: "fff",
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
});
