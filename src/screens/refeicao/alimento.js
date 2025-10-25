import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Habilitar animação para Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


export default function Alimento({ route, navigation }) {
  const comida = route?.params?.comida;

  if (!comida) {
    console.warn("⚠️ Nenhum alimento foi passado para a tela Alimento!");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#555", textAlign: "center" }}>
          Nenhum alimento selecionado.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginTop: 20,
            backgroundColor: "#4CAF50",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff" }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }


  const [nutritionalOpen, setNutritionalOpen] = useState(true);
  const [ingredientsOpen, setIngredientsOpen] = useState(true);
  const [instructionsOpen, setInstructionsOpen] = useState(true);

  const [comentarios, setComentarios] = useState([]);
  const [comentariosFiltrados, setComentariosFiltrados] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [nota, setNota] = useState(0);

  const comentariosRef = collection(db, "comentarios");

  // Carregar comentários
  useEffect(() => {
    const q = query(comentariosRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComentarios(lista);
      setComentariosFiltrados(lista.filter((c) => c.comidaId === comida.id));
    });
    return () => unsubscribe();
  }, [comida.id]);


  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === "nutritional") setNutritionalOpen(!nutritionalOpen);
    if (section === "ingredients") setIngredientsOpen(!ingredientsOpen);
    if (section === "instructions") setInstructionsOpen(!instructionsOpen);
  };

  const enviarComentario = async () => {
    if (!novoComentario) return;
    if (!auth.currentUser) {
      console.log("Usuário não logado");
      return;
    }

    try {
      await addDoc(comentariosRef, {
        comidaId: comida.id,
        userId: auth.currentUser.uid,
        nome: auth.currentUser.displayName || "Usuário",
        foto:
          auth.currentUser.photoURL ||
          "https://cdn-icons-png.flaticon.com/512/147/147142.png",
        comentario: novoComentario,
        nota,
        createdAt: serverTimestamp(),
      });
      setNovoComentario("");
      setNota(0);
    } catch (error) {
      console.log("Erro ao enviar comentário:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleString();
    return new Date(timestamp).toLocaleString();
  };

  const renderComentario = ({ item }) => (
    <View style={styles.comentarioRow}>
      <Image source={{ uri: item.foto }} style={styles.comentarioFoto} />
      <View style={{ flex: 1 }}>
        <View style={styles.comentarioHeader}>
          <Text style={{ fontWeight: "bold" }}>{item.nome}</Text>
          <Text style={styles.comentarioData}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={{ flexDirection: "row", marginVertical: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Ionicons
              key={n}
              name={n <= item.nota ? "star" : "star-outline"}
              size={16}
              color="#f1c40f"
            />
          ))}
        </View>
        <Text>{item.comentario}</Text>
      </View>
    </View>
  );

  const renderHeader = () => {
    // As categorias já estão no formato de nomes
    const categoriasDoAlimento = comida.categorias;


    return (
      <View>
        {/* Botão voltar */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>

        <Image source={{ uri: comida.img }} style={styles.image} />

        <View style={{ padding: 16 }}>
          <Text style={styles.title}>{comida.nome}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons name="star" size={16} color="#f1c40f" />
            <Text style={{ marginLeft: 4, marginRight: 12 }}>{comida.rating || 4.5}</Text>
            <Ionicons name="time-outline" size={16} color="#444" />
            <Text style={{ marginLeft: 4, marginRight: 12 }}>{comida.time || "15 min"}</Text>
            <Ionicons name="flame-outline" size={16} color="#444" />
            <Text style={{ marginLeft: 4 }}>{comida.kcal} kcal</Text>
          </View>

          {/* CARDS DAS CATEGORIAS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {categoriasDoAlimento.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() => navigation.navigate("Refeicao", { categoria: cat })}
              >
                <Text style={styles.categoryCardText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </View>

        {/* Valor Nutricional */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("nutritional")}
        >
          <Text style={styles.sectionTitle}>Valor nutricional (por porção)</Text>
          <Ionicons
            name={nutritionalOpen ? "chevron-up-outline" : "chevron-down-outline"}
            size={18}
            color="#444"
          />
        </TouchableOpacity>
        {nutritionalOpen && (
          <View style={styles.sectionContentRounded}>
            {[
              ["Gordura", "20.9 g"],
              ["Carboidratos", "7.1 g"],
              ["Proteínas", "28.9 g"],
              ["Carga glicêmica", "1.9"],
              ["Açúcar", "2.3 g"],
              ["Colesterol", "78 mg"],
              ["Fibra", "2.6 g"],
            ].map(([label, value], i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Ingredientes */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("ingredients")}
        >
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <Ionicons
            name={ingredientsOpen ? "chevron-up-outline" : "chevron-down-outline"}
            size={18}
            color="#444"
          />
        </TouchableOpacity>
        {ingredientsOpen && (
          <View style={styles.sectionContentRounded}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                {[
                  [
                    "Alho",
                    "1 dente picado (3 g)",
                    "https://upload.wikimedia.org/wikipedia/commons/8/8c/Garlic_Bulb.jpg",
                  ],
                  [
                    "Azeite",
                    "1 colher (15 g)",
                    "https://upload.wikimedia.org/wikipedia/commons/8/8e/Olive_Oil.jpg",
                  ],
                  [
                    "Tomate seco",
                    "1 unidade picada (10 g)",
                    "https://upload.wikimedia.org/wikipedia/commons/3/35/Dried_tomatoes.jpg",
                  ],
                ].map(([name, desc, img], i) => (
                  <View key={i} style={styles.ingredientRow}>
                    <Image source={{ uri: img }} style={styles.ingredientImage} />
                    <View>
                      <Text style={styles.ingredientName}>{name}</Text>
                      <Text style={styles.ingredientDesc}>{desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Image
                source={require("../../../assets/tuga_bodybuilder.png")}
                style={styles.mascoteSide}
              />
            </View>
          </View>
        )}

        {/* Instruções */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("instructions")}
        >
          <Text style={styles.sectionTitle}>Instruções</Text>
          <Ionicons
            name={instructionsOpen ? "chevron-up-outline" : "chevron-down-outline"}
            size={18}
            color="#444"
          />
        </TouchableOpacity>
        {instructionsOpen && (
          <View style={styles.sectionContentRounded}>
            {[
              "Corte o frango e tempere com sal e pimenta.",
              "Aqueça o azeite e doure o frango por 4–5 min cada lado.",
              "Adicione os temperos e cozinhe por mais 2 min.",
              "Sirva imediatamente.",
            ].map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Seção de Comentários */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setNota(n)}>
                <Ionicons
                  name={n <= nota ? "star" : "star-outline"}
                  size={24}
                  color="#f1c40f"
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <TextInput
              style={styles.input}
              placeholder="Escreva seu comentário..."
              value={novoComentario}
              onChangeText={setNovoComentario}
            />
            <TouchableOpacity style={styles.sendButton} onPress={enviarComentario}>
              <Text style={{ color: "#fff" }}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        <FlatList
          data={comentariosFiltrados}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={renderComentario}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 6 },
  sectionHeader: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  sectionContentRounded: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, fontWeight: "600", color: "#111" },
  ingredientRow: { flexDirection: "row", marginBottom: 10 },
  ingredientImage: { width: 50, height: 50, marginRight: 12, borderRadius: 8 },
  ingredientName: { fontWeight: "600", fontSize: 14, color: "#111" },
  ingredientDesc: { fontSize: 12, color: "#666" },
  stepRow: { flexDirection: "row", marginBottom: 8, alignItems: "flex-start" },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1e90ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  stepNumberText: { color: "#fff", fontWeight: "bold" },
  stepText: { flex: 1, fontSize: 14, color: "#111" },
  mascoteSide: { width: 100, height: 100, marginLeft: 12, marginTop: 10, resizeMode: "contain" },
  comentarioRow: { flexDirection: "row", marginBottom: 12, paddingHorizontal: 16, alignItems: "flex-start" },
  comentarioFoto: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  comentarioHeader: { flexDirection: "row", justifyContent: "space-between" },
  comentarioData: { fontSize: 12, color: "#888" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginRight: 8 },
  sendButton: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#1e90ff", borderRadius: 8 },

  image: { width: "100%", height: 220, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 6 },

  // Cards das categorias
  categoryCard: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryCardText: { color: "#fff", fontWeight: "600" },

  backButton: { position: "absolute", top: 40, left: 16, zIndex: 10 },

});
