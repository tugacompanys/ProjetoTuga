import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { auth } from "../config/firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dispositivoCompat, setDispositivoCompat] = useState(false);

  useEffect(() => {
    checarCompatibilidadeBiometria();
  }, []);

  const checarCompatibilidadeBiometria = async () => {
    try {
      const compat = await LocalAuthentication.hasHardwareAsync();
      const cadastrado = await LocalAuthentication.isEnrolledAsync();
      const credEmail = await SecureStore.getItemAsync('email');
      const credSenha = await SecureStore.getItemAsync('senha');

      // Botão biometria só aparece se hardware compatível, biometria cadastrada e credenciais salvas
      setDispositivoCompat(compat && cadastrado && credEmail && credSenha);
    } catch (err) {
      console.log('Erro ao checar biometria:', err);
    }
  };

  const autenticarBiometria = async () => {
    try {
      const credEmail = await SecureStore.getItemAsync('email');
      const credSenha = await SecureStore.getItemAsync('senha');

      if (!credEmail || !credSenha) {
        Alert.alert("⚠️ Nenhuma credencial salva", "Faça login manual primeiro para ativar biometria.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para entrar',
        fallbackLabel: 'Usar senha',
      });

      if (result.success) {
        setLoading(true);
        await signInWithEmailAndPassword(auth, credEmail, credSenha);

        // Salva nome do usuário para exibir na Home
        const nomeUsuario = auth.currentUser?.displayName || "Usuário";
        await AsyncStorage.setItem("@user_name", nomeUsuario);

        navigation.navigate("HomeScreen");
        setLoading(false);
      }
    } catch (err) {
      console.log('Erro autenticação biométrica:', err);
    }
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("⚠️ Campos obrigatórios", "Preencha todos os campos para continuar.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);

      // Salva credenciais e nome do usuário
      await SecureStore.setItemAsync('email', email);
      await SecureStore.setItemAsync('senha', senha);
      await SecureStore.setItemAsync('usarBiometria', 'true');

      const nomeUsuario = auth.currentUser?.displayName || "Usuário";
      await AsyncStorage.setItem("@user_name", nomeUsuario);

      setDispositivoCompat(true);

      setTimeout(() => {
        navigation.navigate("HomeScreen");
        setLoading(false);
      }, 1000);
    } catch (error) {
      let msg = "❗ Ocorreu um erro inesperado. Tente novamente.";
      switch (error.code) {
        case "auth/invalid-email": msg = "📧 E-mail inválido."; break;
        case "auth/user-disabled": msg = "🚫 Conta desativada."; break;
        case "auth/user-not-found": msg = "❌ Conta não encontrada."; break;
        case "auth/wrong-password": msg = "🔒 Senha incorreta."; break;
      }
      Alert.alert("Erro", msg);
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#e0f7ff", "#c2e9fb", "#a1c4fd"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 20, paddingTop: 80 }} keyboardShouldPersistTaps="handled">

          <Image source={require('../../assets/tugacriança.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>
            <Text style={{ fontWeight: 'bold' }}>MY</Text> <Text style={{ color: '#00aaff' }}>GLUCO</Text>
          </Text>
          <Text style={styles.welcome}>Seja Bem-Vindo</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#000" />
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#000" />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              secureTextEntry={!mostrarSenha}
              onChangeText={setSenha}
              value={senha}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setMostrarSenha(!mostrarSenha)}>
              <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => Alert.alert('Recuperação', 'Função em desenvolvimento')}>
            <Text style={styles.forgot}>Esqueci a senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <LinearGradient
                colors={["#0ed42fff", "#0f971aff"]}
                style={styles.buttonLogin}
              >
                <Text style={styles.buttonText}>Entrar</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>


          {/* Botão biometria visível se o dispositivo for compatível e credenciais salvas */}
          {dispositivoCompat && (
            <TouchableOpacity style={styles.bioButton} onPress={autenticarBiometria}>
              <MaterialIcons name="fingerprint" size={34} color="#00aaff" />
              <Text style={styles.bioText}>Entrar com biometria</Text>
            </TouchableOpacity>
          )}

          <View style={styles.registerContainer}>
            <Text>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.register}>Inscrever-se</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.or}>OU</Text>
          <Text style={styles.socialText}>Inscreva-se com uma rede social</Text>

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
    paddingTop: 0,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#f4efef',
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 160,
    height: 160
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10
  },
  welcome: {
    color: '#6a4a4a',
    fontSize: 18, fontWeight: 'bold',
    marginTop: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a0a0a0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 20,
    width: '100%',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 10
  },
  forgot: {
    color: '#a44',
    alignSelf: 'flex-end',
    left: 110,
    marginTop: 6,
    fontWeight: 'bold'
  },
  buttonLogin: {
    borderRadius: 20,
    marginTop: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#081b03ff',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  buttonText: { fontWeight: 'bold', color: '#fff', fontSize: 16 },

  

  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
  },
  bioText: {
    marginLeft: 10,
    fontWeight: '600',
    color: '#00aaff'
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20
  },
  register: {
    color: '#a44',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5
  },
  or: {
    marginTop: 10,
    fontWeight: 'bold'
  },
  socialText: {
    marginTop: 5
  },
  socialIcons: {
    flexDirection: 'row',
    marginTop: 10,
    width: '60%',
    justifyContent: 'space-around',
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    padding: 5
  },
});
