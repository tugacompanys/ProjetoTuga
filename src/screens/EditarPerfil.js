import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../config/firebaseConfig";

export default function Alimento({ route }) {
  const { comida } = route.params;
  const usuario = auth.currentUser;

  const [comentarios, setComentarios] = useState([]);
  const [comentario, setComentario] = useState("");
  const [avaliacao, setAvaliacao] = useState(0);

  useEffect(() => {
    loadComentarios();
  }, []);

  const loadComentarios = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(`comentarios-${comida.id}`);
      if (jsonValue != null) setComentarios(JSON.parse(jsonValue));
    } catch (e) {
      console.log(e);
    }
  };

  const saveComentarios = async (novaLista) => {
    try {
      await AsyncStorage.setItem(
        `comentarios-${comida.id}`,
        JSON.stringify(novaLista)
      );
      setComentarios(novaLista);
    } catch (e) {
      console.log(e);
    }
  };

  const handleEnviar = () => {
    if (!comentario || avaliacao === 0) {
      Alert.alert("Erro", "Digite um comentário e selecione a avaliação.");
      return;
    }

    const novoComentario = {
      texto: comentario,
      avaliacao,
      data: new Date().toLocaleString(),
      nomeUsuario: usuario?.displayName || "Usuário",
      fotoUsuario:
        usuario?.photoURL ||
        "https://cdn-icons-png.flaticon.com/512/147/147142.png",
    };

    const novaLista = [novoComentario, ...comentarios];
    saveComentarios(novaLista);
    setComentario("");
    setAvaliacao(0);
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: comida.img }} style={styles.image} />
      <Text style={styles.title}>{comida.nome}</Text>
      <Text style={styles.kcal}>{comida.kcal} kcal</Text>

      {/* Comentários */}
      <View style={styles.comentarioContainer}>
        <Text style={styles.secaoTitle}>Comentários</Text>

        <View style={styles.novoComentario}>
          <TextInput
            placeholder="Escreva seu comentário..."
            value={comentario}
            onChangeText={setComentario}
            style={styles.inputComentario}
          />
          <View style={styles.avaliacao}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setAvaliacao(i)}>
                <Ionicons
                  name={i <= avaliacao ? "star" : "star-outline"}
                  size={24}
                  color="#f1c40f"
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.botaoEnviar} onPress={handleEnviar}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Enviar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de comentários */}
        <FlatList
          data={comentarios}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item: c }) => (
            <View style={styles.comentarioCard}>
              <Image
                source={{ uri: c.fotoUsuario }}
                style={styles.fotoUsuario}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.nomeUsuario}>{c.nomeUsuario}</Text>
                <View style={{ flexDirection: "row", marginVertical: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= c.avaliacao ? "star" : "star-outline"}
                      size={16}
                      color="#f1c40f"
                    />
                  ))}
                </View>
                <Text>{c.texto}</Text>
                <Text style={styles.data}>{c.data}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f9fafb" },
  image: { width: "100%", height: 200, borderRadius: 12, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },
  kcal: { fontSize: 14, color: "#555", marginBottom: 20 },
  comentarioContainer: { marginTop: 20 },
  secaoTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  novoComentario: { marginBottom: 20 },
  inputComentario: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  avaliacao: { flexDirection: "row", marginBottom: 10 },
  botaoEnviar: {
    backgroundColor: "#1e90ff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  comentarioCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  fotoUsuario: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  nomeUsuario: { fontWeight: "600", marginBottom: 2 },
  data: { fontSize: 12, color: "#888", marginTop: 2 },
});
