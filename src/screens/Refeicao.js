import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height: WIN_HEIGHT } = Dimensions.get("window");

// --- Componente Carrossel ---
const imagens = [
  {
    id: "1",
    titulo: "Falafel caseiro",
    img: "https://receitasdepesos.com.br/wp-content/uploads/2024/09/falafel-balls2.jpeg",
  },
  {
    id: "2",
    titulo: "Caracol de chocolate",
    img: "https://devaneiosdechocolate.files.wordpress.com/2018/09/devaneios-de-chocolate-caracc3b3is-de-chocolate-e-canela.jpg?w=1200",
  },
  {
    id: "3",
    titulo: "Sanduíche com pasta de ..",
    img: "https://th.bing.com/th/id/R.3f1b72bbdd707ec3707d20b10227661f?rik=GUT8dUqA74L9og&pid=ImgRaw&r=0",
  },
];

function Carrossel() {
  return (
    <Carousel
      loop
      width={width}
      height={250}
      autoPlay={true}
      data={imagens}
      scrollAnimationDuration={1500}
      renderItem={({ item }) => (
        <View style={styles.cardCarousel}>
          <Image source={{ uri: item.img }} style={styles.imageCarousel} />
          <Text style={styles.textCarousel}>{item.titulo}</Text>
        </View>
      )}
    />
  );
}

// --- Componente Banners ---
function Banners({ dados = [] }) {
  const [likes, setLikes] = useState(dados.map(() => ({ liked: false, count: 0 })));
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLink, setCurrentLink] = useState(null);
  const [loadingWebView, setLoadingWebView] = useState(true);

  const toggleLike = (index) => {
    const newLikes = [...likes];
    if (newLikes[index].liked) newLikes[index].count -= 1;
    else newLikes[index].count += 1;
    newLikes[index].liked = !newLikes[index].liked;
    setLikes(newLikes);
  };

  const openRecipe = (link) => {
    if (!link) return;
    setCurrentLink(link);
    setLoadingWebView(true);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentLink(null);
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {dados.map((banner, index) => (
          <View key={index} style={styles.cardBanner}>
            <TouchableOpacity
              onPress={() => openRecipe(banner.link)}
              activeOpacity={0.8}
            >
              <Image style={styles.bannerImage} source={{ uri: banner.img }} />
              <Text style={styles.bannerDesc}>{banner.desc}</Text>
            </TouchableOpacity>

            <View style={styles.likeContainer}>
              <TouchableOpacity onPress={() => toggleLike(index)}>
                <Image
                  source={{
                    uri: likes[index]?.liked
                      ? "https://cdn-icons-png.flaticon.com/512/833/833472.png"
                      : "https://cdn-icons-png.flaticon.com/512/1077/1077035.png",
                  }}
                  style={styles.heart}
                />
              </TouchableOpacity>

              <Text style={styles.likeCount}>{likes[index]?.count}</Text>

              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/151/151770.png" }}
                style={styles.clock}
              />

              <Text style={styles.clockText}>{banner.tempo}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.modalTitle}>
              {currentLink}
            </Text>
          </View>

          {loadingWebView && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 8 }}>Carregando...</Text>
            </View>
          )}

          {currentLink && (
            <WebView
              source={{ uri: currentLink }}
              onLoadStart={() => setLoadingWebView(true)}
              onLoadEnd={() => setLoadingWebView(false)}
              startInLoadingState
              style={styles.webview}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// --- Componente principal App ---
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Botão voltar fixo */}
      <TouchableOpacity style={styles.containerBack}>
        <Image
          source={{
            uri: "https://cdn.icon-icons.com/icons2/1514/PNG/512/backbutton_104978.png",
          }}
          style={styles.back}
        />
      </TouchableOpacity>

      {/* Conteúdo com Scroll */}
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Carrossel principal */}
        <View style={styles.carrossel}>
          <Text style={styles.titulo}>REFEIÇÃO</Text>
          <Carrossel />
        </View>

        {/* Café da manhã */}
        <View style={styles.subReceitas}>
          <Text style={styles.subTitulo}>Café da Manhã</Text>
          <Banners
            dados={[
              {
                desc: "Salada de ovo",
                img: "https://tse2.mm.bing.net/th/id/OIP.03HLltyDqhaGY-w5JKLu1AHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
                tempo: "10 min",
                link: "https://chatgpt.com/c/68ed74b2-6b18-8328-bedc-9306e466d57fr",
              },
              {
                desc: "Pudim de chia",
                img: "https://th.bing.com/th/id/R.b17364254833615b3c637aea1cd21756?rik=QdofH5SVPOVVIA&pid=ImgRaw&r=0",
                tempo: "5 min",
              },
              {
                desc: "Ovos mexidos",
                img: "https://ovo.blog.br/wp-content/uploads/2019/08/Ovo-mexido.jpg",
                tempo: "23 min",
              },
              {
                desc: "Granola",
                img: "https://tse1.mm.bing.net/th/id/OIP.Bv9xGL5zVDefxMa9WNXn5gHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
                tempo: "6 min",
              },
            ]}
          />
        </View>

        {/* Almoço */}
        <View style={styles.subReceitas}>
          <Text style={styles.subTitulo}>Almoço</Text>
          <Banners
            dados={[
              {
                desc: "Peito de frango",
                img: "https://s2.glbimg.com/bKeLd9Dl8wJ2qjhuNqhuOZSDa7o=/1200x/smart/filters:cover():strip_icc()/i.s3.glbimg.com/v1/AUTH_1f540e0b94d8437dbbc39d567a1dee68/internal_photos/bs/2020/B/M/xnbeARQxAyocmUgvKOpA/avipe-peito-de-frango-receita.jpg",
                tempo: "9 min",
              },
              {
                desc: "Arroz integral",
                img: "https://s2.abcstatics.com/media/bienestar/2020/08/26/arroz-blanco-kUXE--1248x698@abc.jpg",
                tempo: "12 min",
              },
              {
                desc: "Sopa de lentilha",
                img: "https://www.sabornamesa.com.br/media/k2/items/cache/1a956c46450e1847584fd382f605b0a6_XL.jpg",
                tempo: "20 min",
              },
              {
                desc: "Salada colorida",
                img: "https://1.bp.blogspot.com/-0P9V3TKTQEc/Xw4IxFFoTQI/AAAAAAAAREs/mUkWXtMkZtIVWEtLz_7oWuKxQVNIBmoKQCNcBGAsYHQ/s1600/photos%2B577.jpg",
                tempo: "5 min",
              },
            ]}
          />
        </View>

        {/* Jantar */}
        <View style={styles.subReceitas}>
          <Text style={styles.subTitulo}>Jantar</Text>
          <Banners
            dados={[
              {
                desc: "Omelete",
                img: "https://i.ytimg.com/vi/gY4YpCyxV4Q/maxresdefault.jpg",
                tempo: "8 min",
              },
              {
                desc: "Sopa de legumes",
                img: "https://th.bing.com/th/id/OIP.1pPnja4f5GN2xeHrVggzcAHaEu?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
                tempo: "15 min",
              },
              {
                desc: "Atum",
                img: "https://tse2.mm.bing.net/th/id/OIP.8iCBwe6vRN2KdGeHRd2x1wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                tempo: "5 min",
              },
              {
                desc: "Creme de abóbora",
                img: "https://tse1.mm.bing.net/th/id/OIP.UnISyaQ9ptrdWnWhchLgNQHaD5?rs=1&pid=ImgDetMain&o=7&rm=3",
                tempo: "12 min",
              },
            ]}
          />
        </View>
      </ScrollView>

      {/* Rodapé fixo */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="home-outline" size={24} color="#00c47c" />
          <Text style={[styles.footerText, { color: "#00c47c" }]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="water-outline" size={24} color="#00bcd4" />
          <Text style={[styles.footerText, { color: "#00bcd4" }]}>Glicemia</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={24}
            color="#d17d6b"
          />
          <Text style={[styles.footerText, { color: "#d17d6b" }]}>Refeição</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="barbell-outline" size={24} color="#7c6e7f" />
          <Text style={[styles.footerText, { color: "#7c6e7f" }]}>Exercícios</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  containerBack: { position: "absolute", top: 30, left: 15, zIndex: 10 },
  back: { width: 25, height: 40, resizeMode: "contain" },

  titulo: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  carrossel: { width: "100%", marginTop: 60, marginBottom: 20 },
  cardCarousel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageCarousel: { width: "90%", height: 200, borderRadius: 15 },
  textCarousel: { marginTop: 10, fontSize: 16, fontWeight: "bold" },

  subReceitas: { width: "100%", paddingHorizontal: 10 },
  subTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 15,
    marginTop: 35,
  },

  cardBanner: {
    marginRight: 12,
    alignItems: "center",
    backgroundColor: "#878383ff",
    borderRadius: 10,
    padding: 10,
    width: 160,
  },
  bannerImage: {
    width: 140,
    height: 100,
    borderRadius: 10,
  },
  bannerDesc: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#fff",
    width: 140,
  },

  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 8,
  },
  heart: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 20,
    color: "#fff",
  },
  clock: {
    width: 20,
    height: 20,
  },
  clockText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },

  /* Modal */
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    height: WIN_HEIGHT,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: "#333",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -50,
    marginTop: -40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  /* Rodapé */
  footer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  footerItem: { alignItems: "center" },
  footerText: { fontSize: 10, fontWeight: "bold" },
});
