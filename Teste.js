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

