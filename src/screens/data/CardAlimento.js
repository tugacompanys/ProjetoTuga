import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CardAlimento({ item, navigation, favoritos, toggleFavorito }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Refeicao", { comida: item })}>
      <Image source={{ uri: item.img }} style={styles.imagem} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome}</Text>
        <TouchableOpacity onPress={() => toggleFavorito(item)}>
          <Ionicons
            name={favoritos.some(f => f.id === item.id) ? "heart" : "heart-outline"}
            size={18}
            color={favoritos.some(f => f.id === item.id) ? "#FF4C4C" : "#000"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, borderRadius: 10, overflow: "hidden", backgroundColor: "#fff" },
  imagem: { width: "100%", height: 120 },
  info: { padding: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nome: { fontWeight: "600", fontSize: 14 },
});
