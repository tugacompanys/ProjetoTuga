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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { auth } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
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
    <LinearGradient colors={["#e0f7ff", "#c2e9fb", "#a1c4fd"]} style={{ flex: 1 }}>
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
          <Text style={styles.title}>Crie sua conta</Text>

          <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={
                  image
                    ? { uri: image }
                    : { uri: "https://cdn-icons-png.flaticon.com/512/147/147142.png" }
                }
                style={styles.profileImage}
              />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera-outline" size={20} color="#ffffffff" />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.addPhotoText}>Adicionar foto de perfil</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#000000ff" />
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#888"
              onChangeText={setNome}
              value={nome}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#000000ff" />
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              keyboardType="email-address"
              placeholderTextColor="#888"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#000000ff" />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              secureTextEntry
              placeholderTextColor="#888"
              onChangeText={setSenha}
              value={senha}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#000000ff" />
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              secureTextEntry
              placeholderTextColor="#888"
              onChangeText={setConfirmarSenha}
              value={confirmarSenha}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <LinearGradient style={styles.buttonGradient} colors={["#0ed42fff", "#0f8018ff"]}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}> Entrar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.or}>OU</Text>
          <Text style={styles.socialText}>Cadastre-se com uma rede social</Text>

          <View style={styles.socialIcons}>
            <FontAwesome name="facebook" size={30} color="#3b5998" />
            <FontAwesome name="google" size={30} color="#DB4437" />
            <FontAwesome name="apple" size={30} color="#000" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 25,
    paddingBottom: 40,
    bottom: 30
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingTop: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0077b6",
    marginLeft: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: '#6a4a4a',
    marginTop: 20,
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#00aaff",
    marginTop: 20,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00aaff",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  addPhotoText: {
    color: "#0581beff",
    marginTop: 10,
    marginBottom: 20,
    fontSize: 18,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    color: "#000",
  },
  button: {
    marginTop: 25,
    width: "100%",
    borderRadius: 25,
    overflow: "hidden",
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  loginText: {
    color: "#333",
  },
  loginLink: {
    color: '#a44',
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 5
  },
  or: {
    marginTop: 25,
    fontWeight: "bold",
    color: "#444",
  },
  socialText: {
    marginTop: 8,
    color: "#333",
  },
  socialIcons: {
    flexDirection: "row",
    marginTop: 12,
    width: "60%",
    justifyContent: "space-around",
  },
});
