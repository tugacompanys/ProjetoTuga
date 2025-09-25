import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { auth } from "../config/firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Checa biometria ao abrir a tela
  useEffect(() => {
    checarBiometria();
  }, []);

  const checarBiometria = async () => {
    try {
      const usarBiometria = await SecureStore.getItemAsync('usarBiometria');
      if (usarBiometria === 'true') {
        const compat = await LocalAuthentication.hasHardwareAsync();
        const cadastrado = await LocalAuthentication.isEnrolledAsync();

        if (compat && cadastrado) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Autentique-se para entrar',
            fallbackLabel: 'Usar senha'
          });

          if (result.success) {
            const emailSalvo = await SecureStore.getItemAsync('email');
            const senhaSalva = await SecureStore.getItemAsync('senha');

            if (emailSalvo && senhaSalva) {
              setLoading(true);
              await signInWithEmailAndPassword(auth, emailSalvo, senhaSalva);
              navigation.navigate("HomeScreen", { user: auth.currentUser });
              setLoading(false);
            }
          }
        }
      }
    } catch (err) {
      console.log('Erro biometria:', err);
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

      // ✅ Se biometria estiver ativada nas configurações, salva credenciais
      const usarBiometria = await SecureStore.getItemAsync('usarBiometria');
      if (usarBiometria === 'true') {
        await SecureStore.setItemAsync('email', email);
        await SecureStore.setItemAsync('senha', senha);
      }

      // spinner 1s para UX
      setTimeout(() => {
        navigation.navigate("HomeScreen", { user: auth.currentUser });
        setLoading(false);
      }, 1000);
    } catch (error) {
      let msg = "❗ Ocorreu um erro inesperado. Tente novamente.";
      switch (error.code) {
        case "auth/invalid-email":   msg = "📧 E-mail inválido."; break;
        case "auth/user-disabled":   msg = "🚫 Conta desativada."; break;
        case "auth/user-not-found":  msg = "❌ Conta não encontrada."; break;
        case "auth/wrong-password":  msg = "🔒 Senha incorreta."; break;
      }
      Alert.alert("Erro", msg);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setMostrarSenha(!mostrarSenha)}
        >
          <Ionicons
            name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#000"
          />
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
        {loading ? <ActivityIndicator size="small" color="#000" /> :
          <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#f4efef',
    alignItems: 'center',
    marginTop: 80,
  },
  logo: { width: 160, height: 160 },
  appName: { fontSize: 28, fontWeight: 'bold', marginTop: 10 },
  welcome: { color: '#6a4a4a', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#a0a0a0',
    borderRadius: 10, paddingHorizontal: 10,
    marginTop: 20, width: '100%', backgroundColor: '#fff',
  },
  input: { flex: 1, paddingVertical: 10, marginLeft: 10 },
  forgot: { color: '#a44', alignSelf: 'flex-end', marginTop: 10 },
  button: {
    backgroundColor: '#00ff0dff', borderRadius: 20,
    marginTop: 20, paddingHorizontal: 40, paddingVertical: 10,
    elevation: 3, shadowColor: '#081b03ff', shadowOpacity: 0.6, shadowRadius: 10,
  },
  buttonText: { fontWeight: 'bold', color: '#000' },
  registerContainer: { flexDirection: 'row', marginTop: 20 },
  register: { color: '#a44', fontWeight: 'bold' },
  or: { marginTop: 10, fontWeight: 'bold' },
  socialText: { marginTop: 5 },
  socialIcons: {
    flexDirection: 'row', marginTop: 10,
    width: '60%', justifyContent: 'space-around',
  },
  eyeButton: { position: 'absolute', right: 10, padding: 5 },
});
