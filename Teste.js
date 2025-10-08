<Modal
  visible={!!videoId}
  animationType="slide"
  presentationStyle="fullScreen"
>
  <SafeAreaView style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}>
    <ScrollView>
      <YoutubePlayer
        height={250}
        play={true}
        videoId={videoId}
        webViewProps={{ allowsFullscreenVideo: true }}
      />
      <TouchableOpacity
        style={{
          backgroundColor: "#e40000ff",
          padding: 10,
          borderRadius: 8,
          marginTop: 20,
          alignItems: "center",
          marginHorizontal: 20,
        }}
        onPress={() => setVideoId(null)}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Fechar</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
</Modal>

{/* Menu deslizante */ }
{
  menuAberto && (
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
          colors={["#1e90ff", "#b5d8fcff"]}
          style={styles.menuGradient}
        >
          <View style={styles.menuHeader}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=47" }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{nome}</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuAberto(false);
              navigation.navigate("Login");
            }}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={22}
              color="#fff"
            />
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
  )
}

const styles = StyleSheet.create({

  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
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

  menuGradient: {
    flex: 1,
    padding: 20,
  },

  menuHeader: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, borderWidth: 2, borderColor: "#fff" },
  username: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.3)" },
  menuText: { marginLeft: 15, color: "#fff", fontSize: 16, fontWeight: "600" },

})
