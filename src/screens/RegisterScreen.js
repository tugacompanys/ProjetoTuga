import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { auth } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [nomeFocus, setNomeFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [senhaFocus, setSenhaFocus] = useState(false);
  const [confirmarSenhaFocus, setConfirmarSenhaFocus] = useState(false);
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("É necessário permitir o acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleRegister = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      alert("⚠️ Preencha todos os campos para continuar.");
      return;
    }

    if (senha.length < 6) {
      alert("🔒 A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("❌ As senhas não coincidem.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: nome,
        photoURL: image,
      });

      alert(`✅ Usuário ${nome} cadastrado com sucesso!`);
      navigation.navigate("Login");
    } catch (error) {
      let mensagemErro = "Erro ao cadastrar. Tente novamente.";

      switch (error.code) {
        case "auth/invalid-email":
          mensagemErro = "📧 O e-mail informado é inválido.";
          break;
        case "auth/email-already-in-use":
          mensagemErro = "⚠️ Este e-mail já está sendo usado por outra conta.";
          break;
        case "auth/weak-password":
          mensagemErro = "🔒 A senha é muito fraca. Escolha uma senha mais segura.";
          break;
      }

      alert(mensagemErro);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#0077b6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voltar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {step === 1 && (
          <View style={[styles.page, { width }]}>
            <View style={{ paddingHorizontal: 28 }}>
              <Text style={styles.h1}>Olá, bem-vindo ao MyGluco!</Text>
              <Text style={styles.h2}>
                Vamos começar criando sua conta e ajudá-lo a entender melhor sua glicose e hábitos diários
              </Text>
            </View>

            <View style={styles.mascoteWrap}>
              <Image
                source={require("../../assets/tuga_celular.png")}
                style={styles.mascote}
                resizeMode="contain"
              />
            </View>

            <View style={{ alignItems: "center", marginTop: 30 }}>
              <TouchableOpacity style={styles.buttonStep1} onPress={handleNext}>
                <Text style={styles.buttonText}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {step === 2 && (
          <>
            {/* FOTO DO USUÁRIO */}
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={{ marginTop: -20 }}>
              <View style={styles.imageWrapper}>
                <Image
                  source={
                    image
                      ? { uri: image }
                      : { uri: "https://cdn-icons-png.flaticon.com/512/9512/9512683.png" }
                  }
                  style={styles.profileImage}
                />
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera-outline" size={20} color="#000000ff" />
                </View>
              </View>
            </TouchableOpacity>

            {/* CAMPO NOME (SEPARADO E MAIS PRA CIMA) */}
            <View style={[
              styles.singleInputBox,
              nomeFocus && styles.inputFocused
            ]}>
              <Ionicons
                name="pencil"
                size={20}
                color={nomeFocus ? "#0077b6" : "#333"}
                style={{ marginRight: 10 }} />

              <TextInput
                style={styles.inputField}
                placeholder="Nome completo"
                placeholderTextColor="#777"
                value={nome}
                onChangeText={setNome}
                onFocus={() => setNomeFocus(true)}
                onBlur={() => setNomeFocus(false)}
              />
            </View>


            {/* Espaçamento para separar os outros campos */}
            <View style={{ height: 30 }} />

            {/* CAMPO EMAIL */}
            <View style={[
              styles.singleInputBox,
              emailFocus && styles.inputFocused
            ]}>

              <Ionicons
                name="mail-outline"
                size={20}
                color={emailFocus ? "#0077b6" : "#333"}
                style={{ marginRight: 10 }}
              />

              <TextInput
                style={styles.inputField}
                placeholder="Email"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
              />
            </View>

            {/* CAMPO SENHA */}
            <View style={[
              styles.singleInputBox,
              senhaFocus && styles.inputFocused
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={senhaFocus ? "#0077b6" : "#333"}
                style={{ marginRight: 10 }}
              />

              <TextInput
                style={styles.inputField}
                placeholder="Senha"
                placeholderTextColor="#777"
                secureTextEntry={!showSenha}
                value={senha}
                onChangeText={setSenha}
                onFocus={() => setSenhaFocus(true)}
                onBlur={() => setSenhaFocus(false)}
              />

              <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                <Ionicons
                  name={showSenha ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>



            {/* CAMPO CONFIRMAR SENHA */}
            <View style={[
              styles.singleInputBox,
              confirmarSenhaFocus && styles.inputFocused
            ]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={confirmarSenhaFocus ? "#0077b6" : "#333"}
                style={{ marginRight: 10 }}
              />

              <TextInput
                style={styles.inputField}
                placeholder="Confirmar senha"
                placeholderTextColor="#777"
                secureTextEntry={!showConfirmSenha}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                onFocus={() => setConfirmarSenhaFocus(true)}
                onBlur={() => setConfirmarSenhaFocus(false)}
              />

              <TouchableOpacity onPress={() => setShowConfirmSenha(!showConfirmSenha)}>
                <Ionicons
                  name={showConfirmSenha ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>


            {/* BOTÃO CADASTRAR */}
            <TouchableOpacity style={styles.buttonStep2} onPress={handleRegister}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>


            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <Text style={{ fontSize: 16, color: "#555" }}>
                Já possui uma conta?
              </Text>

              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={{ fontSize: 20, color: "#0077b6", fontWeight: "800", marginLeft: 5, underlineColor: "#0077b6", textDecorationLine: "underline", bottom: 4, left: 6 }}>
                  Entrar
                </Text>
              </TouchableOpacity>
            </View>

          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 25,
    paddingBottom: 40,
    bottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingTop: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0077b6",
    marginLeft: 10,
    paddingTop: 30
  },
  imageContainer: { alignItems: "center", justifyContent: "center" },
  imageWrapper: { position: "relative" },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#ffffffff",
    marginTop: 80,
    marginBottom: 20
  },
  cameraIcon: {
    position: "absolute",
    bottom: 20,
    right: 0,
    backgroundColor: "#ffffffff",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },

  barNome: {
    width: "90%",
    backgroundColor: "#e9e9e9",
    paddingVertical: 10,
    marginTop: 15,
    borderRadius: 10,
    justifyContent: "center",
  },

  boxInputs: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    elevation: 3,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  line: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },

  singleLine: {
    width: "100%",
    paddingVertical: 6,
    marginLeft: 8,
  },

  buttonStep1: {
    marginTop: 25,
    width: "90%",
    borderRadius: 25,
    paddingVertical: 12,
    backgroundColor: "#0077ff",
    alignItems: "center",
  },

  buttonStep2: {
    marginTop: 25,
    width: "90%",
    height: 55,
    borderRadius: 25,
    paddingVertical: 14,
    backgroundColor: "#0077ff",
    alignItems: "center"
  },

  buttonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 18,
  },

  page: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  h1: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1E1A2A",
    lineHeight: 42,
    marginTop: 12,
  },

  h2: {
    fontSize: 18,
    color: "#5E5870",
    marginTop: 12,
  },

  mascote: {
    height: 380,
    width: 350,
    alignSelf: "center",
    marginTop: 20
  },
  iconLeft: {
    marginRight: 10,
  },

  singleInputBox: {
    width: "90%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
  },

  inputFocused: {
    borderColor: "#0077b6",
  },


  inputField: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 15,
  },
  iconAbsolute: {
    position: "absolute",
    left: 14,
    zIndex: 10,
  },

  inputFieldCentered: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
    textAlign: "center",   // CENTRALIZA DE VERDADE
  },

  singleInputBox: {
    width: "90%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
  },

  inputFocused: {
    borderColor: "#0077b6",
  },

});
