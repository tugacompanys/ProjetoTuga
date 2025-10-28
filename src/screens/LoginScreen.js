import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { FontAwesome, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { auth } from "../config/firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
    <LinearGradient colors={["#5DE985", "#5DE985"]} style={{ flex: 1 }}>
      <StatusBar hidden />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flex: 1 }}>
              {/* Top Green */}
              <View style={styles.topGreen} />

              {/* Login Box */}
              <View style={styles.loginBox}>
                <Text style={styles.title}>LOGIN</Text>

                <TextInput
                  label="Email"
                  placeholder="teste@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  mode="outlined"
                  activeOutlineColor="#000"
                  outlineColor="#fff"
                />

                <TextInput
                  label="Senha"
                  placeholder="********"
                  value={senha}
                  onChangeText={setSenha}
                  style={styles.input}
                  secureTextEntry={!mostrarSenha}
                  mode="outlined"
                  activeOutlineColor="#000"
                  outlineColor="#fff"
                  right={<TextInput.Icon icon={mostrarSenha ? "eye-off" : "eye"} onPress={() => setMostrarSenha(!mostrarSenha)} />}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
                </TouchableOpacity>

                {dispositivoCompat && (
                  <TouchableOpacity style={styles.bioButton} onPress={autenticarBiometria}>
                    <MaterialIcons name="fingerprint" size={34} color="#00aaff" />
                    <Text style={styles.bioText}>Entrar com biometria</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.separatorLine} />

                <View style={styles.socials}>
                  <TouchableOpacity style={styles.socialIcon}>
                    <FontAwesome name="facebook-square" size={30} color="#1877F2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <AntDesign name="google" size={30} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <MaterialCommunityIcons name="twitter" size={30} color="#000" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.signupText}>
                  Não tem conta? <Text style={styles.signupLink} onPress={() => navigation.navigate('Register')}>Criar</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topGreen: {
    width: '100%',
    height: height * 0.20,
    backgroundColor: '#5DE985',
    borderBottomLeftRadius: 100,
  },
  loginBox: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#f7f5f5',
    borderTopLeftRadius: 100,
    paddingVertical: 50,
    paddingHorizontal: 25,
    shadowColor: '#000000ff',
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 20,
  },
  title: { fontSize: 36, fontWeight: '500', marginBottom: 50, textAlign: 'center', color: '#000', bottom: 90 },
  input: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 20, bottom: 90 },
  button: { backgroundColor: '#000', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 10, bottom: 90 },
  buttonText: { color: '#fff', fontSize: 18, bottom: 0 },
  bioButton: { flexDirection: 'row', alignItems: 'center', marginTop: 15, bottom: 90, backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, alignSelf: 'center', elevation: 2 },
  bioText: { marginLeft: 10, fontWeight: '600', color: '#00aaff' },
  separatorLine: { height: 1, backgroundColor: '#b9b9b9', marginVertical: 20, bottom: 90 },
  socials: { flexDirection: 'row', justifyContent: 'center' },
  socialIcon: { marginHorizontal: 12, bottom: 90 },
  signupText: { textAlign: 'center', color: '#555', marginTop: 20, fontSize: 16, bottom: 90 },
  signupLink: { color: '#5DE985', fontWeight: 'bold', fontSize: 16, bottom: 90 },
});
