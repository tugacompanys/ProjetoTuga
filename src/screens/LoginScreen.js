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
  Keyboard,
  Image
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { FontAwesome, AntDesign, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { auth } from "../config/firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [emailFocus, setEmailFocus] = useState(false);
  const [senhaFocus, setSenhaFocus] = useState(false);
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
      setDispositivoCompat(!!(compat && cadastrado && credEmail && credSenha));
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
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("⚠️ Campos obrigatórios", "Preencha todos os campos para continuar.");
      return;
    }

    setLoading(true);
    try {
      // Mantive a chamada original com 'auth' — isso faz o login no Firebase
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
      }, 600);
    } catch (error) {
      let msg = "❗ Ocorreu um erro inesperado. Tente novamente.";
      if (error?.code) {
        switch (error.code) {
          case "auth/invalid-email": msg = "📧 E-mail inválido."; break;
          case "auth/user-disabled": msg = "🚫 Conta desativada."; break;
          case "auth/user-not-found": msg = "❌ Conta não encontrada."; break;
          case "auth/wrong-password": msg = "🔒 Senha incorreta."; break;
        }
      }
      Alert.alert("Erro", msg);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.inner}>
              <Text style={styles.pageTitle}>Entrar</Text>

              <Image
                source={require('../../assets/tugacriança.png')}
                style={styles.loginImage}
                resizeMode="contain"
              />

              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                placeholder={emailFocus ? "" : "Digite seu email"}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                mode="outlined"

                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}

                selectionColor="#000"
                caretHidden={false}

                outlineColor="transparent"
                activeOutlineColor="#0eaa16ff"

                theme={{
                  colors: {
                    background: 'rgba(93,233,133,0.18)',
                    text: '#000',
                    placeholder: '#666'
                  },
                  roundness: 16
                }}

                left={
                  <TextInput.Icon
                    icon={() => <Ionicons name="mail-outline" size={20} color="#000" />}
                  />
                }
              />

              <Text style={styles.fieldLabel}>Senha</Text>
              <TextInput
                placeholder={senhaFocus ? "" : "Digite sua senha"}
                value={senha}
                onChangeText={setSenha}
                style={styles.input}
                secureTextEntry={!mostrarSenha}
                mode="outlined"

                onFocus={() => setSenhaFocus(true)}
                onBlur={() => setSenhaFocus(false)}

                selectionColor="#000"
                caretHidden={false}

                outlineColor="transparent"
                activeOutlineColor="#0eaa16ff"

                theme={{
                  colors: {
                    background: 'rgba(93,233,133,0.18)',
                    text: '#000',
                    placeholder: '#666'
                  },
                  roundness: 16
                }}

                left={
                  <TextInput.Icon
                    icon={() => <Ionicons name="lock-closed-outline" size={20} color="#000" />}
                  />
                }

                right={
                  <TextInput.Icon
                    icon={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                    onPress={() => setMostrarSenha(!mostrarSenha)}
                  />
                }
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={{ width: '100%', alignItems: 'flex-end', marginTop: 4, marginBottom: 12 }}
              >
                <Text style={[styles.forgotText, { marginBottom: 0, top: 0 }]}>Esqueci a senha</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Entrar</Text>}
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

              <Text style={styles.signupText}>Não tem conta?</Text>
              <Text style={styles.signupLink} onPress={() => navigation.navigate('Register')}>Cadastrar</Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  inner: {
    flex: 1,
    padding: 25,
    alignItems: 'center'
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '600',
    marginTop: 36,
    color: '#000',
    fontWeight: '800'
  },
  loginImage: {
    width: width * 0.5,
    height: height * 0.2,
    marginVertical: 18
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    marginTop: 0,
    marginBottom: 6,
    color: '#000',
    fontWeight: '600',
    fontSize: 15
  },
  input: {
    width: '100%',
    backgroundColor: '#FFF', // verde translúcido
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 8,
    elevation: 0
  },
  forgotWrap: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 6
  },
  forgotText: {
    color: '#0eaa16ff',
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 4,
    marginBottom: -20,
    top: 10,
    textDecorationLine: 'underline',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#0eaa16ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2
  },
  bioText: {
    marginLeft: 10,
    fontWeight: '600',
    color: '#00aaff'
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#b9b9b9',
    width: '80%',
    marginVertical: 18
  },
  socials: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  socialIcon: {
    marginHorizontal: 12
  },
  signupText: {
    textAlign: 'center',
    color: '#555',
    marginTop: 20,
    fontSize: 15,
    gap: 4,
    right: 50
  },
  signupLink: {
    color: '#0eaa16ff',
    fontWeight: 'bold',
    fontSize: 20,
    textDecorationLine: 'underline',
    marginLeft: 36,   // se quiser mais espaço ainda
    left: 40,
    bottom: 25
  }
});
